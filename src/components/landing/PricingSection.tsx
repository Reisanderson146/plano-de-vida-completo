import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Sparkles, Shield, Zap } from "lucide-react";

interface PricingSectionProps {
  onCheckout: () => void;
  onLogin: () => void;
  loading: boolean;
}

const benefits = [
  { text: "Planejamento das 7 áreas da vida", icon: Sparkles },
  { text: "Resumo inteligente com IA", icon: Zap },
  { text: "Fechamento de balanço anual", icon: Check },
  { text: "Relatórios e gráficos de progresso", icon: Check },
  { text: "Exportação profissional em PDF", icon: Check },
  { text: "Seus dados seguros na nuvem", icon: Shield },
];

const PricingSection = ({ onCheckout, onLogin, loading }: PricingSectionProps) => {
  return (
    <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 to-transparent rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
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

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto animate-fade-in">
          <Card className="relative overflow-hidden border-2 border-primary/30 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/10">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5" />
            
            {/* Premium Badge */}
            <div className="absolute -top-px left-1/2 -translate-x-1/2">
              <div className="relative px-6 py-2 bg-gradient-to-r from-primary to-emerald-500 rounded-b-xl">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Crown className="w-4 h-4" />
                  <span>Premium</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer rounded-b-xl" />
              </div>
            </div>

            <CardHeader className="pt-16 pb-4 text-center relative">
              <CardTitle className="text-2xl font-bold text-foreground mb-4 mt-2">
                Plano de Vida Completo
              </CardTitle>
              
              {/* Price */}
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-lg text-muted-foreground line-through">R$ 19,99</span>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                    R$ 9,99
                  </span>
                  <span className="text-muted-foreground ml-1">/mês</span>
                </div>
              </div>
              <p className="text-xs text-primary font-medium mt-2">50% de desconto no lançamento!</p>
            </CardHeader>

            <CardContent className="relative space-y-6 pb-8">
              {/* Benefits List */}
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-foreground text-sm">{benefit.text}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  size="lg"
                  onClick={onCheckout}
                  disabled={loading}
                  className="w-full relative py-6 text-lg font-semibold bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processando...</span>
                    </div>
                  ) : (
                    <>
                      <span className="relative z-10">Começar Agora</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onLogin}
                  className="w-full py-6 text-muted-foreground hover:text-primary"
                >
                  Já sou assinante
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Pagamento seguro</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
