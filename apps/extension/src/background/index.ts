/**
 * Kernes Background Service Worker
 * Manifest V3 — Punto de entrada del service worker
 * 
 * Responsabilidades:
 * - Interceptar y analizar headers HTTP de todas las requests
 * - Mantener la base de datos de trackers actualizada
 * - Coordinar la comunicación entre content scripts y popup
 * - Programar tareas de escaneo periódico
 */

import { NetworkAnalyzer } from './network-analyzer';
import { TrackerDatabase } from './tracker-db';
import { SentinelScanner } from '@/sentinel/scanner';
import { StorageManager } from '@/shared/storage';

// Instancias singleton
const storage = new StorageManager();
const trackerDB = new TrackerDatabase();
const networkAnalyzer = new NetworkAnalyzer(trackerDB);
const scanner = new SentinelScanner(storage, trackerDB);

// ============================================================================
// LIFECYCLE DEL SERVICE WORKER
// ============================================================================

/**
 * Chrome puede terminar el service worker tras 30s de inactividad.
* Para funciones críticas que necesitan persistencia, usamos
 * keep-alive mediante alarms (ver chrome.alarms más abajo).
 */

self.addEventListener('install', () => {
  console.log('[Kernes BG] Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Kernes BG] Service Worker activado');
  // Tomar control inmediatamente
  (event as ExtendableEvent).waitUntil((self as any).clients.claim());
});

// ============================================================================
// INTERCEPTACIÓN DE RED (declarativeNetRequest + webRequest fallback)
// ============================================================================

/**
 * Analiza headers de respuesta para detectar trackers.
 * En Manifest V3 usamos declarativeNetRequest para bloqueo,
 * pero el análisis de headers lo hacemos via onHeadersReceived
 * con "host_permissions": ["<all_urls>"].
 */
chrome.webRequest?.onHeadersReceived?.addListener(
  (details) => {
    networkAnalyzer.analyzeHeaders(details);
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);

/**
 * Analiza cookies de terceros en requests salientes.
 */
chrome.webRequest?.onBeforeSendHeaders?.addListener(
  (details) => {
    networkAnalyzer.analyzeRequestHeaders(details);
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders']
);

// ============================================================================
// MENSAJERÍA (Content Script ↔ Popup ↔ Background)
// ============================================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message;

  switch (type) {
    // ------------------------------------------------------------------
    // SENTINEL — Escaneo y detección
    // ------------------------------------------------------------------
    case 'SENTINEL_SCAN_TAB': {
      const tabId = sender.tab?.id ?? payload?.tabId;
      if (tabId) {
        scanner.scanTab(tabId).then((result) => {
          sendResponse({ success: true, result });
        }).catch((err) => {
          sendResponse({ success: false, error: err.message });
        });
      } else {
        sendResponse({ success: false, error: 'No tab ID' });
      }
      return true; // Async response
    }

    case 'SENTINEL_GET_RESULT': {
      const { url } = payload ?? {};
      scanner.getResultForUrl(url).then((result) => {
        sendResponse({ success: true, result });
      });
      return true;
    }

    case 'SENTINEL_GET_SCORE': {
      scanner.calculateOverallScore().then((score) => {
        sendResponse({ success: true, score });
      });
      return true;
    }

    // ------------------------------------------------------------------
    // TRACKER DB — Consultas
    // ------------------------------------------------------------------
    case 'TRACKER_GET_FOR_URL': {
      const { url } = payload ?? {};
      const trackers = trackerDB.getTrackersForUrl(url);
      sendResponse({ success: true, trackers });
      break;
    }

    case 'TRACKER_GET_ALL': {
      const all = trackerDB.getAllTrackers();
      sendResponse({ success: true, trackers: all });
      break;
    }

    case 'TRACKER_UPDATE_DB': {
      trackerDB.updateDatabase().then(() => {
        sendResponse({ success: true });
      }).catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
      return true;
    }

    // ------------------------------------------------------------------
    // STORAGE — Datos persistentes
    // ------------------------------------------------------------------
    case 'STORAGE_GET': {
      const { key } = payload ?? {};
      storage.get(key).then((value) => {
        sendResponse({ success: true, value });
      });
      return true;
    }

    case 'STORAGE_SET': {
      const { key, value } = payload ?? {};
      storage.set(key, value).then(() => {
        sendResponse({ success: true });
      });
      return true;
    }

    // ------------------------------------------------------------------
    // SETTINGS — Configuración de la extensión
    // ------------------------------------------------------------------
    case 'SETTINGS_GET': {
      storage.get('settings').then((settings) => {
        sendResponse({
          success: true,
          settings: settings ?? getDefaultSettings(),
        });
      });
      return true;
    }

    case 'SETTINGS_SET': {
      const { settings } = payload ?? {};
      storage.set('settings', settings).then(() => {
        sendResponse({ success: true });
      });
      return true;
    }

    // ------------------------------------------------------------------
    // DEFAULT
    // ------------------------------------------------------------------
    default:
      console.warn('[Kernes BG] Mensaje desconocido:', type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }

  return false;
});

// ============================================================================
// ALARMAS — Tareas periódicas
// ============================================================================

chrome.alarms?.onAlarm?.addListener((alarm) => {
  switch (alarm.name) {
    case 'sentinel-periodic-scan': {
      console.log('[Kernes BG] Ejecutando escaneo periódico...');
      scanner.runPeriodicScan().catch(console.error);
      break;
    }

    case 'tracker-db-update': {
      console.log('[Kernes BG] Actualizando base de datos de trackers...');
      trackerDB.updateDatabase().catch(console.error);
      break;
    }

    default:
      break;
  }
});

// Programar alarmas al instalar
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    // Escaneo periódico cada 5 minutos
    chrome.alarms.create('sentinel-periodic-scan', {
      periodInMinutes: 5,
    });

    // Actualización de tracker DB cada 24 horas
    chrome.alarms.create('tracker-db-update', {
      periodInMinutes: 1440,
    });

    // Actualizar DB inmediatamente en install
    trackerDB.updateDatabase().catch(console.error);

    console.log('[Kernes BG] Alarmas programadas correctamente');
  }
});

// ============================================================================
// UTILIDADES
// ============================================================================

function getDefaultSettings() {
  return {
    protectionLevel: 'medium', // 'low' | 'medium' | 'paranoid'
    sentinelEnabled: true,
    chaffEnabled: false, // MVP: chaff viene en Fase 2
    lexaiEnabled: false, // MVP: lexai viene en Fase 2
    blockTrackers: true,
    fingerprintProtection: true,
    syntheticNavigation: false,
    searchDilution: false,
    whitelistedSites: [],
    language: 'es',
    firstRun: true,
  };
}

// ============================================================================
// KEEP-ALIVE (prevenir que el SW duerma durante operaciones críticas)
// ============================================================================

const keepAlivePorts = new Set<chrome.runtime.Port>();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'keep-alive') {
    keepAlivePorts.add(port);
    port.onDisconnect.addListener(() => {
      keepAlivePorts.delete(port);
    });
  }
});

console.log('[Kernes BG] Service Worker cargado y listo');
