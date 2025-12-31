import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useExportReport } from '@/hooks/useExportReport';
import { useToast } from '@/hooks/use-toast';
import { LIFE_AREAS, LifeArea, AREA_HEX_COLORS } from '@/lib/constants';
import { Loader2, TrendingUp, TrendingDown, Target, CheckCircle2 } from 'lucide-react';
import { ExportPdfButton } from '@/components/ui/export-pdf-button';
import { PlanSelector, PLAN_TYPE_CONFIG } from '@/components/filters/PlanSelector';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
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

// PLAN_TYPE_CONFIG imported from PlanSelector

export default function Relatorios() {
  const { user } = useAuth();
  const { exportToPDF } = useExportReport();
  const { toast } = useToast();
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
  const [totalGoals, setTotalGoals] = useState(0);
  const [completedGoals, setCompletedGoals] = useState(0);

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
      let query = supabase
        .from('life_goals')
        .select('area, is_completed, period_year')
        .eq('user_id', user!.id)
        .eq('life_plan_id', selectedPlanId);

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

      let total = 0;
      let completed = 0;

      goals?.forEach((goal) => {
        const area = goal.area as LifeArea;
        if (newStats[area]) {
          newStats[area].total++;
          total++;
          if (goal.is_completed) {
            newStats[area].completed++;
            completed++;
          }
        }
      });

      setStats(newStats);
      setTotalGoals(total);
      setCompletedGoals(completed);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getDateRangeLabel = (range: DateRange | undefined): string => {
    if (!range?.from) return 'Todos os períodos';
    if (!range.to) return format(range.from, 'yyyy', { locale: ptBR });
    const fromYear = range.from.getFullYear();
    const toYear = range.to.getFullYear();
    if (fromYear === toYear) return `${fromYear}`;
    return `${fromYear} - ${toYear}`;
  };

  const barChartData = LIFE_AREAS.map((area) => ({
    name: area.label,
    area: area.id,
    total: stats[area.id].total,
    completed: stats[area.id].completed,
    percentage: stats[area.id].total > 0
      ? Math.round((stats[area.id].completed / stats[area.id].total) * 100)
      : 0,
  }));

  const bestArea = barChartData.reduce((best, current) => 
    current.percentage > best.percentage ? current : best
  );
  
  const worstArea = barChartData.reduce((worst, current) => 
    current.percentage < worst.percentage ? current : worst
  );

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const overallPercentage = totalGoals > 0 
    ? Math.round((completedGoals / totalGoals) * 100) 
    : 0;

  const handleExport = () => {
    const exportData = {
      title: 'Relatório de Progresso',
      subtitle: `${selectedPlan?.title || 'Plano de Vida'} - ${getDateRangeLabel(dateRange)}`,
      areas: LIFE_AREAS.map(area => ({
        area: area.id,
        label: area.label,
        total: stats[area.id].total,
        completed: stats[area.id].completed,
        percentage: stats[area.id].total > 0
          ? Math.round((stats[area.id].completed / stats[area.id].total) * 100)
          : 0,
      })),
      totalGoals,
      completedGoals,
      overallPercentage,
    };

    try {
      exportToPDF(exportData);
      toast({
        title: 'Exportação concluída!',
        description: 'Relatório exportado em PDF com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar o relatório.',
        variant: 'destructive',
      });
    }
  };

  if (loading && plans.length === 0) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="opacity-0 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Relatórios</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Análise detalhada do seu progresso
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 opacity-0 animate-stagger-1">
          <PlanSelector
            plans={plans}
            value={selectedPlanId}
            onChange={setSelectedPlanId}
          />

          <DateRangeFilter value={dateRange} onChange={setDateRange} />

          <div className="flex gap-2 sm:ml-auto">
            <ExportPdfButton onClick={handleExport} />
          </div>
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
              {getDateRangeLabel(dateRange)}
            </Badge>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 opacity-0 animate-stagger-2">
          <Card className="border-border/40">
            <CardContent className="pt-5 px-4 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground truncate">Total de Metas</p>
                  <p className="text-2xl font-bold text-foreground">{totalGoals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardContent className="pt-5 px-4 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground truncate">Concluídas</p>
                  <p className="text-2xl font-bold text-success">{completedGoals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardContent className="pt-5 px-4 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground truncate">Melhor Área</p>
                  <p className="text-base font-semibold text-foreground truncate">{bestArea.name}</p>
                  <p className="text-xs text-success font-medium">{bestArea.percentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardContent className="pt-5 px-4 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground truncate">Para Melhorar</p>
                  <p className="text-base font-semibold text-foreground truncate">{worstArea.name}</p>
                  <p className="text-xs text-destructive font-medium">{worstArea.percentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">Progresso por Área</CardTitle>
                <Badge variant="outline" className="font-normal text-xs rounded-lg">
                  {getDateRangeLabel(dateRange)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-5">
              <div className="h-[280px] sm:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} layout="vertical" margin={{ left: 0, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={80} 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Progresso']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '13px',
                        boxShadow: 'var(--shadow-card)'
                      }}
                    />
                    <Bar dataKey="percentage" radius={[0, 6, 6, 0]} barSize={20}>
                      {barChartData.map((entry) => (
                        <Cell key={entry.area} fill={AREA_HEX_COLORS[entry.area as LifeArea]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">Visão Radar</CardTitle>
                <Badge variant="outline" className="font-normal text-xs rounded-lg">
                  {getDateRangeLabel(dateRange)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-3 sm:px-5">
              <ProgressChart data={stats} showAreaFilter={true} />
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="border-border/40 mt-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Progresso Geral</CardTitle>
              <Badge variant="outline" className="font-normal text-xs rounded-lg">
                {getDateRangeLabel(dateRange)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="44%"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="44%"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${overallPercentage * 2.76} 276`}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">{overallPercentage}%</span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  {overallPercentage >= 80 ? 'Excelente!' : 
                   overallPercentage >= 50 ? 'Bom progresso!' : 
                   'Continue tentando!'}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Você completou <span className="font-semibold text-foreground">{completedGoals}</span> de <span className="font-semibold text-foreground">{totalGoals}</span> metas no período selecionado.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
