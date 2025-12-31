import { useState, useEffect } from 'react';
import { Check, Shield, Zap, Heart, Target, Sparkles, Gem, Loader2, RefreshCw, X, Crown, User, Users, Baby, BarChart3, Calendar, FileText, Bell, Download, History, Eye, BookOpen, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Tooltip descriptions for each benefit
const benefitTooltips: Record<string, string> = {
  "1 Plano Individual": "Crie metas para todas as 7 áreas da sua vida pessoal",
  "Planejamento das 7 áreas da vida": "Espiritual, Intelectual, Familiar, Social, Financeiro, Profissional e Saúde",
  "Dados seguros na nuvem": "Seus dados criptografados e acessíveis de qualquer dispositivo",
  "Exportação em PDF": "Baixe seu plano em formato profissional para impressão",
  "Dashboard com progresso": "Visualize gráficos e métricas do seu avanço em tempo real",
  "Consulta visual do plano": "Veja seu plano completo em formato de tabela interativa",
  "Visão por períodos de vida": "Organize suas metas por fases: 1, 5, 10+ anos",
  "Guia de uso do sistema": "Tutorial completo para aproveitar todos os recursos",
  "1 Plano Familiar": "Planeje o futuro da família em conjunto com seu parceiro(a)",
  "1 Plano para Filho": "Crie um plano individual para seu filho acompanhar suas metas",
  "3 Planos para Filhos": "Crie planos individuais para cada filho acompanhar suas metas",
  "Resumo inteligente com IA": "Análise do seu progresso com sugestões personalizadas de melhoria",
  "Relatórios e gráficos detalhados": "Relatórios visuais avançados do seu progresso",
  "Lembretes por email": "Receba notificações das metas importantes no seu email",
  "Histórico de metas concluídas": "Acompanhe todas as conquistas que você já realizou",
  "Balanço de progresso anual": "Análise aprofundada por área e período de vida",
  "Email de aniversário de casamento": "Receba mensagens especiais no aniversário de casamento",
};

interface Benefit {
  icon: typeof User;
  text: string;
  highlight?: boolean;
}

const basicBenefits: Benefit[] = [
  { icon: User, text: '1 Plano Individual' },
  { icon: Target, text: 'Planejamento das 7 áreas da vida' },
  { icon: Shield, text: 'Dados seguros na nuvem' },
  { icon: Download, text: 'Exportação em PDF' },
  { icon: BarChart3, text: 'Dashboard com progresso' },
  { icon: Eye, text: 'Consulta visual do plano' },
  { icon: Calendar, text: 'Visão por períodos de vida' },
  { icon: BookOpen, text: 'Guia de uso do sistema' },
];

const familiarBenefits: Benefit[] = [
  { icon: Users, text: '1 Plano Familiar', highlight: true },
  { icon: Baby, text: '1 Plano para Filho', highlight: true },
  { icon: Target, text: 'Planejamento das 7 áreas da vida' },
  { icon: Shield, text: 'Dados seguros na nuvem' },
  { icon: Download, text: 'Exportação em PDF' },
  { icon: BarChart3, text: 'Dashboard com progresso' },
  { icon: Bell, text: 'Lembretes por email' },
  { icon: Heart, text: 'Email de aniversário de casamento' },
  { icon: Sparkles, text: 'Resumo inteligente com IA', highlight: true },
];

const premiumBenefits: Benefit[] = [
  { icon: Users, text: '1 Plano Familiar', highlight: true },
  { icon: Baby, text: '3 Planos para Filhos', highlight: true },
  { icon: Sparkles, text: 'Resumo inteligente com IA', highlight: true },
  { icon: Target, text: 'Planejamento das 7 áreas da vida' },
  { icon: Shield, text: 'Dados seguros na nuvem' },
  { icon: Download, text: 'Exportação em PDF' },
  { icon: BarChart3, text: 'Relatórios e gráficos detalhados' },
  { icon: Bell, text: 'Lembretes por email' },
  { icon: Heart, text: 'Email de aniversário de casamento' },
  { icon: History, text: 'Histórico de metas concluídas' },
];

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribed: () => void;
}

