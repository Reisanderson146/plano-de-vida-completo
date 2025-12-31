import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Crown, Gem, Sparkles, Shield, Target, BarChart3, Download, Bell, History, FileText, Users, Baby, User, Calendar, Eye, BookOpen, ArrowLeft, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Feature {
  name: string;
  description: string;
  icon: React.ElementType;
  basic: boolean | string;
  familiar: boolean | string;
  premium: boolean | string;
  highlight?: boolean;
}

const features: Feature[] = [
  { 
    name: 'Plano Individual', 
    description: 'Crie seu plano de vida pessoal com metas para todas as áreas',
    icon: User, 
    basic: true, 
    familiar: false,
    premium: false 
  },
  { 
    name: 'Plano Familiar', 
    description: 'Planeje o futuro da sua família em conjunto',
    icon: Users, 
    basic: false, 
    familiar: true,
    premium: true 
  },
  { 
    name: 'Planos para Filhos', 
    description: 'Crie planos individuais para seus filhos',
    icon: Baby, 
    basic: '—', 
    familiar: '1 plano',
    premium: '3 planos' 
  },
  { 
    name: 'Resumo com IA', 
    description: 'Análise inteligente do seu progresso com sugestões personalizadas',
    icon: Sparkles, 
    basic: false, 
    familiar: true,
    premium: true,
    highlight: true 
  },
  { 
    name: '7 Áreas da Vida', 
    description: 'Planeje: Espiritual, Intelectual, Familiar, Social, Financeiro, Profissional e Saúde',
    icon: Target, 
    basic: true, 
    familiar: true,
    premium: true 
  },
  { 
    name: 'Dashboard de Progresso', 
    description: 'Visualize seu avanço com gráficos e métricas',
    icon: BarChart3, 
    basic: true, 
    familiar: true,
    premium: true 
  },
  { 
    name: 'Consulta Visual do Plano', 
    description: 'Veja seu plano completo em formato de tabela interativa',
    icon: Eye, 
    basic: true, 
    familiar: true,
    premium: true 
  },
  { 
    name: 'Visão por Períodos', 
    description: 'Organize metas por fases da vida (1, 5, 10+ anos)',
    icon: Calendar, 
    basic: true, 
    familiar: true,
    premium: true 
  },
  { 
    name: 'Dados na Nuvem', 
    description: 'Seus dados seguros e acessíveis de qualquer dispositivo',
    icon: Shield, 
    basic: true, 
    familiar: true,
    premium: true 
  },
  { 
    name: 'Exportação em PDF', 
    description: 'Baixe seu plano em formato profissional para impressão',
    icon: Download, 
    basic: true, 
    familiar: true,
    premium: true 
  },
  { 
    name: 'Guia de Uso', 
    description: 'Tutorial completo para aproveitar todos os recursos',
    icon: BookOpen, 
    basic: true, 
    familiar: true,
    premium: true 
  },
  { 
    name: 'Lembretes por Email', 
    description: 'Receba lembretes das suas metas importantes',
    icon: Bell, 
    basic: false, 
    familiar: true,
    premium: true 
  },
  { 
    name: 'Email Aniversário Casamento', 
    description: 'Mensagem especial com versículo bíblico no aniversário de casamento',
    icon: Heart, 
    basic: false, 
    familiar: true,
    premium: true 
  },
  { 
    name: 'Histórico de Metas', 
    description: 'Acompanhe todas as metas que você já concluiu',
    icon: History, 
    basic: true, 
    familiar: true,
    premium: true 
  },
];

