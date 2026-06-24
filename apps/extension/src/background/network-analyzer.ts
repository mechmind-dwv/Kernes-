/**
 * NetworkAnalyzer
 * Analiza headers HTTP y requests para detectar trackers y fingerprinting.
 */

import type { TrackerDatabase } from './tracker-db';
import type { NetworkEvent, TrackerMatch } from '@kernes/shared-types';

export class NetworkAnalyzer {
  private trackerDB: TrackerDatabase;
  private eventBuffer: NetworkEvent[] = [];
  private readonly BUFFER_FLUSH_SIZE = 50;

  constructor(trackerDB: TrackerDatabase) {
    this.trackerDB = trackerDB;
  }

  /**
   * Analiza headers de respuesta HTTP en busca de:
   * - Cookies de terceros
   * - Headers de tracking conocidos (X-Tracker, X-Palantir, etc.)
   * - Headers de fingerprinting
   */
  analyzeHeaders(details: chrome.webRequest.WebResponseHeadersDetails): void {
    const { url, tabId, responseHeaders, initiator } = details;
    if (!responseHeaders) return;

    const findings: TrackerMatch[] = [];
    const domain = this.extractDomain(url);

    // Buscar headers de tracking conocidos
    for (const header of responseHeaders) {
      const name = header.name.toLowerCase();
      const value = header.value ?? '';

      // Headers sospechosos de tracking
      const suspiciousHeaders = [
        'x-palantir-trace',
        'x-palantir-session',
        'x-tracker-id',
        'x-tracking-id',
        'x-request-id',
        'x-correlation-id',
        'x-device-fingerprint',
        'x-browser-id',
        'x-user-id',
        'x-client-id',
        'x-data-collector',
        'x-analytics-token',
      ];

      if (suspiciousHeaders.includes(name)) {
        findings.push({
          type: 'tracking-header',
          source: domain,
          detail: `Header sospechoso detectado: ${header.name}=${value.slice(0, 50)}`,
          severity: 'high',
          timestamp: Date.now(),
        });
      }

      // Set-Cookie de terceros
      if (name === 'set-cookie') {
        const cookieAnalysis = this.analyzeCookie(value, initiator, domain);
        if (cookieAnalysis.isThirdParty) {
          findings.push({
            type: 'third-party-cookie',
            source: domain,
            detail: `Cookie de tercero: ${cookieAnalysis.name}`,
            severity: cookieAnalysis.isSuperCookie ? 'critical' : 'medium',
            timestamp: Date.now(),
          });
        }
      }
    }

    if (findings.length > 0) {
      this.bufferEvent({
        type: 'headers-analyzed',
        url,
        tabId,
        initiator: initiator ?? undefined,
        timestamp: Date.now(),
        findings,
      });
    }
  }

  /**
   * Analiza headers de request salientes.
   */
  analyzeRequestHeaders(details: chrome.webRequest.WebRequestHeadersDetails): void {
    const { url, tabId, requestHeaders, initiator } = details;
    if (!requestHeaders) return;

    const findings: TrackerMatch[] = [];
    const domain = this.extractDomain(url);

    for (const header of requestHeaders) {
      const name = header.name.toLowerCase();
      const value = header.value ?? '';

      // Referer que filtra mucha información
      if (name === 'referer' && value.length > 100) {
        findings.push({
          type: 'referer-leak',
          source: domain,
          detail: `Referer largo que expone navegación: ${value.slice(0, 80)}...`,
          severity: 'low',
          timestamp: Date.now(),
        });
      }

      // User-Agent muy detallado (facilita fingerprinting)
      if (name === 'user-agent') {
        const entropy = this.calculateUAEntropy(value);
        if (entropy > 15) {
          findings.push({
            type: 'high-entropy-ua',
            source: domain,
            detail: `User-Agent con alta entropía (${entropy.toFixed(1)} bits): facilita fingerprinting`,
            severity: 'medium',
            timestamp: Date.now(),
          });
        }
      }
    }

    // Verificar si el dominio está en la base de datos de trackers
    const knownTracker = this.trackerDB.findByDomain(domain);
    if (knownTracker) {
      findings.push({
        type: 'known-tracker',
        source: domain,
        detail: `Tracker conocido: ${knownTracker.name} (${knownTracker.category})`,
        severity: knownTracker.category === 'surveillance' ? 'critical' : 'high',
        timestamp: Date.now(),
      });
    }

    if (findings.length > 0) {
      this.bufferEvent({
        type: 'request-analyzed',
        url,
        tabId,
        initiator: initiator ?? undefined,
        timestamp: Date.now(),
        findings,
      });
    }
  }

