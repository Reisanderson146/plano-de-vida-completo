import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { isSoundEnabled, getSoundVolume, getSoundStyle, soundStyleConfigs } from '@/hooks/useSoundSettings';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { LIFE_AREAS, AREA_HEX_COLORS, LifeArea } from '@/lib/constants';
import { CheckCircle2, Clock, Sparkles, Plus, Trophy } from 'lucide-react';
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
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const volume = getSoundVolume();
      const style = getSoundStyle();
      const config = soundStyleConfigs[style];
      
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.setValueAtTime(volume * 0.5, audioContext.currentTime);

      config.celebrationNotes.forEach(({ freq, time, duration }) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = config.oscillatorType;
        oscillator.connect(gainNode);
        gainNode.connect(masterGain);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + time);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + time);
        gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + duration);
        
        oscillator.start(audioContext.currentTime + time);
        oscillator.stop(audioContext.currentTime + time + duration + 0.05);
      });
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  const handleCompleteGoal = async (goalId: string, event?: React.MouseEvent) => {
    setCompletingId(goalId);
    
    try {
      const { error } = await supabase
        .from('life_goals')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', goalId);

      if (error) throw error;

      // Play success sound
      playSuccessSound();

      // Get the position of the checkbox for targeted confetti
      const rect = event?.currentTarget?.getBoundingClientRect();
      const originX = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
      const originY = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.6;

      // Initial burst from the checkbox position
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: originX, y: originY },
        colors: ['#22c55e', '#10b981', '#059669'],
        scalar: 0.8,
        gravity: 1.2,
      });

      // Side bursts for more celebration
      setTimeout(() => {
        confetti({
          particleCount: 30,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#fbbf24', '#f59e0b', '#d97706'],
        });
        confetti({
          particleCount: 30,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#8b5cf6', '#6366f1', '#4f46e5'],
        });
      }, 150);

      // Star burst
      setTimeout(() => {
        confetti({
          particleCount: 20,
          spread: 360,
          ticks: 60,
          origin: { x: originX, y: originY - 0.1 },
          colors: ['#fcd34d', '#fbbf24', '#f59e0b'],
          shapes: ['star'],
          scalar: 1.2,
        });
      }, 300);

      // Animate removal with delay for visual feedback
      setTimeout(() => {
        setGoals((prev) => prev.filter((g) => g.id !== goalId));
      }, 600);
      
      // Notify parent that a goal was completed
      onGoalCompleted?.();
      
      toast({
        title: '🎉 Meta concluída!',
        description: 'Parabéns pelo progresso!',
      });
    } catch (error) {
      console.error('Error completing goal:', error);
      toast({
        title: 'Erro ao completar meta',
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => setCompletingId(null), 600);
    }
  };

  const getAreaLabel = (areaId: LifeArea) => {
    return LIFE_AREAS.find((a) => a.id === areaId)?.label || areaId;
  };

  if (loading) {
    return (
      <Card className="border-border/40 h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Metas Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 flex-1">
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
      <Card className="border-border/40 h-full flex flex-col">
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
        <CardContent className="flex-1 flex items-center justify-center">
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
        <CardFooter className="pt-2 pb-4">
          <Link to="/historico-metas" className="w-full">
            <Button 
              size="sm" 
              className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md shadow-primary/20 transition-all duration-200 btn-shimmer"
            >
              Ver histórico de metas concluídas
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 h-full flex flex-col">
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
      <CardContent className="space-y-2 flex-1">
        {goals.map((goal, index) => (
          <div
            key={goal.id}
            className={cn(
              "group relative flex items-start gap-3 p-3 rounded-xl transition-all duration-500 ease-out overflow-hidden",
              "bg-muted/30 hover:bg-muted/50",
              completingId === goal.id && "scale-95 bg-success/20"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Success glow effect */}
            {completingId === goal.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-success/30 via-success/10 to-transparent animate-pulse" />
            )}
            
            {/* Completing animation overlay */}
            {completingId === goal.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-success/10 backdrop-blur-[1px] z-10">
                <div className="flex items-center gap-2 text-success font-medium text-sm animate-bounce">
                  <Trophy className="w-5 h-5" />
                  <span>Concluída!</span>
                </div>
              </div>
            )}
            
            <div 
              className={cn(
                "relative cursor-pointer",
                completingId === goal.id && "opacity-0"
              )}
              onClick={(e) => handleCompleteGoal(goal.id, e)}
            >
              <Checkbox
                checked={false}
                onCheckedChange={() => {}}
                disabled={completingId === goal.id}
                className="mt-0.5 transition-transform duration-200 hover:scale-110"
              />
            </div>
            <div className={cn(
              "flex-1 min-w-0 transition-opacity duration-300",
              completingId === goal.id && "opacity-30"
            )}>
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
      <CardFooter className="pt-2 pb-4">
        <Link to="/historico-metas" className="w-full">
          <Button 
            size="sm" 
            className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md shadow-primary/20 transition-all duration-200 btn-shimmer"
          >
            Ver histórico de metas concluídas
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
