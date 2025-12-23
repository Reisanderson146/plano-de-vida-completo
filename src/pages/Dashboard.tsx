import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { AreaCard } from '@/components/dashboard/AreaCard';
import { MotivationalQuote } from '@/components/dashboard/MotivationalQuote';
import { PendingGoalsWidget } from '@/components/dashboard/PendingGoalsWidget';
import { MonthlyEvolutionChart } from '@/components/dashboard/MonthlyEvolutionChart';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LIFE_AREAS, LifeArea } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Target, Folder, User, Users, Baby, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DateRangeFilter, getYearRangeFromDateRange } from '@/components/filters/DateRangeFilter';
import { DateRange } from 'react-day-picker';
import { format, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { usePlanAreaCustomizations } from '@/hooks/usePlanAreaCustomizations';

type AreaStats = Record<LifeArea, { total: number; completed: number }>;

interface LifePlan {
  id: string;
  title: string;
  plan_type: string;
  member_name: string | null;
}

const PLAN_TYPE_CONFIG = {
  individual: { label: 'Individual', icon: User },
  familiar: { label: 'Familiar', icon: Users },
  filho: { label: 'Filho(a)', icon: Baby },
};

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
          <Select value={selectedPlanId} onValueChange={handlePlanChange}>
            <SelectTrigger className="w-full sm:w-[250px] h-11 rounded-xl">
              <Folder className="w-4 h-4 mr-2 flex-shrink-0 text-muted-foreground" />
              <SelectValue placeholder="Selecione um plano" />
            </SelectTrigger>
            <SelectContent>
              {plans.map(plan => {
                const config = PLAN_TYPE_CONFIG[plan.plan_type as keyof typeof PLAN_TYPE_CONFIG] || PLAN_TYPE_CONFIG.individual;
                const PlanIcon = config.icon;
                return (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex items-center gap-2">
                      <PlanIcon className="w-4 h-4" />
                      <span>{plan.title}</span>
                      {plan.member_name && <span className="text-muted-foreground">({plan.member_name})</span>}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

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

        {/* Area cards */}
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide opacity-0 animate-stagger-2">
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 min-w-max sm:min-w-0">
            {LIFE_AREAS.map((area, index) => (
              <div 
                key={area.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <AreaCard
                  area={area.id}
                  label={getAreaLabel(area.id)}
                  total={stats[area.id].total}
                  completed={stats[area.id].completed}
                  customColor={getAreaColor(area.id)}
                />
              </div>
            ))}
          </div>
        </div>

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
        <Card className="border-border/40 opacity-0 animate-stagger-3">
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
      </div>
    </AppLayout>
  );
}
