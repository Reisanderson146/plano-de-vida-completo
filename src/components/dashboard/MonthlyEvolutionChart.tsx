import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthlyData {
  month: string;
  fullMonth: string;
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
          fullMonth: format(monthDate, 'MMMM yyyy', { locale: ptBR }),
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
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  const hasData = data.some((d) => d.completed > 0);
  const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);
  
  // Calculate trend
  const lastMonth = data[data.length - 1]?.completed || 0;
  const previousMonth = data[data.length - 2]?.completed || 0;
  const trend = lastMonth - previousMonth;
  const trendPercentage = previousMonth > 0 ? Math.round((trend / previousMonth) * 100) : lastMonth > 0 ? 100 : 0;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-success' : trend < 0 ? 'text-destructive' : 'text-muted-foreground';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = data.find(d => d.month === label);
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground capitalize">
            {dataPoint?.fullMonth}
          </p>
          <p className="text-lg font-bold text-primary">
            {payload[0].value} {payload[0].value === 1 ? 'meta' : 'metas'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Evolução Mensal
          </CardTitle>
          {hasData && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-lg">
                {totalCompleted} total
              </Badge>
              {trendPercentage !== 0 && (
                <div className={`flex items-center gap-0.5 text-xs ${trendColor}`}>
                  <TrendIcon className="w-3.5 h-3.5" />
                  <span>{Math.abs(trendPercentage)}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
              <TrendingUp className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Complete metas para ver sua evolução
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                stroke="hsl(var(--border))"
                strokeOpacity={0.5}
              />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                allowDecimals={false}
                tickMargin={8}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#colorCompleted)"
                dot={{ 
                  fill: 'hsl(var(--primary))', 
                  strokeWidth: 2,
                  stroke: 'hsl(var(--background))',
                  r: 4
                }}
                activeDot={{ 
                  r: 6, 
                  fill: 'hsl(var(--primary))',
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
