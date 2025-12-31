import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { AreaCard } from '@/components/dashboard/AreaCard';
import { MotivationalQuote } from '@/components/dashboard/MotivationalQuote';
import { PendingGoalsWidget } from '@/components/dashboard/PendingGoalsWidget';
import { MonthlyEvolutionChart } from '@/components/dashboard/MonthlyEvolutionChart';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LIFE_AREAS, LifeArea } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Target, Sparkles, Plus } from 'lucide-react';
import { PlanSelector, PLAN_TYPE_CONFIG } from '@/components/filters/PlanSelector';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DateRangeFilter, getYearRangeFromDateRange } from '@/components/filters/DateRangeFilter';
import { DateRange } from 'react-day-picker';
import { format, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePlanAreaCustomizations } from '@/hooks/usePlanAreaCustomizations';
import { AnimatedContent } from '@/components/ui/animated-content';

type AreaStats = Record<LifeArea, { total: number; completed: number }>;

interface LifePlan {
  id: string;
  title: string;
  plan_type: string;
  member_name: string | null;
}

// PLAN_TYPE_CONFIG imported from PlanSelector

const SELECTED_PLAN_STORAGE_KEY = 'selectedPlanId';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AreaStats>({
    espiritual: { total: 0, completed: 0 },
    intelectual: { total: 0, completed: 0 },
    familiar: { total: 0, completed: 0 },
    social: { total: 0, completed: 0 },
    financeiro: { total: 0, completed: 0 },
    profissional: { total: 0, completed: 0 },
    saude: { total: 0, completed: 0 },
  });
  const [plans, setPlans] = useState<LifePlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    return localStorage.getItem(SELECTED_PLAN_STORAGE_KEY) || '';
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfYear(new Date()),
    to: endOfYear(new Date())
  });
  const [hasPlans, setHasPlans] = useState(false);
  const [chartRefreshKey, setChartRefreshKey] = useState(0);

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    localStorage.setItem(SELECTED_PLAN_STORAGE_KEY, planId);
  };

  const handleGoalCompleted = () => {
    // Refresh the chart by incrementing the key
    setChartRefreshKey(prev => prev + 1);
    // Also refresh stats
    loadStats();
  };
  
  const { getAreaLabel, getAreaColor } = usePlanAreaCustomizations(selectedPlanId || undefined);

  useEffect(() => {
    if (user) {
      loadPlans();
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedPlanId) {
      loadStats();
    }
  }, [user, selectedPlanId, dateRange]);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('life_plans')
        .select('id, title, plan_type, member_name')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPlans(data || []);
      setHasPlans((data?.length ?? 0) > 0);
      
      if (data && data.length > 0) {
        const storedPlanId = localStorage.getItem(SELECTED_PLAN_STORAGE_KEY);
        const storedPlanExists = storedPlanId && data.some(p => p.id === storedPlanId);
        
        if (storedPlanExists) {
          setSelectedPlanId(storedPlanId);
        } else {
          setSelectedPlanId(data[0].id);
          localStorage.setItem(SELECTED_PLAN_STORAGE_KEY, data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!selectedPlanId) return;
    
    try {
      let query = supabase
        .from('life_goals')
        .select('area, is_completed, period_year, goal_text')
        .eq('user_id', user!.id)
        .eq('life_plan_id', selectedPlanId)
        .neq('goal_text', '');

      const yearRange = getYearRangeFromDateRange(dateRange);
      if (yearRange.min !== undefined) {
        query = query.gte('period_year', yearRange.min);
      }
      if (yearRange.max !== undefined) {
        query = query.lte('period_year', yearRange.max);
      }

      const { data: goals, error } = await query;

      if (error) throw error;

      const newStats: AreaStats = {
        espiritual: { total: 0, completed: 0 },
        intelectual: { total: 0, completed: 0 },
        familiar: { total: 0, completed: 0 },
        social: { total: 0, completed: 0 },
        financeiro: { total: 0, completed: 0 },
        profissional: { total: 0, completed: 0 },
        saude: { total: 0, completed: 0 },
      };

      goals?.forEach((goal) => {
        const area = goal.area as LifeArea;
        if (newStats[area]) {
          newStats[area].total++;
          if (goal.is_completed) {
            newStats[area].completed++;
          }
        }
      });

      setStats(newStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!hasPlans) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in px-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-emerald-500/10 flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Bem-vindo ao Plano de Vida!
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md leading-relaxed">
            Você ainda não tem nenhum plano cadastrado. Comece criando seu primeiro plano de vida e defina suas metas anuais nas 7 áreas.
          </p>
          <Link to="/cadastro">
            <Button size="lg" variant="premium" className="h-12 px-8 rounded-xl">
              Criar meu primeiro plano
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-8">
        <div className="space-y-1 opacity-0 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Painel de Controle</h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            Constância que constrói resultados.
          </p>
        </div>

        {/* Motivational Quote */}
        <MotivationalQuote />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 opacity-0 animate-stagger-1">
          <PlanSelector
            plans={plans}
            value={selectedPlanId}
            onChange={handlePlanChange}
          />

          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
          />
        </div>

        {/* Current Selection Info */}
        {selectedPlan && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg">
              {(() => {
                const config = PLAN_TYPE_CONFIG[selectedPlan.plan_type as keyof typeof PLAN_TYPE_CONFIG] || PLAN_TYPE_CONFIG.individual;
                const PlanIcon = config.icon;
                return <PlanIcon className="w-3.5 h-3.5" />;
              })()}
              {selectedPlan.title}
              {selectedPlan.member_name && ` - ${selectedPlan.member_name}`}
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 rounded-lg">
              {dateRange?.from 
                ? dateRange.to 
                  ? `${format(dateRange.from, 'dd/MM/yy', { locale: ptBR })} - ${format(dateRange.to, 'dd/MM/yy', { locale: ptBR })}`
                  : format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
                : 'Todos os períodos'}
            </Badge>
          </div>
        )}

        {/* Animated content that changes with plan selection */}
        <AnimatedContent contentKey={`${selectedPlanId}-${dateRange?.from?.getTime()}-${dateRange?.to?.getTime()}`} className="space-y-4 sm:space-y-6">
          {/* Area cards */}
          {(() => {
            const totalGoals = Object.values(stats).reduce((acc, s) => acc + s.total, 0);
            if (totalGoals === 0) {
              return (
                <Card className="border-border/40 border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                      <Target className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      Nenhuma meta no período
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Ajuste o filtro de datas ou adicione metas ao seu plano para visualizar o progresso.
                    </p>
                    <Link to={`/consulta/${selectedPlanId}`}>
                      <Button variant="outline" className="mt-4 rounded-xl gap-2">
                        <Plus className="w-4 h-4" />
                        Adicionar metas
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            }
            
            return (
              <div className="relative">
                {/* Scroll indicator for mobile */}
                <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none z-10 bg-gradient-to-l from-background to-transparent sm:hidden" />
                <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
                  <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 min-w-max sm:min-w-0">
                    {LIFE_AREAS.map((area, index) => (
                      <div 
                        key={area.id} 
                        className="opacity-0 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                      >
                        <AreaCard
                          area={area.id}
                          label={getAreaLabel(area.id)}
                          total={stats[area.id].total}
                          completed={stats[area.id].completed}
                          customColor={getAreaColor(area.id)}
                          planId={selectedPlanId}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Pending Goals and Monthly Evolution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            <div className="h-full">
              <PendingGoalsWidget selectedPlanId={selectedPlanId} onGoalCompleted={handleGoalCompleted} />
            </div>
            <div className="h-full">
              <MonthlyEvolutionChart selectedPlanId={selectedPlanId} refreshKey={chartRefreshKey} />
            </div>
          </div>

          {/* Progress Chart */}
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg sm:text-xl">Visão Geral do Progresso</CardTitle>
                <Badge variant="outline" className="font-normal rounded-lg">
                  {dateRange?.from 
                    ? `${format(dateRange.from, 'yyyy', { locale: ptBR })}${dateRange.to && dateRange.to.getFullYear() !== dateRange.from.getFullYear() ? ` - ${format(dateRange.to, 'yyyy', { locale: ptBR })}` : ''}`
                    : 'Todos'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-5">
              <ProgressChart data={stats} />
            </CardContent>
          </Card>
        </AnimatedContent>
      </div>
    </AppLayout>
  );
}
