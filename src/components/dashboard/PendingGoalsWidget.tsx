import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useUserStreak } from '@/hooks/useUserStreak';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LIFE_AREAS, AREA_HEX_COLORS, LifeArea } from '@/lib/constants';
import { CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface PendingGoal {
  id: string;
  goal_text: string;
  area: LifeArea;
  period_year: number;
  life_plan_id: string;
}

interface PendingGoalsWidgetProps {
  selectedPlanId: string;
}

export function PendingGoalsWidget({ selectedPlanId }: PendingGoalsWidgetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { incrementGoalsCompleted } = useUserStreak();
  const [goals, setGoals] = useState<PendingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user && selectedPlanId) {
      fetchPendingGoals();
    }
  }, [user, selectedPlanId]);

  const fetchPendingGoals = async () => {
    if (!user || !selectedPlanId) return;

    try {
      const currentYear = new Date().getFullYear();
      
      const { data, error } = await supabase
        .from('life_goals')
        .select('id, goal_text, area, period_year, life_plan_id')
        .eq('user_id', user.id)
        .eq('life_plan_id', selectedPlanId)
        .eq('is_completed', false)
        .neq('goal_text', '')
        .gte('period_year', currentYear)
        .order('period_year', { ascending: true })
        .limit(5);

      if (error) throw error;
      setGoals(data as PendingGoal[]);
    } catch (error) {
      console.error('Error fetching pending goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    setCompletingId(goalId);
    
    try {
      const { error } = await supabase
        .from('life_goals')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', goalId);

      if (error) throw error;

      // Trigger confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#10b981', '#059669'],
      });

      // Update streak
      await incrementGoalsCompleted(10);

      // Remove from list with animation
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      
      toast({
        title: '🎉 Meta concluída!',
        description: '+10 pontos adicionados',
      });
    } catch (error) {
      console.error('Error completing goal:', error);
      toast({
        title: 'Erro ao completar meta',
        variant: 'destructive',
      });
    } finally {
      setCompletingId(null);
    }
  };

  const getAreaLabel = (areaId: LifeArea) => {
    return LIFE_AREAS.find((a) => a.id === areaId)?.label || areaId;
  };

  if (loading) {
    return (
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Metas Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Metas Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mb-3">
              <Sparkles className="w-7 h-7 text-success" />
            </div>
            <p className="text-sm font-medium text-foreground">Excelente trabalho!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as metas do período estão concluídas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Metas Pendentes
          <Badge variant="secondary" className="ml-auto rounded-lg">
            {goals.length} {goals.length === 1 ? 'meta' : 'metas'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {goals.map((goal, index) => (
          <div
            key={goal.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-xl transition-all duration-300",
              "bg-muted/30 hover:bg-muted/50",
              completingId === goal.id && "scale-95 opacity-50"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Checkbox
              checked={false}
              onCheckedChange={() => handleCompleteGoal(goal.id)}
              disabled={completingId === goal.id}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug line-clamp-2">
                {goal.goal_text}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0 h-5 rounded-md"
                  style={{
                    borderColor: AREA_HEX_COLORS[goal.area] + '40',
                    color: AREA_HEX_COLORS[goal.area],
                  }}
                >
                  {getAreaLabel(goal.area)}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {goal.period_year}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