  /**
   * Extrae el dominio base de una URL.
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  /**
   * Analiza una cookie para detectar si es de terceros o supercookie.
   */
  private analyzeCookie(
    cookieStr: string,
    initiator: string | undefined,
    domain: string
  ): { name: string; isThirdParty: boolean; isSuperCookie: boolean } {
    const parts = cookieStr.split(';');
    const nameValue = parts[0]?.trim() ?? '';
    const name = nameValue.split('=')[0]?.trim() ?? '';

    let isThirdParty = false;
    let isSuperCookie = false;

    // Es de terceros si el dominio del cookie no coincide con el initiator
    if (initiator) {
      try {
        const initiatorDomain = new URL(initiator).hostname;
        if (!domain.includes(initiatorDomain) && !initiatorDomain.includes(domain)) {
          isThirdParty = true;
        }
      } catch {
        // Ignorar URL de initiator inválida
      }
    }

    // Detectar supercookies (etag, localStorage sync, etc.)
    const superCookieIndicators = ['__utm', '_ga', '_gid', 'fp_', 'browser_id', 'device_id'];
    if (superCookieIndicators.some((ind) => name.includes(ind))) {
      isSuperCookie = true;
    }

    // Verificar atributos de cookie
    for (const part of parts) {
      const attr = part.trim().toLowerCase();
      if (attr.startsWith('domain=') || attr.startsWith('path=/')) {
        // Cookies con dominio amplio son más invasivas
        continue;
      }
    }

    return { name, isThirdParty, isSuperCookie };
  }

  /**
   * Calcula la entropía aproximada de un User-Agent en bits.
   * Más alto = más único = más fácil de trackear.
   */
  private calculateUAEntropy(ua: string): number {
    // Contar componentes únicos del UA
    const components = [
      /Mozilla\/\d+\.\d+/.test(ua),
      /Windows NT \d+\.\d+/.test(ua),
      /Mac OS X/.test(ua),
      /Linux/.test(ua),
      /Android \d+/.test(ua),
      /iPhone|iPad|iPod/.test(ua),
      /Chrome\/\d+/.test(ua),
      /Firefox\/\d+/.test(ua),
      /Safari\/\d+/.test(ua),
      /Edg\/\d+/.test(ua),
      /OPR\/\d+/.test(ua),
      /rv:\d+/.test(ua),
      /Gecko\/\d+/.test(ua),
      /WebKit\/\d+/.test(ua),
      /en-US|es-ES|fr-FR|de-DE/.test(ua),
      /WOW64|Win64|x64/.test(ua),
    ];

    const trueCount = components.filter(Boolean).length;
    // Entropía aproximada: cada componente añade ~1.5 bits de información
    return trueCount * 1.5;
  }

  /**
   * Almacena un evento en el buffer y hace flush si es necesario.
   */
  private bufferEvent(event: NetworkEvent): void {
    this.eventBuffer.push(event);

    if (this.eventBuffer.length >= this.BUFFER_FLUSH_SIZE) {
      this.flushEvents();
    }
  }

  /**
   * Persiste los eventos acumulados en storage.
   */
  private async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    try {
      const existing = (await chrome.storage.local.get('network-events'))?.['network-events'] ?? [];
      const merged = [...existing, ...this.eventBuffer].slice(-1000); // Mantener últimos 1000
      await chrome.storage.local.set({ 'network-events': merged });
      this.eventBuffer = [];
    } catch (err) {
      console.error('[Kernes NetworkAnalyzer] Error flushing events:', err);
    }
  }

  /**
   * Devuelve los eventos almacenados para un tab específico.
   */
  async getEventsForTab(tabId: number): Promise<NetworkEvent[]> {
    await this.flushEvents();
    const data = (await chrome.storage.local.get('network-events'))?.['network-events'] ?? [];
    return data.filter((e: NetworkEvent) => e.tabId === tabId);
  }

  /**
   * Devuelve todos los eventos recientes.
   */
  async getAllEvents(): Promise<NetworkEvent[]> {
    await this.flushEvents();
    return (await chrome.storage.local.get('network-events'))?.['network-events'] ?? [];
  }
}
