/**
 * Popup App — Dashboard de Privacidad
 * UI principal del popup de Kernes.
 * Muestra el score de privacidad, amenazas detectadas, y controles rápidos.
 */

import { useState, useEffect, useCallback } from 'react';
import { PrivacyScore } from './components/PrivacyScore';
import { ThreatList } from './components/ThreatList';
import { TrackerList } from './components/TrackerList';
import { QuickActions } from './components/QuickActions';
import { SettingsPanel } from './components/SettingsPanel';
import { useSentinel } from './hooks/useSentinel';
import { useSettings } from './hooks/useSettings';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'threats' | 'trackers' | 'settings'>('dashboard');
  const { scanResult, isScanning, scanCurrentTab, overallScore } = useSentinel();
  const { settings, updateSettings } = useSettings();

  // Escaneo automático al abrir el popup
  useEffect(() => {
    scanCurrentTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#84cc16';
    if (score >= 40) return '#eab308';
    if (score >= 20) return '#f97316';
    return '#ef4444';
  };

  const getGrade = (score: number): string => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 60) return 'C';
    if (score >= 40) return 'D';
    if (score >= 20) return 'E';
    return 'F';
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>◈</span>
          <h1 style={styles.title}>Kernes</h1>
          <span style={styles.version}>v0.1.0</span>
        </div>
        <p style={styles.subtitle}>Contravigilancia Digital</p>
      </header>

      {/* SCORE CIRCULAR */}
      <div style={styles.scoreSection}>
        <PrivacyScore
          score={scanResult?.score ?? overallScore?.score ?? 0}
          grade={scanResult?.score ? getGrade(scanResult.score) : overallScore?.grade ?? '-'}
          color={getScoreColor(scanResult?.score ?? overallScore?.score ?? 0)}
          isScanning={isScanning}
          onScan={scanCurrentTab}
          message={scanResult?.summary ?? overallScore?.summary ?? 'Escaneando...'}
        />
      </div>

      {/* TABS */}
      <nav style={styles.tabs}>
        {(['dashboard', 'threats', 'trackers', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : {}),
            }}
          >
            {tab === 'dashboard' && '◈ Dashboard'}
            {tab === 'threats' && `⚠ Amenazas ${scanResult?.threats.length ? `(${scanResult.threats.length})` : ''}`}
            {tab === 'trackers' && `● Trackers ${scanResult?.trackers.length ? `(${scanResult.trackers.length})` : ''}`}
            {tab === 'settings' && '◉ Config'}
          </button>
        ))}
      </nav>

      {/* CONTENT */}
      <div style={styles.content}>
        {activeTab === 'dashboard' && (
          <DashboardTab
            scanResult={scanResult}
            isScanning={isScanning}
            onScan={scanCurrentTab}
          />
        )}

        {activeTab === 'threats' && (
          <ThreatList threats={scanResult?.threats ?? []} />
        )}

        {activeTab === 'trackers' && (
          <TrackerList trackers={scanResult?.trackers ?? []} />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel settings={settings} onUpdate={updateSettings} />
        )}
      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <span style={styles.footerText}>kernes.org</span>
        <span style={styles.footerDot}> · </span>
        <span style={styles.footerText}>Código abierto</span>
      </footer>
    </div>
  );
}

// ===================================================================
// DASHBOARD TAB
// ===================================================================

