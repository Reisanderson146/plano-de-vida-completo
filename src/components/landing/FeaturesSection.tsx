import { FileText, Target, BarChart3, Brain, FileDown, Cloud, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Crie seu Plano de Vida",
    description: "Organize suas metas nas 7 áreas da vida com um sistema intuitivo e visual. Importe planos existentes em Excel ou PDF.",
    highlight: "Importação inteligente",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Target,
    title: "Acompanhe suas Metas",
    description: "Marque metas como realizadas, acompanhe o progresso de cada área e celebre cada conquista com animações motivacionais.",
    highlight: "Celebração de conquistas",
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: BarChart3,
    title: "Dashboard Completo",
    description: "Visualize seu progresso em gráficos interativos. Veja quais áreas estão bem e quais precisam de mais atenção.",
    highlight: "Gráficos interativos",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Brain,
    title: "Resumo Inteligente com IA",
    description: "Nossa inteligência artificial analisa seu progresso e gera resumos personalizados com insights valiosos sobre sua jornada.",
    highlight: "Powered by IA",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: FileDown,
    title: "Exportação em PDF",
    description: "Exporte seu plano de vida completo em PDF profissional, perfeito para imprimir, compartilhar ou guardar como registro.",
    highlight: "Design premium",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: Cloud,
    title: "Dados na Nuvem",
    description: "Seus planos e metas ficam seguros na nuvem. Acesse de qualquer dispositivo, a qualquer momento.",
    highlight: "100% seguro",
    color: "from-slate-500 to-gray-600",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Funcionalidades{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              Poderosas
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para planejar, acompanhar e alcançar suas metas de vida.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              <div className="relative bg-card border border-border/50 rounded-2xl p-6 h-full hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{feature.description}</p>

                {/* Highlight Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">{feature.highlight}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
