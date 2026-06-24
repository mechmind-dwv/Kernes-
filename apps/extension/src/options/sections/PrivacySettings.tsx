/**
 * PrivacySettings — Configuración de Privacidad y Protección
 */

import { useState } from 'react';

export function PrivacySettings() {
  const [protectionLevel, setProtectionLevel] = useState('medium');
  const [blockTrackers, setBlockTrackers] = useState(true);
  const [antiFingerprint, setAntiFingerprint] = useState(true);
  const [blockThirdPartyCookies, setBlockThirdPartyCookies] = useState(false);
  const [forceHTTPS, setForceHTTPS] = useState(true);
  const [whitelist, setWhitelist] = useState('');

  const levels = [
    { value: 'low', label: 'Bajo', desc: 'Solo detección y reporte. Sin bloqueo activo.', color: '#22c55e' },
    { value: 'medium', label: 'Medio', desc: 'Detección + bloqueo de trackers y fingerprinting.', color: '#eab308' },
    { value: 'paranoid', label: 'Paranóico', desc: 'Máxima protección. Puede afectar algunos sitios.', color: '#ef4444' },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔒 Privacidad y Protección</h2>

      {/* Nivel de protección */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Nivel de Protección</h3>
        <div style={styles.levels}>
          {levels.map((level) => (
            <button
              key={level.value}
              onClick={() => setProtectionLevel(level.value)}
              style={{
                ...styles.levelBtn,
                borderColor: protectionLevel === level.value ? level.color : '#1e1e2e',
                background: protectionLevel === level.value ? `${level.color}10` : '#0a0a0f',
              }}
            >
              <span style={{ color: level.color, fontWeight: 700, fontSize: 14 }}>
                ● {level.label}
              </span>
              <span style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
                {level.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Protecciones individuales */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Protecciones Activas</h3>
        <Toggle label="🛡 Bloquear trackers conocidos" enabled={blockTrackers} onChange={setBlockTrackers} />
        <Toggle label="👤 Anti-fingerprinting" enabled={antiFingerprint} onChange={setAntiFingerprint} />
        <Toggle label="🍪 Bloquear cookies de terceros" enabled={blockThirdPartyCookies} onChange={setBlockThirdPartyCookies} />
        <Toggle label="🔒 Forzar HTTPS" enabled={forceHTTPS} onChange={setForceHTTPS} />
      </div>

      {/* Lista blanca */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Lista Blanca</h3>
        <p style={styles.desc}>Dominios excluidos de todas las protecciones (uno por línea):</p>
        <textarea
          value={whitelist}
          onChange={(e) => setWhitelist(e.target.value)}
          placeholder="ejemplo.com&#10;otro-sitio.org"
          style={styles.textarea}
          rows={4}
        />
        <p style={styles.note}>Estos sitios no serán escaneados ni bloqueados por Kernes.</p>
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
  sectionTitle: { color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: 12 },
  desc: { color: '#64748b', fontSize: 12, marginBottom: 10 },
  levels: { display: 'flex', flexDirection: 'column', gap: 8 },
  levelBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    padding: '10px 14px', borderRadius: 8, border: '1px solid #1e1e2e',
    background: '#0a0a0f', cursor: 'pointer', transition: 'all 0.15s ease',
  },
  toggle: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid #1e1e2e',
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
  textarea: {
    width: '100%', padding: '8px 12px', background: '#0a0a0f',
    color: '#e2e8f0', border: '1px solid #1e1e2e', borderRadius: 6,
    fontSize: 13, resize: 'vertical' as const,
  },
  note: { color: '#475569', fontSize: 11, marginTop: 8 },
};
