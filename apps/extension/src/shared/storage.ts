/**
 * StorageManager
 * Wrapper tipado y seguro para chrome.storage.local.
 * Todas las operaciones son asíncronas y manejan errores.
 */

export class StorageManager {
  /**
   * Obtiene un valor del almacenamiento local.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] ?? null;
    } catch (err) {
      console.error(`[Kernes Storage] Error getting "${key}":`, err);
      return null;
    }
  }

  /**
   * Almacena un valor en el almacenamiento local.
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (err) {
      console.error(`[Kernes Storage] Error setting "${key}":`, err);
      throw err;
    }
  }

  /**
   * Elimina un valor del almacenamiento local.
   */
  async remove(key: string): Promise<void> {
    try {
      await chrome.storage.local.remove(key);
    } catch (err) {
      console.error(`[Kernes Storage] Error removing "${key}":`, err);
      throw err;
    }
  }

  /**
   * Elimina todos los datos del almacenamiento local.
   * ⚠️ USAR CON PRECAUCIÓN.
   */
  async clear(): Promise<void> {
    try {
      await chrome.storage.local.clear();
    } catch (err) {
      console.error('[Kernes Storage] Error clearing storage:', err);
      throw err;
    }
  }

  /**
   * Obtiene múltiples valores a la vez.
   */
  async getMultiple<T extends Record<string, any>>(keys: (keyof T)[]): Promise<Partial<T>> {
    try {
      const result = await chrome.storage.local.get(keys as string[]);
      return result as Partial<T>;
    } catch (err) {
      console.error('[Kernes Storage] Error getting multiple keys:', err);
      return {};
    }
  }

  /**
   * Escucha cambios en una clave específica.
   */
  onChanged<T>(key: string, callback: (newValue: T | null, oldValue: T | null) => void): void {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      if (key in changes) {
        callback(changes[key].newValue ?? null, changes[key].oldValue ?? null);
      }
    });
  }
}
