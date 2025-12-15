import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Star, Sparkles, Shield, Zap, Heart, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Logo } from '@/components/Logo';

const benefits = [
  { icon: Target, text: 'Planejamento completo das 7 áreas da vida' },
  { icon: Shield, text: 'Seus dados seguros na nuvem' },
  { icon: Zap, text: 'Relatórios e gráficos de progresso' },
  { icon: Heart, text: 'Lembretes personalizados por email' },
  { icon: Sparkles, text: 'Exportação profissional em PDF' },
  { icon: Star, text: 'Suporte prioritário' },
];

export default function Assinatura() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: 'premium',
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Bem-vindo ao Premium! 🎉', {
        description: 'Sua jornada de transformação começa agora.',
      });
      navigate('/');
    } catch (error) {
      console.error('Error activating subscription:', error);
      toast.error('Erro ao ativar assinatura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-300/5 rounded-full blur-[180px]" />
      </div>

      {/* Watermark pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-size='8' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif'%3EPREMIUM%3C/text%3E%3C/svg%3E")`,
        backgroundSize: '120px 120px',
      }} />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <Logo size="xl" showText={false} showIcon={true} variant="light" className="mx-auto mb-6 drop-shadow-2xl" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Plano de Vida
          </h1>
          <p className="text-amber-200/80 text-lg font-light tracking-wide">
            Constância que constrói propósito
          </p>
        </div>

        {/* Main Card */}
        <Card className="w-full max-w-lg border-0 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl shadow-2xl shadow-amber-500/10 rounded-3xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Premium badge */}
          <div className="relative bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 py-4 px-6">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
            <div className="relative flex items-center justify-center gap-3">
              <Crown className="w-8 h-8 text-amber-900 drop-shadow-lg" fill="currentColor" />
              <span className="text-2xl font-bold text-amber-900 tracking-wide">PREMIUM</span>
              <Crown className="w-8 h-8 text-amber-900 drop-shadow-lg" fill="currentColor" />
            </div>
            
            {/* 5 Stars */}
            <div className="flex justify-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className="w-5 h-5 text-amber-900 drop-shadow-md animate-pulse" 
                  fill="currentColor"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Price */}
            <div className="text-center py-4">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-sm text-slate-400 line-through">R$ 29,99</span>
              </div>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                  R$ 9,99
                </span>
                <span className="text-slate-400 text-lg">/mês</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-sm font-medium px-3 py-1 rounded-full">
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
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-white/90 text-sm sm:text-base">{benefit.text}</span>
                    <Check className="w-5 h-5 text-emerald-400 ml-auto flex-shrink-0" />
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleActivate}
              disabled={loading}
              className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-400 text-amber-900 shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-amber-500/50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-amber-900/30 border-t-amber-900 rounded-full animate-spin" />
                  Ativando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Começar Agora
                </div>
              )}
            </Button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-2 text-slate-500 text-xs">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Pagamento Seguro</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-600" />
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                <span>Acesso Imediato</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonial */}
        <div className="mt-8 max-w-lg text-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400" fill="currentColor" />
            ))}
          </div>
          <p className="text-white/60 text-sm italic">
            "O Plano de Vida transformou minha forma de organizar minhas metas. 
            Finalmente consigo ver meu progresso em todas as áreas!"
          </p>
          <p className="text-amber-400/80 text-sm mt-2 font-medium">— Maria S., usuária Premium</p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={signOut}
            className="text-slate-500 hover:text-slate-400 text-sm underline-offset-4 hover:underline transition-colors"
          >
            Sair da conta
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
