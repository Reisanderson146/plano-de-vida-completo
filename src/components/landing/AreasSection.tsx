import { Cross, Brain, Heart, Users, DollarSign, Briefcase, Dumbbell } from "lucide-react";

const areas = [
  { name: "Espiritual", icon: Cross, color: "from-violet-500 to-purple-600", bgColor: "bg-violet-500/10" },
  { name: "Intelectual", icon: Brain, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/10" },
  { name: "Familiar", icon: Heart, color: "from-rose-500 to-pink-500", bgColor: "bg-rose-500/10" },
  { name: "Social", icon: Users, color: "from-amber-500 to-orange-500", bgColor: "bg-amber-500/10" },
  { name: "Financeiro", icon: DollarSign, color: "from-emerald-500 to-green-500", bgColor: "bg-emerald-500/10" },
  { name: "Profissional", icon: Briefcase, color: "from-slate-500 to-gray-600", bgColor: "bg-slate-500/10" },
  { name: "Saúde", icon: Dumbbell, color: "from-red-500 to-rose-500", bgColor: "bg-red-500/10" },
];

const AreasSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O Que É o{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              Plano de Vida
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            O Plano de Vida é uma ferramenta de planejamento pessoal baseada em princípios bíblicos 
            de sabedoria e propósito. Organize cada área da sua vida com clareza e intencionalidade, 
            construindo um futuro alinhado com seus valores e objetivos mais profundos.
          </p>
        </div>

        {/* Areas Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {areas.map((area, index) => (
            <div
              key={area.name}
              className="group relative animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${area.color} rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />
              <div className="relative bg-card border border-border/50 rounded-2xl p-6 text-center hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl ${area.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <area.icon className={`w-7 h-7 bg-gradient-to-br ${area.color} bg-clip-text`} style={{ color: area.color.includes('violet') ? '#8b5cf6' : area.color.includes('blue') ? '#3b82f6' : area.color.includes('rose') ? '#f43f5e' : area.color.includes('amber') ? '#f59e0b' : area.color.includes('emerald') ? '#10b981' : area.color.includes('slate') ? '#64748b' : '#ef4444' }} />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{area.name}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Context */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cada área representa um pilar fundamental da vida. Ao planejar e acompanhar metas em todas elas, 
            você constrói uma vida equilibrada e com propósito divino.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AreasSection;