export function SubscriptionDialog({ open, onOpenChange, onSubscribed }: SubscriptionDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<'basic' | 'familiar' | 'premium' | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'familiar' | 'premium'>('familiar');

  // Check subscription status periodically when dialog is open
  useEffect(() => {
    if (!open || !user) return;

    const checkSubscription = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.error('Error checking subscription:', error);
          return;
        }
        
        if (data?.subscribed || data?.subscription_status === 'active') {
          toast.success('Assinatura ativa! Você pode criar seu plano.');
          onSubscribed();
          onOpenChange(false);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const interval = setInterval(checkSubscription, 5000);
    return () => clearInterval(interval);
  }, [open, user, onSubscribed, onOpenChange]);

  const handleCheckSubscription = async () => {
    setCheckingSubscription(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      if (data?.subscribed || data?.subscription_status === 'active') {
        toast.success('Assinatura confirmada! Você pode criar seu plano.');
        onSubscribed();
        onOpenChange(false);
      } else {
        toast.info('Assinatura ainda não detectada. Se você acabou de pagar, aguarde alguns segundos.');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Erro ao verificar assinatura. Tente novamente.');
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleCheckout = async (tier: 'basic' | 'familiar' | 'premium') => {
    if (!user) return;

    setLoading(tier);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
      setLoading(null);
    }
  };

  const getBenefits = () => {
    switch (selectedPlan) {
      case 'basic': return basicBenefits;
      case 'familiar': return familiarBenefits;
      case 'premium': return premiumBenefits;
    }
  };

  const getPlanConfig = () => {
    switch (selectedPlan) {
      case 'basic':
        return {
          price: 'R$ 9,99',
          badge: 'Essencial',
          tagline: 'Teste grátis por 7 dias, cancele quando quiser',
          plansIncluded: '1 plano individual',
          color: 'emerald',
          gradientBg: 'bg-muted/30',
          badgeBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
          priceClass: 'text-foreground',
          taglineClass: 'text-emerald-600 dark:text-emerald-400',
          iconBg: 'bg-emerald-500/10',
          iconColor: 'text-emerald-600',
          checkColor: 'text-emerald-600',
          buttonClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white',
          Icon: Gem,
        };
      case 'familiar':
        return {
          price: 'R$ 15,90',
          badge: 'Popular',
          tagline: 'Teste grátis por 7 dias, cancele quando quiser',
          plansIncluded: '2 planos incluídos',
          color: 'rose',
          gradientBg: 'bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20',
          badgeBg: 'bg-gradient-to-r from-rose-500 to-pink-500',
          priceClass: 'bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent',
          taglineClass: 'text-rose-600 dark:text-rose-400',
          iconBg: 'bg-rose-500/10',
          iconColor: 'text-rose-600',
          checkColor: 'text-rose-600',
          buttonClass: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg shadow-rose-500/25',
          Icon: Heart,
        };
        return {
          price: 'R$ 29,99',
          badge: 'Completo',
          tagline: 'Teste grátis por 7 dias, cancele quando quiser',
          plansIncluded: '4 planos incluídos + IA',
          color: 'violet',
          gradientBg: 'bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20',
          badgeBg: 'bg-gradient-to-r from-violet-600 to-purple-600',
          priceClass: 'bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent',
          taglineClass: 'text-violet-600 dark:text-violet-400',
          iconBg: 'bg-violet-500/10',
          iconColor: 'text-violet-600',
          checkColor: 'text-violet-600',
          buttonClass: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25',
          Icon: Crown,
        };
    }
  };

  const config = getPlanConfig();
  const benefits = getBenefits();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-[28px] border-0 gap-0">
        <DialogTitle className="sr-only">Escolha seu Plano</DialogTitle>
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#2A8C68] via-[#3d9d78] to-[#2A8C68] py-4 px-5">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 w-8 h-8 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white">Escolha seu Plano</h2>
            <p className="text-white/80 text-xs mt-0.5">Para criar planos de vida</p>
          </div>
        </div>

        <div className="p-5 bg-background">
          {/* Plan Selection Tabs */}
          <div className="flex gap-1.5 mb-5 p-1 bg-muted/50 rounded-xl">
            <button
              onClick={() => setSelectedPlan('basic')}
              className={cn(
                "flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all",
                selectedPlan === 'basic'
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Gem className="w-3.5 h-3.5 inline mr-1" />
              Basic
            </button>
            <button
              onClick={() => setSelectedPlan('familiar')}
              className={cn(
                "flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all relative",
                selectedPlan === 'familiar'
                  ? "bg-gradient-to-r from-rose-500/10 to-pink-500/10 shadow-sm text-rose-700 dark:text-rose-300 border border-rose-500/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart className="w-3.5 h-3.5 inline mr-1" />
              Familiar
            </button>
            <button
              onClick={() => setSelectedPlan('premium')}
              className={cn(
                "flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all relative",
                selectedPlan === 'premium'
                  ? "bg-gradient-to-r from-violet-500/10 to-purple-500/10 shadow-sm text-violet-700 dark:text-violet-300 border border-violet-500/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Crown className="w-3.5 h-3.5 inline mr-1" />
              Premium
              <span className="absolute -top-2 -right-1 text-[9px] bg-gradient-to-r from-violet-600 to-purple-600 text-white px-1 py-0.5 rounded-full">
                IA
              </span>
            </button>
          </div>

          {/* Plan Content */}
          <div className="space-y-4 animate-fade-in" key={selectedPlan}>
            {/* Plan Badge */}
            <div className="flex justify-center">
              <div className={cn(
                "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white font-bold text-xs shadow-lg",
                selectedPlan === 'basic' && "bg-gradient-to-r from-emerald-500 to-teal-500",
                selectedPlan === 'familiar' && "bg-gradient-to-r from-rose-500 to-pink-500",
                selectedPlan === 'premium' && "bg-gradient-to-r from-violet-600 to-purple-600"
              )}>
                {selectedPlan === 'basic' && <Gem className="w-3.5 h-3.5" />}
                {selectedPlan === 'familiar' && <Heart className="w-3.5 h-3.5" />}
                {selectedPlan === 'premium' && <Crown className="w-3.5 h-3.5" />}
                {config.badge}
              </div>
            </div>

            {/* Price with Trial Badge */}
            <div className={cn("text-center py-3 rounded-xl relative overflow-hidden", config.gradientBg)}>
              <div className={cn("absolute top-0 right-0 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg", config.badgeBg)}>
                7 DIAS GRÁTIS
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className={cn("text-3xl font-bold", config.priceClass)}>{config.price}</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </div>
              <p className={cn("text-xs font-medium mt-1", config.taglineClass)}>
                {config.tagline}
              </p>
              <div className={cn("mt-1 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full", 
                selectedPlan === 'basic' ? "bg-emerald-500/20 text-emerald-600" :
                selectedPlan === 'familiar' ? "bg-rose-500/20 text-rose-600" :
                "bg-violet-500/20 text-violet-600"
              )}>
                <Zap className="w-3 h-3" />
                {config.plansIncluded}
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-premium pr-1">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div 
                    key={index} 
                    className={cn(
                      "flex items-center gap-2.5 p-2 rounded-lg",
                      benefit.highlight 
                        ? cn("border",
                            selectedPlan === 'basic' ? "bg-emerald-500/5 border-emerald-500/20" :
                            selectedPlan === 'familiar' ? "bg-rose-500/5 border-rose-500/20" :
                            "bg-violet-500/5 border-violet-500/20"
                          )
                        : "bg-muted/30"
                    )}
                  >
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0", config.iconBg)}>
                      <Icon className={cn("w-3.5 h-3.5", config.iconColor)} />
                    </div>
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className={cn("text-foreground text-sm", benefit.highlight && "font-medium")}>{benefit.text}</span>
                      {benefitTooltips[benefit.text] && (
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <button 
                              type="button"
                              className="w-4 h-4 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors flex-shrink-0"
                            >
                              <Info className="w-2.5 h-2.5 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="right" 
                            align="center"
                            className="max-w-[200px] text-xs font-normal leading-relaxed"
                          >
                            <p>{benefitTooltips[benefit.text]}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    {benefit.highlight && selectedPlan === 'premium' && benefit.text.includes('IA') && (
                      <span className="text-[10px] bg-violet-500/20 text-violet-600 px-1.5 py-0.5 rounded-full">
                        Exclusivo
                      </span>
                    )}
                    <Check className={cn("w-3.5 h-3.5 flex-shrink-0", config.checkColor)} />
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <Button
              onClick={() => handleCheckout(selectedPlan)}
              disabled={loading !== null}
              className={cn("w-full h-11 text-base font-bold rounded-xl", config.buttonClass)}
            >
              {loading === selectedPlan ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <config.Icon className="w-4 h-4" />
                  Começar 7 dias grátis
                </div>
              )}
            </Button>
          </div>

          {/* Already Subscribed Button */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-3 border border-emerald-500/20">
              <p className="text-xs text-center text-muted-foreground mb-2">
                Já realizou o pagamento?
              </p>
              <Button
                onClick={handleCheckSubscription}
                disabled={checkingSubscription}
                variant="outline"
                className="w-full border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
              >
                {checkingSubscription ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verificando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Verificar assinatura
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/30">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Shield className="w-3 h-3 text-primary" />
              <span>Pagamento seguro</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Check className="w-3 h-3 text-primary" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
