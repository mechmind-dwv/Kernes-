/**
 * AboutSection — Acerca de Kernes
 */

export function AboutSection() {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>ℹ Acerca de Kernes</h2>

      <div style={styles.section}>
        <div style={styles.logoRow}>
          <span style={{ color: '#8b5cf6', fontSize: 36 }}>◈</span>
          <div>
            <h3 style={{ color: '#f8fafc', fontSize: 18, fontWeight: 700 }}>Kernes</h3>
            <p style={{ color: '#64748b', fontSize: 12 }}>v0.1.0 — Contravigilancia Digital</p>
          </div>
        </div>
        <p style={styles.text}>
          Kernes es una herramienta de código abierto diseñada para contrarrestar los abusos
          de privacidad y vigilancia masiva llevados a cabo por plataformas que integran y
          analizan datos personales sin consentimiento real ni transparencia.
        </p>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🛡 Lo que hace</h3>
        <ul style={styles.list}>
          <li>Detecta trackers, fingerprinting y cookies de terceros</li>
          <li>Analiza headers HTTP en busca de señales de vigilancia</li>
          <li>Genera un score de privacidad por sitio web</li>
          <li>Ofrece protección activa contra el rastreo</li>
          <li>Todo el procesamiento ocurre en tu dispositivo (local-first)</li>
        </ul>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📜 Licencias</h3>
        <p style={styles.text}>
          <strong>Extensión:</strong> GNU General Public License v3.0 (GPL-3.0)
        </p>
        <p style={styles.text}>
          <strong>Servidor:</strong> GNU Affero General Public License v3.0 (AGPL-3.0)
        </p>
        <p style={styles.text}>
          <strong>Documentación:</strong> Creative Commons BY-SA 4.0
        </p>
        <p style={styles.text}>
          Eres libre de usar, modificar y distribuir Kernes siempre que mantengas
          la misma licencia para trabajos derivados.
        </p>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🔗 Enlaces</h3>
        <div style={styles.links}>
          <a href="https://kernes.org" target="_blank" rel="noopener noreferrer" style={styles.link}>🌐 kernes.org</a>
          <a href="https://github.com/mechmind-dwv/Kernes-" target="_blank" rel="noopener noreferrer" style={styles.link}>📁 GitHub</a>
          <a href="https://docs.kernes.org" target="_blank" rel="noopener noreferrer" style={styles.link}>📖 Documentación</a>
          <a href="mailto:dev@kernes.org" style={styles.link}>✉ Contacto</a>
        </div>
      </div>

      <div style={{ ...styles.section, textAlign: 'center' }}>
        <p style={{ color: '#8b5cf6', fontSize: 13, fontWeight: 600 }}>
          ◈ Privacidad es un derecho humano. Defiéndelo.
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
  logoRow: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 },
  text: { color: '#94a3b8', fontSize: 12, lineHeight: 1.6, marginBottom: 8 },
  list: { color: '#94a3b8', fontSize: 12, lineHeight: 1.8, paddingLeft: 16 },
  links: { display: 'flex', flexDirection: 'column', gap: 8 },
  link: { color: '#8b5cf6', fontSize: 13, textDecoration: 'none' },
};
