import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserTheme } from '@/hooks/useUserTheme';

export function DarkModeToggle() {
  const { theme, setTheme, mounted } = useUserTheme();

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
            onClick={() => setTheme(option.value)}
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
