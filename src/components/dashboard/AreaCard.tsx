import { cn } from '@/lib/utils';
import { CheckCircle2, Sparkles, Brain, Heart, Users, Wallet, Briefcase, Dumbbell } from 'lucide-react';
import { AREA_HEX_COLORS, LifeArea } from '@/lib/constants';
import { useMemo } from 'react';

interface AreaCardProps {
  area: LifeArea;
  label: string;
  total: number;
  completed: number;
  customColor?: string;
}

const AREA_ICONS: Record<LifeArea, React.ElementType> = {
  espiritual: Sparkles,
  intelectual: Brain,
  familiar: Heart,
  social: Users,
  financeiro: Wallet,
  profissional: Briefcase,
  saude: Dumbbell,
};

// Convert hex to HSL for dynamic styling
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 50 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function AreaCard({ area, label, total, completed, customColor }: AreaCardProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = total > 0 && completed === total;
  const Icon = AREA_ICONS[area];
  
  const colorHex = customColor || AREA_HEX_COLORS[area];
  
  const styles = useMemo(() => {
    const hsl = hexToHsl(colorHex);
    return {
      gradient: `linear-gradient(135deg, hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 0.15), hsla(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 10, 100)}%, 0.05))`,
      hoverGradient: `linear-gradient(135deg, hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 0.25), hsla(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 10, 100)}%, 0.12))`,
      iconBg: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 0.2)`,
      iconColor: `hsl(${hsl.h}, ${hsl.s}%, ${Math.max(hsl.l - 15, 30)}%)`,
      barGradient: `linear-gradient(90deg, ${colorHex}, hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 15, 85)}%))`,
      glowColor: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 0.4)`,
      borderColor: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 0.3)`,
    };
  }, [colorHex]);

  return (
    <div 
      className={cn(
        "relative rounded-2xl p-4 sm:p-5 min-w-[140px] sm:min-w-0",
        "border border-border/40",
        "group overflow-hidden cursor-pointer",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1.5 hover:scale-[1.02]"
      )}
      style={{ 
        background: styles.gradient,
        '--hover-glow': styles.glowColor,
        '--hover-border': styles.borderColor,
      } as React.CSSProperties}
    >
      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ 
          background: styles.hoverGradient,
          boxShadow: `0 8px 30px -8px ${styles.glowColor}`,
        }}
      />
      
      {/* Hover border glow */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ 
          border: `1px solid ${styles.borderColor}`,
        }}
      />

      <div className="relative z-10">
        <div 
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: styles.iconBg }}
        >
          <Icon 
            className="w-5 h-5 transition-all duration-300 group-hover:scale-110" 
            strokeWidth={1.75} 
            style={{ color: styles.iconColor }} 
          />
        </div>

        <h3 className="font-semibold text-foreground text-sm mb-1 truncate transition-colors duration-300">
          {label}
        </h3>

        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-2xl font-bold text-foreground transition-transform duration-300 group-hover:scale-105">
            {percentage}%
          </span>
          {isComplete && (
            <CheckCircle2 className="w-4 h-4 text-success transition-transform duration-300 group-hover:scale-125" />
          )}
        </div>

        <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out group-hover:shadow-lg"
            style={{ 
              width: `${percentage}%`, 
              background: styles.barGradient,
            }}
          />
        </div>

        <p className="text-xs text-muted-foreground mt-2 transition-colors duration-300 group-hover:text-foreground/70">
          {completed}/{total} metas
        </p>
      </div>
    </div>
  );
}
