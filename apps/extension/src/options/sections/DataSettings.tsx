/**
 * DataSettings — Gestión de Datos Almacenados
 */

import { useState } from 'react';

export function DataSettings() {
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleClearScans = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 5000);
      return;
    }
    chrome.storage.local.remove('sentinel-results').then(() => {
      alert('Resultados de escaneo eliminados.');
      setConfirmClear(false);
    });
  };

  const handleResetAll = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 5000);
      return;
    }
    chrome.storage.local.clear().then(() => {
      alert('Todos los datos eliminados. La extensión se reiniciará.');
      setConfirmReset(false);
    });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🗄 Gestión de Datos</h2>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Exportar Datos</h3>
        <p style={styles.desc}>Descarga todos tus datos de escaneo en formato JSON.</p>
        <button
          onClick={async () => {
            const data = await chrome.storage.local.get(null);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `kernes-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          style={styles.btnPrimary}
        >
          📥 Exportar datos (JSON)
        </button>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Eliminar Resultados de Escaneo</h3>
        <p style={styles.desc}>Borra todos los resultados de escaneo almacenados. La configuración se conserva.</p>
        <button
          onClick={handleClearScans}
          style={{
            ...styles.btnDanger,
            background: confirmClear ? '#7f1d1d' : '#14141f',
          }}
        >
          {confirmClear ? '⚠ Toca de nuevo para confirmar' : '🗑 Eliminar resultados'}
        </button>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Restablecer Extensión</h3>
        <p style={styles.desc}>
          <strong style={{ color: '#fca5a5' }}>⚠ Precaución:</strong> Esto elimina TODOS los datos,
          incluyendo configuración y resultados. La extensión volverá a su estado inicial.
        </p>
        <button
          onClick={handleResetAll}
          style={{
            ...styles.btnDanger,
            background: confirmReset ? '#7f1d1d' : '#14141f',
          }}
        >
          {confirmReset ? '⚠ Toca de nuevo para confirmar' : '♻ Restablecer todo'}
        </button>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Privacidad de Datos</h3>
        <p style={styles.text}>
          <strong style={{ color: '#86efac' }}>✓ Todo el procesamiento es local.</strong>
        </p>
        <p style={styles.text}>
          Los datos de escaneo nunca salen de tu dispositivo. No tenemos servidores centralizados
          que almacenen tu historial de navegación.
        </p>
        <p style={styles.text}>
          La única comunicación externa es la actualización de la base de datos de trackers,
          que descarga una lista pública de dominios conocidos (sin datos personales).
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 20 },
  title: { color: '#f8fafc', fontSize: 22, fontWeight: 700, marginBottom: 8 },
  section: { background: '#14141f', borderRadius: 10, padding: '16px 20px', marginBottom: 12 },
  sectionTitle: { color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: 10 },
  desc: { color: '#64748b', fontSize: 12, marginBottom: 12 },
  text: { color: '#94a3b8', fontSize: 12, lineHeight: 1.6, marginBottom: 8 },
  btnPrimary: {
    padding: '10px 20px', background: '#8b5cf6', color: '#fff', border: 'none',
    borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  btnDanger: {
    padding: '10px 20px', background: '#14141f', color: '#fca5a5', border: '1px solid #3f1d1d',
    borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s ease',
  },
};
