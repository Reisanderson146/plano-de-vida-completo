import { cn } from '@/lib/utils';
import logoJourney from '@/assets/logo-journey.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'light';
}

export function Logo({ className, showText = true, size = 'md', variant = 'default' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-3xl sm:text-4xl',
  };

  const isLight = variant === 'light';

  return (
    <div className={cn("flex items-center gap-3 sm:gap-4", className)}>
      {/* Logo with enhanced shadow and polish */}
      <div className="relative">
        <img 
          src={logoJourney} 
          alt="Plano de Vida" 
          className={cn(
            sizeClasses[size], 
            "object-contain",
            "drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]",
            "filter contrast-105 brightness-105"
          )}
        />
        {/* Subtle glow effect behind logo */}
        {size === 'xl' && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-xl -z-10 scale-150" />
        )}
      </div>
      
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn(
            "font-bold tracking-tight",
            textSizeClasses[size],
            isLight 
              ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" 
              : "text-foreground"
          )}>
            Plano de
          </span>
          <span className={cn(
            "font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent",
            textSizeClasses[size],
            isLight && "drop-shadow-[0_2px_8px_rgba(16,185,129,0.4)]"
          )}>
            Vida
          </span>
        </div>
      )}
    </div>
  );
}