/**
 * SettingsPanel — Panel de Configuración del Popup
 * Controles rápidos para ajustar el nivel de protección.
 */

import { useState } from 'react';

interface Settings {
  protectionLevel: 'low' | 'medium' | 'paranoid';
  sentinelEnabled: boolean;
  blockTrackers: boolean;
  fingerprintProtection: boolean;
  language: string;
}

interface Props {
  settings: Settings;
  onUpdate: (settings: Partial<Settings>) => void;
}

const levels: Array<{ value: Settings['protectionLevel']; label: string; color: string; desc: string }> = [
  { value: 'low', label: 'Bajo', color: '#22c55e', desc: 'Solo detección, sin bloqueo' },
  { value: 'medium', label: 'Medio', color: '#eab308', desc: 'Detección + bloqueo básico' },
  { value: 'paranoid', label: 'Paranóico', color: '#ef4444', desc: 'Máxima protección' },
];

export function SettingsPanel({ settings, onUpdate }: Props) {
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }

    // Resetear datos
    chrome.storage.local.clear().then(() => {
      window.location.reload();
    });
  };

  return (
    <div style={styles.container}>
      {/* Nivel de protección */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🛡 Nivel de Protección</h3>
        <div style={styles.levels}>
          {levels.map((level) => (
            <button
              key={level.value}
              onClick={() => onUpdate({ protectionLevel: level.value })}
              style={{
                ...styles.levelButton,
                borderColor: settings.protectionLevel === level.value ? level.color : '#1e1e2e',
                background: settings.protectionLevel === level.value ? `${level.color}15` : '#14141f',
              }}
            >
              <span style={{ ...styles.levelDot, color: level.color }}>●</span>
              <span
                style={{
                  ...styles.levelLabel,
                  color: settings.protectionLevel === level.value ? level.color : '#94a3b8',
                }}
              >
                {level.label}
              </span>
              <span style={styles.levelDesc}>{level.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>⚙ Funciones</h3>

        <Toggle
          label="Sentinel (detección)"
          enabled={settings.sentinelEnabled}
          onChange={(v) => onUpdate({ sentinelEnabled: v })}
        />
        <Toggle
          label="Bloquear trackers"
          enabled={settings.blockTrackers}
          onChange={(v) => onUpdate({ blockTrackers: v })}
        />
        <Toggle
          label="Anti-fingerprinting"
          enabled={settings.fingerprintProtection}
          onChange={(v) => onUpdate({ fingerprintProtection: v })}
        />
      </div>

      {/* Datos */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🗑 Datos</h3>
        <button
          onClick={handleReset}
          style={{
            ...styles.resetButton,
            background: confirmReset ? '#3f1d1d' : '#14141f',
            color: confirmReset ? '#fca5a5' : '#94a3b8',
          }}
        >
          {confirmReset ? '⚠ Toca de nuevo para confirmar' : 'Borrar todos los datos locales'}
        </button>
        <p style={styles.resetNote}>
          Esto elimina todos los escaneos y configuraciones almacenadas en este dispositivo.
        </p>
      </div>

      {/* Info */}
      <div style={styles.infoSection}>
        <p style={styles.infoText}>
          <strong style={{ color: '#8b5cf6' }}>Kernes v0.1.0</strong>
        </p>
        <p style={styles.infoText}>
          Licenciado bajo AGPLv3/GPLv3
        </p>
        <a
          href="https://kernes.org"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          kernes.org →
        </a>
      </div>
    </div>
  );
}

// ===================================================================
// TOGGLE COMPONENT
// ===================================================================

function Toggle({ label, enabled, onChange }: { label: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={styles.toggle}>
      <span style={styles.toggleLabel}>{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        style={{
          ...styles.toggleTrack,
          background: enabled ? '#8b5cf6' : '#1e1e2e',
        }}
      >
        <div
          style={{
            ...styles.toggleThumb,
            transform: enabled ? 'translateX(14px)' : 'translateX(2px)',
          }}
        />
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
  },
  section: {
    background: '#14141f',
    borderRadius: 10,
    padding: '12px 14px',
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 10,
  },
  levels: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  levelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid #1e1e2e',
    background: '#14141f',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  levelDot: {
    fontSize: 12,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: 600,
    minWidth: 60,
  },
  levelDesc: {
    color: '#64748b',
    fontSize: 10,
    marginLeft: 'auto',
  },
  toggle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #1e1e2e',
  },
  toggleLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  toggleTrack: {
    width: 34,
    height: 18,
    borderRadius: 9,
    border: 'none',
    cursor: 'pointer',
    position: 'relative' as const,
    transition: 'background 0.15s ease',
  },
  toggleThumb: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute' as const,
    top: 2,
    transition: 'transform 0.15s ease',
  },
  resetButton: {
    width: '100%',
    padding: '10px',
    borderRadius: 8,
    border: '1px solid #1e1e2e',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  resetNote: {
    color: '#475569',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center' as const,
  },
  infoSection: {
    textAlign: 'center' as const,
    padding: '12px',
  },
  infoText: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 4,
  },
  link: {
    color: '#8b5cf6',
    fontSize: 11,
    textDecoration: 'none',
  },
};
