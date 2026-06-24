/**
 * FingerprintDetector
 * Detecta y bloquea técnicas de fingerprinting de navegador:
 * - Canvas fingerprinting (2D y WebGL)
 * - AudioContext fingerprinting
 * - Font enumeration
 * - Navigator properties
 * - Screen/Window dimension tracking
 * - WebRTC IP leak
 */

export interface FingerprintReport {
  canvas: { detected: boolean; method?: string; blocked: boolean };
  webgl: { detected: boolean; method?: string; blocked: boolean };
  audio: { detected: boolean; method?: string; blocked: boolean };
  fonts: { detected: boolean; count?: number; blocked: boolean };
  navigator: { detected: boolean; propertiesAccessed: string[] };
  screen: { detected: boolean; dimensions?: string };
  webrtc: { detected: boolean; blocked: boolean };
  score: number; // 0-100, más alto = más fingerprintable
  timestamp: number;
}

export class FingerprintDetector {
  private report: FingerprintReport;
  private navigatorAccessed: Set<string> = new Set();
  private isMonitoring: boolean = false;

  constructor() {
    this.report = this.createEmptyReport();
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    this.detectCanvasFingerprinting();
    this.detectWebGLFingerprinting();
    this.detectAudioFingerprinting();
    this.detectFontEnumeration();
    this.detectNavigatorAccess();
    this.detectScreenTracking();
    this.detectWebRTCLeak();

    // Recalcular score periódicamente
    setInterval(() => this.calculateScore(), 5000);
  }

  getReport(): FingerprintReport {
    this.calculateScore();
    return { ...this.report, timestamp: Date.now() };
  }

  private createEmptyReport(): FingerprintReport {
    return {
      canvas: { detected: false, blocked: false },
      webgl: { detected: false, blocked: false },
      audio: { detected: false, blocked: false },
      fonts: { detected: false, blocked: false },
      navigator: { detected: false, propertiesAccessed: [] },
      screen: { detected: false },
      webrtc: { detected: false, blocked: false },
      score: 0,
      timestamp: Date.now(),
    };
  }

  // ===================================================================
  // CANVAS FINGERPRINTING
  // ===================================================================

  private detectCanvasFingerprinting(): void {
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    const detector = this;

    // Hook toDataURL
    HTMLCanvasElement.prototype.toDataURL = function (
      type?: string,
      quality?: unknown
    ): string {
      const width = this.width;
      const height = this.height;

      // Detectar canvas de fingerprinting: dimensiones características
      const isFingerprinting = detector.isLikelyFingerprintingCanvas(width, height);

      if (isFingerprinting && !detector.report.canvas.detected) {
        detector.report.canvas = {
          detected: true,
          method: `toDataURL (${width}x${height})`,
          blocked: false, // MVP: detectar primero, bloquear después
        };

        detector.notifyBackground('CANVAS_FINGERPRINTING', {
          method: 'toDataURL',
          dimensions: `${width}x${height}`,
          url: location.href,
        });
      }

      return originalToDataURL.call(this, type, quality as number);
    };

    // Hook getImageData
    CanvasRenderingContext2D.prototype.getImageData = function (
      sx: number,
      sy: number,
      sw: number,
      sh: number
    ): ImageData {
      const isSuspicious = sw <= 300 && sh <= 50; // Canvas de fingerprinting típico

      if (isSuspicious && !detector.report.canvas.detected) {
        detector.report.canvas = {
          detected: true,
          method: `getImageData (${sw}x${sh})`,
          blocked: false,
        };

        detector.notifyBackground('CANVAS_FINGERPRINTING', {
          method: 'getImageData',
          dimensions: `${sw}x${sh}`,
          url: location.href,
        });
      }

      return originalGetImageData.call(this, sx, sy, sw, sh);
    };
  }

  private isLikelyFingerprintingCanvas(width: number, height: number): boolean {
    // Dimensiones típicas de canvas de fingerprinting
    const fingerprintingSizes = [
      [16, 16], [125, 125], [200, 20], [220, 30],
      [300, 50], [450, 60], [500, 60], [1000, 100],
    ];

    return fingerprintingSizes.some(
      ([w, h]) => width === w && height === h
    ) || (width > 0 && height > 0 && width < 1000 && height < 200);
  }

