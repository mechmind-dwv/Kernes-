/**
 * Kernes Content Script
 * Se inyecta en todas las páginas web para:
 * - Detectar intentos de fingerprinting (canvas, WebGL, AudioContext, etc.)
 * - Instrumentar APIs potencialmente invasivas
 * - Reportar hallazgos al background script
 * - Bloquear scripts de trackers conocidos
 */

import { FingerprintDetector } from './fingerprint-detector';
import { DOMInstrumenter } from './dom-instrumenter';

// Solo ejecutar en el frame principal (no en iframes de anuncios)
if (window.self === window.top) {
  console.log('[Kernes Content] Inicializando en:', location.href);

  // Inicializar detector de fingerprinting
  const fingerprintDetector = new FingerprintDetector();
  fingerprintDetector.startMonitoring();

  // Instrumentar APIs del DOM para detectar acceso a datos sensibles
  const domInstrumenter = new DOMInstrumenter();
  domInstrumenter.instrument();

  // Escuchar mensajes del background/popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'CONTENT_GET_FINGERPRINT': {
        const report = fingerprintDetector.getReport();
        sendResponse({ success: true, report });
        break;
      }

      case 'CONTENT_GET_DOM_ACCESS': {
        const accesses = domInstrumenter.getAccessLog();
        sendResponse({ success: true, accesses });
        break;
      }

      default:
        sendResponse({ success: false, error: 'Unknown message' });
    }

    return false;
  });

  // Reportar scripts de terceros cargados en la página
  reportThirdPartyScripts();
}

/**
 * Analiza todos los scripts cargados en la página y reporta los de terceros.
 */
function reportThirdPartyScripts(): void {
  const pageDomain = location.hostname;
  const scripts = document.querySelectorAll('script[src]');
  const thirdPartyScripts: Array<{ src: string; domain: string }> = [];

  scripts.forEach((script) => {
    const src = script.getAttribute('src');
    if (!src) return;

    try {
      const scriptUrl = new URL(src, location.href);
      const scriptDomain = scriptUrl.hostname;

      if (scriptDomain !== pageDomain && !scriptDomain.endsWith(`.${pageDomain}`)) {
        thirdPartyScripts.push({ src, domain: scriptDomain });
      }
    } catch {
      // URL inválida, ignorar
    }
  });

  if (thirdPartyScripts.length > 0) {
    chrome.runtime.sendMessage({
      type: 'CONTENT_THIRD_PARTY_SCRIPTS',
      payload: {
        url: location.href,
        domain: pageDomain,
        scripts: thirdPartyScripts,
        timestamp: Date.now(),
      },
    }).catch(() => {
      // Background puede no estar disponible
    });
  }
}

// Observar nuevos scripts añadidos dinámicamente
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node instanceof HTMLScriptElement && node.src) {
        reportThirdPartyScripts();
      }
    }
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});