export default function CompararPlanos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<'basic' | 'familiar' | 'premium' | null>(null);

  const handleCheckout = async (tier: 'basic' | 'familiar' | 'premium') => {
    if (!user) {
      navigate('/auth');
      return;
    }

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

  const renderFeatureValue = (value: boolean | string, color: 'emerald' | 'rose' | 'violet') => {
    if (typeof value === 'string') {
      return (
        <span className={cn(
          "text-xs font-medium",
          color === 'emerald' ? "text-emerald-600" :
          color === 'rose' ? "text-rose-600" :
          "text-violet-600"
        )}>
          {value}
        </span>
      );
    }
    
    if (value) {
      return (
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center",
          color === 'emerald' ? "bg-emerald-500/20" :
          color === 'rose' ? "bg-rose-500/20" :
          "bg-violet-500/20"
        )}>
          <Check className={cn(
            "w-4 h-4",
            color === 'emerald' ? "text-emerald-600" :
            color === 'rose' ? "text-rose-600" :
            "text-violet-600"
          )} />
        </div>
      );
    }
    
    return (
      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
        <X className="w-4 h-4 text-muted-foreground/50" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <h1 className="text-lg font-semibold">Comparar Planos</h1>
          <div className="w-24" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha o plano ideal para{' '}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              sua jornada
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Compare os recursos de cada plano e escolha o que melhor atende às suas necessidades.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="overflow-x-auto"
        >
          <Card className="overflow-hidden border-2 border-border/50 min-w-[700px]">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr,130px,130px,130px] md:grid-cols-[1fr,160px,160px,160px] bg-muted/50">
              <div className="p-4 md:p-6 border-r border-border">
                <span className="font-semibold text-foreground">Recursos</span>
              </div>
              
              {/* Basic */}
              <div className="p-4 md:p-6 text-center border-r border-border relative">
                <div className="absolute top-2 right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  7 DIAS GRÁTIS
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    <Gem className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="font-bold text-foreground">Basic</span>
                  <span className="text-xl md:text-2xl font-bold text-emerald-600">R$ 9,99</span>
                  <span className="text-xs text-muted-foreground">/mês</span>
                </div>
              </div>
              
              {/* Familiar */}
              <div className="p-4 md:p-6 text-center border-r border-border bg-gradient-to-br from-rose-500/5 to-pink-500/5 relative">
                <div className="absolute top-2 right-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  7 DIAS GRÁTIS
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-rose-600" />
                  </div>
                  <span className="font-bold text-foreground">Familiar</span>
                  <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">R$ 19,90</span>
                  <span className="text-xs text-muted-foreground">/mês</span>
                </div>
              </div>
              
              {/* Premium */}
              <div className="p-4 md:p-6 text-center bg-gradient-to-br from-violet-500/5 to-purple-500/5 relative">
                <div className="absolute top-2 right-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  7 DIAS GRÁTIS
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-foreground">Premium</span>
                    <span className="text-[10px] bg-violet-500 text-white px-1.5 py-0.5 rounded-full">
                      IA
                    </span>
                  </div>
                  <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">R$ 29,99</span>
                  <span className="text-xs text-muted-foreground">/mês</span>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.name}
                    className={cn(
                      "grid grid-cols-[1fr,130px,130px,130px] md:grid-cols-[1fr,160px,160px,160px]",
                      feature.highlight && "bg-gradient-to-r from-violet-500/5 to-purple-500/5"
                    )}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                  >
                    <div className="p-4 md:p-5 border-r border-border">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          feature.highlight 
                            ? "bg-gradient-to-br from-violet-500 to-purple-600"
                            : "bg-muted"
                        )}>
                          <Icon className={cn(
                            "w-4 h-4",
                            feature.highlight ? "text-white" : "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <p className={cn(
                            "font-medium text-sm",
                            feature.highlight && "text-violet-700 dark:text-violet-300"
                          )}>
                            {feature.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 hidden md:block">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 md:p-5 flex items-center justify-center border-r border-border">
                      {renderFeatureValue(feature.basic, 'emerald')}
                    </div>
                    <div className="p-4 md:p-5 flex items-center justify-center border-r border-border">
                      {renderFeatureValue(feature.familiar, 'rose')}
                    </div>
                    <div className={cn(
                      "p-4 md:p-5 flex items-center justify-center",
                      feature.highlight && "bg-gradient-to-r from-violet-500/5 to-purple-500/5"
                    )}>
                      {renderFeatureValue(feature.premium, 'violet')}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Table Footer - CTAs */}
            <div className="grid grid-cols-[1fr,130px,130px,130px] md:grid-cols-[1fr,160px,160px,160px] bg-muted/30 border-t-2 border-border">
              <div className="p-4 md:p-6 border-r border-border flex items-center">
                <p className="text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 inline mr-1 text-primary" />
                  Cancele quando quiser
                </p>
              </div>
              <div className="p-4 md:p-6 flex items-center justify-center border-r border-border">
                <Button
                  onClick={() => handleCheckout('basic')}
                  disabled={loading !== null}
                  variant="outline"
                  size="sm"
                  className="w-full border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10"
                >
                  {loading === 'basic' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Assinar'
                  )}
                </Button>
              </div>
              <div className="p-4 md:p-6 flex items-center justify-center border-r border-border bg-gradient-to-br from-rose-500/5 to-pink-500/5">
                <Button
                  onClick={() => handleCheckout('familiar')}
                  disabled={loading !== null}
                  size="sm"
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                >
                  {loading === 'familiar' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Assinar'
                  )}
                </Button>
              </div>
              <div className="p-4 md:p-6 flex items-center justify-center bg-gradient-to-br from-violet-500/5 to-purple-500/5">
                <Button
                  onClick={() => handleCheckout('premium')}
                  disabled={loading !== null}
                  size="sm"
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  {loading === 'premium' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Assinar'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          className="flex flex-wrap items-center justify-center gap-6 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>Pagamento seguro</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            <span>Cancele quando quiser</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            <span>Acesso imediato</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
