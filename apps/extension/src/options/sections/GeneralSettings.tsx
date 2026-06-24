/**
 * GeneralSettings — Configuración General
 */

import { useState } from 'react';

export function GeneralSettings() {
  const [language, setLanguage] = useState('es');
  const [theme, setTheme] = useState('dark');
  const [startupScan, setStartupScan] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⚙ Configuración General</h2>

      {/* Idioma */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Idioma</h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={styles.select}
        >
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="ca">Català</option>
          <option value="eu">Euskara</option>
        </select>
      </div>

      {/* Tema */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Tema</h3>
        <div style={styles.radioGroup}>
          {[
            { value: 'dark', label: '🌙 Oscuro' },
            { value: 'auto', label: '🌗 Automático' },
          ].map((opt) => (
            <label key={opt.value} style={styles.radioLabel}>
              <input
                type="radio"
                name="theme"
                value={opt.value}
                checked={theme === opt.value}
                onChange={(e) => setTheme(e.target.value)}
                style={styles.radio}
              />
              <span style={styles.radioText}>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Comportamiento</h3>

        <Toggle
          label="Escanear al inicio"
          description="Realizar un escaneo automático al abrir el navegador"
          enabled={startupScan}
          onChange={setStartupScan}
        />
        <Toggle
          label="Notificaciones"
          description="Mostrar alertas cuando se detecten amenazas críticas"
          enabled={notifications}
          onChange={setNotifications}
        />
      </div>
    </div>
  );
}

function Toggle({ label, description, enabled, onChange }: {
  label: string; description: string; enabled: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div style={styles.toggle}>
      <div>
        <p style={styles.toggleLabel}>{label}</p>
        <p style={styles.toggleDesc}>{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        style={{
          ...styles.toggleTrack,
          background: enabled ? '#8b5cf6' : '#1e1e2e',
        }}
      >
        <div style={{ ...styles.toggleThumb, transform: enabled ? 'translateX(14px)' : 'translateX(2px)' }} />
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 20 },
  title: { color: '#f8fafc', fontSize: 22, fontWeight: 700, marginBottom: 8 },
  section: { background: '#14141f', borderRadius: 10, padding: '16px 20px' },
  sectionTitle: { color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: 12 },
  select: {
    width: '100%',
    padding: '8px 12px',
    background: '#0a0a0f',
    color: '#e2e8f0',
    border: '1px solid #1e1e2e',
    borderRadius: 6,
    fontSize: 13,
  },
  radioGroup: { display: 'flex', gap: 16 },
  radioLabel: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  radio: { accentColor: '#8b5cf6' },
  radioText: { color: '#94a3b8', fontSize: 13 },
  toggle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #1e1e2e',
  },
  toggleLabel: { color: '#e2e8f0', fontSize: 13, fontWeight: 500 },
  toggleDesc: { color: '#64748b', fontSize: 11, marginTop: 2 },
  toggleTrack: {
    width: 34, height: 18, borderRadius: 9, border: 'none',
    cursor: 'pointer', position: 'relative', transition: 'background 0.15s ease',
  },
  toggleThumb: {
    width: 14, height: 14, borderRadius: '50%', background: '#fff',
    position: 'absolute', top: 2, transition: 'transform 0.15s ease',
  },
};
