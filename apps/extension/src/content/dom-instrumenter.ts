/**
 * DOMInstrumenter
 * Instrumenta APIs del DOM para detectar acceso a datos sensibles
 * por parte de scripts de terceros.
 */

export interface DOMAccessEvent {
  api: string;
  property: string;
  stack?: string;
  timestamp: number;
}

export class DOMInstrumenter {
  private accessLog: DOMAccessEvent[] = [];
  private readonly MAX_LOG_SIZE = 1000;

  instrument(): void {
    this.instrumentStorageAPIs();
    this.instrumentCanvasAPIs();
    this.instrumentNavigatorAPIs();
    this.instrumentSensorAPIs();
  }

  getAccessLog(): DOMAccessEvent[] {
    return [...this.accessLog];
  }

  // ===================================================================
  // STORAGE APIs (localStorage, sessionStorage, IndexedDB, cookies)
  // ===================================================================

  private instrumentStorageAPIs(): void {
    const instrumenter = this;

    // localStorage
    const originalSetItem = Storage.prototype.setItem;
    const originalGetItem = Storage.prototype.getItem;
    const originalRemoveItem = Storage.prototype.removeItem;

    Storage.prototype.setItem = function (key: string, value: string): void {
      if (this === localStorage || this === sessionStorage) {
        instrumenter.log({
          api: this === localStorage ? 'localStorage' : 'sessionStorage',
          property: `setItem("${key}")`,
          stack: instrumenter.getStackTrace(),
        });
      }
      return originalSetItem.call(this, key, value);
    };

    Storage.prototype.getItem = function (key: string): string | null {
      if (this === localStorage || this === sessionStorage) {
        instrumenter.log({
          api: this === localStorage ? 'localStorage' : 'sessionStorage',
          property: `getItem("${key}")`,
          stack: instrumenter.getStackTrace(),
        });
      }
      return originalGetItem.call(this, key);
    };

    Storage.prototype.removeItem = function (key: string): void {
      if (this === localStorage || this === sessionStorage) {
        instrumenter.log({
          api: this === localStorage ? 'localStorage' : 'sessionStorage',
          property: `removeItem("${key}")`,
          stack: instrumenter.getStackTrace(),
        });
      }
      return originalRemoveItem.call(this, key);
    };

    // document.cookie
    const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
    if (originalCookieDescriptor?.get || originalCookieDescriptor?.set) {
      Object.defineProperty(Document.prototype, 'cookie', {
        get() {
          instrumenter.log({
            api: 'document',
            property: 'cookie (get)',
            stack: instrumenter.getStackTrace(),
          });
          return originalCookieDescriptor.get?.call(this) ?? '';
        },
        set(value: string) {
          instrumenter.log({
            api: 'document',
            property: `cookie (set: "${value.slice(0, 50)}...")`,
            stack: instrumenter.getStackTrace(),
          });
          originalCookieDescriptor.set?.call(this, value);
        },
      });
    }
  }

  // ===================================================================
  // CANVAS APIs
  // ===================================================================

  private instrumentCanvasAPIs(): void {
    const instrumenter = this;
    const methods = ['toDataURL', 'toBlob', 'getImageData'] as const;

    for (const method of methods) {
      const original = (HTMLCanvasElement.prototype as any)[method] ??
        (CanvasRenderingContext2D.prototype as any)[method];

      if (original) {
        const target = method === 'getImageData'
          ? CanvasRenderingContext2D.prototype
          : HTMLCanvasElement.prototype;

        (target as any)[method] = function (...args: any[]) {
          instrumenter.log({
            api: 'Canvas',
            property: `${method}()`,
            stack: instrumenter.getStackTrace(),
          });
          return original.apply(this, args);
        };
      }
    }
  }

  // ===================================================================
  // NAVIGATOR APIs (geolocation, media devices, etc.)
  // ===================================================================

