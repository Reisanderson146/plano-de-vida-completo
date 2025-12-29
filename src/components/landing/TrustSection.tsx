import { motion } from "framer-motion";
import { Shield, Lock, Cloud, CheckCircle2 } from "lucide-react";

const trustItems = [
  { icon: Lock, text: "Dados criptografados" },
  { icon: Cloud, text: "Armazenamento seguro" },
  { icon: CheckCircle2, text: "Você controla suas informações" },
];

const TrustSection = () => {
  return (
    <section className="py-12 md:py-16 px-4 relative overflow-hidden bg-muted/30">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 border border-primary/20 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>

          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Seus dados estão{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              seguros
            </span>
          </h3>

          {/* Description */}
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Seus dados são criptografados e armazenados com segurança na nuvem. 
            Você controla suas informações. Sempre.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-4">
            {trustItems.map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <item.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSection;
