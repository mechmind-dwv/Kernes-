/**
 * ThreatList — Lista de Amenazas Detectadas
 * Muestra todas las amenazas de seguridad y privacidad ordenadas por severidad.
 */

import type { SentinelThreat } from '@/sentinel/scanner';

interface Props {
  threats: SentinelThreat[];
}

const severityConfig: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  critical: { color: '#fca5a5', bg: '#3f1d1d', label: 'CRÍTICA', icon: '🔴' },
  high: { color: '#fdba74', bg: '#3f2315', label: 'ALTA', icon: '🟠' },
  medium: { color: '#fcd34d', bg: '#3f2f15', label: 'MEDIA', icon: '🟡' },
  low: { color: '#86efac', bg: '#1a2f1d', label: 'BAJA', icon: '🟢' },
};

const typeLabels: Record<string, string> = {
  surveillance: '👁 Vigilancia',
  tracking: '📡 Tracking',
  fingerprinting: '👋 Fingerprinting',
  'data-broker': '🏢 Data Broker',
  'third-party-cookie': '🍪 Cookie 3P',
};

export function ThreatList({ threats }: Props) {
  if (threats.length === 0) {
    return (
      <div style={styles.empty}>
        <span style={styles.emptyIcon}>🛡</span>
        <p style={styles.emptyText}>No se detectaron amenazas en este sitio.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerText}>{threats.length} amenaza(s) detectada(s)</span>
      </div>

      {threats.map((threat, index) => {
        const config = severityConfig[threat.severity] ?? severityConfig.low;

        return (
          <div key={index} style={{ ...styles.card, borderLeftColor: config.color }}>
            <div style={styles.cardHeader}>
              <span style={{ color: config.color, fontSize: 12, fontWeight: 700 }}>
                {config.icon} {config.label}
              </span>
              <span style={styles.typeBadge}>
                {typeLabels[threat.type] ?? threat.type}
              </span>
            </div>

            <p style={styles.source}>📍 {threat.source}</p>
            <p style={styles.description}>{threat.description}</p>

            {threat.recommendation && (
              <div style={{ ...styles.recommendation, background: config.bg }}>
                <span style={{ color: config.color, fontSize: 11 }}>
                  💡 {threat.recommendation}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
  },
  header: {
    padding: '6px 4px',
    marginBottom: 4,
  },
  headerText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 500,
  },
  card: {
    background: '#14141f',
    borderRadius: 8,
    padding: '10px 12px',
    borderLeft: '3px solid #ef4444',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadge: {
    padding: '2px 6px',
    background: '#1e1e2e',
    color: '#94a3b8',
    fontSize: 9,
    borderRadius: 4,
    fontWeight: 500,
  },
  source: {
    color: '#64748b',
    fontSize: 10,
    marginBottom: 4,
  },
  description: {
    color: '#e2e8f0',
    fontSize: 12,
    lineHeight: 1.4,
  },
  recommendation: {
    marginTop: 8,
    padding: '6px 8px',
    borderRadius: 6,
    fontSize: 11,
    lineHeight: 1.4,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '40px 20px',
    gap: 10,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center' as const,
  },
};
