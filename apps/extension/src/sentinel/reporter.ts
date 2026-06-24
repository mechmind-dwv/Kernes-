/**
 * SentinelReporter
 * Genera informes de privacidad en múltiples formatos:
 * - Resumen visual para el popup
 * - Informe detallado para el panel web
 * - Exportación PDF (para uso legal/evidencia)
 */

import type { SentinelScanResult, SentinelThreat } from './scanner';

export interface PrivacyReport {
  title: string;
  generatedAt: number;
  overallScore: number;
  grade: string;
  sitesAnalyzed: number;
  totalThreats: number;
  threatBreakdown: Record<string, number>;
  topThreats: SentinelThreat[];
  recommendations: string[];
  sections: ReportSection[];
}

export interface ReportSection {
  title: string;
  icon: string;
  status: 'safe' | 'warning' | 'danger';
  content: string;
  details?: string[];
}

export class SentinelReporter {
  /**
   * Genera un informe de privacidad completo a partir de múltiples resultados de escaneo.
   */
  generateReport(results: SentinelScanResult[]): PrivacyReport {
    if (results.length === 0) {
      return this.createEmptyReport();
    }

    const overallScore = this.calculateOverallScore(results);
    const grade = this.scoreToGrade(overallScore);
    const allThreats = results.flatMap((r) => r.threats);

    return {
      title: 'Informe de Privacidad Digital',
      generatedAt: Date.now(),
      overallScore,
      grade,
      sitesAnalyzed: results.length,
      totalThreats: allThreats.length,
      threatBreakdown: this.calculateThreatBreakdown(allThreats),
      topThreats: this.getTopThreats(allThreats),
      recommendations: this.generateRecommendations(results, overallScore),
      sections: [
        this.generateTrackersSection(results),
        this.generateFingerprintingSection(results),
        this.generateCookiesSection(results),
        this.generateHeadersSection(results),
        this.generateThirdPartySection(results),
      ],
    };
  }

  /**
   * Genera un resumen corto para mostrar en el popup.
   */
  generatePopupSummary(result: SentinelScanResult | null): {
    score: number;
    grade: string;
    color: string;
    message: string;
    threatCount: number;
    trackerCount: number;
  } {
    if (!result) {
      return {
        score: 0,
        grade: '-',
        color: '#9ca3af',
        message: 'No hay datos. Haz clic para escanear.',
        threatCount: 0,
        trackerCount: 0,
      };
    }

    const { score, threats, trackers } = result;
    const grade = this.scoreToGrade(score);
    const color = this.scoreToColor(score);

    let message: string;
    if (score >= 80) {
      message = 'Buena privacidad. Pocos riesgos detectados.';
    } else if (score >= 60) {
      message = 'Privacidad moderada. Algunos trackers activos.';
    } else if (score >= 40) {
      message = 'Privacidad baja. Múltiples amenazas detectadas.';
    } else {
      message = '¡Privacidad comprometida! Amenazas críticas.';
    }

    return {
      score,
      grade,
      color,
      message,
      threatCount: threats.length,
      trackerCount: trackers.length,
    };
  }

  /**
   * Exporta un informe en formato Markdown (para compartir).
   */
  exportToMarkdown(report: PrivacyReport): string {
    const lines: string[] = [
      `# ${report.title}`,
      '',
      `**Fecha:** ${new Date(report.generatedAt).toLocaleString('es-ES')}`,
      `**Score:** ${report.overallScore}/100 (Grado ${report.grade})`,
      `**Sitios analizados:** ${report.sitesAnalyzed}`,
      `**Amenazas totales:** ${report.totalThreats}`,
      '',
      '## Desglose de amenazas',
      '',
      ...Object.entries(report.threatBreakdown).map(([type, count]) => `- ${type}: ${count}`),
      '',
      '## Amenazas principales',
      '',
      ...report.topThreats.map((t, i) =>
        `${i + 1}. **[${t.severity.toUpperCase()}]** ${t.type} — ${t.source}: ${t.description}`
      ),
      '',
      '## Recomendaciones',
      '',
      ...report.recommendations.map((r, i) => `${i + 1}. ${r}`),
      '',
      '---',
      'Generado por [Kernes](https://kernes.org) — Contravigilancia Digital',
    ];

    return lines.join('\n');
  }

  // ===================================================================
  // PRIVATE
  // ===================================================================

  private calculateOverallScore(results: SentinelScanResult[]): number {
    if (results.length === 0) return 0;
    const avg = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    return Math.round(avg);
  }

