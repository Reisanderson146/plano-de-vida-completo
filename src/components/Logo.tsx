import { cn } from '@/lib/utils';

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
      <div className={cn(
        "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 shadow-lg",
        sizeClasses[size]
      )}>
        {/* Christian Cross with Heart - representing life plan with faith */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          className="w-[75%] h-[75%]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cross */}
          <path
            d="M20 6V34"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M10 14H30"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Heart at center */}
          <path
            d="M20 18C20 18 16 14 14 14C11.5 14 10 16 10 18.5C10 22 20 28 20 28C20 28 30 22 30 18.5C30 16 28.5 14 26 14C24 14 20 18 20 18Z"
            fill="white"
            fillOpacity="0.95"
          />
          {/* Subtle glow effect */}
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.3"
          />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn(
            "font-bold text-white tracking-tight",
            textSizeClasses[size]
          )}>
            Plano de
          </span>
          <span className={cn(
            "font-bold bg-gradient-to-r from-amber-300 via-orange-200 to-amber-300 bg-clip-text text-transparent tracking-tight -mt-1",
            textSizeClasses[size]
          )}>
            Vida
          </span>
        </div>
      )}
    </div>
  );
}