  private instrumentNavigatorAPIs(): void {
    const instrumenter = this;

    // Geolocation
    if (navigator.geolocation) {
      const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition;
      navigator.geolocation.getCurrentPosition = function (
        success: PositionCallback,
        error?: PositionErrorCallback | null,
        options?: PositionOptions
      ): void {
        instrumenter.log({
          api: 'navigator.geolocation',
          property: 'getCurrentPosition()',
          stack: instrumenter.getStackTrace(),
        });
        return originalGetCurrentPosition.call(this, success, error, options);
      };

      const originalWatchPosition = navigator.geolocation.watchPosition;
      navigator.geolocation.watchPosition = function (
        success: PositionCallback,
        error?: PositionErrorCallback | null,
        options?: PositionOptions
      ): number {
        instrumenter.log({
          api: 'navigator.geolocation',
          property: 'watchPosition()',
          stack: instrumenter.getStackTrace(),
        });
        return originalWatchPosition.call(this, success, error, options);
      };
    }

    // Media Devices (cámara, micrófono)
    if (navigator.mediaDevices) {
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
      navigator.mediaDevices.getUserMedia = function (constraints?: MediaStreamConstraints) {
        instrumenter.log({
          api: 'navigator.mediaDevices',
          property: `getUserMedia(${JSON.stringify(constraints)})`,
          stack: instrumenter.getStackTrace(),
        });
        return originalGetUserMedia.call(navigator.mediaDevices, constraints);
      };

      const originalEnumerateDevices = navigator.mediaDevices.enumerateDevices;
      navigator.mediaDevices.enumerateDevices = function () {
        instrumenter.log({
          api: 'navigator.mediaDevices',
          property: 'enumerateDevices()',
          stack: instrumenter.getStackTrace(),
        });
        return originalEnumerateDevices.call(navigator.mediaDevices);
      };
    }

    // Bluetooth, USB, Serial (Web APIs avanzadas)
    const advancedAPIs = ['bluetooth', 'usb', 'serial', 'hid', 'permissions'] as const;
    for (const api of advancedAPIs) {
      if ((navigator as any)[api]) {
        instrumenter.log({
          api: `navigator.${api}`,
          property: 'API disponible',
          stack: instrumenter.getStackTrace(),
        });
      }
    }
  }

  // ===================================================================
  // SENSOR APIs (accelerometer, gyroscope, magnetometer)
  // ===================================================================

  private instrumentSensorAPIs(): void {
    const instrumenter = this;

    // DeviceMotion
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ): void {
      if (type === 'devicemotion' || type === 'deviceorientation') {
        instrumenter.log({
          api: 'window',
          property: `addEventListener("${type}")`,
          stack: instrumenter.getStackTrace(),
        });
      }
      return originalAddEventListener.call(this, type, listener, options);
    };

    // Sensors API (Accelerometer, Gyroscope, Magnetometer)
    const sensorClasses = ['Accelerometer', 'Gyroscope', 'Magnetometer', 'AbsoluteOrientationSensor'];
    for (const sensorName of sensorClasses) {
      if (sensorName in window) {
        instrumenter.log({
          api: 'window',
          property: `${sensorName} disponible`,
          stack: instrumenter.getStackTrace(),
        });
      }
    }
  }

  // ===================================================================
  // UTILIDADES
  // ===================================================================

  private log(event: Omit<DOMAccessEvent, 'timestamp'>): void {
    if (this.accessLog.length >= this.MAX_LOG_SIZE) {
      this.accessLog.shift();
    }
    this.accessLog.push({ ...event, timestamp: Date.now() });
  }

  private getStackTrace(): string | undefined {
    try {
      throw new Error('Stack trace');
    } catch (e: any) {
      const stack = e.stack as string;
      const lines = stack.split('\n');
      // Filtrar las primeras 3 líneas (nuestros hooks) y devolver el origen real
      const relevant = lines.slice(4, 7).map((l) => l.trim()).join('; ');
      return relevant.length > 200 ? relevant.slice(0, 200) + '...' : relevant;
    }
  }
}
