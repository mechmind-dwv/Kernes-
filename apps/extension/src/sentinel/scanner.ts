/**
 * SentinelScanner
 * Orquesta el escaneo de privacidad de una pestaña/sitio web.
 * Coordina el análisis de headers, fingerprinting, scripts de terceros
 * y genera un informe consolidado.
 */

import type { TrackerDatabase } from '@/background/tracker-db';
import type { StorageManager } from '@/shared/storage';

export interface SentinelScanResult {
  url: string;
  domain: string;
  timestamp: number;
  score: number; // 0-100, más alto = más privacidad (mejor)
  threats: SentinelThreat[];
  trackers: SentinelTrackerInfo[];
  fingerprinting: SentinelFingerprintingInfo;
  thirdPartyScripts: SentinelThirdPartyInfo[];
  cookies: SentinelCookieInfo[];
  headers: SentinelHeaderInfo[];
  summary: string;
}

export interface SentinelThreat {
  type: 'surveillance' | 'tracking' | 'fingerprinting' | 'data-broker' | 'third-party-cookie';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  recommendation?: string;
}

export interface SentinelTrackerInfo {
  name: string;
  domain: string;
  category: string;
  severity: string;
  parentCompany?: string;
  alternatives?: string[];
}

export interface SentinelFingerprintingInfo {
  detected: boolean;
  methods: string[];
  score: number; // 0-100 fingerprintability
}

export interface SentinelThirdPartyInfo {
  domain: string;
  scriptUrl: string;
  isTracker: boolean;
}

export interface SentinelCookieInfo {
  name: string;
  domain: string;
  isThirdParty: boolean;
  isSuperCookie: boolean;
}

export interface SentinelHeaderInfo {
  name: string;
  value: string;
  risk: 'low' | 'medium' | 'high';
}

export class SentinelScanner {
  private storage: StorageManager;
  private trackerDB: TrackerDatabase;

  constructor(storage: StorageManager, trackerDB: TrackerDatabase) {
    this.storage = storage;
    this.trackerDB = trackerDB;
  }

  /**
   * Escanea una pestaña específica.
   */
  async scanTab(tabId: number): Promise<SentinelScanResult> {
    const tab = await chrome.tabs.get(tabId);
    const url = tab.url ?? '';
    const domain = this.extractDomain(url);

    if (!url || url.startsWith('chrome://') || url.startsWith('about:') || url.startsWith('edge://')) {
      return this.createEmptyResult(url, domain);
    }

    // Ejecutar análisis en paralelo
    const [
      networkEvents,
      fingerprintReport,
      thirdPartyScripts,
    ] = await Promise.all([
      this.getNetworkEvents(tabId),
      this.getFingerprintReport(tabId),
      this.getThirdPartyScripts(tabId),
    ]);

    // Compilar resultados
    const trackers = this.extractTrackers(networkEvents);
    const threats = this.compileThreats(networkEvents, fingerprintReport, trackers);
    const cookies = this.extractCookies(networkEvents);
    const headers = this.extractHeaders(networkEvents);

    const result: SentinelScanResult = {
      url,
      domain,
      timestamp: Date.now(),
      score: this.calculateScore(networkEvents, fingerprintReport, trackers),
      threats,
      trackers,
      fingerprinting: {
        detected: fingerprintReport.score > 0,
        methods: this.extractFingerprintingMethods(fingerprintReport),
        score: fingerprintReport.score,
      },
      thirdPartyScripts,
      cookies,
      headers,
      summary: this.generateSummary(domain, threats, trackers, fingerprintReport),
    };

    // Persistir resultado
    await this.saveResult(result);

    return result;
  }

  /**
   * Obtiene el resultado más reciente para una URL.
   */
  async getResultForUrl(url: string): Promise<SentinelScanResult | null> {
    const results = await this.getStoredResults();
    return results.find((r) => r.url === url) ?? null;
  }

  /**
   * Calcula el score global de privacidad del usuario.
   */
  async calculateOverallScore(): Promise<{ score: number; grade: string; summary: string }> {
    const results = await this.getStoredResults();

    if (results.length === 0) {
      return { score: 0, grade: '-', summary: 'Sin datos de escaneo todavía.' };
    }

    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const grade = this.scoreToGrade(avgScore);

    return {
      score: Math.round(avgScore),
      grade,
      summary: this.generateOverallSummary(results, avgScore),
    };
  }

