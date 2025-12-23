import { useState, useEffect, useCallback } from 'react';

const SOUND_SETTINGS_KEY = 'sound-settings';

export type SoundStyle = 'classic' | 'modern' | 'soft' | 'minimal';

interface SoundSettings {
  enabled: boolean;
  volume: number; // 0 to 1
  style: SoundStyle;
}

const defaultSettings: SoundSettings = {
  enabled: true,
  volume: 0.5,
  style: 'modern',
};

export function useSoundSettings() {
  const [settings, setSettings] = useState<SoundSettings>(() => {
    if (typeof window === 'undefined') return defaultSettings;
    
    try {
      const stored = localStorage.getItem(SOUND_SETTINGS_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
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

  const setVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  const setStyle = useCallback((style: SoundStyle) => {
    setSettings(prev => ({ ...prev, style }));
  }, []);

  return {
    soundEnabled: settings.enabled,
    volume: settings.volume,
    style: settings.style,
    toggleSound,
    setSoundEnabled,
    setVolume,
    setStyle,
  };
}

// Utility functions to get settings outside React components
export function getSoundSettings(): SoundSettings {
  if (typeof window === 'undefined') return defaultSettings;
  
  try {
    const stored = localStorage.getItem(SOUND_SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
    return defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function isSoundEnabled(): boolean {
  return getSoundSettings().enabled;
}

export function getSoundVolume(): number {
  return getSoundSettings().volume;
}

export function getSoundStyle(): SoundStyle {
  return getSoundSettings().style;
}

// Sound style configurations
export const soundStyleConfigs: Record<SoundStyle, {
  label: string;
  description: string;
  celebrationNotes: { freq: number; time: number; duration: number }[];
  sadNotes: { freq: number; time: number; duration: number }[];
  oscillatorType: OscillatorType;
}> = {
  classic: {
    label: 'Clássico',
    description: 'Sons tradicionais e elegantes',
    celebrationNotes: [
      { freq: 523.25, time: 0, duration: 0.15 },
      { freq: 659.25, time: 0.08, duration: 0.15 },
      { freq: 783.99, time: 0.16, duration: 0.15 },
      { freq: 1046.50, time: 0.24, duration: 0.25 },
    ],
    sadNotes: [
      { freq: 392.00, time: 0, duration: 0.3 },
      { freq: 349.23, time: 0.2, duration: 0.3 },
      { freq: 293.66, time: 0.4, duration: 0.4 },
    ],
    oscillatorType: 'sine',
  },
  modern: {
    label: 'Moderno',
    description: 'Sons vibrantes e dinâmicos',
    celebrationNotes: [
      { freq: 587.33, time: 0, duration: 0.1 },
      { freq: 739.99, time: 0.05, duration: 0.1 },
      { freq: 880.00, time: 0.1, duration: 0.12 },
      { freq: 1174.66, time: 0.18, duration: 0.2 },
      { freq: 1396.91, time: 0.28, duration: 0.25 },
    ],
    sadNotes: [
      { freq: 440.00, time: 0, duration: 0.25 },
      { freq: 370.00, time: 0.15, duration: 0.25 },
      { freq: 311.13, time: 0.3, duration: 0.35 },
    ],
    oscillatorType: 'triangle',
  },
  soft: {
    label: 'Suave',
    description: 'Sons gentis e relaxantes',
    celebrationNotes: [
      { freq: 440.00, time: 0, duration: 0.2 },
      { freq: 523.25, time: 0.15, duration: 0.2 },
      { freq: 659.25, time: 0.3, duration: 0.25 },
      { freq: 783.99, time: 0.5, duration: 0.3 },
    ],
    sadNotes: [
      { freq: 349.23, time: 0, duration: 0.4 },
      { freq: 311.13, time: 0.3, duration: 0.4 },
      { freq: 261.63, time: 0.6, duration: 0.5 },
    ],
    oscillatorType: 'sine',
  },
  minimal: {
    label: 'Minimalista',
    description: 'Sons simples e discretos',
    celebrationNotes: [
      { freq: 880.00, time: 0, duration: 0.15 },
      { freq: 1174.66, time: 0.1, duration: 0.2 },
    ],
    sadNotes: [
      { freq: 440.00, time: 0, duration: 0.2 },
      { freq: 349.23, time: 0.15, duration: 0.25 },
    ],
    oscillatorType: 'sine',
  },
};
