import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, RefreshCw, Save, Lock, Crown, Heart, Zap, Scale, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { hasAIAccess, SubscriptionTier } from '@/lib/subscription-tiers';
import { cn } from '@/lib/utils';

/**
 * Sanitizes AI-generated text to prevent XSS attacks.
 * Removes any HTML/JavaScript that could be malicious while preserving plain text.
 */
const sanitizeAIResponse = (text: string): string => {
  if (!text) return '';
  
  // Configure DOMPurify to strip all HTML tags (we only want plain text)
  const sanitized = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content from stripped tags
  });
  
  // Additional cleanup: remove any remaining HTML entities that might be suspicious
  return sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
};

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
  isAdmin?: boolean;
  onNoteSaved?: () => void;
}

type AIStyle = 'friendly' | 'balanced' | 'direct';

const AI_STYLES = [
  {
    id: 'friendly' as const,
    label: 'Amigável',
    description: 'Motivacional e encorajador',
    icon: Heart,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-500/20',
    bgColor: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 hover:from-red-100 hover:to-pink-100 dark:hover:from-red-950/50 dark:hover:to-pink-950/50 border-red-200 dark:border-red-800/50',
    activeColor: 'bg-gradient-to-br from-red-500 to-pink-500 text-white border-red-500 shadow-red-500/30',
  },
  {
    id: 'balanced' as const,
    label: 'Equilibrado',
    description: 'Construtivo e ponderado',
    icon: Scale,
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-500/20',
    bgColor: 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 hover:from-violet-100 hover:to-purple-100 dark:hover:from-violet-950/50 dark:hover:to-purple-950/50 border-violet-200 dark:border-violet-800/50',
    activeColor: 'bg-gradient-to-br from-violet-500 to-purple-500 text-white border-violet-500 shadow-violet-500/30',
  },
  {
    id: 'direct' as const,
    label: 'Direto',
    description: 'Objetivo e prático',
    icon: Zap,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/20',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-950/50 dark:hover:to-orange-950/50 border-amber-200 dark:border-amber-800/50',
    activeColor: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white border-amber-500 shadow-amber-500/30',
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
  isAdmin = false,
  onNoteSaved 
}: AISummaryProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rawSummary, setRawSummary] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Sanitize the AI response to prevent XSS
  const summary = useMemo(() => {
    return rawSummary ? sanitizeAIResponse(rawSummary) : null;
  }, [rawSummary]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPreference, setSavingPreference] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<AIStyle>('balanced');

  // Typewriter effect
  useEffect(() => {
    if (!summary) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    setDisplayedText('');
    
    let currentIndex = 0;
    const typingSpeed = 15; // milliseconds per character
    
    const typeInterval = setInterval(() => {
      if (currentIndex < summary.length) {
        setDisplayedText(summary.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, [summary]);

  const canUseAI = hasAIAccess(subscriptionTier, isAdmin);

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
      }
    };

    loadPreferredStyle();
  }, [user]);

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
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setRawSummary(data.summary);
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
          <div className="grid grid-cols-3 gap-3">
            {AI_STYLES.map((style, index) => {
              const Icon = style.icon;
              const isActive = selectedStyle === style.id;
              
              return (
                <motion.button
                  key={style.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStyleChange(style.id)}
                  disabled={loading}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors duration-300",
                    isActive 
                      ? style.activeColor + " shadow-xl" 
                      : style.bgColor
                  )}
                >
                  {/* Icon container with glow effect */}
                  <motion.div 
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300",
                      isActive 
                        ? "bg-white/20 shadow-lg" 
                        : style.iconBg
                    )}
                    animate={isActive ? { 
                      boxShadow: ["0 0 0 0 rgba(255,255,255,0.4)", "0 0 20px 5px rgba(255,255,255,0.1)", "0 0 0 0 rgba(255,255,255,0.4)"]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Icon className={cn(
                      "w-5 h-5 transition-colors duration-300",
                      isActive ? "text-white" : style.iconColor
                    )} />
                  </motion.div>
                  
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={cn(
                      "text-sm font-bold transition-colors duration-300",
                      isActive ? "text-white" : "text-foreground"
                    )}>
                      {style.label}
                    </span>
                    <span className={cn(
                      "text-[10px] leading-tight text-center transition-colors duration-300",
                      isActive ? "text-white/80" : "text-muted-foreground"
                    )}>
                      {style.description}
                    </span>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Check className="w-3 h-3 text-emerald-500" />
                    </motion.div>
                  )}
                </motion.button>
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
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed p-4 rounded-xl bg-background/50 border border-violet-500/20 min-h-[80px]">
                {displayedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-0.5 h-4 bg-violet-500 ml-0.5 align-middle"
                  />
                )}
              </div>
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: isTyping ? 0.5 : 1 }}
              className="flex flex-wrap justify-end gap-2 pt-2"
            >
              <Button 
                variant="outline" 
                size="sm" 
                onClick={saveAsNote} 
                disabled={saving || isTyping} 
                className="gap-2 border-violet-500/30 hover:bg-violet-500/10 hover:border-violet-500/50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar como anotação
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => generateSummary()} 
                disabled={isTyping}
                className="gap-2 hover:bg-violet-500/10 text-violet-600 dark:text-violet-400"
              >
                <RefreshCw className="w-4 h-4" />
                Gerar novo resumo
              </Button>
            </motion.div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
