import React from 'react';
import { THEMES, Theme } from '@/lib/themes';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ThemeSelectorProps {
  selectedTheme: string;
  onThemeChange: (themeId: string) => void;
}

export function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
        'group relative p-3 rounded-xl border-2 transition-all duration-300',
        'hover:scale-[1.03] hover:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        isSelected
          ? 'border-primary shadow-md ring-2 ring-primary/20'
          : 'border-border bg-card hover:border-primary/40'
      )}
    >
      {/* Color Preview Orbs */}
      <div className="relative h-12 mb-3 rounded-lg overflow-hidden">
        <div 
          className="absolute inset-0 opacity-90"
          style={{ 
            background: `linear-gradient(135deg, ${theme.preview.primary} 0%, ${theme.preview.accent} 50%, ${theme.preview.secondary} 100%)` 
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center gap-1.5">
          <div
            className="h-7 w-7 rounded-full shadow-lg ring-2 ring-white/30 transition-transform group-hover:scale-110"
            style={{ backgroundColor: theme.preview.primary }}
          />
          <div
            className="h-5 w-5 rounded-full shadow-md ring-2 ring-white/20 transition-transform group-hover:scale-110 delay-75"
            style={{ backgroundColor: theme.preview.accent }}
          />
          <div
            className="h-4 w-4 rounded-full shadow ring-1 ring-white/10 transition-transform group-hover:scale-110 delay-100"
            style={{ backgroundColor: theme.preview.secondary }}
          />
        </div>
      </div>

      {/* Theme Info */}
      <div className="text-left">
        <p className={cn(
          "font-semibold text-sm transition-colors",
          isSelected ? "text-primary" : "text-foreground"
        )}>
          {theme.name}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {theme.description}
        </p>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg animate-scale-in">
          <Check className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      )}
    </button>
  );
}
