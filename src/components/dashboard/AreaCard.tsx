import { cn } from '@/lib/utils';
import { CheckCircle2, Sparkles, Brain, Heart, Users, Wallet, Briefcase, Dumbbell } from 'lucide-react';
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

const AREA_STYLES: Record<LifeArea, { gradient: string; iconBg: string; barColor: string }> = {
  espiritual: { gradient: 'from-violet-500/20 to-purple-500/10', iconBg: 'bg-violet-500/20 text-violet-600 dark:text-violet-400', barColor: 'bg-gradient-to-r from-violet-500 to-purple-500' },
  intelectual: { gradient: 'from-blue-500/20 to-sky-500/10', iconBg: 'bg-blue-500/20 text-blue-600 dark:text-blue-400', barColor: 'bg-gradient-to-r from-blue-500 to-sky-500' },
  familiar: { gradient: 'from-rose-500/20 to-pink-500/10', iconBg: 'bg-rose-500/20 text-rose-600 dark:text-rose-400', barColor: 'bg-gradient-to-r from-rose-500 to-pink-500' },
  social: { gradient: 'from-orange-500/20 to-amber-500/10', iconBg: 'bg-orange-500/20 text-orange-600 dark:text-orange-400', barColor: 'bg-gradient-to-r from-orange-500 to-amber-500' },
  financeiro: { gradient: 'from-emerald-500/20 to-green-500/10', iconBg: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400', barColor: 'bg-gradient-to-r from-emerald-500 to-green-500' },
  profissional: { gradient: 'from-amber-500/20 to-yellow-500/10', iconBg: 'bg-amber-500/20 text-amber-600 dark:text-amber-400', barColor: 'bg-gradient-to-r from-amber-500 to-yellow-500' },
  saude: { gradient: 'from-teal-500/20 to-cyan-500/10', iconBg: 'bg-teal-500/20 text-teal-600 dark:text-teal-400', barColor: 'bg-gradient-to-r from-teal-500 to-cyan-500' },
};

export function AreaCard({ area, label, total, completed }: AreaCardProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = total > 0 && completed === total;
  const areaColor = AREA_HEX_COLORS[area];
  const Icon = AREA_ICONS[area];
  const styles = AREA_STYLES[area];

  return (
    <div className={cn(
      "relative rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover min-w-[140px] sm:min-w-0",
      "bg-gradient-to-br border border-border/40",
      "group overflow-hidden",
      styles.gradient
    )}>
      <div className="relative z-10">
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-3", styles.iconBg)}>
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>

        <h3 className="font-semibold text-foreground text-sm mb-1 truncate">{label}</h3>

        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-2xl font-bold text-foreground">{percentage}%</span>
          {isComplete && <CheckCircle2 className="w-4 h-4 text-success" />}
        </div>

        <div className="h-2.5 bg-muted/40 rounded-full overflow-hidden shadow-inner">
          <div
            className={cn("h-full rounded-full transition-all duration-700 ease-out", styles.barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground mt-2">{completed}/{total} metas</p>
      </div>
    </div>
  );
}
