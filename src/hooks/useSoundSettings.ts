import { useState, useEffect, useCallback } from 'react';

const SOUND_SETTINGS_KEY = 'sound-settings';

interface SoundSettings {
  enabled: boolean;
}

const defaultSettings: SoundSettings = {
  enabled: true,
};

export function useSoundSettings() {
  const [settings, setSettings] = useState<SoundSettings>(() => {
    if (typeof window === 'undefined') return defaultSettings;
    
    try {
      const stored = localStorage.getItem(SOUND_SETTINGS_KEY);
      return stored ? JSON.parse(stored) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const toggleSound = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, enabled }));
  }, []);

  return {
    soundEnabled: settings.enabled,
    toggleSound,
    setSoundEnabled,
  };
}

// Utility function to check if sounds are enabled (for use outside React components)
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  
  try {
    const stored = localStorage.getItem(SOUND_SETTINGS_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      return settings.enabled ?? true;
    }
    return true;
  } catch {
    return true;
  }
}
