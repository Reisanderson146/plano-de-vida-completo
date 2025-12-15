import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, RefreshCw, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  period: string;
  onNoteSaved?: () => void;
}

export function AISummary({ stats, totalGoals, completedGoals, planTitle, period, onNoteSaved }: AISummaryProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const generateSummary = async () => {
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

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-card to-card border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Resumo Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!summary && !loading && (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Use a inteligência artificial para obter uma análise personalizada do seu progresso.
            </p>
            <Button onClick={generateSummary} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Gerar Análise com IA
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analisando seu progresso...</p>
          </div>
        )}

        {summary && !loading && (
          <div className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                {summary}
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={saveAsNote} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar como anotação
              </Button>
              <Button variant="ghost" size="sm" onClick={generateSummary} className="gap-2">
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
