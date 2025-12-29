import { motion } from "framer-motion";
import { Target, BarChart3, Bell, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Target,
    title: "Defina suas áreas e metas",
    description: "Organize suas metas em 7 áreas da vida: espiritual, intelectual, familiar, social, financeiro, profissional e saúde.",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "Acompanhe seu progresso",
    description: "Visualize seu avanço em tempo real com gráficos e indicadores claros do seu desenvolvimento.",
  },
  {
    number: "03",
    icon: Bell,
    title: "Receba lembretes inteligentes",
    description: "Notificações personalizadas te mantêm focado e no caminho certo para alcançar seus objetivos.",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Evolua com constância",
    description: "Sem sobrecarga. Construa hábitos sólidos e veja sua evolução ao longo do tempo.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 px-4 relative overflow-hidden bg-muted/30">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Simples de usar.{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              Poderoso nos resultados.
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Quatro passos para transformar sua vida
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 h-full transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                {/* Step number */}
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-primary-foreground">{step.number}</span>
                </div>

                <div className="pt-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
