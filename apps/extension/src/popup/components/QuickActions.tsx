/**
 * QuickActions — Acciones Rápidas del Popup
 * Botones para activar/desactivar protecciones comunes.
 */

import { useState } from 'react';

interface Action {
  id: string;
  icon: string;
  label: string;
  description: string;
  active: boolean;
}

export function QuickActions() {
  const [actions, setActions] = useState<Action[]>([
    {
      id: 'block-trackers',
      icon: '🛡',
      label: 'Bloquear Trackers',
      description: 'Bloquea scripts de rastreo conocidos',
      active: true,
    },
    {
      id: 'anti-fingerprint',
      icon: '👤',
      label: 'Anti-Fingerprint',
      description: 'Dificulta la identificación de tu navegador',
      active: true,
    },
    {
      id: 'block-cookies-3p',
      icon: '🍪',
      label: 'Bloquear Cookies 3P',
      description: 'Evita cookies de terceros',
      active: false,
    },
    {
      id: 'https-only',
      icon: '🔒',
      label: 'Forzar HTTPS',
      description: 'Siempre usa conexiones cifradas',
      active: true,
    },
  ]);

  const toggleAction = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );

    // Notificar al background script
    const action = actions.find((a) => a.id === id);
    if (action) {
      chrome.runtime.sendMessage({
        type: 'TOGGLE_PROTECTION',
        payload: { id, active: !action.active },
      }).catch(() => {});
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>⚡ Protecciones Rápidas</h3>
      <div style={styles.grid}>
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => toggleAction(action.id)}
            style={{
              ...styles.button,
              background: action.active ? '#141f2a' : '#14141f',
              borderColor: action.active ? '#1d4e6e' : '#1e1e2e',
            }}
          >
            <span style={{ fontSize: 18 }}>{action.icon}</span>
            <span
              style={{
                ...styles.label,
                color: action.active ? '#7dd3fc' : '#64748b',
              }}
            >
              {action.label}
            </span>
            <span style={styles.status}>
              {action.active ? '● ON' : '○ OFF'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: 4,
    marginBottom: 4,
  },
  title: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 8,
    paddingLeft: 4,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 6,
  },
  button: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 6px',
    borderRadius: 8,
    border: '1px solid #1e1e2e',
    background: '#14141f',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    gap: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: 500,
  },
  status: {
    fontSize: 9,
    color: '#475569',
    fontWeight: 600,
  },
};
