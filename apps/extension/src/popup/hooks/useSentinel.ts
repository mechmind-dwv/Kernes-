/**
 * useSentinel — Hook para el estado de Sentinel en el popup
 * Maneja el escaneo, resultados y score global.
 */

import { useState, useEffect, useCallback } from 'react';
import type { SentinelScanResult } from '@/sentinel/scanner';

interface UseSentinelReturn {
  scanResult: SentinelScanResult | null;
  isScanning: boolean;
  overallScore: { score: number; grade: string; summary: string } | null;
  scanCurrentTab: () => Promise<void>;
}

export function useSentinel(): UseSentinelReturn {
  const [scanResult, setScanResult] = useState<SentinelScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [overallScore, setOverallScore] = useState<{ score: number; grade: string; summary: string } | null>(null);

  // Obtener score global al montar
  useEffect(() => {
    getOverallScore();
  }, []);

  const scanCurrentTab = useCallback(async () => {
    setIsScanning(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setIsScanning(false);
        return;
      }

      // Enviar mensaje al background para escanear
      const response = await chrome.runtime.sendMessage({
        type: 'SENTINEL_SCAN_TAB',
        payload: { tabId: tab.id },
      });

      if (response?.success) {
        setScanResult(response.result);
        // Actualizar score global
        await getOverallScore();
      }
    } catch (err) {
      console.error('[useSentinel] Error scanning:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const getOverallScore = useCallback(async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SENTINEL_GET_SCORE',
      });
      if (response?.success) {
        setOverallScore(response.score);
      }
    } catch (err) {
      console.error('[useSentinel] Error getting score:', err);
    }
  }, []);

  return {
    scanResult,
    isScanning,
    overallScore,
    scanCurrentTab,
  };
}
