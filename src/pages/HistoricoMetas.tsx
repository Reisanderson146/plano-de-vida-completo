import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LIFE_AREAS, AREA_HEX_COLORS, LifeArea } from '@/lib/constants';
import { CheckCircle2, Calendar, Target, ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CompletedGoal {
  id: string;
  goal_text: string;
  area: LifeArea;
  period_year: number;
  completed_at: string;
  life_plan_id: string;
  life_plan_title?: string;
}

interface LifePlan {
  id: string;
  title: string;
}

export default function HistoricoMetas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [goals, setGoals] = useState<CompletedGoal[]>([]);
  const [plans, setPlans] = useState<LifePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchPlans();
      fetchCompletedGoals();
    }
  }, [user, selectedPlanId, selectedArea, selectedYear]);

  const fetchPlans = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('life_plans')
      .select('id, title')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPlans(data);
    }
  };

  const fetchCompletedGoals = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let query = supabase
        .from('life_goals')
        .select(`
          id,
          goal_text,
          area,
          period_year,
          completed_at,
          life_plan_id,
          life_plans!inner(title)
        `)
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (selectedPlanId !== 'all') {
        query = query.eq('life_plan_id', selectedPlanId);
      }

      if (selectedArea !== 'all') {
        query = query.eq('area', selectedArea);
      }

      if (selectedYear !== 'all') {
        query = query.eq('period_year', parseInt(selectedYear));
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      const formattedGoals = (data || []).map((goal: any) => ({
        ...goal,
        life_plan_title: goal.life_plans?.title,
      }));

      setGoals(formattedGoals);
    } catch (error) {
      console.error('Error fetching completed goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAreaLabel = (areaId: LifeArea) => {
    return LIFE_AREAS.find((a) => a.id === areaId)?.label || areaId;
  };

  const uniqueYears = [...new Set(goals.map(g => g.period_year))].sort((a, b) => b - a);

  const groupedByMonth = goals.reduce((acc, goal) => {
    if (!goal.completed_at) return acc;
    const monthKey = format(new Date(goal.completed_at), 'MMMM yyyy', { locale: ptBR });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(goal);
    return acc;
  }, {} as Record<string, CompletedGoal[]>);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Histórico de Metas
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Veja todas as metas que você já conquistou
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-border/40">
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3">
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos os planos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os planos</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Todas as áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as áreas</SelectItem>
                  {LIFE_AREAS.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/40">
            <CardContent className="pt-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <p className="text-2xl font-bold text-foreground">{goals.length}</p>
              <p className="text-xs text-muted-foreground">Metas Concluídas</p>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="pt-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {new Set(goals.map(g => g.area)).size}
              </p>
              <p className="text-xs text-muted-foreground">Áreas Ativas</p>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="pt-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {new Set(goals.map(g => g.life_plan_id)).size}
              </p>
              <p className="text-xs text-muted-foreground">Planos</p>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="pt-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-violet-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {new Set(goals.map(g => g.period_year)).size}
              </p>
              <p className="text-xs text-muted-foreground">Anos</p>
            </CardContent>
          </Card>
        </div>

        {/* Goals List */}
        {loading ? (
          <Card className="border-border/40">
            <CardContent className="space-y-3 pt-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : goals.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground">Nenhuma meta concluída</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complete suas primeiras metas para vê-las aqui
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/')}
              >
                Ir para o Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByMonth).map(([month, monthGoals]) => (
              <div key={month}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
                  {month}
                </h3>
                <Card className="border-border/40">
                  <CardContent className="space-y-2 pt-4">
                    {monthGoals.map((goal) => (
                      <div
                        key={goal.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-xl",
                          "bg-muted/30 hover:bg-muted/50 transition-colors"
                        )}
                      >
                        <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">
                            {goal.goal_text}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
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
                            {goal.life_plan_title && (
                              <span className="text-[10px] text-muted-foreground">
                                • {goal.life_plan_title}
                              </span>
                            )}
                            {goal.completed_at && (
                              <span className="text-[10px] text-muted-foreground ml-auto">
                                {format(new Date(goal.completed_at), "d 'de' MMM", { locale: ptBR })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
