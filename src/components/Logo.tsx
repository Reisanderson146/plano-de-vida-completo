import { cn } from '@/lib/utils';
import logoPath from '@/assets/logo-path.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img 
        src={logoPath} 
        alt="Plano de Vida" 
        className={cn(sizeClasses[size], "object-contain")}
      />
      
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn(
            "font-bold text-foreground tracking-tight",
            textSizeClasses[size]
          )}>
            Plano de
          </span>
          <span className={cn(
            "font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent tracking-tight -mt-1",
            textSizeClasses[size]
          )}>
            Vida
          </span>
        </div>
      )}
    </div>
  );
}
