/**
 * TrackerList — Lista de Trackers Detectados
 * Muestra los trackers identificados con información sobre categoría y severidad.
 */

import type { SentinelTrackerInfo } from '@/sentinel/scanner';

interface Props {
  trackers: SentinelTrackerInfo[];
}

const categoryIcons: Record<string, string> = {
  surveillance: '👁',
  advertising: '📢',
  analytics: '📊',
  fingerprinting: '👋',
  'data-broker': '🏢',
};

const categoryLabels: Record<string, string> = {
  surveillance: 'Vigilancia',
  advertising: 'Publicidad',
  analytics: 'Analytics',
  fingerprinting: 'Fingerprinting',
  'data-broker': 'Data Broker',
};

const severityDots: Record<string, string> = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢',
};

export function TrackerList({ trackers }: Props) {
  if (trackers.length === 0) {
    return (
      <div style={styles.empty}>
        <span style={styles.emptyIcon}>🔍</span>
        <p style={styles.emptyText}>No se detectaron trackers conocidos en este sitio.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerText}>{trackers.length} tracker(s) identificado(s)</span>
      </div>

      {trackers.map((tracker, index) => (
        <div
          key={index}
          style={{
            ...styles.card,
            borderLeftColor:
              tracker.severity === 'critical' ? '#ef4444' :
              tracker.severity === 'high' ? '#f97316' :
              tracker.severity === 'medium' ? '#eab308' : '#22c55e',
          }}
        >
          <div style={styles.cardHeader}>
            <div style={styles.nameRow}>
              <span style={{ fontSize: 16 }}>{categoryIcons[tracker.category] ?? '●'}</span>
              <span style={styles.name}>{tracker.name}</span>
              <span style={styles.severity}>{severityDots[tracker.severity]}</span>
            </div>
            <span style={styles.categoryBadge}>
              {categoryLabels[tracker.category] ?? tracker.category}
            </span>
          </div>

          <div style={styles.details}>
            <p style={styles.domain}>🌐 {tracker.domain}</p>
            {tracker.parentCompany && (
              <p style={styles.parent}>🏢 Empresa matriz: {tracker.parentCompany}</p>
            )}
          </div>

          {tracker.alternatives && tracker.alternatives.length > 0 && (
            <div style={styles.alternatives}>
              <span style={styles.altLabel}>✓ Alternativas éticas:</span>
              <div style={styles.altList}>
                {tracker.alternatives.map((alt) => (
                  <span key={alt} style={styles.altTag}>{alt}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
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
    borderLeft: '3px solid #f97316',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  name: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: 600,
  },
  severity: {
    fontSize: 10,
  },
  categoryBadge: {
    padding: '2px 6px',
    background: '#1e1e2e',
    color: '#94a3b8',
    fontSize: 9,
    borderRadius: 4,
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
  },
  details: {
    marginTop: 4,
  },
  domain: {
    color: '#64748b',
    fontSize: 10,
    marginBottom: 2,
  },
  parent: {
    color: '#64748b',
    fontSize: 10,
  },
  alternatives: {
    marginTop: 8,
    padding: '6px 8px',
    background: '#0f1f1a',
    borderRadius: 6,
  },
  altLabel: {
    color: '#86efac',
    fontSize: 10,
    fontWeight: 500,
  },
  altList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 4,
    marginTop: 4,
  },
  altTag: {
    padding: '2px 6px',
    background: '#1a2f1d',
    color: '#86efac',
    fontSize: 9,
    borderRadius: 4,
    fontWeight: 500,
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
