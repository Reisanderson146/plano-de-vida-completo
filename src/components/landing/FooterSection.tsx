import { Instagram } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="py-12 px-4 bg-muted/50 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center">
          {/* Logo/Title */}
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent mb-2">
            Plano de Vida
          </h3>
          
          {/* Slogan */}
          <p className="text-muted-foreground mb-4">
            Constância que constrói resultados
          </p>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/planode.vida"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 mb-6 group transition-all hover:scale-105"
          >
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px] shadow-lg group-hover:shadow-xl transition-shadow">
              <div className="w-full h-full rounded-[10px] bg-card flex items-center justify-center">
                <Instagram className="w-4 h-4 text-foreground" />
              </div>
            </div>
            <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">@planode.vida</span>
          </a>

          {/* Divider */}
          <div className="w-24 h-0.5 bg-gradient-to-r from-primary/50 to-emerald-500/50 rounded-full mb-6" />

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Plano de Vida. Desenvolvido por Anderson Reis.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
