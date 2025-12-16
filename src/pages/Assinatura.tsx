import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, Zap, Heart, Target, Sparkles, BadgeCheck, Gem, Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import loginBackground from '@/assets/login-background.png';
import DemoCarousel from '@/components/subscription/DemoCarousel';

const benefits = [
  { icon: Target, text: 'Planejamento completo das 7 áreas da vida' },
  { icon: Shield, text: 'Seus dados seguros na nuvem' },
  { icon: Zap, text: 'Relatórios e gráficos de progresso' },
  { icon: Heart, text: 'Lembretes personalizados por email' },
  { icon: Sparkles, text: 'Exportação profissional em PDF' },
];

export default function Assinatura() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    // If not logged in, redirect to auth first
    if (!user) {
      toast.info('Faça login ou crie sua conta para assinar');
      navigate('/auth', { state: { returnTo: '/assinatura', action: 'checkout' } });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');

      if (error) throw error;

      if (data?.url) {
        // Navigate in same window to maintain session
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

  const handleAlreadySubscriber = () => {
    navigate('/auth');
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Green overlay matching login screen */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2A8C68]/70 via-[#7BC8A4]/50 to-[#2A8C68]/60 backdrop-blur-[2px]" />
      
      {/* Animated glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#A8E6CE]/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#7BC8A4]/15 rounded-full blur-[100px] animate-pulse delay-1000" />

      {/* Watermark pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-size='8' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif'%3EPREMIUM%3C/text%3E%3C/svg%3E")`,
        backgroundSize: '120px 120px',
      }} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-4 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] mb-1">
            Plano de Vida
          </h1>
          <p className="text-white/90 text-sm sm:text-base font-light tracking-wide drop-shadow-md">
            Constância que constrói propósito
          </p>
        </div>

        {/* Main Content - Two Column Layout on larger screens */}
        <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center justify-center gap-6">
          
          {/* Demo Carousel */}
          <div className="w-full max-w-sm animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
            <DemoCarousel />
          </div>

          {/* Subscription Card */}
          <Card className="w-full max-w-sm border-0 overflow-hidden rounded-2xl shadow-[0_20px_60px_-10px_rgba(42,140,104,0.35)] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-2xl p-[1px] bg-gradient-to-br from-white/40 via-[#A8E6CE]/30 to-white/20">
              <div className="w-full h-full rounded-[15px] bg-white/95 backdrop-blur-2xl" />
            </div>

            <div className="relative z-10">
              {/* Premium badge - Compact */}
              <div className="relative bg-gradient-to-r from-[#2A8C68] via-[#3d9d78] to-[#2A8C68] py-3 px-4">
                <div className="relative flex items-center justify-center gap-2">
                  <Gem className="w-4 h-4 text-white" />
                  <span className="text-base font-semibold text-white tracking-widest uppercase">Premium</span>
                  <BadgeCheck className="w-4 h-4 text-white" />
                </div>
              </div>

              <CardContent className="p-4 sm:p-5 space-y-4 bg-white">
                {/* Price - Compact */}
                <div className="text-center py-2">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-xs text-muted-foreground line-through">R$ 29,99</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] bg-clip-text text-transparent">
                      R$ 9,99
                    </span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 bg-[#A8E6CE]/30 text-[#2A8C68] text-xs font-semibold px-3 py-1 rounded-full">
                    <Zap className="w-3 h-3" />
                    Economia de 67%
                  </div>
                </div>

                {/* Benefits - Compact */}
                <div className="space-y-2">
                  {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <div 
                        key={index} 
                        className="flex items-center gap-2 p-2 rounded-lg bg-[#A8E6CE]/10"
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A8E6CE]/40 to-[#7BC8A4]/40 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-[#2A8C68]" />
                        </div>
                        <span className="text-foreground text-xs sm:text-sm flex-1">{benefit.text}</span>
                        <Check className="w-4 h-4 text-[#2A8C68] flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] hover:from-[#238058] hover:via-[#6ab893] hover:to-[#238058] text-white shadow-lg shadow-[#2A8C68]/30 transition-all duration-300 hover:scale-[1.02]"
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
                    onClick={handleAlreadySubscriber}
                    variant="outline"
                    className="w-full h-10 text-sm font-medium rounded-xl border-[#2A8C68] text-[#2A8C68] hover:bg-[#2A8C68] hover:text-white transition-all"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Já sou assinante
                  </Button>
                </div>

                {/* Trust badges - Compact */}
                <div className="flex items-center justify-center gap-3 pt-1 text-muted-foreground text-xs">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Seguro</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Cancele quando quiser</span>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}