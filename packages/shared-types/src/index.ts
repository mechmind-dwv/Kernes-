/**
 * @kernes/shared-types
 * Tipos TypeScript compartidos entre todos los módulos de Kernes.
 */

// ============================================================================
// SENTINEL — Detección y escaneo
// ============================================================================

export interface NetworkEvent {
  type: string;
  url: string;
  tabId: number;
  initiator?: string;
  timestamp: number;
  findings: TrackerMatch[];
}

export interface TrackerMatch {
  type: string;
  source: string;
  detail: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

export interface FingerprintReport {
  canvas: { detected: boolean; method?: string; blocked: boolean };
  webgl: { detected: boolean; method?: string; blocked: boolean };
  audio: { detected: boolean; method?: string; blocked: boolean };
  fonts: { detected: boolean; count?: number; blocked: boolean };
  navigator: { detected: boolean; propertiesAccessed: string[] };
  screen: { detected: boolean; dimensions?: string };
  webrtc: { detected: boolean; blocked: boolean };
  score: number;
  timestamp: number;
}

// ============================================================================
// SETTINGS — Configuración de la extensión
// ============================================================================

export interface ExtensionSettings {
  protectionLevel: 'low' | 'medium' | 'paranoid';
  sentinelEnabled: boolean;
  chaffEnabled: boolean;
  lexaiEnabled: boolean;
  blockTrackers: boolean;
  fingerprintProtection: boolean;
  syntheticNavigation: boolean;
  searchDilution: boolean;
  whitelistedSites: string[];
  language: string;
  firstRun: boolean;
}

// ============================================================================
// API — Respuestas del API Gateway
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TrackerListResponse {
  trackers: Array<{
    name: string;
    domain: string;
    category: string;
    severity: string;
    parentCompany?: string;
  }>;
  updatedAt: number;
}

// ============================================================================
// PRIVACY — Informes y scores
// ============================================================================

export interface PrivacyScore {
  overall: number;
  grade: string;
  byCategory: Record<string, number>;
  lastUpdated: number;
}

export interface PrivacyReport {
  generatedAt: number;
  score: PrivacyScore;
  sites: SitePrivacyReport[];
  recommendations: string[];
}

export interface SitePrivacyReport {
  domain: string;
  score: number;
  trackers: string[];
  fingerprinting: boolean;
  thirdPartyCookies: number;
  lastVisited: number;
}
