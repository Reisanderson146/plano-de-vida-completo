import { Instagram, Mail, Shield, FileText, HelpCircle, BookOpen, Target, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const FooterSection = () => {
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { label: "Meu Plano", href: "/consulta", icon: Target },
    { label: "Guia de Uso", href: "/guia", icon: BookOpen },
  ];

  const supportLinks = [
    { label: "FAQ", href: "#faq", isAnchor: true },
    { label: "Contato", href: "mailto:contato@planodevida.app", isExternal: true },
  ];

  const legalLinks = [
    { label: "Termos de Uso", href: "/termos" },
    { label: "Privacidade", href: "/privacidade" },
  ];

  return (
    <footer className="py-12 md:py-16 px-4 bg-muted/50 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent mb-2">
              Plano de Vida
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Constância que constrói resultados
            </p>
            
            {/* Instagram */}
            <a
              href="https://www.instagram.com/planode.vida"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 group transition-all hover:scale-105"
            >
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px] shadow-md group-hover:shadow-lg transition-shadow">
                <div className="w-full h-full rounded-[10px] bg-card flex items-center justify-center">
                  <Instagram className="w-4 h-4 text-foreground" />
                </div>
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                @planode.vida
              </span>
            </a>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              Produto
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              Suporte
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  {link.isAnchor ? (
                    <a 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      {link.label}
                    </a>
                  ) : link.isExternal ? (
                    <a 
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {link.label}
                    </a>
                  ) : (
                    <Link 
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              Legal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    {link.label === "Termos de Uso" ? (
                      <FileText className="w-3.5 h-3.5" />
                    ) : (
                      <Shield className="w-3.5 h-3.5" />
                    )}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} Plano de Vida. Todos os direitos reservados.
            </p>
            <p className="text-sm text-muted-foreground">
              Versão 1.0 • Desenvolvido por{" "}
              <span className="font-medium text-foreground">Anderson Reis</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
