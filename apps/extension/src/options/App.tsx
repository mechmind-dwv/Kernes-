/**
 * Options App — Página de Opciones Completa
 * Configuración detallada de Kernes accesible desde chrome://extensions.
 */

import { useState } from 'react';
import { GeneralSettings } from './sections/GeneralSettings';
import { SentinelSettings } from './sections/SentinelSettings';
import { PrivacySettings } from './sections/PrivacySettings';
import { DataSettings } from './sections/DataSettings';
import { AboutSection } from './sections/AboutSection';

type TabId = 'general' | 'sentinel' | 'privacy' | 'data' | 'about';

const tabs: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'general', label: 'General', icon: '⚙' },
  { id: 'sentinel', label: 'Sentinel', icon: '👁' },
  { id: 'privacy', label: 'Privacidad', icon: '🔒' },
  { id: 'data', label: 'Datos', icon: '🗄' },
  { id: 'about', label: 'Acerca de', icon: 'ℹ' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('general');

  const renderTab = () => {
    switch (activeTab) {
      case 'general': return <GeneralSettings />;
      case 'sentinel': return <SentinelSettings />;
      case 'privacy': return <PrivacySettings />;
      case 'data': return <DataSettings />;
      case 'about': return <AboutSection />;
      default: return <GeneralSettings />;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>◈</span>
          <h1 style={styles.title}>Kernes — Opciones</h1>
        </div>
      </header>

      <div style={styles.layout}>
        {/* Sidebar */}
        <nav style={styles.sidebar}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                background: activeTab === tab.id ? '#14141f' : 'transparent',
                color: activeTab === tab.id ? '#8b5cf6' : '#94a3b8',
                borderLeftColor: activeTab === tab.id ? '#8b5cf6' : 'transparent',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <main style={styles.content}>
          {renderTab()}
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0f',
  },
  header: {
    padding: '20px 32px',
    borderBottom: '1px solid #1e1e2e',
    background: '#0e0e16',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    color: '#8b5cf6',
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: 700,
  },
  layout: {
    display: 'flex',
    maxWidth: 1000,
    margin: '0 auto',
    minHeight: 'calc(100vh - 73px)',
  },
  sidebar: {
    width: 220,
    padding: '20px 0',
    borderRight: '1px solid #1e1e2e',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '10px 20px',
    border: 'none',
    borderLeft: '3px solid transparent',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.15s ease',
  },
  content: {
    flex: 1,
    padding: '24px 32px',
  },
};
