import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthlyData {
  month: string;
  completed: number;
}

interface MonthlyEvolutionChartProps {
  selectedPlanId: string;
}

export function MonthlyEvolutionChart({ selectedPlanId }: MonthlyEvolutionChartProps) {
  const { user } = useAuth();
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && selectedPlanId) {
      fetchMonthlyData();
    }
  }, [user, selectedPlanId]);

  const fetchMonthlyData = async () => {
    if (!user || !selectedPlanId) return;

    try {
      const months: MonthlyData[] = [];
      const today = new Date();

      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(today, i);
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);

        const { count, error } = await supabase
          .from('life_goals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('life_plan_id', selectedPlanId)
          .eq('is_completed', true)
          .gte('completed_at', start.toISOString())
          .lte('completed_at', end.toISOString());

        if (error) throw error;

        months.push({
          month: format(monthDate, 'MMM', { locale: ptBR }),
          completed: count || 0,
        });
      }

      setData(months);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Evolução Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[180px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const hasData = data.some((d) => d.completed > 0);
  const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Evolução Mensal
          </CardTitle>
          {hasData && (
            <span className="text-sm text-muted-foreground">
              {totalCompleted} concluídas
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[180px] text-center">
            <p className="text-sm text-muted-foreground">
              Complete metas para ver sua evolução
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value} metas`, 'Concluídas']}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorCompleted)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
