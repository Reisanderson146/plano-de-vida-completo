import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useUserStreak } from '@/hooks/useUserStreak';
import { isSoundEnabled } from '@/hooks/useSoundSettings';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LIFE_AREAS, AREA_HEX_COLORS, LifeArea } from '@/lib/constants';
import { CheckCircle2, Clock, Sparkles, Plus } from 'lucide-react';
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
  onGoalCompleted?: () => void;
}

export function PendingGoalsWidget({ selectedPlanId, onGoalCompleted }: PendingGoalsWidgetProps) {
  const navigate = useNavigate();
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

  const playSuccessSound = () => {
    if (!isSoundEnabled()) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Pleasant success sound - two quick ascending tones
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  };

  const handleCompleteGoal = async (goalId: string) => {
    setCompletingId(goalId);
    
    try {
      const { error } = await supabase
        .from('life_goals')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', goalId);

      if (error) throw error;

      // Play success sound
      playSuccessSound();

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
      
      // Notify parent that a goal was completed
      onGoalCompleted?.();
      
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

  const handleCreateGoal = () => {
    navigate(`/consulta/${selectedPlanId}`);
  };

  if (goals.length === 0) {
    return (
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Metas Pendentes
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5"
              onClick={handleCreateGoal}
            >
              <Plus className="w-4 h-4" />
              Nova Meta
            </Button>
          </div>
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Metas Pendentes
            <Badge variant="secondary" className="rounded-lg">
              {goals.length}
            </Badge>
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5"
            onClick={handleCreateGoal}
          >
            <Plus className="w-4 h-4" />
            Nova Meta
          </Button>
        </div>
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
