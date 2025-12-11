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
    xl: 'w-20 h-20',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-3xl',
  };

  const isLight = variant === 'light';

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img 
        src={logoJourney} 
        alt="Plano de Vida" 
        className={cn(sizeClasses[size], "object-contain drop-shadow-md")}
      />
      
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn(
            "font-bold tracking-tight",
            textSizeClasses[size],
            isLight ? "text-white/90" : "text-foreground"
          )}>
            Plano de
          </span>
          <span className={cn(
            "font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent",
            textSizeClasses[size]
          )}>
            Vida
          </span>
        </div>
      )}
    </div>
  );
}
