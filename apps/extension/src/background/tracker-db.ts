/**
 * TrackerDatabase
 * Base de datos local de trackers, brokers de datos y plataformas de vigilancia.
 * Se actualiza periódicamente desde una fuente remota (IPFS/GitHub).
 */

export interface TrackerEntry {
  name: string;
  domain: string;
  category: 'surveillance' | 'advertising' | 'analytics' | 'fingerprinting' | 'data-broker';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  parentCompany?: string;
  alternatives?: string[];
}

// Base de datos inicial embebida (MVP — se actualiza remotamente después)
const DEFAULT_TRACKERS: TrackerEntry[] = [
  // Plataformas de vigilancia
  {
    name: 'Palantir Gotham',
    domain: 'palantir.com',
    category: 'surveillance',
    description: 'Plataforma de integración y análisis de datos masivos',
    severity: 'critical',
    parentCompany: 'Palantir Technologies',
  },
  {
    name: 'Palantir Foundry',
    domain: 'palantirfoundry.com',
    category: 'surveillance',
    description: 'Plataforma corporativa de análisis de datos',
    severity: 'critical',
    parentCompany: 'Palantir Technologies',
  },

  // Big Tech - Advertising/Tracking
  {
    name: 'Google Analytics',
    domain: 'google-analytics.com',
    category: 'analytics',
    description: 'Servicio de análisis web de Google',
    severity: 'high',
    parentCompany: 'Google/Alphabet',
    alternatives: ['Plausible', 'Fathom', 'Matomo'],
  },
  {
    name: 'Google DoubleClick',
    domain: 'doubleclick.net',
    category: 'advertising',
    description: 'Red de publicidad display de Google',
    severity: 'high',
    parentCompany: 'Google/Alphabet',
  },
  {
    name: 'Facebook Pixel',
    domain: 'connect.facebook.net',
    category: 'advertising',
    description: 'Píxel de seguimiento de Meta/Facebook',
    severity: 'high',
    parentCompany: 'Meta Platforms',
  },
  {
    name: 'Facebook Graph',
    domain: 'graph.facebook.com',
    category: 'data-broker',
    description: 'API de datos de Facebook',
    severity: 'high',
    parentCompany: 'Meta Platforms',
  },

  // Fingerprinting
  {
    name: 'FingerprintJS',
    domain: 'fingerprintjs.com',
    category: 'fingerprinting',
    description: 'Librería de fingerprinting de navegador',
    severity: 'critical',
  },
  {
    name: 'ThreatMetrix',
    domain: 'threatmetrix.com',
    category: 'fingerprinting',
    description: 'Fingerprinting para prevención de fraude',
    severity: 'high',
    parentCompany: 'LexisNexis',
  },

  // Data Brokers
  {
    name: 'Acxiom',
    domain: 'acxiom.com',
    category: 'data-broker',
    description: 'Broker de datos personales masivos',
    severity: 'critical',
  },
  {
    name: 'Experian',
    domain: 'experian.com',
    category: 'data-broker',
    description: 'Buró de crédito y broker de datos',
    severity: 'high',
  },
  {
    name: 'LiveRamp',
    domain: 'liveramp.com',
    category: 'data-broker',
    description: 'Plataforma de unificación de identidad',
    severity: 'critical',
  },
  {
    name: 'Oracle Data Cloud',
    domain: 'oracle.com',
    category: 'data-broker',
    description: 'División de datos de Oracle',
    severity: 'high',
    parentCompany: 'Oracle Corporation',
  },

  // Analytics adicionales
  {
    name: 'Segment',
    domain: 'segment.io',
    category: 'analytics',
    description: 'Plataforma de recolección de datos de usuario',
    severity: 'medium',
    parentCompany: 'Twilio',
  },
  {
    name: 'Mixpanel',
    domain: 'mixpanel.com',
    category: 'analytics',
    description: 'Análisis de producto y comportamiento de usuarios',
    severity: 'medium',
  },
  {
    name: 'Amplitude',
    domain: 'amplitude.com',
    category: 'analytics',
    description: 'Plataforma de análisis de producto',
    severity: 'medium',
  },

  // Advertising networks
  {
    name: 'AppNexus/Xandr',
    domain: 'adnxs.com',
    category: 'advertising',
    description: 'Plataforma de publicidad programática',
    severity: 'medium',
    parentCompany: 'Microsoft',
  },
  {
    name: 'Criteo',
    domain: 'criteo.com',
    category: 'advertising',
    description: 'Retargeting y publicidad personalizada',
    severity: 'medium',
  },
  {
    name: 'Taboola',
    domain: 'taboola.com',
    category: 'advertising',
    description: 'Publicidad nativa y recomendaciones de contenido',
    severity: 'low',
  },
];

