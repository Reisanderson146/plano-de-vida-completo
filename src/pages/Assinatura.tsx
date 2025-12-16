import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, Zap, Target, Sparkles, BadgeCheck, Gem, Loader2, LogIn, Play, ChevronRight, Brain, BarChart3, FileText, Cloud, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import loginBackground from '@/assets/login-background.png';
import DemoCarousel from '@/components/subscription/DemoCarousel';

const benefits = [
  { icon: Target, text: 'Planejamento das 7 áreas da vida', highlight: false },
  { icon: Brain, text: 'Resumo inteligente com IA', highlight: true },
  { icon: BarChart3, text: 'Fechamento de balanço anual', highlight: false },
  { icon: Zap, text: 'Relatórios e gráficos de progresso', highlight: false },
  { icon: FileText, text: 'Exportação profissional em PDF', highlight: false },
  { icon: Cloud, text: 'Seus dados seguros na nuvem', highlight: false },
];

export default function Assinatura() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

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
      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a5c42]/90 via-[#2A8C68]/80 to-[#1a5c42]/90" />
      
      {/* Animated orbs */}
      <div className="absolute top-20 left-10 w-[300px] h-[300px] bg-[#A8E6CE]/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-[#7BC8A4]/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2A8C68]/10 rounded-full blur-[150px]" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
        {/* Header with glow effect */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-4 border border-white/20">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-white/90 text-sm font-medium">Transforme sua vida hoje</span>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-3">
            <span className="bg-gradient-to-r from-white via-[#A8E6CE] to-white bg-clip-text text-transparent">
              Plano de Vida
            </span>
          </h1>
          <p className="text-white/80 text-lg sm:text-xl font-light tracking-wide mb-6">
            Constância que constrói propósito
          </p>
          
          {/* Demo Button - Premium style */}
          <Button
            onClick={() => setDemoOpen(true)}
            variant="outline"
            className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:text-white hover:border-white/50 px-8 py-3 rounded-full transition-all duration-300 group shadow-lg shadow-black/20"
          >
            <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform fill-white" />
            Ver demonstração
            <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Main Card - Premium glass morphism */}
        <Card className="w-full max-w-md border-0 overflow-hidden rounded-3xl shadow-2xl shadow-black/30 animate-fade-in-up backdrop-blur-xl" style={{ animationDelay: '0.15s' }}>
          {/* Gradient border glow */}
          <div className="absolute -inset-[1px] bg-gradient-to-br from-[#A8E6CE]/60 via-white/30 to-[#7BC8A4]/60 rounded-3xl blur-[1px]" />
          
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl overflow-hidden">
            {/* Premium badge header */}
            <div className="relative bg-gradient-to-r from-[#1a5c42] via-[#2A8C68] to-[#1a5c42] py-4 px-6 overflow-hidden">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" style={{ animationDuration: '2s' }} />
              
              <div className="relative flex items-center justify-center gap-3">
                <Gem className="w-5 h-5 text-[#A8E6CE]" />
                <span className="text-lg font-bold text-white tracking-[0.2em] uppercase">Premium</span>
                <BadgeCheck className="w-5 h-5 text-[#A8E6CE]" />
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Price section */}
              <div className="text-center py-4 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#A8E6CE]/10 to-transparent rounded-2xl" />
                
                <div className="relative">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-sm text-muted-foreground line-through">R$ 29,99</span>
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">-67%</span>
                  </div>
                  
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <span className="text-6xl font-black bg-gradient-to-br from-[#2A8C68] via-[#3d9d78] to-[#2A8C68] bg-clip-text text-transparent">
                      9
                    </span>
                    <span className="text-3xl font-bold text-[#2A8C68]">,99</span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    Menos que um café por semana ☕
                  </p>
                </div>
              </div>

              {/* Benefits grid */}
              <div className="space-y-2">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div 
                      key={index} 
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                        benefit.highlight 
                          ? 'bg-gradient-to-r from-[#2A8C68]/10 via-[#A8E6CE]/20 to-[#2A8C68]/10 border border-[#2A8C68]/20' 
                          : 'bg-gray-50/80 hover:bg-[#A8E6CE]/10'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        benefit.highlight 
                          ? 'bg-gradient-to-br from-[#2A8C68] to-[#7BC8A4] shadow-lg shadow-[#2A8C68]/30' 
                          : 'bg-gradient-to-br from-[#A8E6CE]/60 to-[#7BC8A4]/60'
                      }`}>
                        <Icon className={`w-5 h-5 ${benefit.highlight ? 'text-white' : 'text-[#2A8C68]'}`} />
                      </div>
                      <span className={`flex-1 text-sm ${benefit.highlight ? 'font-semibold text-[#2A8C68]' : 'text-foreground'}`}>
                        {benefit.text}
                      </span>
                      <Check className={`w-5 h-5 flex-shrink-0 ${benefit.highlight ? 'text-[#2A8C68]' : 'text-[#7BC8A4]'}`} />
                    </div>
                  );
                })}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-[#2A8C68] via-[#3d9d78] to-[#2A8C68] hover:from-[#238058] hover:via-[#2f8a6a] hover:to-[#238058] text-white shadow-xl shadow-[#2A8C68]/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#2A8C68]/50 relative overflow-hidden group"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 relative">
                      <Gem className="w-5 h-5" />
                      Começar Agora
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>

                <Button
                  onClick={handleAlreadySubscriber}
                  variant="ghost"
                  className="w-full h-12 text-sm font-medium rounded-xl text-[#2A8C68] hover:bg-[#A8E6CE]/20 transition-all"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Já sou assinante
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Shield className="w-4 h-4 text-[#2A8C68]" />
                  <span>Pagamento seguro</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Zap className="w-4 h-4 text-[#2A8C68]" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Social proof */}
        <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-white/60 text-sm">
            Junte-se a centenas de pessoas transformando suas vidas
          </p>
        </div>
      </div>

      {/* Demo Modal */}
      <DemoCarousel open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}