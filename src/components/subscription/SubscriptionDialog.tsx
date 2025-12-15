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
        window.open(data.url, '_blank');
        toast.info('Complete o pagamento na nova aba. Após concluir, clique em "Já assinei".');
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-[28px] border-0 gap-0">
        <DialogTitle className="sr-only">Assine o Plano Premium</DialogTitle>
        
        {/* Premium badge */}
        <div className="relative bg-gradient-to-r from-[#2A8C68] via-[#3d9d78] to-[#2A8C68] py-5 px-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="relative flex items-center justify-center gap-2">
            <Gem className="w-5 h-5 text-white" />
            <span className="text-xl font-semibold text-white tracking-widest uppercase">Premium</span>
            <BadgeCheck className="w-5 h-5 text-white" />
          </div>
          <p className="text-center text-white/80 text-sm mt-1">Para criar planos de vida</p>
        </div>

        <div className="p-6 space-y-5 bg-background">
          {/* Price */}
          <div className="text-center py-2">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-sm text-muted-foreground line-through">R$ 29,99</span>
            </div>
            <div className="flex items-baseline justify-center gap-1 mt-1">
              <span className="text-4xl font-bold bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] bg-clip-text text-transparent">
                R$ 9,99
              </span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 bg-[#A8E6CE]/30 text-[#2A8C68] text-xs font-semibold px-3 py-1 rounded-full">
              <Zap className="w-3 h-3" />
              Economia de 67%
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[#A8E6CE]/10"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A8E6CE]/40 to-[#7BC8A4]/40 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#2A8C68]" />
                  </div>
                  <span className="text-foreground text-sm flex-1">{benefit.text}</span>
                  <Check className="w-4 h-4 text-[#2A8C68] flex-shrink-0" />
                </div>
              );
            })}
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full h-12 text-base font-bold rounded-2xl bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] hover:from-[#238058] hover:via-[#6ab893] hover:to-[#238058] text-white shadow-lg shadow-[#2A8C68]/30"
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
              className="w-full h-10 text-sm font-medium rounded-2xl border-[#2A8C68]/30 text-[#2A8C68] hover:bg-[#A8E6CE]/20"
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
          <div className="flex items-center justify-center gap-4 pt-1 text-muted-foreground text-xs">
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