  /**
   * Ejecuta un escaneo periódico en todas las pestañas abiertas.
   */
  async runPeriodicScan(): Promise<void> {
    const tabs = await chrome.tabs.query({ active: true });
    for (const tab of tabs) {
      if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
        try {
          await this.scanTab(tab.id);
        } catch (err) {
          console.warn(`[Sentinel] Error escaneando tab ${tab.id}:`, err);
        }
      }
    }
  }

  // ===================================================================
  // PRIVATE METHODS
  // ===================================================================

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  private async getNetworkEvents(tabId: number): Promise<any[]> {
    try {
      // Obtener del background script
      const response = await chrome.runtime.sendMessage({
        type: 'NETWORK_GET_EVENTS_FOR_TAB',
        payload: { tabId },
      });
      return response?.events ?? [];
    } catch {
      return [];
    }
  }

  private async getFingerprintReport(tabId: number) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (!tab.id) return { score: 0 };

      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Esta función se ejecuta en el content script
          return { score: 0 }; // Placeholder — el content script responde via mensajes
        },
      });

      return result?.result ?? { score: 0 };
    } catch {
      return { score: 0 };
    }
  }

  private async getThirdPartyScripts(tabId: number): Promise<SentinelThirdPartyInfo[]> {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (!tab.id) return [];

      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const scripts = document.querySelectorAll('script[src]');
          const pageDomain = location.hostname;
          return Array.from(scripts)
            .map((s) => s.getAttribute('src'))
            .filter((src): src is string => !!src)
            .map((src) => {
              try {
                const url = new URL(src, location.href);
                return { domain: url.hostname, scriptUrl: src };
              } catch {
                return { domain: 'unknown', scriptUrl: src };
              }
            })
            .filter((s) => s.domain !== pageDomain);
        },
      });

      const scripts = (result?.result ?? []) as Array<{ domain: string; scriptUrl: string }>;

      return scripts.map((s) => ({
        domain: s.domain,
        scriptUrl: s.scriptUrl,
        isTracker: this.trackerDB.searchByDomain(s.domain).length > 0,
      }));
    } catch {
      return [];
    }
  }

  private extractTrackers(events: any[]): SentinelTrackerInfo[] {
    const trackers: SentinelTrackerInfo[] = [];
    const seen = new Set<string>();

    for (const event of events) {
      if (event.findings) {
        for (const finding of event.findings) {
          if (finding.type === 'known-tracker' && !seen.has(finding.source)) {
            seen.add(finding.source);
            const tracker = this.trackerDB.findByDomain(finding.source);
            if (tracker) {
              trackers.push({
                name: tracker.name,
                domain: tracker.domain,
                category: tracker.category,
                severity: tracker.severity,
                parentCompany: tracker.parentCompany,
                alternatives: tracker.alternatives,
              });
            }
          }
        }
      }
    }

    return trackers;
  }

  private compileThreats(
    events: any[],
    fingerprintReport: any,
    trackers: SentinelTrackerInfo[]
  ): SentinelThreat[] {
    const threats: SentinelThreat[] = [];

    // Amenazas de network events
    for (const event of events) {
      if (event.findings) {
        for (const finding of event.findings) {
          const threat = this.findingToThreat(finding);
          if (threat) threats.push(threat);
        }
      }
    }

    // Amenazas de fingerprinting
    if (fingerprintReport.score > 30) {
      threats.push({
        type: 'fingerprinting',
        severity: fingerprintReport.score > 60 ? 'critical' : 'high',
        source: location.hostname,
        description: `Fingerprinting de navegador detectado (${fingerprintReport.score}/100)`,
        recommendation: 'Considera usar el modo de protección "Medio" o "Paranóico"',
      });
    }

    // Amenazas de trackers conocidos
    for (const tracker of trackers) {
      if (tracker.severity === 'critical' || tracker.severity === 'high') {
        threats.push({
          type: tracker.category === 'surveillance' ? 'surveillance' : 'tracking',
          severity: tracker.severity as any,
          source: tracker.domain,
          description: `${tracker.name} (${tracker.parentCompany ?? 'desconocido'})`,
          recommendation: tracker.alternatives
            ? `Alternativas: ${tracker.alternatives.join(', ')}`
            : undefined,
        });
      }
    }

    // Deduplicar
    const unique = new Map<string, SentinelThreat>();
    for (const t of threats) {
      const key = `${t.type}-${t.source}-${t.description}`;
      if (!unique.has(key) || unique.get(key)!.severity !== 'critical') {
        unique.set(key, t);
      }
    }

    return Array.from(unique.values()).sort((a, b) => {
      const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return sevOrder[a.severity] - sevOrder[b.severity];
    });
  }

  private findingToThreat(finding: any): SentinelThreat | null {
    switch (finding.type) {
      case 'tracking-header':
        return {
          type: 'tracking',
          severity: finding.severity,
          source: finding.source,
          description: finding.detail,
        };
      case 'third-party-cookie':
        return {
          type: 'third-party-cookie',
          severity: finding.severity,
          source: finding.source,
          description: finding.detail,
          recommendation: 'Bloquea cookies de terceros en la configuración del navegador',
        };
      case 'known-tracker':
        return {
          type: 'tracking',
          severity: finding.severity,
          source: finding.source,
          description: finding.detail,
        };
      default:
        return null;
    }
  }

  private extractCookies(events: any[]): SentinelCookieInfo[] {
    const cookies: SentinelCookieInfo[] = [];
    const seen = new Set<string>();

    for (const event of events) {
      if (event.findings) {
        for (const f of event.findings) {
          if (f.type === 'third-party-cookie') {
            const key = `${f.source}-${f.detail}`;
            if (!seen.has(key)) {
              seen.add(key);
              cookies.push({
                name: f.detail.replace('Cookie de tercero: ', ''),
                domain: f.source,
                isThirdParty: true,
                isSuperCookie: f.severity === 'critical',
              });
            }
          }
        }
      }
    }

    return cookies;
  }

  private extractHeaders(events: any[]): SentinelHeaderInfo[] {
    const headers: SentinelHeaderInfo[] = [];

    for (const event of events) {
      if (event.findings) {
        for (const f of event.findings) {
          if (f.type === 'tracking-header') {
            headers.push({
              name: f.detail.split('=')[0]?.replace('Header sospechoso detectado: ', '') ?? 'unknown',
              value: f.detail.split('=')[1]?.slice(0, 50) ?? '',
              risk: f.severity,
            });
          }
        }
      }
    }

    return headers;
  }

  private extractFingerprintingMethods(report: any): string[] {
    const methods: string[] = [];
    if (report.canvas?.detected) methods.push('Canvas');
    if (report.webgl?.detected) methods.push('WebGL');
    if (report.audio?.detected) methods.push('AudioContext');
    if (report.fonts?.detected) methods.push('Font Enumeration');
    if (report.navigator?.detected) methods.push('Navigator Properties');
    if (report.screen?.detected) methods.push('Screen Dimensions');
    if (report.webrtc?.detected) methods.push('WebRTC');
    return methods;
  }

  private calculateScore(events: any[], fingerprintReport: any, trackers: SentinelTrackerInfo[]): number {
    let score = 100; // Empezar con puntaje perfecto y restar

    // Restar por trackers
    const criticalTrackers = trackers.filter((t) => t.severity === 'critical').length;
    const highTrackers = trackers.filter((t) => t.severity === 'high').length;
    score -= criticalTrackers * 15;
    score -= highTrackers * 8;

    // Restar por fingerprinting
    score -= fingerprintReport.score * 0.3;

    // Restar por cookies de terceros
    const thirdPartyCookies = events.reduce((count, e) => {
      return count + (e.findings?.filter((f: any) => f.type === 'third-party-cookie').length ?? 0);
    }, 0);
    score -= thirdPartyCookies * 3;

    // Restar por headers de tracking
    const trackingHeaders = events.reduce((count, e) => {
      return count + (e.findings?.filter((f: any) => f.type === 'tracking-header').length ?? 0);
    }, 0);
    score -= trackingHeaders * 2;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private scoreToGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    if (score >= 20) return 'E';
    return 'F';
  }

  private generateSummary(
    domain: string,
    threats: SentinelThreat[],
    trackers: SentinelTrackerInfo[],
    fingerprintReport: any
  ): string {
    const parts: string[] = [];

    const criticalCount = threats.filter((t) => t.severity === 'critical').length;
    const highCount = threats.filter((t) => t.severity === 'high').length;

    if (criticalCount > 0) {
      parts.push(`${criticalCount} amenaza(s) crítica(s) detectada(s)`);
    }
    if (highCount > 0) {
      parts.push(`${highCount} amenaza(s) alta(s)`);
    }
    if (trackers.length > 0) {
      parts.push(`${trackers.length} tracker(s) identificado(s)`);
    }
    if (fingerprintReport.score > 30) {
      parts.push(`Fingerprinting: ${fingerprintReport.score}/100`);
    }

    if (parts.length === 0) {
      return `${domain} parece respetuoso con tu privacidad.`;
    }

    return `${domain}: ${parts.join('; ')}.`;
  }

  private generateOverallSummary(results: SentinelScanResult[], avgScore: number): string {
    const totalThreats = results.reduce((sum, r) => sum + r.threats.length, 0);
    const totalTrackers = new Set(results.flatMap((r) => r.trackers.map((t) => t.domain))).size;
    const sitesWithFingerprinting = results.filter((r) => r.fingerprinting.detected).length;

    return (
      `Score promedio: ${avgScore.toFixed(0)}/100. ` +
      `${totalThreats} amenazas detectadas en ${results.length} sitios. ` +
      `${totalTrackers} trackers únicos identificados. ` +
      `${sitesWithFingerprinting} sitios intentaron fingerprinting.`
    );
  }

  private async saveResult(result: SentinelScanResult): Promise<void> {
    const results = await this.getStoredResults();

    // Reemplazar resultado para esta URL si existe
    const existingIndex = results.findIndex((r) => r.url === result.url);
    if (existingIndex >= 0) {
      results[existingIndex] = result;
    } else {
      results.push(result);
    }

    // Mantener solo los últimos 500 resultados
    const trimmed = results.slice(-500);
    await this.storage.set('sentinel-results', trimmed);
  }

  private async getStoredResults(): Promise<SentinelScanResult[]> {
    return (await this.storage.get('sentinel-results')) ?? [];
  }

  private createEmptyResult(url: string, domain: string): SentinelScanResult {
    return {
      url,
      domain,
      timestamp: Date.now(),
      score: 0,
      threats: [],
      trackers: [],
      fingerprinting: { detected: false, methods: [], score: 0 },
      thirdPartyScripts: [],
      cookies: [],
      headers: [],
      summary: 'No se pudo analizar esta página.',
    };
  }
}
