import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, RefreshCw, Save, Lock, Crown, Heart, Zap, Scale, TrendingUp, TrendingDown, Minus, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { hasAIAccess, SubscriptionTier } from '@/lib/subscription-tiers';
import { cn } from '@/lib/utils';

interface AreaStats {
  area: string;
  label: string;
  total: number;
  completed: number;
  percentage: number;
}

interface MonthlyComparison {
  currentMonth: { completed: number; total: number; percentage: number };
  previousMonth: { completed: number; total: number; percentage: number };
  difference: number;
  trend: 'up' | 'down' | 'same';
}

interface AISummaryProps {
  stats: AreaStats[];
  totalGoals: number;
  completedGoals: number;
  planTitle: string;
  planId: string;
  period: string;
  subscriptionTier: SubscriptionTier | null;
  onNoteSaved?: () => void;
}

type AIStyle = 'friendly' | 'balanced' | 'direct';

const AI_STYLES = [
  {
    id: 'friendly' as const,
    label: 'Amigável',
    description: 'Motivacional e encorajador',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/30',
    activeColor: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-500',
  },
  {
    id: 'balanced' as const,
    label: 'Equilibrado',
    description: 'Construtivo e ponderado',
    icon: Scale,
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/30',
    activeColor: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-violet-500',
  },
  {
    id: 'direct' as const,
    label: 'Direto',
    description: 'Objetivo e prático',
    icon: Zap,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30',
    activeColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500',
  },
];

