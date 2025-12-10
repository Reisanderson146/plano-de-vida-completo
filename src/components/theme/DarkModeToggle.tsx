import { useTheme } from 'next-themes';
import { useEffect, useState, useCallback } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { applyTheme } from '@/lib/themes';

export function DarkModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reapply color theme when dark/light mode changes
  useEffect(() => {
    if (mounted) {
      const savedColorTheme = localStorage.getItem('plano-vida-theme') || 'default';
      setTimeout(() => applyTheme(savedColorTheme), 50);
    }
  }, [resolvedTheme, mounted]);

  const handleThemeChange = useCallback((newTheme: string) => {
    // Add transitioning class for smooth animation
    document.documentElement.classList.add('theme-transitioning');
    
    setTheme(newTheme);
    
    // Remove class after transition completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 350);
  }, [setTheme]);

  if (!mounted) {
    return (
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        <div className="w-8 h-8 rounded-md" />
        <div className="w-8 h-8 rounded-md" />
        <div className="w-8 h-8 rounded-md" />
      </div>
    );
  }

  const options = [
    { value: 'light', icon: Sun, label: 'Claro' },
    { value: 'dark', icon: Moon, label: 'Escuro' },
    { value: 'system', icon: Monitor, label: 'Sistema' },
  ];

  return (
    <div className="flex gap-1 p-1 bg-muted rounded-lg">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => handleThemeChange(option.value)}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
            title={option.label}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}