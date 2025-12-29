import { motion } from "framer-motion";
import { Compass, Layers, Focus, LineChart, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: Compass,
    title: "Clareza sobre sua jornada",
    description: "Saiba exatamente onde você está e para onde vai em cada área da vida.",
  },
  {
    icon: Layers,
    title: "Organização sem esforço",
    description: "Tudo em um só lugar, acessível de qualquer dispositivo, a qualquer momento.",
  },
  {
    icon: Focus,
    title: "Mais foco, menos ansiedade",
    description: "Chega de sobrecarga mental. Foque no que realmente importa.",
  },
  {
    icon: LineChart,
    title: "Progresso visível e mensurável",
    description: "Acompanhe sua evolução com dados reais e comemore cada conquista.",
  },
  {
    icon: Sparkles,
    title: "Um sistema que evolui com você",
    description: "Inteligência artificial que aprende seus padrões e sugere melhorias.",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-3xl" />
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
            Benefícios que você vai{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              sentir
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Mais do que organização — uma transformação real
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <div className="relative h-full rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5">
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center mb-4 group-hover:from-primary/20 group-hover:to-emerald-500/20 transition-colors">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