export function AISummary({ 
  stats, 
  totalGoals, 
  completedGoals, 
  planTitle, 
  planId, 
  period, 
  subscriptionTier,
  onNoteSaved 
}: AISummaryProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<AIStyle>('balanced');
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);
  const [monthlyComparison, setMonthlyComparison] = useState<MonthlyComparison | null>(null);

  const canUseAI = hasAIAccess(subscriptionTier);

  // Load user's preferred style from profile
  useEffect(() => {
    const loadPreferredStyle = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferred_ai_style')
          .eq('id', user.id)
          .single();
        
        if (!error && data?.preferred_ai_style) {
          setSelectedStyle(data.preferred_ai_style as AIStyle);
        }
      } catch (error) {
        console.error('Error loading preferred style:', error);
      } finally {
        setPreferenceLoaded(true);
      }
    };

    loadPreferredStyle();
  }, [user]);

  // Load monthly comparison data
  useEffect(() => {
    const loadMonthlyComparison = async () => {
      if (!user || !planId) return;

      try {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Get goals completed this month
        const { data: currentMonthData, error: currentError } = await supabase
          .from('life_goals')
          .select('id, is_completed, completed_at')
          .eq('life_plan_id', planId)
          .eq('user_id', user.id);

        if (currentError) throw currentError;

        // Calculate current month completions
        const currentMonthCompleted = currentMonthData?.filter(g => 
          g.is_completed && 
          g.completed_at && 
          new Date(g.completed_at) >= currentMonthStart
        ).length || 0;

        // Calculate previous month completions
        const previousMonthCompleted = currentMonthData?.filter(g => 
          g.is_completed && 
          g.completed_at && 
          new Date(g.completed_at) >= previousMonthStart &&
          new Date(g.completed_at) <= previousMonthEnd
        ).length || 0;

        const difference = currentMonthCompleted - previousMonthCompleted;
        const trend: 'up' | 'down' | 'same' = difference > 0 ? 'up' : difference < 0 ? 'down' : 'same';

        setMonthlyComparison({
          currentMonth: { completed: currentMonthCompleted, total: totalGoals, percentage: totalGoals > 0 ? Math.round((currentMonthCompleted / totalGoals) * 100) : 0 },
          previousMonth: { completed: previousMonthCompleted, total: totalGoals, percentage: totalGoals > 0 ? Math.round((previousMonthCompleted / totalGoals) * 100) : 0 },
          difference: Math.abs(difference),
          trend,
        });
      } catch (error) {
        console.error('Error loading monthly comparison:', error);
      }
    };

    loadMonthlyComparison();
  }, [user, planId, totalGoals]);

  const savePreferredStyle = async (style: AIStyle) => {
    if (!user) return;

    setSavingPreference(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_ai_style: style })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Preferência salva!',
        description: `Estilo "${AI_STYLES.find(s => s.id === style)?.label}" definido como padrão.`,
      });
    } catch (error) {
      console.error('Error saving preference:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a preferência.',
        variant: 'destructive',
      });
    } finally {
      setSavingPreference(false);
    }
  };

  const generateSummary = async (style: AIStyle = selectedStyle) => {
    if (!canUseAI) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-balance-summary', {
        body: {
          stats,
          totalGoals,
          completedGoals,
          planTitle,
          period,
          style,
          monthlyComparison,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setSummary(data.summary);
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast({
        title: 'Erro ao gerar resumo',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAsNote = async () => {
    if (!user || !summary) return;

    setSaving(true);
    try {
      const styleLabel = AI_STYLES.find(s => s.id === selectedStyle)?.label || 'IA';
      const title = `[Balanço ${period}] Análise ${styleLabel} - ${planTitle}`;
      
      const { error } = await supabase.from('notes').insert({
        user_id: user.id,
        life_plan_id: planId,
        title,
        content: summary,
        area: null,
      });

      if (error) throw error;

      toast({
        title: 'Anotação salva!',
        description: 'O resumo da IA foi salvo como anotação de balanço.',
      });

      onNoteSaved?.();
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a anotação.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStyleChange = (style: AIStyle) => {
    setSelectedStyle(style);
    if (summary) {
      // If already has a summary, regenerate with new style
      generateSummary(style);
    }
  };

  const getMonthName = (offset: number = 0) => {
    const date = new Date();
    date.setMonth(date.getMonth() + offset);
    return date.toLocaleString('pt-BR', { month: 'long' });
  };

  if (totalGoals === 0) {
    return null;
  }

  // Blocked state for Basic users
  if (!canUseAI) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border-2 border-violet-500/30 shadow-lg shadow-violet-500/10">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/10 to-fuchsia-500/5 animate-pulse" />
        
        <CardHeader className="pb-3 relative">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent font-bold">
              Resumo Inteligente
            </span>
            <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="relative">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30 flex items-center justify-center">
              <Lock className="w-8 h-8 text-violet-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Recurso Exclusivo Premium
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Obtenha análises personalizadas do seu progresso com inteligência artificial. 
              Faça upgrade para desbloquear!
            </p>
            <Button 
              onClick={() => navigate('/conta')} 
              className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
            >
              <Crown className="w-4 h-4" />
              Fazer Upgrade para Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-fuchsia-500/15 border-2 border-violet-500/40 shadow-lg shadow-violet-500/20">
      {/* Animated glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/10 to-fuchsia-500/5" />
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 blur-xl opacity-50" />
      
      <CardHeader className="pb-3 relative">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent font-bold">
            Resumo Inteligente
          </span>
          <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-xs font-medium text-violet-600 dark:text-violet-400">
            <Sparkles className="w-3 h-3" />
            IA
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative">
        {/* Monthly Comparison */}
        {monthlyComparison && (monthlyComparison.currentMonth.completed > 0 || monthlyComparison.previousMonth.completed > 0) && (
          <div className="mb-5 p-3 rounded-xl bg-background/50 border border-violet-500/20">
            <p className="text-xs font-medium text-muted-foreground mb-2">Comparativo mensal:</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-center p-2 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground capitalize">{getMonthName(-1)}</p>
                <p className="text-lg font-bold">{monthlyComparison.previousMonth.completed}</p>
                <p className="text-[10px] text-muted-foreground">metas</p>
              </div>
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                monthlyComparison.trend === 'up' && "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
                monthlyComparison.trend === 'down' && "bg-red-500/20 text-red-600 dark:text-red-400",
                monthlyComparison.trend === 'same' && "bg-gray-500/20 text-gray-600 dark:text-gray-400"
              )}>
                {monthlyComparison.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {monthlyComparison.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                {monthlyComparison.trend === 'same' && <Minus className="w-3 h-3" />}
                {monthlyComparison.trend !== 'same' ? `${monthlyComparison.difference}` : '='}
              </div>
              <div className="flex-1 text-center p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <p className="text-[10px] text-muted-foreground capitalize">{getMonthName(0)}</p>
                <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{monthlyComparison.currentMonth.completed}</p>
                <p className="text-[10px] text-muted-foreground">metas</p>
              </div>
            </div>
          </div>
        )}

        {/* Style Selection */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground">Escolha o estilo da análise:</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => savePreferredStyle(selectedStyle)}
              disabled={savingPreference}
              className="h-6 text-[10px] gap-1 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
            >
              {savingPreference ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3" />
              )}
              Salvar como padrão
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {AI_STYLES.map((style) => {
              const Icon = style.icon;
              const isActive = selectedStyle === style.id;
              
              return (
                <button
                  key={style.id}
                  onClick={() => handleStyleChange(style.id)}
                  disabled={loading}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200",
                    isActive 
                      ? style.activeColor + " shadow-lg" 
                      : style.bgColor + " text-foreground"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-white" : "")} />
                  <span className={cn("text-xs font-semibold", isActive ? "text-white" : "")}>
                    {style.label}
                  </span>
                  <span className={cn(
                    "text-[10px] leading-tight text-center",
                    isActive ? "text-white/80" : "text-muted-foreground"
                  )}>
                    {style.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {!summary && !loading && (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4 text-sm">
              Use a inteligência artificial para obter uma análise personalizada do seu progresso.
            </p>
            <Button 
              onClick={() => generateSummary()} 
              className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
            >
              <Sparkles className="w-4 h-4" />
              Gerar Análise com IA
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="relative">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              <div className="absolute inset-0 blur-lg bg-violet-500/30 animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">
              Analisando seu progresso no modo {AI_STYLES.find(s => s.id === selectedStyle)?.label.toLowerCase()}...
            </p>
          </div>
        )}

        {summary && !loading && (
          <div className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed p-4 rounded-xl bg-background/50 border border-violet-500/20">
                {summary}
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={saveAsNote} 
                disabled={saving} 
                className="gap-2 border-violet-500/30 hover:bg-violet-500/10 hover:border-violet-500/50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar como anotação
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => generateSummary()} 
                className="gap-2 hover:bg-violet-500/10 text-violet-600 dark:text-violet-400"
              >
                <RefreshCw className="w-4 h-4" />
                Gerar novo resumo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
