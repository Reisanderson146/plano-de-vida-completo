import React from 'react';
import { THEMES, Theme } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { Check, Palette } from 'lucide-react';

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (themeId: string) => void;
}

export function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Palette className="w-4 h-4" />
        <span>Escolha seu tema</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {THEMES.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isSelected={selectedTheme === theme.id}
            onClick={() => onThemeChange(theme.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface ThemeCardProps {
  theme: Theme;
  isSelected: boolean;
  onClick: () => void;
}

function ThemeCard({ theme, isSelected, onClick }: ThemeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative p-3 rounded-xl border-2 transition-all duration-200',
        'hover:scale-[1.02] hover:shadow-md',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card hover:border-primary/50'
      )}
    >
      {/* Color Preview */}
      <div className="flex gap-1 mb-2">
        <div
          className="h-6 w-6 rounded-full shadow-sm"
          style={{ backgroundColor: theme.preview.primary }}
        />
        <div
          className="h-6 w-6 rounded-full shadow-sm"
          style={{ backgroundColor: theme.preview.accent }}
        />
        <div
          className="h-6 w-6 rounded-full shadow-sm border border-border"
          style={{ backgroundColor: theme.preview.secondary }}
        />
      </div>

      {/* Theme Info */}
      <div className="text-left">
        <p className="font-medium text-sm text-foreground">{theme.name}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{theme.description}</p>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
    </button>
  );
}
