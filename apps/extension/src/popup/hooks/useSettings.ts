/**
 * useSettings — Hook para la configuración de la extensión
 * Lee y modifica las preferencias del usuario.
 */

import { useState, useEffect, useCallback } from 'react';

interface ExtensionSettings {
  protectionLevel: 'low' | 'medium' | 'paranoid';
  sentinelEnabled: boolean;
  blockTrackers: boolean;
  fingerprintProtection: boolean;
  syntheticNavigation: boolean;
  searchDilution: boolean;
  whitelistedSites: string[];
  language: string;
}

const DEFAULT_SETTINGS: ExtensionSettings = {
  protectionLevel: 'medium',
  sentinelEnabled: true,
  blockTrackers: true,
  fingerprintProtection: true,
  syntheticNavigation: false,
  searchDilution: false,
  whitelistedSites: [],
  language: 'es',
};

interface UseSettingsReturn {
  settings: ExtensionSettings;
  updateSettings: (partial: Partial<ExtensionSettings>) => Promise<void>;
  isLoading: boolean;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar settings al montar
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SETTINGS_GET',
      });

      if (response?.success && response.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...response.settings });
      }
    } catch (err) {
      console.error('[useSettings] Error loading:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = useCallback(async (partial: Partial<ExtensionSettings>) => {
    const newSettings = { ...settings, ...partial };
    setSettings(newSettings);

    try {
      await chrome.runtime.sendMessage({
        type: 'SETTINGS_SET',
        payload: { settings: newSettings },
      });
    } catch (err) {
      console.error('[useSettings] Error saving:', err);
    }
  }, [settings]);

  return {
    settings,
    updateSettings,
    isLoading,
  };
}
