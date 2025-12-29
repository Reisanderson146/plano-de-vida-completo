import { motion } from "framer-motion";
import { X, Check, FileText, Bell, TrendingDown, Clock, Target, Sparkles, BarChart3, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const oldWayItems = [
  { text: "Metas desorganizadas no papel ou WhatsApp", icon: FileText },
  { text: "Esquece das metas e perde o foco", icon: Bell },
  { text: "Sem visão clara do progresso", icon: TrendingDown },
  { text: "Tempo perdido tentando se organizar", icon: Clock },
];

const newWayItems = [
  { text: "Plano organizado e acessível 24/7", icon: Target },
  { text: "Dashboard mostra seu avanço real", icon: BarChart3 },
  { text: "Lembretes te mantêm no caminho certo", icon: Bell },
  { text: "IA analisa e sugere melhorias", icon: Sparkles },
  { text: "Seus dados seguros na nuvem", icon: Shield },
];

const ComparisonSection = () => {
  return (
    <section className="py-16 md:py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-destructive/5 blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Deixe o passado para trás
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Veja como o Plano de Vida transforma sua forma de planejar o futuro
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Old Way Card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="rounded-2xl border border-destructive/20 bg-card p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <X className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="text-xl font-bold text-foreground">O Jeito Antigo</h3>
              </div>

              <div className="space-y-4">
                {oldWayItems.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center mt-0.5">
                      <X className="w-3.5 h-3.5 text-destructive" />
                    </div>
                    <span className="text-muted-foreground">{item.text}</span>
                  </motion.div>
                ))}
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
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/30 to-emerald-500/30 blur-lg opacity-50" />
            
            <div className="relative rounded-2xl border border-primary/30 bg-card p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">
                  <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                    O Jeito Plano de Vida
                  </span>
                </h3>
              </div>

              <div className="space-y-4">
                {newWayItems.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
