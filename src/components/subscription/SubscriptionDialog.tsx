import { useState, useEffect } from 'react';
import { Check, Shield, Zap, Heart, Target, Sparkles, BadgeCheck, Gem, Loader2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const benefits = [
  { icon: Target, text: 'Planejamento completo das 7 áreas da vida' },
  { icon: Shield, text: 'Seus dados seguros na nuvem' },
  { icon: Zap, text: 'Relatórios e gráficos de progresso' },
  { icon: Heart, text: 'Lembretes personalizados por email' },
  { icon: Sparkles, text: 'Exportação profissional em PDF' },
];

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribed: () => void;
}

export function SubscriptionDialog({ open, onOpenChange, onSubscribed }: SubscriptionDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);

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

  const handleCheckout = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');

      if (error) throw error;

      if (data?.url) {
        // Navigate in the same window to maintain session consistency
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-[28px] border-0 gap-0">
        <DialogTitle className="sr-only">Assine o Plano Premium</DialogTitle>
        
        {/* Premium badge */}
        <div className="relative bg-gradient-to-r from-[#2A8C68] via-[#3d9d78] to-[#2A8C68] py-4 px-5 animate-fade-in">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 w-8 h-8 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="relative flex items-center justify-center gap-2">
            <Gem className="w-4 h-4 text-white animate-pulse" />
            <span className="text-lg font-semibold text-white tracking-widest uppercase">Premium</span>
            <BadgeCheck className="w-4 h-4 text-white" />
          </div>
          <p className="text-center text-white/80 text-xs mt-0.5">Para criar planos de vida</p>
        </div>

        <div className="p-5 space-y-4 bg-background">
          {/* Price */}
          <div className="text-center py-1 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-xs text-muted-foreground line-through">R$ 29,99</span>
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] bg-clip-text text-transparent">
                R$ 9,99
              </span>
              <span className="text-sm text-muted-foreground">/mês</span>
            </div>
            <div className="mt-1.5 inline-flex items-center gap-1.5 bg-[#A8E6CE]/30 text-[#2A8C68] text-xs font-semibold px-2.5 py-0.5 rounded-full animate-pulse">
              <Zap className="w-3 h-3" />
              Economia de 67%
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-1.5">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index} 
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-[#A8E6CE]/10 animate-fade-in"
                  style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A8E6CE]/40 to-[#7BC8A4]/40 flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-110">
                    <Icon className="w-3.5 h-3.5 text-[#2A8C68]" />
                  </div>
                  <span className="text-foreground text-sm flex-1">{benefit.text}</span>
                  <Check className="w-3.5 h-3.5 text-[#2A8C68] flex-shrink-0" />
                </div>
              );
            })}
          </div>

          {/* Buttons */}
          <div className="space-y-2 pt-1">
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full h-11 text-base font-bold rounded-xl bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] hover:from-[#238058] hover:via-[#6ab893] hover:to-[#238058] text-white shadow-lg shadow-[#2A8C68]/30"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Gem className="w-4 h-4" />
                  Assinar Agora
                </div>
              )}
            </Button>

            <Button
              onClick={handleCheckSubscription}
              disabled={checkingSubscription}
              variant="outline"
              className="w-full h-9 text-sm font-medium rounded-xl border-[#2A8C68]/30 text-[#2A8C68] hover:bg-[#A8E6CE]/20"
            >
              {checkingSubscription ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Já assinei - Verificar
                </div>
              )}
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-3 pt-0.5 text-muted-foreground text-xs">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
