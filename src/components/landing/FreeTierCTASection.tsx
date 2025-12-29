import { motion } from "framer-motion";
import { Gift, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FreeTierCTASectionProps {
  onCtaClick: () => void;
}

const FreeTierCTASection = ({ onCtaClick }: FreeTierCTASectionProps) => {
  return (
    <section className="py-12 md:py-16 px-4 relative overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div 
          className="relative rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-emerald-500/30" />
          <div className="absolute inset-0 bg-card/60 backdrop-blur-sm" />
          
          <div className="relative p-8 md:p-12 text-center">
            {/* Icon */}
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 mb-6 shadow-lg shadow-primary/30"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Gift className="w-8 h-8 text-primary-foreground" />
            </motion.div>

            {/* Title */}
            <motion.h3
              className="text-2xl md:text-3xl font-bold text-foreground mb-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Comece grátis,{" "}
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                sem compromisso.
              </span>
            </motion.h3>

            {/* Description */}
            <motion.p
              className="text-muted-foreground mb-6 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Use o Plano de Vida gratuitamente por 7 dias. 
              Cancele quando quiser, sem burocracia.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <Button
                onClick={onCtaClick}
                size="lg"
                className="group px-8 py-6 text-base font-semibold bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Começar meu teste grátis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FreeTierCTASection;
