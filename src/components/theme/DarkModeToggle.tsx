import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserTheme } from '@/hooks/useUserTheme';

export function DarkModeToggle() {
  const { theme, setTheme, mounted } = useUserTheme();

  if (!mounted) {
    return (
      <div className="flex gap-1 p-1.5 bg-background/80 backdrop-blur-xl rounded-full border border-border/50 shadow-lg">
        <div className="w-9 h-9 rounded-full" />
        <div className="w-9 h-9 rounded-full" />
        <div className="w-9 h-9 rounded-full" />
      </div>
    );
  }

  const options = [
    { value: 'light', icon: Sun, label: 'Claro' },
    { value: 'dark', icon: Moon, label: 'Escuro' },
    { value: 'system', icon: Monitor, label: 'Sistema' },
  ];

  return (
    <div className="flex gap-1 p-1.5 bg-background/80 backdrop-blur-xl rounded-full border border-border/50 shadow-lg">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              'relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ease-out',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              isActive
                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:scale-105'
            )}
            title={option.label}
            aria-label={option.label}
          >
            <Icon 
              className={cn(
                'w-4 h-4 transition-all duration-300',
                isActive && option.value === 'light' && 'animate-[spin_0.5s_ease-out]',
                isActive && option.value === 'dark' && 'animate-[pulse_0.5s_ease-out]',
                isActive && 'drop-shadow-sm'
              )} 
            />
            {isActive && (
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-[ping_0.5s_ease-out]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
