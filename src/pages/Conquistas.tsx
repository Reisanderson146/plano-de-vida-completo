import { AppLayout } from '@/components/layout/AppLayout';
import { useAchievements } from '@/hooks/useAchievements';
import { useUserStreak } from '@/hooks/useUserStreak';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Star, Target, TrendingUp } from 'lucide-react';

export default function Conquistas() {
  const { achievements, loading, totalPoints, unlockedCount, totalAchievements } = useAchievements();
  const { streak } = useUserStreak();

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const progressPercent = (unlockedCount / totalAchievements) * 100;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Conquistas</h1>
          <p className="text-muted-foreground mt-1">Acompanhe seu progresso e desbloqueie conquistas</p>
        </div>

        {/* Stats Summary */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {/* Level */}
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-7 h-7 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{streak?.level || 1}</p>
                <p className="text-xs text-muted-foreground">Nível</p>
              </div>

              {/* Total Points */}
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
                  <Star className="w-7 h-7 text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">{totalPoints}</p>
                <p className="text-xs text-muted-foreground">Pontos</p>
              </div>

              {/* Achievements */}
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-7 h-7 text-violet-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">{unlockedCount}</p>
                <p className="text-xs text-muted-foreground">Conquistas</p>
              </div>

              {/* Goals Completed */}
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                  <Target className="w-7 h-7 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">{streak?.total_goals_completed || 0}</p>
                <p className="text-xs text-muted-foreground">Metas Concluídas</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso geral</span>
                <Badge variant="secondary" className="rounded-lg">
                  {unlockedCount}/{totalAchievements}
                </Badge>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Achievements Grid */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Todas as Conquistas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {achievements
              .sort((a, b) => (b.isUnlocked ? 1 : 0) - (a.isUnlocked ? 1 : 0))
              .map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
