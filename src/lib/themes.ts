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

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Esmeralda',
    description: 'Verde vibrante e refrescante',
    preview: {
      primary: '#10b981',
      secondary: '#e0f2fe',
      accent: '#14b8a6',
    },
    cssVariables: {
      light: {
        '--primary': '168 80% 38%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '175 60% 88%',
        '--accent-foreground': '200 25% 15%',
        '--navbar-from': '168 84% 30%',
        '--navbar-via': '175 75% 35%',
        '--navbar-to': '185 70% 32%',
        '--ring': '168 80% 38%',
      },
      dark: {
        '--primary': '168 70% 50%',
        '--primary-foreground': '200 20% 8%',
        '--accent': '175 30% 22%',
        '--accent-foreground': '200 15% 95%',
        '--navbar-from': '168 75% 25%',
        '--navbar-via': '175 65% 28%',
        '--navbar-to': '185 60% 25%',
        '--ring': '168 70% 50%',
      },
    },
  },
  {
    id: 'ocean',
    name: 'Oceano',
    description: 'Azul profundo e sereno',
    preview: {
      primary: '#3b82f6',
      secondary: '#dbeafe',
      accent: '#0ea5e9',
    },
    cssVariables: {
      light: {
        '--primary': '217 91% 60%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '199 89% 48%',
        '--accent-foreground': '200 25% 15%',
        '--navbar-from': '217 85% 45%',
        '--navbar-via': '210 80% 50%',
        '--navbar-to': '199 75% 48%',
        '--ring': '217 91% 60%',
      },
      dark: {
        '--primary': '217 80% 55%',
        '--primary-foreground': '220 20% 8%',
        '--accent': '199 70% 35%',
        '--accent-foreground': '200 15% 95%',
        '--navbar-from': '217 75% 35%',
        '--navbar-via': '210 70% 40%',
        '--navbar-to': '199 65% 38%',
        '--ring': '217 80% 55%',
      },
    },
  },
  {
    id: 'sunset',
    name: 'Pôr do Sol',
    description: 'Tons quentes e acolhedores',
    preview: {
      primary: '#f97316',
      secondary: '#ffedd5',
      accent: '#fb923c',
    },
    cssVariables: {
      light: {
        '--primary': '25 95% 53%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '27 96% 61%',
        '--accent-foreground': '200 25% 15%',
        '--navbar-from': '25 90% 48%',
        '--navbar-via': '20 85% 52%',
        '--navbar-to': '15 80% 50%',
        '--ring': '25 95% 53%',
      },
      dark: {
        '--primary': '25 85% 50%',
        '--primary-foreground': '30 20% 8%',
        '--accent': '27 75% 40%',
        '--accent-foreground': '200 15% 95%',
        '--navbar-from': '25 75% 38%',
        '--navbar-via': '20 70% 42%',
        '--navbar-to': '15 65% 40%',
        '--ring': '25 85% 50%',
      },
    },
  },
  {
    id: 'lavender',
    name: 'Lavanda',
    description: 'Roxo suave e elegante',
    preview: {
      primary: '#8b5cf6',
      secondary: '#ede9fe',
      accent: '#a78bfa',
    },
    cssVariables: {
      light: {
        '--primary': '262 83% 58%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '262 80% 70%',
        '--accent-foreground': '200 25% 15%',
        '--navbar-from': '262 78% 50%',
        '--navbar-via': '270 70% 55%',
        '--navbar-to': '280 65% 52%',
        '--ring': '262 83% 58%',
      },
      dark: {
        '--primary': '262 70% 55%',
        '--primary-foreground': '260 20% 8%',
        '--accent': '262 50% 35%',
        '--accent-foreground': '200 15% 95%',
        '--navbar-from': '262 65% 40%',
        '--navbar-via': '270 55% 45%',
        '--navbar-to': '280 50% 42%',
        '--ring': '262 70% 55%',
      },
    },
  },
  {
    id: 'rose',
    name: 'Rosa',
    description: 'Delicado e acolhedor',
    preview: {
      primary: '#ec4899',
      secondary: '#fce7f3',
      accent: '#f472b6',
    },
    cssVariables: {
      light: {
        '--primary': '330 81% 60%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '330 75% 70%',
        '--accent-foreground': '200 25% 15%',
        '--navbar-from': '330 75% 52%',
        '--navbar-via': '335 70% 56%',
        '--navbar-to': '340 65% 54%',
        '--ring': '330 81% 60%',
      },
      dark: {
        '--primary': '330 70% 55%',
        '--primary-foreground': '330 20% 8%',
        '--accent': '330 50% 35%',
        '--accent-foreground': '200 15% 95%',
        '--navbar-from': '330 60% 42%',
        '--navbar-via': '335 55% 46%',
        '--navbar-to': '340 50% 44%',
        '--ring': '330 70% 55%',
      },
    },
  },
  {
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
  },
  {
    id: 'midnight',
    name: 'Meia-Noite',
    description: 'Azul escuro sofisticado',
    preview: {
      primary: '#6366f1',
      secondary: '#e0e7ff',
      accent: '#818cf8',
    },
    cssVariables: {
      light: {
        '--primary': '239 84% 67%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '239 80% 75%',
        '--accent-foreground': '200 25% 15%',
        '--navbar-from': '239 78% 55%',
        '--navbar-via': '245 70% 60%',
        '--navbar-to': '250 65% 58%',
        '--ring': '239 84% 67%',
      },
      dark: {
        '--primary': '239 70% 60%',
        '--primary-foreground': '240 20% 8%',
        '--accent': '239 50% 38%',
        '--accent-foreground': '200 15% 95%',
        '--navbar-from': '239 65% 42%',
        '--navbar-via': '245 55% 48%',
        '--navbar-to': '250 50% 45%',
        '--ring': '239 70% 60%',
      },
    },
  },
  {
    id: 'coral',
    name: 'Coral',
    description: 'Vibrante e energético',
    preview: {
      primary: '#f43f5e',
      secondary: '#ffe4e6',
      accent: '#fb7185',
    },
    cssVariables: {
      light: {
        '--primary': '350 89% 60%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '350 85% 70%',
        '--accent-foreground': '200 25% 15%',
        '--navbar-from': '350 82% 52%',
        '--navbar-via': '355 78% 56%',
        '--navbar-to': '0 72% 54%',
        '--ring': '350 89% 60%',
      },
      dark: {
        '--primary': '350 75% 55%',
        '--primary-foreground': '350 20% 8%',
        '--accent': '350 55% 38%',
        '--accent-foreground': '200 15% 95%',
        '--navbar-from': '350 68% 42%',
        '--navbar-via': '355 60% 46%',
        '--navbar-to': '0 55% 44%',
        '--ring': '350 75% 55%',
      },
    },
  },
  {
    id: 'golden',
    name: 'Dourado',
    description: 'Elegante e luxuoso',
    preview: {
      primary: '#eab308',
      secondary: '#fef9c3',
      accent: '#facc15',
    },
    cssVariables: {
      light: {
        '--primary': '48 96% 48%',
        '--primary-foreground': '0 0% 10%',
        '--accent': '48 90% 55%',
        '--accent-foreground': '200 25% 15%',
        '--navbar-from': '48 90% 42%',
        '--navbar-via': '45 85% 46%',
        '--navbar-to': '40 80% 44%',
        '--ring': '48 96% 48%',
      },
      dark: {
        '--primary': '48 85% 45%',
        '--primary-foreground': '48 20% 8%',
        '--accent': '48 60% 32%',
        '--accent-foreground': '200 15% 95%',
        '--navbar-from': '48 75% 35%',
        '--navbar-via': '45 70% 38%',
        '--navbar-to': '40 65% 36%',
        '--ring': '48 85% 45%',
      },
    },
  },
  {
    id: 'slate',
    name: 'Ardósia',
    description: 'Neutro e profissional',
    preview: {
      primary: '#64748b',
      secondary: '#f1f5f9',
      accent: '#94a3b8',
    },
    cssVariables: {
      light: {
        '--primary': '215 16% 47%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '215 20% 65%',
        '--accent-foreground': '200 25% 15%',
        '--navbar-from': '215 20% 40%',
        '--navbar-via': '220 18% 45%',
        '--navbar-to': '225 15% 42%',
        '--ring': '215 16% 47%',
      },
      dark: {
        '--primary': '215 20% 55%',
        '--primary-foreground': '215 20% 8%',
        '--accent': '215 15% 35%',
        '--accent-foreground': '200 15% 95%',
        '--navbar-from': '215 18% 32%',
        '--navbar-via': '220 16% 36%',
        '--navbar-to': '225 14% 34%',
        '--ring': '215 20% 55%',
      },
    },
  },
  {
    id: 'mint',
    name: 'Menta',
    description: 'Fresco e tranquilo',
    preview: {
      primary: '#2dd4bf',
      secondary: '#ccfbf1',
      accent: '#5eead4',
    },
    cssVariables: {
      light: {
        '--primary': '174 70% 50%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '174 65% 60%',
        '--accent-foreground': '200 25% 15%',
        '--navbar-from': '174 65% 42%',
        '--navbar-via': '178 60% 46%',
        '--navbar-to': '182 55% 44%',
        '--ring': '174 70% 50%',
      },
      dark: {
        '--primary': '174 60% 48%',
        '--primary-foreground': '174 20% 8%',
        '--accent': '174 40% 32%',
        '--accent-foreground': '200 15% 95%',
        '--navbar-from': '174 55% 35%',
        '--navbar-via': '178 50% 38%',
        '--navbar-to': '182 45% 36%',
        '--ring': '174 60% 48%',
      },
    },
  },
  {
    id: 'plum',
    name: 'Ameixa',
    description: 'Rico e misterioso',
    preview: {
      primary: '#a855f7',
      secondary: '#f3e8ff',
      accent: '#c084fc',
    },
    cssVariables: {
      light: {
        '--primary': '280 85% 65%',
        '--primary-foreground': '0 0% 100%',
        '--accent': '280 78% 72%',
        '--accent-foreground': '200 25% 15%',
        '--navbar-from': '280 78% 55%',
        '--navbar-via': '285 72% 60%',
        '--navbar-to': '290 68% 58%',
        '--ring': '280 85% 65%',
      },
      dark: {
        '--primary': '280 70% 58%',
        '--primary-foreground': '280 20% 8%',
        '--accent': '280 50% 40%',
        '--accent-foreground': '200 15% 95%',
        '--navbar-from': '280 62% 45%',
        '--navbar-via': '285 55% 50%',
        '--navbar-to': '290 50% 48%',
        '--ring': '280 70% 58%',
      },
    },
  },
];

export const getThemeById = (id: string): Theme => {
  return THEMES.find(t => t.id === id) || THEMES[0];
};

export const applyTheme = (themeId: string) => {
  const theme = getThemeById(themeId);
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  const variables = isDark ? theme.cssVariables.dark : theme.cssVariables.light;

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

export const initializeTheme = (themeId: string = 'default') => {
  applyTheme(themeId);
  return themeId;
};
