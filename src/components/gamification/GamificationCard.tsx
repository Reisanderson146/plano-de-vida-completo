import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Trophy, Star, Target, Zap } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';

export function GamificationCard() {
  const { streak, achievements, loading } = useGamification();

  if (loading || !streak) {
    return null;
  }

  const pointsToNextLevel = 100 - (streak.total_points % 100);
  const levelProgress = ((100 - pointsToNextLevel) / 100) * 100;

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Gamificação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level and Points */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white font-bold">
              {streak.level}
            </div>
            <div>
              <p className="text-sm font-medium">Nível {streak.level}</p>
              <p className="text-xs text-muted-foreground">{streak.total_points} pontos</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            +{pointsToNextLevel} para nível {streak.level + 1}
          </Badge>
        </div>
        
        <Progress value={levelProgress} className="h-2" />

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-600">{streak.current_streak}</p>
            <p className="text-xs text-muted-foreground">Dias seguidos</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/20">
            <Target className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{streak.total_goals_completed}</p>
            <p className="text-xs text-muted-foreground">Metas realizadas</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-yellow-600">{streak.longest_streak}</p>
            <p className="text-xs text-muted-foreground">Maior sequência</p>
          </div>
        </div>

        {/* Recent Achievements */}
        {achievements.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Conquistas Recentes</p>
            <div className="flex flex-wrap gap-2">
              {achievements.slice(0, 3).map((achievement) => (
                <Badge 
                  key={achievement.id} 
                  variant="outline" 
                  className="flex items-center gap-1 py-1"
                >
                  <Trophy className="w-3 h-3 text-yellow-500" />
                  {achievement.achievement_name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
