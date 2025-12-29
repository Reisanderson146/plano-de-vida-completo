import { motion } from "framer-motion";
import { X, Check, FileText, Frown, Eye, RotateCcw, Zap, Clock, BarChart3, Bell, Sparkles, Shield } from "lucide-react";

const oldWayItems = [
  { text: "Metas espalhadas em papel, notas ou WhatsApp", icon: FileText },
  { text: "Falta de constância e motivação com o tempo", icon: Frown },
  { text: "Nenhuma visão clara do que está funcionando", icon: Eye },
  { text: "Sensação constante de recomeço", icon: RotateCcw },
  { text: "Tempo e energia desperdiçados", icon: Zap },
];

const newWayItems = [
  { text: "Tudo organizado em um só lugar, 24 horas por dia", icon: Clock },
  { text: "Dashboard mostra seu progresso real", icon: BarChart3 },
  { text: "Lembretes inteligentes mantêm você no caminho", icon: Bell },
  { text: "IA analisa seus dados e sugere melhorias", icon: Sparkles },
  { text: "Seus dados protegidos na nuvem", icon: Shield },
];

const ComparisonSection = () => {
  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-destructive/5 blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Do caos à{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              clareza
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Veja como o Plano de Vida transforma sua forma de evoluir
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Old Way Card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="rounded-2xl border border-destructive/20 bg-card/50 backdrop-blur-sm p-6 md:p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <X className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">O jeito antigo</h3>
                  <p className="text-sm text-muted-foreground">de tentar evoluir</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {oldWayItems.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center mt-0.5">
                      <X className="w-3.5 h-3.5 text-destructive" />
                    </div>
                    <span className="text-muted-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4 border-t border-destructive/10">
                <p className="text-destructive/70 font-medium text-center">
                  Muito esforço. Pouco resultado.
                </p>
              </div>
            </div>
          </motion.div>

          {/* New Way Card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/30 to-emerald-500/30 blur-lg opacity-60" />
            
            <div className="relative rounded-2xl border border-primary/30 bg-card/80 backdrop-blur-sm p-6 md:p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                      O jeito Plano de Vida
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground">de evoluir</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {newWayItems.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4 border-t border-primary/20">
                <p className="text-primary font-semibold text-center">
                  Clareza, constância e evolução de verdade.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
