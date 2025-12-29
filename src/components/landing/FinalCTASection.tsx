import { motion } from "framer-motion";
import { Gift, ArrowRight, Sparkles, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FinalCTASectionProps {
  onCtaClick: () => void;
  onLogin: () => void;
}

const FinalCTASection = ({ onCtaClick, onLogin }: FinalCTASectionProps) => {
  return (
    <section className="py-16 md:py-20 px-4 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-emerald-500/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <motion.div 
        className="max-w-2xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center">
          {/* Icon */}
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 mb-6 border border-primary/20"
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Gift className="w-10 h-10 text-primary" />
          </motion.div>

          {/* Title */}
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Comece grátis,{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              sem compromisso.
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            className="text-muted-foreground mb-8 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Use o Plano de Vida gratuitamente por 7 dias. 
            Cancele quando quiser, sem burocracia.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            {/* Primary CTA */}
            <Button
              onClick={onCtaClick}
              size="lg"
              className="group px-8 py-6 text-base font-semibold bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Começar meu teste grátis
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            {/* Secondary - Already subscriber */}
            <Button
              variant="ghost"
              onClick={onLogin}
              className="text-muted-foreground hover:text-foreground hover:bg-transparent transition-colors"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Já sou assinante - Entrar
            </Button>
          </motion.div>

          {/* Trust text */}
          <motion.p
            className="text-xs text-muted-foreground mt-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            Cancele a qualquer momento durante o teste
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
};

export default FinalCTASection;
