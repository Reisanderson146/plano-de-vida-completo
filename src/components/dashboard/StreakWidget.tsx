import { Flame, Trophy, Target, TrendingUp } from 'lucide-react';
import { useUserStreak } from '@/hooks/useUserStreak';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function StreakWidget() {
  const { streak, loading } = useUserStreak();

  if (loading) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  if (!streak) return null;

  const progressToNextLevel = (streak.total_points % 100);
  const pointsToNextLevel = 100 - progressToNextLevel;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Streak Card */}
      <div className={cn(
        "relative p-4 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1",
        "bg-gradient-to-br from-orange-500/15 to-amber-500/10 border border-orange-500/20",
        streak.current_streak >= 7 && "shadow-lg shadow-orange-500/20"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br from-orange-500 to-amber-500",
            streak.current_streak >= 7 && "animate-pulse-soft"
          )}>
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{streak.current_streak}</p>
            <p className="text-xs text-muted-foreground">dias seguidos</p>
          </div>
        </div>
        {streak.current_streak >= 7 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-xs">🔥</span>
          </div>
        )}
      </div>

      {/* Level Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-primary/80">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{streak.level}</p>
            <p className="text-xs text-muted-foreground">nível atual</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{pointsToNextLevel} pts para nível {streak.level + 1}</p>
        </div>
      </div>

      {/* Goals Completed Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-green-500/10 border border-emerald-500/20 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-500">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{streak.total_goals_completed}</p>
            <p className="text-xs text-muted-foreground">metas concluídas</p>
          </div>
        </div>
      </div>

      {/* Best Streak Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/15 to-purple-500/10 border border-violet-500/20 transition-all duration-300 hover:-translate-y-1">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-500">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{streak.longest_streak}</p>
            <p className="text-xs text-muted-foreground">melhor streak</p>
          </div>
        </div>
      </div>
    </div>
  );
}
