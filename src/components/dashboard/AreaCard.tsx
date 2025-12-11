import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Sparkles, Brain, Heart, Users, Wallet, Briefcase, Dumbbell } from 'lucide-react';
import { AREA_HEX_COLORS, LifeArea } from '@/lib/constants';

interface AreaCardProps {
  area: LifeArea;
  label: string;
  total: number;
  completed: number;
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

const AREA_GRADIENTS: Record<LifeArea, string> = {
  espiritual: 'from-purple-500/20 to-violet-500/10',
  intelectual: 'from-blue-500/20 to-cyan-500/10',
  familiar: 'from-pink-500/20 to-rose-500/10',
  social: 'from-orange-500/20 to-amber-500/10',
  financeiro: 'from-emerald-500/20 to-green-500/10',
  profissional: 'from-yellow-500/20 to-amber-500/10',
  saude: 'from-teal-500/20 to-cyan-500/10',
};

export function AreaCard({ area, label, total, completed }: AreaCardProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = percentage >= 80;
  const areaColor = AREA_HEX_COLORS[area];
  const Icon = AREA_ICONS[area];

  return (
    <div className={cn(
      "relative rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl min-w-[140px] sm:min-w-0",
      "bg-gradient-to-br border border-border/50 backdrop-blur-sm",
      "group cursor-pointer overflow-hidden",
      AREA_GRADIENTS[area]
    )}>
      {/* Decorative circle */}
      <div 
        className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-20 blur-xl transition-all duration-500 group-hover:opacity-40"
        style={{ backgroundColor: areaColor }}
      />
      
      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: `${areaColor}20` }}
          >
            <Icon className="w-5 h-5" style={{ color: areaColor }} />
          </div>
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground/40" />
          )}
        </div>

        {/* Label */}
        <h3 className="font-semibold text-foreground text-sm mb-2 truncate">{label}</h3>

        {/* Stats */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{percentage}</span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {completed} de {total} metas
          </div>

          {/* Progress bar */}
          <div className="w-full bg-background/60 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: `${percentage}%`,
                backgroundColor: areaColor 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