  private scoreToGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    if (score >= 20) return 'E';
    return 'F';
  }

  private scoreToColor(score: number): string {
    if (score >= 80) return '#22c55e'; // green-500
    if (score >= 60) return '#84cc16'; // lime-500
    if (score >= 40) return '#eab308'; // yellow-500
    if (score >= 20) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  }

  private calculateThreatBreakdown(threats: SentinelThreat[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    for (const t of threats) {
      breakdown[t.type] = (breakdown[t.type] ?? 0) + 1;
    }
    return breakdown;
  }

  private getTopThreats(threats: SentinelThreat[]): SentinelThreat[] {
    const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...threats]
      .sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity])
      .slice(0, 10);
  }

  private generateRecommendations(results: SentinelScanResult[], score: number): string[] {
    const recs: string[] = [];

    const hasSurveillance = results.some((r) =>
      r.trackers.some((t) => t.category === 'surveillance')
    );
    const hasFingerprinting = results.some((r) => r.fingerprinting.detected);
    const hasThirdPartyCookies = results.some((r) => r.cookies.length > 0);
    const hasDataBrokers = results.some((r) =>
      r.trackers.some((t) => t.category === 'data-broker')
    );

    if (hasSurveillance) {
      recs.push('Este sitio integra datos con plataformas de vigilancia. Considera usar una VPN y el modo Paranóico de Kernes.');
    }

    if (hasFingerprinting) {
      recs.push('Se detectó fingerprinting de navegador. Activa la protección anti-fingerprinting en la configuración.');
    }

    if (hasThirdPartyCookies) {
      recs.push('Bloquea cookies de terceros en la configuración de tu navegador o activa el bloqueo integrado de Kernes.');
    }

    if (hasDataBrokers) {
      recs.push('Data brokers están recopilando tus datos. Usa LexAI para enviar solicitudes de eliminación (GDPR/CCPA).');
    }

    if (score < 60) {
      recs.push('Tu score de privacidad es bajo. Revisa la configuración de protección y considera usar navegadores más privados como Firefox o Brave.');
    }

    if (recs.length === 0) {
      recs.push('¡Buen trabajo! Tu privacidad está bien protegida. Mantén Kernes activo para monitoreo continuo.');
    }

    return recs;
  }

  private generateTrackersSection(results: SentinelScanResult[]): ReportSection {
    const allTrackers = results.flatMap((r) => r.trackers);
    const uniqueTrackers = new Map(allTrackers.map((t) => [t.domain, t]));
    const critical = allTrackers.filter((t) => t.severity === 'critical');

    return {
      title: 'Trackers Detectados',
      icon: 'eye',
      status: critical.length > 0 ? 'danger' : uniqueTrackers.size > 0 ? 'warning' : 'safe',
      content: `${uniqueTrackers.size} tracker(s) único(s) identificado(s) en ${results.length} sitio(s).`,
      details: Array.from(uniqueTrackers.values()).map(
        (t) => `${t.name} (${t.category}) — Severidad: ${t.severity}`
      ),
    };
  }

  private generateFingerprintingSection(results: SentinelScanResult[]): ReportSection {
    const sitesWithFP = results.filter((r) => r.fingerprinting.detected);
    const avgScore = sitesWithFP.length > 0
      ? sitesWithFP.reduce((sum, r) => sum + r.fingerprinting.score, 0) / sitesWithFP.length
      : 0;

    return {
      title: 'Fingerprinting',
      icon: 'fingerprint',
      status: avgScore > 50 ? 'danger' : avgScore > 20 ? 'warning' : 'safe',
      content: sitesWithFP.length > 0
        ? `${sitesWithFP.length} sitio(s) intentaron fingerprinting. Score promedio: ${avgScore.toFixed(0)}/100.`
        : 'No se detectó fingerprinting en los sitios analizados.',
      details: sitesWithFP.length > 0
        ? sitesWithFP.map((r) => `${r.domain}: ${r.fingerprinting.methods.join(', ')}`)
        : undefined,
    };
  }

  private generateCookiesSection(results: SentinelScanResult[]): ReportSection {
    const allCookies = results.flatMap((r) => r.cookies);
    const thirdParty = allCookies.filter((c) => c.isThirdParty);
    const superCookies = allCookies.filter((c) => c.isSuperCookie);

    return {
      title: 'Cookies de Terceros',
      icon: 'cookie',
      status: superCookies.length > 0 ? 'danger' : thirdParty.length > 0 ? 'warning' : 'safe',
      content: `${thirdParty.length} cookie(s) de terceros detectada(s). ${superCookies.length} supercookie(s).`,
      details: thirdParty.map((c) => `${c.name} (${c.domain})${c.isSuperCookie ? ' [SUPERCOOKIE]' : ''}`),
    };
  }

  private generateHeadersSection(results: SentinelScanResult[]): ReportSection {
    const allHeaders = results.flatMap((r) => r.headers);
    const highRisk = allHeaders.filter((h) => h.risk === 'high');

    return {
      title: 'Headers de Tracking',
      icon: 'server',
      status: highRisk.length > 0 ? 'danger' : allHeaders.length > 0 ? 'warning' : 'safe',
      content: `${allHeaders.length} header(s) de tracking detectado(s).`,
      details: allHeaders.map((h) => `${h.name}: ${h.value} (riesgo: ${h.risk})`),
    };
  }

  private generateThirdPartySection(results: SentinelScanResult[]): ReportSection {
    const allScripts = results.flatMap((r) => r.thirdPartyScripts);
    const trackerScripts = allScripts.filter((s) => s.isTracker);

    return {
      title: 'Scripts de Terceros',
      icon: 'code',
      status: trackerScripts.length > 0 ? 'danger' : allScripts.length > 0 ? 'warning' : 'safe',
      content: `${allScripts.length} script(s) de terceros. ${trackerScripts.length} identificado(s) como tracker.`,
      details: allScripts.map((s) => `${s.domain}${s.isTracker ? ' [TRACKER]' : ''}`),
    };
  }

  private createEmptyReport(): PrivacyReport {
    return {
      title: 'Informe de Privacidad Digital',
      generatedAt: Date.now(),
      overallScore: 0,
      grade: '-',
      sitesAnalyzed: 0,
      totalThreats: 0,
      threatBreakdown: {},
      topThreats: [],
      recommendations: ['Aún no hay datos de escaneo. Empieza navegando y Kernes analizará automáticamente los sitios que visites.'],
      sections: [],
    };
  }
}
