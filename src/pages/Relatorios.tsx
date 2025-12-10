import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useExportReport } from '@/hooks/useExportReport';
import { useToast } from '@/hooks/use-toast';
import { LIFE_AREAS, LifeArea, AREA_HEX_COLORS } from '@/lib/constants';
import { Loader2, TrendingUp, TrendingDown, Target, CheckCircle2, FileText, FileSpreadsheet, Folder, User, Users, Baby } from 'lucide-react';
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

const PLAN_TYPE_CONFIG = {
  individual: { label: 'Individual', icon: User },
  familiar: { label: 'Familiar', icon: Users },
  filho: { label: 'Filho(a)', icon: Baby },
};

export default function Relatorios() {
  const { user } = useAuth();
  const { exportToPDF, exportToExcel } = useExportReport();
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

  const handleExport = (format: 'pdf' | 'excel') => {
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
      if (format === 'pdf') {
        exportToPDF(exportData);
      } else {
        exportToExcel(exportData);
      }
      toast({
        title: 'Exportação concluída!',
        description: `Relatório exportado em ${format.toUpperCase()} com sucesso.`,
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
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Relatórios</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Análise detalhada do seu progresso anual
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

          {/* Export Buttons */}
          <div className="flex gap-2 sm:ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              className="flex-1 sm:flex-none"
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('excel')}
              className="flex-1 sm:flex-none"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
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
              {getDateRangeLabel(dateRange)}
            </Badge>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-md">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Total de Metas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalGoals}</p>
                </div>
                <Target className="w-8 h-8 sm:w-10 sm:h-10 text-primary opacity-50 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Concluídas</p>
                  <p className="text-2xl sm:text-3xl font-bold text-success">{completedGoals}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-success opacity-50 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Melhor Área</p>
                  <p className="text-base sm:text-xl font-bold text-foreground truncate">{bestArea.name}</p>
                  <p className="text-xs sm:text-sm text-success">{bestArea.percentage}%</p>
                </div>
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-success opacity-50 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Para Melhorar</p>
                  <p className="text-base sm:text-xl font-bold text-foreground truncate">{worstArea.name}</p>
                  <p className="text-xs sm:text-sm text-destructive">{worstArea.percentage}%</p>
                </div>
                <TrendingDown className="w-8 h-8 sm:w-10 sm:h-10 text-destructive opacity-50 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader className="pb-2 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">Progresso por Área</CardTitle>
                <Badge variant="outline" className="font-normal text-xs">
                  {getDateRangeLabel(dateRange)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="h-[250px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={70} 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} 
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Progresso']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                      {barChartData.map((entry) => (
                        <Cell key={entry.area} fill={AREA_HEX_COLORS[entry.area as LifeArea]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-2 sm:pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg">Visão Radar</CardTitle>
                <Badge variant="outline" className="font-normal text-xs">
                  {getDateRangeLabel(dateRange)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <ProgressChart data={stats} />
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="shadow-lg">
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Progresso Geral</CardTitle>
              <Badge variant="outline" className="font-normal text-xs">
                {getDateRangeLabel(dateRange)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${overallPercentage * 2.83} 283`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl font-bold text-foreground">{overallPercentage}%</span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
                  {overallPercentage >= 80 ? 'Excelente!' : 
                   overallPercentage >= 50 ? 'Bom progresso!' : 
                   totalGoals === 0 ? 'Sem metas no período' :
                   'Continue focado!'}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {totalGoals > 0 
                    ? `Você completou ${completedGoals} de ${totalGoals} metas em ${getDateRangeLabel(dateRange)}.`
                    : `Nenhuma meta encontrada para ${getDateRangeLabel(dateRange)}. Tente selecionar outro período.`
                  }
                  {overallPercentage < 50 && totalGoals > 0 && ' Foque nas áreas que precisam de mais atenção.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
