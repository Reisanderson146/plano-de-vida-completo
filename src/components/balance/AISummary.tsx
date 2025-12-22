import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, RefreshCw, Save, Lock, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { hasAIAccess, SubscriptionTier } from '@/lib/subscription-tiers';

interface AreaStats {
  area: string;
  label: string;
  total: number;
  completed: number;
  percentage: number;
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

  const canUseAI = hasAIAccess(subscriptionTier);

  const generateSummary = async () => {
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
      const title = `[Balanço ${period}] Análise IA - ${planTitle}`;
      
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
        {!summary && !loading && (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Use a inteligência artificial para obter uma análise personalizada do seu progresso.
            </p>
            <Button 
              onClick={generateSummary} 
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
            <p className="text-sm text-muted-foreground">Analisando seu progresso...</p>
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
                onClick={generateSummary} 
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
