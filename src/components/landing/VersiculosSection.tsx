import { BookOpen } from "lucide-react";

const versiculos = [
  {
    texto: "Um dia faz declaração a outro dia, e uma noite mostra sabedoria a outra noite.",
    referencia: "Salmo 19:2",
  },
  {
    texto: "O coração do homem pode traçar o seu caminho, mas o Senhor lhe dirige os passos.",
    referencia: "Provérbios 16:9",
  },
  {
    texto: "Instruiremos e ensinaremos a ti o caminho que deves seguir; guiar-te-emos com os nossos olhos.",
    referencia: "Salmo 32:8",
  },
  {
    texto: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.",
    referencia: "Jeremias 29:11",
  },
];

const VersiculosSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Sabedoria Bíblica</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Versículos que{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              Inspiram
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A Palavra de Deus é a base para uma vida de propósito e sabedoria.
          </p>
        </div>

        {/* Verses Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {versiculos.map((versiculo, index) => (
            <div
              key={index}
              className="group relative animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <blockquote className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 h-full hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                <div className="absolute top-4 left-4 text-6xl text-primary/10 font-serif">"</div>
                <p className="text-foreground italic leading-relaxed mb-6 relative z-10 pt-4">
                  {versiculo.texto}
                </p>
                <footer className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-emerald-500 rounded-full" />
                  <span className="text-primary font-semibold text-sm">{versiculo.referencia}</span>
                </footer>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VersiculosSection;
