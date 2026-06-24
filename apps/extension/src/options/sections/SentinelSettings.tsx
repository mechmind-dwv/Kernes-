/**
 * SentinelSettings — Configuración del Módulo Sentinel
 */

import { useState } from 'react';

export function SentinelSettings() {
  const [scanFrequency, setScanFrequency] = useState(5);
  const [trackerDBUpdate, setTrackerDBUpdate] = useState(24);
  const [detectFingerprinting, setDetectFingerprinting] = useState(true);
  const [detectThirdPartyCookies, setDetectThirdPartyCookies] = useState(true);
  const [detectTrackingHeaders, setDetectTrackingHeaders] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState('medium');

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👁 Configuración de Sentinel</h2>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Frecuencia de Escaneo</h3>
        <p style={styles.desc}>¿Con qué frecuencia Sentinel analiza la pestaña activa?</p>
        <div style={styles.rangeRow}>
          <input
            type="range"
            min={1}
            max={60}
            value={scanFrequency}
            onChange={(e) => setScanFrequency(Number(e.target.value))}
            style={styles.range}
          />
          <span style={styles.rangeValue}>{scanFrequency} min</span>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Actualización de Base de Datos</h3>
        <p style={styles.desc}>Frecuencia de actualización de la lista de trackers conocidos</p>
        <div style={styles.rangeRow}>
          <input
            type="range"
            min={1}
            max={72}
            value={trackerDBUpdate}
            onChange={(e) => setTrackerDBUpdate(Number(e.target.value))}
            style={styles.range}
          />
          <span style={styles.rangeValue}>{trackerDBUpdate} h</span>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Detecciones Activas</h3>
        <Toggle label="Fingerprinting de navegador" enabled={detectFingerprinting} onChange={setDetectFingerprinting} />
        <Toggle label="Cookies de terceros" enabled={detectThirdPartyCookies} onChange={setDetectThirdPartyCookies} />
        <Toggle label="Headers de tracking" enabled={detectTrackingHeaders} onChange={setDetectTrackingHeaders} />
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Umbral de Alerta</h3>
        <p style={styles.desc}>Solo notificar amenazas con severidad igual o superior a:</p>
        <div style={styles.buttonGroup}>
          {[
            { value: 'low', label: 'Baja', color: '#22c55e' },
            { value: 'medium', label: 'Media', color: '#eab308' },
            { value: 'high', label: 'Alta', color: '#f97316' },
            { value: 'critical', label: 'Crítica', color: '#ef4444' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAlertThreshold(opt.value)}
              style={{
                ...styles.thresholdBtn,
                borderColor: alertThreshold === opt.value ? opt.color : '#1e1e2e',
                background: alertThreshold === opt.value ? `${opt.color}15` : '#0a0a0f',
                color: alertThreshold === opt.value ? opt.color : '#64748b',
              }}
            >
              ● {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={styles.toggle}>
      <span style={styles.toggleLabel}>{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        style={{ ...styles.toggleTrack, background: enabled ? '#8b5cf6' : '#1e1e2e' }}
      >
        <div style={{ ...styles.toggleThumb, transform: enabled ? 'translateX(14px)' : 'translateX(2px)' }} />
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 20 },
  title: { color: '#f8fafc', fontSize: 22, fontWeight: 700, marginBottom: 8 },
  section: { background: '#14141f', borderRadius: 10, padding: '16px 20px', marginBottom: 12 },
  sectionTitle: { color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: 8 },
  desc: { color: '#64748b', fontSize: 12, marginBottom: 10 },
  rangeRow: { display: 'flex', alignItems: 'center', gap: 12 },
  range: { flex: 1, accentColor: '#8b5cf6' },
  rangeValue: { color: '#8b5cf6', fontSize: 13, fontWeight: 600, minWidth: 50 },
  toggle: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 0', borderBottom: '1px solid #1e1e2e',
  },
  toggleLabel: { color: '#94a3b8', fontSize: 13 },
  toggleTrack: {
    width: 34, height: 18, borderRadius: 9, border: 'none',
    cursor: 'pointer', position: 'relative', transition: 'background 0.15s ease',
  },
  toggleThumb: {
    width: 14, height: 14, borderRadius: '50%', background: '#fff',
    position: 'absolute', top: 2, transition: 'transform 0.15s ease',
  },
  buttonGroup: { display: 'flex', gap: 8 },
  thresholdBtn: {
    padding: '6px 12px', borderRadius: 6, border: '1px solid #1e1e2e',
    background: '#0a0a0f', fontSize: 12, fontWeight: 500, cursor: 'pointer',
  },
};
