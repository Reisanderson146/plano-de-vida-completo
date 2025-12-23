import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Sparkles, Shield, Zap, Gem, User, Users, Baby, Heart, Target, Loader2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PricingSectionProps {
  onCheckout: (tier: 'basic' | 'premium') => void;
  onLogin: () => void;
  loading: 'basic' | 'premium' | null;
}

interface Benefit {
  text: string;
  icon: LucideIcon;
  includedInBasic: boolean;
  highlight?: boolean;
}

const allBenefits: Benefit[] = [
  { text: "1 Plano Individual", icon: User, includedInBasic: true },
  { text: "Planejamento das 7 áreas da vida", icon: Target, includedInBasic: true },
  { text: "Seus dados seguros na nuvem", icon: Shield, includedInBasic: true },
  { text: "Exportação profissional em PDF", icon: Zap, includedInBasic: true },
  { text: "1 Plano Familiar", icon: Users, includedInBasic: false },
  { text: "2 Planos para Filhos", icon: Baby, includedInBasic: false },
  { text: "Resumo inteligente com IA", icon: Sparkles, includedInBasic: false, highlight: true },
  { text: "Relatórios e gráficos de progresso", icon: Check, includedInBasic: false },
  { text: "Lembretes por email", icon: Heart, includedInBasic: false },
];

const PricingSection = ({ onCheckout, onLogin, loading }: PricingSectionProps) => {
  const [activeCard, setActiveCard] = useState<0 | 1>(0);

  const goToNext = () => setActiveCard(1);
  const goToPrev = () => setActiveCard(0);

  return (
    <section id="pricing" className="py-20 px-4 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 to-transparent rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 animate-fade-in">
          <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">
            Conferir planos
          </p>
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

        {/* Carousel Container */}
        <div className="relative max-w-md mx-auto animate-fade-in">
          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20",
              "w-10 h-10 rounded-full bg-card border border-border shadow-lg",
              "flex items-center justify-center transition-all duration-200",
              activeCard === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-muted hover:scale-110"
            )}
            disabled={activeCard === 0}
            aria-label="Plano anterior"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          
          <button
            onClick={goToNext}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20",
              "w-10 h-10 rounded-full bg-card border border-border shadow-lg",
              "flex items-center justify-center transition-all duration-200",
              activeCard === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-muted hover:scale-110"
            )}
            disabled={activeCard === 1}
            aria-label="Próximo plano"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>

          {/* Cards Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeCard * 100}%)` }}
            >
              {/* Basic Plan */}
              <div className="w-full flex-shrink-0 px-2">
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
                      {allBenefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                            benefit.includedInBasic 
                              ? "bg-emerald-500/10" 
                              : "bg-muted/50"
                          )}>
                            {benefit.includedInBasic ? (
                              <benefit.icon className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-muted-foreground/50" />
                            )}
                          </div>
                          <span className={cn(
                            "text-sm",
                            benefit.includedInBasic 
                              ? "text-foreground" 
                              : "text-muted-foreground/50 line-through"
                          )}>
                            {benefit.text}
                          </span>
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
              </div>

              {/* Premium Plan */}
              <div className="w-full flex-shrink-0 px-2">
                <Card className="relative overflow-hidden border-2 border-violet-500/40 bg-card/80 backdrop-blur-sm shadow-2xl shadow-violet-500/10 transition-all duration-300 hover:border-violet-500/60 hover:shadow-violet-500/20">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10" />
                  
                  {/* Recommended Badge - positioned at top right corner */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full text-white font-medium text-xs shadow-lg shadow-violet-500/30">
                      <Crown className="w-3 h-3" />
                      <span>Recomendado</span>
                    </div>
                  </div>

                  <CardHeader className="pt-8 pb-4 text-center relative">
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
                      {allBenefits.map((benefit, index) => (
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
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setActiveCard(0)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                activeCard === 0 
                  ? "bg-primary scale-110" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label="Ver plano Basic"
            />
            <button
              onClick={() => setActiveCard(1)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                activeCard === 1 
                  ? "bg-violet-500 scale-110" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label="Ver plano Premium"
            />
          </div>

          {/* Plan indicator text */}
          <p className="text-center text-sm text-muted-foreground mt-2">
            {activeCard === 0 ? "Plano Basic" : "Plano Premium"} • Clique para ver outro
          </p>
        </div>

        {/* Already Subscriber Button - More Visible */}
        <div className="text-center mt-8">
          <div className="inline-flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-emerald-500/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">Já possui uma conta?</p>
            <Button
              variant="outline"
              size="lg"
              onClick={onLogin}
              className="border-primary/50 text-primary hover:bg-primary/10 hover:border-primary font-semibold px-8"
            >
              <Check className="w-4 h-4 mr-2" />
              Já sou assinante - Entrar
            </Button>
          </div>
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
