import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Sparkles, Shield, Zap, Gem, User, Users, Baby, Heart, Target, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingSectionProps {
  onCheckout: (tier: 'basic' | 'premium') => void;
  onLogin: () => void;
  loading: 'basic' | 'premium' | null;
}

const basicBenefits = [
  { text: "1 Plano Individual", icon: User },
  { text: "Planejamento das 7 áreas da vida", icon: Target },
  { text: "Seus dados seguros na nuvem", icon: Shield },
  { text: "Exportação profissional em PDF", icon: Zap },
];

const premiumBenefits = [
  { text: "1 Plano Individual", icon: User },
  { text: "1 Plano Familiar", icon: Users },
  { text: "2 Planos para Filhos", icon: Baby },
  { text: "Resumo inteligente com IA", icon: Sparkles, highlight: true },
  { text: "Relatórios e gráficos de progresso", icon: Check },
  { text: "Lembretes por email", icon: Heart },
  { text: "Exportação profissional em PDF", icon: Zap },
  { text: "Seus dados seguros na nuvem", icon: Shield },
];

const PricingSection = ({ onCheckout, onLogin, loading }: PricingSectionProps) => {
  return (
    <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 to-transparent rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comece sua{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              Jornada
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Invista no seu futuro com um plano que cabe no seu bolso.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto animate-fade-in">
          {/* Basic Plan */}
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-card/80 backdrop-blur-sm shadow-xl transition-all duration-300 hover:border-primary/40 hover:shadow-2xl">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5" />

            <CardHeader className="pt-8 pb-4 text-center relative">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 text-sm font-semibold mx-auto mb-4">
                <Gem className="w-4 h-4" />
                <span>Basic</span>
              </div>
              
              <CardTitle className="text-xl font-bold text-foreground mb-4">
                Para Começar
              </CardTitle>
              
              {/* Price */}
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-foreground">
                  R$ 9,99
                </span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">1 plano individual</p>
            </CardHeader>

            <CardContent className="relative space-y-6 pb-8">
              {/* Benefits List */}
              <ul className="space-y-3">
                {basicBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-foreground text-sm">{benefit.text}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="pt-4">
                <Button
                  size="lg"
                  onClick={() => onCheckout('basic')}
                  disabled={loading !== null}
                  className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02]"
                >
                  {loading === 'basic' ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Gem className="w-5 h-5" />
                      <span>Assinar Basic</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative overflow-hidden border-2 border-violet-500/40 bg-card/80 backdrop-blur-sm shadow-2xl shadow-violet-500/10 transition-all duration-300 hover:border-violet-500/60 hover:shadow-violet-500/20">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10" />
            
            {/* Recommended Badge */}
            <div className="absolute -top-px left-1/2 -translate-x-1/2">
              <div className="relative px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-b-xl">
                <div className="flex items-center gap-2 text-white font-semibold text-sm">
                  <Crown className="w-4 h-4" />
                  <span>Recomendado</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer rounded-b-xl" />
              </div>
            </div>

            <CardHeader className="pt-14 pb-4 text-center relative">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-full text-violet-600 dark:text-violet-400 text-sm font-semibold mx-auto mb-4">
                <Crown className="w-4 h-4" />
                <span>Premium</span>
              </div>
              
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Para Toda Família
              </CardTitle>
              
              {/* Price */}
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  R$ 29,99
                </span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                <Zap className="w-3 h-3" />
                4 planos incluídos
              </div>
            </CardHeader>

            <CardContent className="relative space-y-6 pb-8">
              {/* Benefits List */}
              <ul className="space-y-3">
                {premiumBenefits.map((benefit, index) => (
                  <li 
                    key={index} 
                    className={cn(
                      "flex items-center gap-3",
                      benefit.highlight && "p-2 -mx-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                      benefit.highlight 
                        ? "bg-gradient-to-br from-violet-500 to-purple-600" 
                        : "bg-violet-500/10"
                    )}>
                      <benefit.icon className={cn(
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
                      <span className="text-[10px] bg-violet-500/20 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded-full">
                        Exclusivo
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="pt-4">
                <Button
                  size="lg"
                  onClick={() => onCheckout('premium')}
                  disabled={loading !== null}
                  className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:scale-[1.02]"
                >
                  {loading === 'premium' ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      <span>Assinar Premium</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Already Subscriber Button */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            size="lg"
            onClick={onLogin}
            className="text-muted-foreground hover:text-primary"
          >
            Já sou assinante
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>Pagamento seguro</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="w-4 h-4 text-primary" />
            <span>Cancele quando quiser</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
