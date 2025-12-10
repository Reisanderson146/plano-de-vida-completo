import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { AreaCard } from '@/components/dashboard/AreaCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LIFE_AREAS, LifeArea } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Target, Folder, User, Users, Baby } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DateRangeFilter, getYearRangeFromDateRange } from '@/components/filters/DateRangeFilter';
import { DateRange } from 'react-day-picker';
import { format, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfYear(new Date()),
    to: endOfYear(new Date())
  });
  const [hasPlans, setHasPlans] = useState(false);

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
      
      // Auto-select first plan if exists
      if (data && data.length > 0) {
        setSelectedPlanId(data[0].id);
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
      // Build query with date range filter
      let query = supabase
        .from('life_goals')
        .select('area, is_completed, period_year')
        .eq('user_id', user!.id)
        .eq('life_plan_id', selectedPlanId);

      // Apply year range filter from date range
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
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-hero flex items-center justify-center mb-4 sm:mb-6">
            <Target className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
            Bem-vindo ao Plano de Vida!
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md">
            Você ainda não tem nenhum plano cadastrado. Comece criando seu primeiro plano de vida e defina suas metas anuais nas 7 áreas.
          </p>
          <Link to="/cadastro">
            <Button size="lg" className="w-full sm:w-auto">
              Criar meu primeiro plano
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Acompanhe seu progresso nas 7 áreas da vida
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Plan Filter */}
          <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <Folder className="w-4 h-4 mr-2 flex-shrink-0" />
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

          {/* Date Range Filter */}
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
          />
        </div>

        {/* Current Selection Info */}
        {selectedPlan && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              {(() => {
                const config = PLAN_TYPE_CONFIG[selectedPlan.plan_type as keyof typeof PLAN_TYPE_CONFIG] || PLAN_TYPE_CONFIG.individual;
                const PlanIcon = config.icon;
                return <PlanIcon className="w-3 h-3" />;
              })()}
              {selectedPlan.title}
              {selectedPlan.member_name && ` - ${selectedPlan.member_name}`}
            </Badge>
            <Badge variant="outline">
              {dateRange?.from 
                ? dateRange.to 
                  ? `${format(dateRange.from, 'dd/MM/yy', { locale: ptBR })} - ${format(dateRange.to, 'dd/MM/yy', { locale: ptBR })}`
                  : format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
                : 'Todos os períodos'}
            </Badge>
          </div>
        )}

        {/* Area cards with horizontal scroll on mobile */}
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 min-w-max sm:min-w-0">
            {LIFE_AREAS.map((area) => (
              <AreaCard
                key={area.id}
                area={area.id}
                label={area.label}
                total={stats[area.id].total}
                completed={stats[area.id].completed}
              />
            ))}
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-2 sm:pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg sm:text-xl">Visão Geral do Progresso</CardTitle>
              <Badge variant="outline" className="font-normal">
                {dateRange?.from 
                  ? `${format(dateRange.from, 'yyyy', { locale: ptBR })}${dateRange.to && dateRange.to.getFullYear() !== dateRange.from.getFullYear() ? ` - ${format(dateRange.to, 'yyyy', { locale: ptBR })}` : ''}`
                  : 'Todos'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ProgressChart data={stats} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