const STORAGE_KEY = 'tracker-database';
const LAST_UPDATE_KEY = 'tracker-db-last-update';
const UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas

export class TrackerDatabase {
  private trackers: Map<string, TrackerEntry> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  /**
   * Inicializa la base de datos desde storage local o defaults.
   */
  private async init(): Promise<void> {
    if (this.initialized) return;

    try {
      const stored = await chrome.storage.local.get(STORAGE_KEY);
      if (stored[STORAGE_KEY]) {
        const entries: TrackerEntry[] = stored[STORAGE_KEY];
        entries.forEach((entry) => {
          this.trackers.set(entry.domain, entry);
        });
      } else {
        // Primera vez: usar defaults
        DEFAULT_TRACKERS.forEach((entry) => {
          this.trackers.set(entry.domain, entry);
        });
        await this.persist();
      }
      this.initialized = true;
    } catch (err) {
      console.error('[Kernes TrackerDB] Error initializing:', err);
      // Fallback a defaults sin persistencia
      DEFAULT_TRACKERS.forEach((entry) => {
        this.trackers.set(entry.domain, entry);
      });
    }
  }

  /**
   * Busca un tracker por su dominio exacto.
   */
  findByDomain(domain: string): TrackerEntry | undefined {
    return this.trackers.get(domain);
  }

  /**
   * Busca trackers que coincidan parcialmente con un dominio.
   */
  searchByDomain(domain: string): TrackerEntry[] {
    const results: TrackerEntry[] = [];
    for (const [key, entry] of this.trackers) {
      if (domain.includes(key) || key.includes(domain)) {
        results.push(entry);
      }
    }
    return results;
  }

  /**
   * Obtiene todos los trackers para una URL dada.
   */
  getTrackersForUrl(url: string): TrackerEntry[] {
    try {
      const domain = new URL(url).hostname;
      return this.searchByDomain(domain);
    } catch {
      return [];
    }
  }

  /**
   * Devuelve todos los trackers.
   */
  getAllTrackers(): TrackerEntry[] {
    return Array.from(this.trackers.values());
  }

  /**
   * Devuelve trackers por categoría.
   */
  getByCategory(category: TrackerEntry['category']): TrackerEntry[] {
    return this.getAllTrackers().filter((t) => t.category === category);
  }

  /**
   * Actualiza la base de datos desde la fuente remota.
   * En MVP usamos un JSON estático en GitHub; en futuro será IPFS.
   */
  async updateDatabase(): Promise<void> {
    const lastUpdate = await this.getLastUpdateTime();
    const now = Date.now();

    if (now - lastUpdate < UPDATE_INTERVAL_MS) {
      return; // No es necesario actualizar
    }

    try {
      // Fuente remota: JSON público en el repo de Kernes
      const response = await fetch(
        'https://raw.githubusercontent.com/mechmind-dwv/Kernes-/main/packages/sentinel-core/trackers.json',
        { cache: 'no-cache' }
      );

      if (response.ok) {
        const data: TrackerEntry[] = await response.json();
        this.trackers.clear();
        data.forEach((entry) => {
          this.trackers.set(entry.domain, entry);
        });
        await this.persist();
        await chrome.storage.local.set({ [LAST_UPDATE_KEY]: now });
        console.log(`[Kernes TrackerDB] Actualizada: ${data.length} trackers`);
      }
    } catch (err) {
      console.warn('[Kernes TrackerDB] No se pudo actualizar remotamente:', err);
      // Silenciosamente falla — seguimos con la DB local
    }
  }

  /**
   * Añade un tracker manualmente (para testing o contribuciones).
   */
  addTracker(entry: TrackerEntry): void {
    this.trackers.set(entry.domain, entry);
    this.persist().catch(console.error);
  }

  /**
   * Persiste la base de datos en storage local.
   */
  private async persist(): Promise<void> {
    const data = this.getAllTrackers();
    await chrome.storage.local.set({ [STORAGE_KEY]: data });
  }

  /**
   * Obtiene la última vez que se actualizó la DB.
   */
  private async getLastUpdateTime(): Promise<number> {
    const stored = await chrome.storage.local.get(LAST_UPDATE_KEY);
    return stored[LAST_UPDATE_KEY] ?? 0;
  }
}
