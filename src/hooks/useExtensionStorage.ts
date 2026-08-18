import { useState, useEffect, useCallback } from 'react';
import { ExtensionSettings } from '../types/extension';
import { storage, DEFAULT_SETTINGS } from '../extension/storage';

export function useExtensionStorage() {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    storage.getSettings().then(s => {
      if (mounted) {
        setSettings(s);
        setLoading(false);
      }
    });

    const unsubscribe = storage.onSettingsChange(updated => {
      if (mounted) setSettings(updated);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const updateSettings = useCallback(async (partial: Partial<ExtensionSettings>) => {
    const updated = await storage.saveSettings(partial);
    setSettings(updated);
    return updated;
  }, []);

  return {
    settings,
    loading,
    updateSettings
  };
}
