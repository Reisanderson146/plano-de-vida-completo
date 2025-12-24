import { Instagram } from 'lucide-react';

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
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <Instagram className="w-5 h-5" />
            <span>@planode.vida</span>
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
