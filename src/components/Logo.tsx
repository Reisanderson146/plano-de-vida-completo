import { cn } from '@/lib/utils';
import logoJourney from '@/assets/logo-journey.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'light';
  singleLine?: boolean;
}

export function Logo({ 
  className, 
  showText = true, 
  showIcon = true,
  size = 'md', 
  variant = 'default',
  singleLine = false 
}: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl sm:text-3xl',
    '2xl': 'text-3xl sm:text-4xl',
  };

  const isLight = variant === 'light';

  return (
    <div className={cn("flex items-center gap-3 sm:gap-4", className)}>
      {/* Logo with enhanced shadow and polish */}
      {showIcon && (
        <div className="relative">
          <img 
            src={logoJourney} 
            alt="Plano de Vida" 
            className={cn(
              sizeClasses[size], 
              "object-contain",
              "drop-shadow-[0_6px_16px_rgba(0,0,0,0.3)]",
              "filter contrast-105 brightness-105"
            )}
          />
          {/* Subtle glow effect behind logo */}
          {(size === 'xl' || size === '2xl') && (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/25 to-teal-400/25 blur-2xl -z-10 scale-150" />
          )}
        </div>
      )}
      
      {showText && (
        singleLine ? (
          <>
            {/* Mobile: PV */}
            <span className={cn(
              "font-bold tracking-wide sm:hidden",
              textSizeClasses[size],
              isLight 
                ? "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" 
                : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent"
            )}>
              PV
            </span>
            {/* Desktop: Plano de Vida */}
            <span className={cn(
              "font-bold tracking-wide hidden sm:inline",
              textSizeClasses[size],
              isLight 
                ? "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" 
                : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent"
            )}>
              Plano de Vida
            </span>
          </>
        ) : (
          <>
            {/* Mobile: PV */}
            <span className={cn(
              "font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent sm:hidden",
              textSizeClasses[size]
            )}>
              PV
            </span>
            {/* Desktop: Plano de Vida stacked */}
            <div className="hidden sm:flex flex-col leading-none">
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
          </>
        )
      )}
    </div>
  );
}