function DashboardTab({
  scanResult,
  isScanning,
  onScan,
}: {
  scanResult: any;
  isScanning: boolean;
  onScan: () => void;
}) {
  const hasData = scanResult && scanResult.score > 0;

  return (
    <div style={{ padding: '0 4px' }}>
      {!hasData && !isScanning ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>◈</div>
          <p style={styles.emptyText}>Aún no hay datos de este sitio.</p>
          <button onClick={onScan} style={styles.scanButton}>
            Escanear ahora
          </button>
        </div>
      ) : (
        <>
          {/* Estado del sitio */}
          <div style={styles.statusCard}>
            <h3 style={styles.cardTitle}>📍 {scanResult?.domain ?? 'Analizando...'}</h3>
            <div style={styles.metrics}>
              <Metric
                label="Amenazas"
                value={scanResult?.threats.length ?? 0}
                color={((scanResult?.threats.length ?? 0) > 2) ? '#ef4444' : '#eab308'}
              />
              <Metric
                label="Trackers"
                value={scanResult?.trackers.length ?? 0}
                color={((scanResult?.trackers.length ?? 0) > 0) ? '#f97316' : '#22c55e'}
              />
              <Metric
                label="Scripts 3P"
                value={scanResult?.thirdPartyScripts.length ?? 0}
                color="#94a3b8"
              />
            </div>
          </div>

          {/* Fingerprinting */}
          {scanResult?.fingerprinting?.detected && (
            <div style={{ ...styles.statusCard, borderLeftColor: '#ef4444' }}>
              <h3 style={styles.cardTitle}>👋 Fingerprinting Detectado</h3>
              <p style={styles.cardText}>
                Score: {scanResult.fingerprinting.score}/100
              </p>
              <div style={styles.tags}>
                {scanResult.fingerprinting.methods.map((m: string) => (
                  <span key={m} style={styles.tagWarning}>{m}</span>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <QuickActions />

          {/* Recomendación */}
          {scanResult?.threats?.length > 0 && (
            <div style={styles.recommendation}>
              <p style={styles.recommendationText}>
                💡 {scanResult.threats[0]?.recommendation ?? 'Activa protección para reducir riesgos.'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ===================================================================
// METRIC COMPONENT
// ===================================================================

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={styles.metric}>
      <span style={{ ...styles.metricValue, color }}>{value}</span>
      <span style={styles.metricLabel}>{label}</span>
    </div>
  );
}

// ===================================================================
// STYLES
// ===================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 380,
    minHeight: 520,
    display: 'flex',
    flexDirection: 'column',
    background: '#0a0a0f',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  header: {
    padding: '14px 16px 8px',
    borderBottom: '1px solid #1e1e2e',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    color: '#8b5cf6',
    fontSize: 20,
    fontWeight: 'bold' as const,
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  version: {
    color: '#64748b',
    fontSize: 11,
    marginLeft: 'auto',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
    letterSpacing: '0.02em',
  },
  scoreSection: {
    padding: '16px',
    borderBottom: '1px solid #1e1e2e',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #1e1e2e',
    padding: '0 8px',
    gap: 2,
  },
  tab: {
    flex: 1,
    padding: '10px 4px',
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  tabActive: {
    color: '#8b5cf6',
    borderBottomColor: '#8b5cf6',
  },
  content: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '12px 12px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: 12,
  },
  emptyIcon: {
    fontSize: 40,
    color: '#1e1e2e',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center' as const,
  },
  scanButton: {
    padding: '10px 24px',
    background: '#8b5cf6',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  statusCard: {
    background: '#14141f',
    borderRadius: 10,
    padding: '12px 14px',
    marginBottom: 10,
    borderLeft: '3px solid #8b5cf6',
  },
  cardTitle: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 8,
  },
  cardText: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 8,
  },
  metrics: {
    display: 'flex',
    gap: 16,
  },
  metric: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: 700,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  tagWarning: {
    padding: '3px 8px',
    background: '#3f1d1d',
    color: '#fca5a5',
    fontSize: 10,
    borderRadius: 4,
    fontWeight: 500,
  },
  tag: {
    padding: '3px 8px',
    background: '#1e1e2e',
    color: '#94a3b8',
    fontSize: 10,
    borderRadius: 4,
  },
  recommendation: {
    marginTop: 10,
    padding: '10px 12px',
    background: '#141f1a',
    borderRadius: 8,
    borderLeft: '3px solid #22c55e',
  },
  recommendationText: {
    color: '#86efac',
    fontSize: 12,
    lineHeight: 1.4,
  },
  footer: {
    padding: '10px 16px',
    borderTop: '1px solid #1e1e2e',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: '#475569',
    fontSize: 10,
  },
  footerDot: {
    color: '#334155',
  },
};
