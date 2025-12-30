import { motion } from "framer-motion";
import { X, Check, Target, BarChart3, Shield, Bell } from "lucide-react";

const oldWayItems = [
  "Metas espalhadas no papel, WhatsApp, Excel ou bloco de notas",
  "Esquece das metas e perde o foco",
  "Sem visão clara do progresso",
  "Tempo perdido tentando se organizar",
];

const newWayItems = [
  { text: "Plano organizado e acessível 24/7", icon: Target },
  { text: "Dashboard mostra seu avanço real", icon: BarChart3 },
  { text: "Lembretes te mantêm no caminho certo", icon: Bell },
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
                {oldWayItems.map((text, i) => (
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
                    <span className="text-muted-foreground">{text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* New Way Card - Enhanced with animations */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Animated glow effect */}
            <motion.div 
              className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/40 to-emerald-500/40 blur-lg"
              animate={{ 
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.02, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Sparkle particles */}
            <motion.div
              className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-primary/60"
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: 0.5
              }}
            />
            <motion.div
              className="absolute top-1/4 -left-1 w-2 h-2 rounded-full bg-emerald-500/60"
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                delay: 1
              }}
            />
            <motion.div
              className="absolute -bottom-1 right-1/4 w-3 h-3 rounded-full bg-primary/50"
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: 1.5
              }}
            />
            
            <div className="relative rounded-2xl border border-primary/30 bg-card p-6 h-full overflow-hidden">
              {/* Inner gradient shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 2
                }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div 
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center border border-primary/20"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 0 rgba(var(--primary), 0)",
                        "0 0 20px 4px rgba(var(--primary), 0.2)",
                        "0 0 0 0 rgba(var(--primary), 0)"
                      ]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity 
                    }}
                  >
                    <Check className="w-5 h-5 text-primary" />
                  </motion.div>
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
                      className="flex items-start gap-3 group"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center mt-0.5 border border-primary/10 group-hover:border-primary/30 transition-colors">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex items-center gap-2 pt-1.5">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-foreground">{item.text}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