  // ===================================================================
  // WEBGL FINGERPRINTING
  // ===================================================================

  private detectWebGLFingerprinting(): void {
    const canvasProto = HTMLCanvasElement.prototype;
    const originalGetContext = canvasProto.getContext;
    const detector = this;

    canvasProto.getContext = function (
      contextId: string,
      options?: any
    ): RenderingContext | null {
      if (contextId === 'webgl' || contextId === 'experimental-webgl') {
        const gl = originalGetContext.call(this, contextId, options) as WebGLRenderingContext | null;

        if (gl && !detector.report.webgl.detected) {
          detector.report.webgl = {
            detected: true,
            method: 'getContext("webgl")',
            blocked: false,
          };

          // Hook getParameter para detectar fingerprinting
          const originalGetParameter = gl.getParameter;
          const accessedParams: string[] = [];

          gl.getParameter = function (pname: number): any {
            const paramNames: Record<number, string> = {
              37445: 'UNMASKED_VENDOR_WEBGL',
              37446: 'UNMASKED_RENDERER_WEBGL',
              3414: 'ALPHA_BITS',
              3415: 'DEPTH_BITS',
              3416: 'STENCIL_BITS',
            };

            if (paramNames[pname]) {
              accessedParams.push(paramNames[pname]);

              if (accessedParams.includes('UNMASKED_VENDOR_WEBGL') &&
                  accessedParams.includes('UNMASKED_RENDERER_WEBGL')) {
                detector.report.webgl.method = 'getParameter (GPU info)';
                detector.notifyBackground('WEBGL_FINGERPRINTING', {
                  parameters: accessedParams,
                  url: location.href,
                });
              }
            }

            return originalGetParameter.call(this, pname);
          };

          detector.notifyBackground('WEBGL_FINGERPRINTING', {
            method: 'getContext',
            url: location.href,
          });
        }

        return gl as any;
      }

      return originalGetContext.call(this, contextId as any, options);
    };
  }

  // ===================================================================
  // AUDIOCONTEXT FINGERPRINTING
  // ===================================================================

  private detectAudioFingerprinting(): void {
    const detector = this;

    const hookAudioContext = (cls: any) => {
      const originalCreateOscillator = cls.prototype.createOscillator;
      const originalCreateDynamicsCompressor = cls.prototype.createDynamicsCompressor;
      const originalCreateAnalyser = cls.prototype.createAnalyser;

      cls.prototype.createOscillator = function (...args: any[]) {
        detector.reportAudioMethod('createOscillator');
        return originalCreateOscillator.apply(this, args);
      };

      cls.prototype.createDynamicsCompressor = function (...args: any[]) {
        detector.reportAudioMethod('createDynamicsCompressor');
        return originalCreateDynamicsCompressor.apply(this, args);
      };

      cls.prototype.createAnalyser = function (...args: any[]) {
        detector.reportAudioMethod('createAnalyser');
        return originalCreateAnalyser.apply(this, args);
      };
    };

    if (window.AudioContext) {
      hookAudioContext(window.AudioContext);
    }
    if ((window as any).webkitAudioContext) {
      hookAudioContext((window as any).webkitAudioContext);
    }
  }

  private reportAudioMethod(method: string): void {
    if (this.report.audio.detected) return;

    // Fingerprinting de audio típicamente usa oscilador + compresor
    this.report.audio = {
      detected: true,
      method: `AudioContext.${method}`,
      blocked: false,
    };

    this.notifyBackground('AUDIO_FINGERPRINTING', {
      method,
      url: location.href,
    });
  }

  // ===================================================================
  // FONT ENUMERATION
  // ===================================================================

  private detectFontEnumeration(): void {
    const detector = this;

    // Hook document.fonts.ready y check
    if (document.fonts) {
      const originalCheck = document.fonts.check;
      const accessedFonts = new Set<string>();

      document.fonts.check = function (font: string, text?: string): boolean {
        accessedFonts.add(font);

        if (accessedFonts.size > 20 && !detector.report.fonts.detected) {
          detector.report.fonts = {
            detected: true,
            count: accessedFonts.size,
            blocked: false,
          };

          detector.notifyBackground('FONT_ENUMERATION', {
            count: accessedFonts.size,
            fonts: Array.from(accessedFonts).slice(0, 10),
            url: location.href,
          });
        }

        return originalCheck.call(this, font, text);
      };
    }
  }

