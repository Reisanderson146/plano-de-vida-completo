export interface Theme {
  id: string;
  name: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
  };
  cssVariables: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}

// Only Forest theme - fixed theme for the entire system
export const FOREST_THEME: Theme = {
  id: 'forest',
  name: 'Floresta',
  description: 'Verde natureza profundo',
  preview: {
    primary: '#22c55e',
    secondary: '#dcfce7',
    accent: '#4ade80',
  },
  cssVariables: {
    light: {
      '--primary': '142 70% 45%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '142 65% 55%',
      '--accent-foreground': '200 25% 15%',
      '--navbar-from': '142 65% 38%',
      '--navbar-via': '150 60% 42%',
      '--navbar-to': '158 55% 40%',
      '--ring': '142 70% 45%',
    },
    dark: {
      '--primary': '142 60% 42%',
      '--primary-foreground': '140 20% 8%',
      '--accent': '142 40% 28%',
      '--accent-foreground': '200 15% 95%',
      '--navbar-from': '142 55% 30%',
      '--navbar-via': '150 50% 34%',
      '--navbar-to': '158 45% 32%',
      '--ring': '142 60% 42%',
    },
  },
};

export const getThemeById = (id: string): Theme => {
  return FOREST_THEME;
};

export const applyTheme = (themeId?: string) => {
  const theme = FOREST_THEME;
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  const variables = isDark ? theme.cssVariables.dark : theme.cssVariables.light;

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

export const initializeTheme = () => {
  applyTheme();
  return 'forest';
};
