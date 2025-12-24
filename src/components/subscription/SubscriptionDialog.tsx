import { useState, useEffect } from 'react';
import { Check, Shield, Zap, Heart, Target, Sparkles, BadgeCheck, Gem, Loader2, RefreshCw, X, Crown, User, Users, Baby, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const basicBenefits = [
  { icon: User, text: '1 Plano Individual' },
  { icon: Shield, text: 'Dados seguros na nuvem' },
  { icon: Target, text: 'Planejamento das 7 áreas' },
  { icon: Zap, text: 'Exportação em PDF' },
];

const premiumBenefits = [
  { icon: User, text: '1 Plano Individual' },
  { icon: Users, text: '1 Plano Familiar' },
  { icon: Baby, text: '2 Planos para Filhos' },
  { icon: Sparkles, text: 'Resumo com IA', highlight: true },
  { icon: Heart, text: 'Lembretes por email' },
];

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribed: () => void;
}

export function SubscriptionDialog({ open, onOpenChange, onSubscribed }: SubscriptionDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<'basic' | 'premium' | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic');

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

    // Check every 5 seconds
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

  const handleCheckout = async (tier: 'basic' | 'premium') => {
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
          <div className="flex gap-2 mb-5 p-1 bg-muted/50 rounded-xl">
            <button
              onClick={() => setSelectedPlan('basic')}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all",
                selectedPlan === 'basic'
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Gem className="w-4 h-4 inline mr-2" />
              Basic
            </button>
            <button
              onClick={() => setSelectedPlan('premium')}
              className={cn(
                "flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all relative",
                selectedPlan === 'premium'
                  ? "bg-gradient-to-r from-violet-500/10 to-purple-500/10 shadow-sm text-violet-700 dark:text-violet-300 border border-violet-500/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Crown className="w-4 h-4 inline mr-2" />
              Premium
              <span className="absolute -top-2 -right-2 text-[10px] bg-gradient-to-r from-violet-600 to-purple-600 text-white px-1.5 py-0.5 rounded-full">
                Recomendado
              </span>
            </button>
          </div>

          {/* Basic Plan Content */}
          {selectedPlan === 'basic' && (
            <div className="space-y-4 animate-fade-in">
              {/* Price */}
              <div className="text-center py-3 bg-muted/30 rounded-xl">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-foreground">R$ 9,99</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Para começar sua jornada</p>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                {basicBenefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div 
                      key={index} 
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30"
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-foreground text-sm flex-1">{benefit.text}</span>
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    </div>
                  );
                })}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => handleCheckout('basic')}
                disabled={loading !== null}
                className="w-full h-11 text-base font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                {loading === 'basic' ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Gem className="w-4 h-4" />
                    Assinar Basic
                  </div>
                )}
              </Button>
            </div>
          )}

          {/* Premium Plan Content */}
          {selectedPlan === 'premium' && (
            <div className="space-y-4 animate-fade-in">
              {/* Price */}
              <div className="text-center py-3 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/20">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    R$ 29,99
                  </span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
                <div className="mt-1 inline-flex items-center gap-1 bg-violet-500/20 text-violet-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  <Zap className="w-3 h-3" />
                  4 planos incluídos
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                {premiumBenefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div 
                      key={index} 
                      className={cn(
                        "flex items-center gap-2.5 p-2 rounded-lg",
                        benefit.highlight 
                          ? "bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20" 
                          : "bg-muted/30"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                        benefit.highlight 
                          ? "bg-gradient-to-br from-violet-500 to-purple-600" 
                          : "bg-violet-500/10"
                      )}>
                        <Icon className={cn(
                          "w-3.5 h-3.5",
                          benefit.highlight ? "text-white" : "text-violet-600"
                        )} />
                      </div>
                      <span className={cn(
                        "text-sm flex-1",
                        benefit.highlight ? "font-semibold text-foreground" : "text-foreground"
                      )}>
                        {benefit.text}
                      </span>
                      {benefit.highlight && (
                        <span className="text-[10px] bg-violet-500/20 text-violet-600 px-1.5 py-0.5 rounded-full">
                          Exclusivo
                        </span>
                      )}
                      <Check className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
                    </div>
                  );
                })}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => handleCheckout('premium')}
                disabled={loading !== null}
                className="w-full h-11 text-base font-bold rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
              >
                {loading === 'premium' ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    Assinar Premium
                  </div>
                )}
              </Button>
            </div>
          )}

          {/* Already Subscribed Button - More Visible */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-3 border border-emerald-500/20">
              <p className="text-xs text-center text-muted-foreground mb-2">
                Já realizou o pagamento?
              </p>
              <Button
                onClick={handleCheckSubscription}
                disabled={checkingSubscription}
                variant="outline"
                className="w-full h-10 text-sm font-semibold border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 hover:border-emerald-500"
              >
                {checkingSubscription ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verificando assinatura...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4" />
                    Já sou assinante - Verificar minha conta
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-3 pt-3 text-muted-foreground text-xs">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Pagamento Seguro</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Cancele quando quiser</span>
            </div>
          </div>

          {/* Instagram */}
          <div className="flex items-center justify-center pt-2">
            <a
              href="https://www.instagram.com/planode.vida"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-xs"
            >
              <Instagram className="w-4 h-4" />
              <span>@planode.vida</span>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