  // ===================================================================
  // NAVIGATOR ACCESS
  // ===================================================================

  private detectNavigatorAccess(): void {
    const sensitiveProps = [
      'userAgent', 'platform', 'language', 'languages', 'hardwareConcurrency',
      'maxTouchPoints', 'deviceMemory', 'connection', 'plugins', 'mimeTypes',
      'doNotTrack', 'cookieEnabled', 'pdfViewerEnabled', 'webdriver',
    ];

    const detector = this;

    for (const prop of sensitiveProps) {
      if (prop in navigator) {
        try {
          const descriptor = Object.getOwnPropertyDescriptor(navigator, prop);
          if (descriptor?.get) {
            const originalGet = descriptor.get;
            Object.defineProperty(navigator, prop, {
              get() {
                detector.navigatorAccessed.add(prop);
                detector.report.navigator = {
                  detected: true,
                  propertiesAccessed: Array.from(detector.navigatorAccessed),
                };
                return originalGet.call(navigator);
              },
            });
          }
        } catch {
          // Algunas propiedades no se pueden redefinir
        }
      }
    }
  }

  // ===================================================================
  // SCREEN TRACKING
  // ===================================================================

  private detectScreenTracking(): void {
    // Detectar acceso frecuente a dimensiones de pantalla
    let accessCount = 0;
    const props = ['width', 'height', 'availWidth', 'availHeight', 'colorDepth', 'pixelDepth'];

    for (const prop of props) {
      if (prop in screen) {
        try {
          const descriptor = Object.getOwnPropertyDescriptor(screen, prop);
          if (descriptor?.get) {
            const originalGet = descriptor.get;
            const detector = this;

            Object.defineProperty(screen, prop, {
              get() {
                accessCount++;
                if (accessCount > 10 && !detector.report.screen.detected) {
                  detector.report.screen = {
                    detected: true,
                    dimensions: `${screen.width}x${screen.height}`,
                  };
                }
                return originalGet.call(screen);
              },
            });
          }
        } catch {
          // Ignorar
        }
      }
    }
  }

  // ===================================================================
  // WEBRTC IP LEAK
  // ===================================================================

  private detectWebRTCLeak(): void {
    if (!window.RTCPeerConnection) return;

    const detector = this;
    const OriginalRTCPeerConnection = window.RTCPeerConnection;

    (window as any).RTCPeerConnection = function (...args: any[]) {
      const pc = new OriginalRTCPeerConnection(...args);

      if (!detector.report.webrtc.detected) {
        detector.report.webrtc = {
          detected: true,
          blocked: false,
        };

        detector.notifyBackground('WEBRTC_DETECTED', {
          url: location.href,
        });
      }

      return pc;
    };

    // Copiar propiedades estáticas
    Object.setPrototypeOf((window as any).RTCPeerConnection, OriginalRTCPeerConnection);
    Object.keys(OriginalRTCPeerConnection).forEach((key) => {
      (window as any).RTCPeerConnection[key] = (OriginalRTCPeerConnection as any)[key];
    });
  }

  // ===================================================================
  // SCORE CALCULATION
  // ===================================================================

  private calculateScore(): void {
    let score = 0;
    const r = this.report;

    if (r.canvas.detected) score += 25;
    if (r.webgl.detected) score += 20;
    if (r.audio.detected) score += 15;
    if (r.fonts.detected) score += 10;
    if (r.navigator.detected) score += 10;
    if (r.screen.detected) score += 5;
    if (r.webrtc.detected) score += 15;

    this.report.score = Math.min(score, 100);
  }

  // ===================================================================
  // NOTIFICATION
  // ===================================================================

  private notifyBackground(type: string, data: Record<string, unknown>): void {
    chrome.runtime.sendMessage({
      type: 'FINGERPRINT_DETECTED',
      payload: { type, data, url: location.href, timestamp: Date.now() },
    }).catch(() => {
      // Background puede no estar disponible
    });
  }
}
