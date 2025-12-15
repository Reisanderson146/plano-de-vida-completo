import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, Zap, Heart, Target, Sparkles, BadgeCheck, Gem, Loader2, LogIn, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import loginBackground from '@/assets/login-background.png';

const benefits = [
  { icon: Target, text: 'Planejamento completo das 7 áreas da vida' },
  { icon: Shield, text: 'Seus dados seguros na nuvem' },
  { icon: Zap, text: 'Relatórios e gráficos de progresso' },
  { icon: Heart, text: 'Acompanhamento de metas por período' },
  { icon: Sparkles, text: 'Exportação profissional em PDF' },
];

export default function Assinatura() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
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

  const handleLogin = () => {
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
      {/* Green overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2A8C68]/70 via-[#7BC8A4]/50 to-[#2A8C68]/60 backdrop-blur-[2px]" />
      
      {/* Animated glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#A8E6CE]/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#7BC8A4]/15 rounded-full blur-[100px] animate-pulse delay-1000" />

      {/* Top Navigation Bar with Login Button */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
              Plano de Vida
            </h2>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            variant="outline"
            className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:text-white rounded-xl px-4 sm:px-6 py-2 font-semibold transition-all duration-300 shadow-lg"
          >
            <User className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Entrar</span>
            <span className="sm:hidden">Login</span>
          </Button>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 pt-20 sm:pt-24">
        
        {/* Subscription Card */}
        <div className="w-full flex flex-col items-center animate-fade-in">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] mb-2">
              Plano de Vida
            </h1>
            <p className="text-white/90 text-base sm:text-lg font-light tracking-wide drop-shadow-md">
              Constância que constrói propósito
            </p>
          </div>

          {/* Main Card */}
          <Card className="w-full max-w-lg border-0 overflow-hidden rounded-[28px] shadow-[0_20px_60px_-10px_rgba(42,140,104,0.35)]">
            <div className="absolute inset-0 rounded-[28px] p-[1px] bg-gradient-to-br from-white/40 via-[#A8E6CE]/30 to-white/20">
              <div className="w-full h-full rounded-[27px] bg-white/95 backdrop-blur-2xl" />
            </div>

            <div className="relative z-10">
              {/* Premium badge */}
              <div className="relative bg-gradient-to-r from-[#2A8C68] via-[#3d9d78] to-[#2A8C68] py-5 px-6">
                <div className="relative flex items-center justify-center gap-2">
                  <Gem className="w-5 h-5 text-white" />
                  <span className="text-xl font-semibold text-white tracking-widest uppercase">Premium</span>
                  <BadgeCheck className="w-5 h-5 text-white" />
                </div>
                <p className="text-center text-white/80 text-sm mt-1">Acesso completo a todas as funcionalidades</p>
              </div>

              <CardContent className="p-6 sm:p-8 space-y-6 bg-white">
                {/* Price */}
                <div className="text-center py-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm text-muted-foreground line-through">R$ 29,99</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] bg-clip-text text-transparent">
                      R$ 9,99
                    </span>
                    <span className="text-muted-foreground text-lg">/mês</span>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 bg-[#A8E6CE]/30 text-[#2A8C68] text-sm font-semibold px-4 py-1.5 rounded-full">
                    <Zap className="w-4 h-4" />
                    Economia de 67%
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-3">
                  {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#A8E6CE]/10 hover:bg-[#A8E6CE]/20 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A8E6CE]/40 to-[#7BC8A4]/40 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-[#2A8C68]" />
                        </div>
                        <span className="text-foreground text-sm sm:text-base flex-1">{benefit.text}</span>
                        <Check className="w-5 h-5 text-[#2A8C68] flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] hover:from-[#238058] hover:via-[#6ab893] hover:to-[#238058] text-white shadow-lg shadow-[#2A8C68]/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-[#2A8C68]/50"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Gem className="w-5 h-5" />
                        Assinar Agora
                      </div>
                    )}
                  </Button>

                  <Button
                    onClick={handleAlreadySubscriber}
                    variant="outline"
                    className="w-full h-14 text-lg font-bold rounded-2xl border-2 border-[#2A8C68] text-[#2A8C68] hover:bg-[#2A8C68] hover:text-white transition-all duration-300"
                  >
                    <div className="flex items-center gap-2">
                      <LogIn className="w-5 h-5" />
                      Já sou assinante
                    </div>
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 pt-2 text-muted-foreground text-xs">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Pagamento Seguro</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    <span>Cancele quando quiser</span>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Testimonial */}
          <div className="mt-6 max-w-lg text-center">
            <p className="text-white/90 text-sm italic drop-shadow-md">
              "O Plano de Vida transformou minha forma de organizar minhas metas. 
              Finalmente consigo ver meu progresso em todas as áreas!"
            </p>
            <p className="text-white font-medium text-sm mt-2 drop-shadow-md">— Maria S., usuária Premium</p>
          </div>
        </div>
      </div>
    </div>
  );
}
