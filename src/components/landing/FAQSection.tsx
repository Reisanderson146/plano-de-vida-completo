import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Como funciona o período de teste?",
    answer: "Não oferecemos período de teste gratuito, mas nosso plano Basic custa apenas R$ 9,99/mês, permitindo que você experimente a plataforma com baixo investimento. Se não gostar, pode cancelar a qualquer momento."
  },
  {
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim! Você pode cancelar sua assinatura quando quiser, sem multas ou taxas adicionais. O acesso continua até o final do período já pago."
  },
  {
    question: "Qual a diferença entre o plano Basic e Premium?",
    answer: "O plano Basic inclui 1 plano individual para você organizar suas metas pessoais. O Premium inclui 4 planos (1 familiar + 3 para filhos), resumo inteligente com IA e lembretes por email."
  },
  {
    question: "Meus dados ficam seguros?",
    answer: "Absolutamente! Todos os seus dados são criptografados e armazenados de forma segura na nuvem. Apenas você tem acesso às suas informações pessoais e planos."
  },
  {
    question: "Posso acessar de qualquer dispositivo?",
    answer: "Sim! O Plano de Vida funciona em qualquer navegador, seja no computador, tablet ou celular. Seus dados sincronizam automaticamente entre dispositivos."
  },
  {
    question: "Como funciona o resumo com IA?",
    answer: "Disponível no plano Premium, a IA analisa seu progresso e oferece insights personalizados sobre suas metas, identificando padrões e sugerindo melhorias para cada área da vida."
  },
  {
    question: "Posso fazer upgrade do meu plano depois?",
    answer: "Claro! Você pode fazer upgrade do Basic para o Premium a qualquer momento. O valor será ajustado proporcionalmente ao período restante da sua assinatura atual."
  },
  {
    question: "Como funciona o plano familiar?",
    answer: "No plano Premium, você pode criar um plano compartilhado com seu cônjuge/parceiro(a) e até 3 planos individuais para seus filhos, permitindo acompanhar o desenvolvimento de toda a família."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            <span>Dúvidas frequentes</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Perguntas{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              Frequentes
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Tire suas dúvidas sobre nossos planos e funcionalidades
          </p>
        </motion.div>

        {/* FAQ Items */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <button
                onClick={() => toggleItem(index)}
                className={cn(
                  "w-full text-left p-4 md:p-5 rounded-xl border transition-all duration-200",
                  "bg-card hover:bg-card/80",
                  openIndex === index 
                    ? "border-primary/30 shadow-md shadow-primary/5" 
                    : "border-border/50 hover:border-border"
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className={cn(
                    "font-medium transition-colors",
                    openIndex === index ? "text-primary" : "text-foreground"
                  )}>
                    {item.question}
                  </span>
                  <ChevronDown 
                    className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0",
                      openIndex === index && "rotate-180 text-primary"
                    )}
                  />
                </div>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pt-4 text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-muted-foreground">
            Ainda tem dúvidas?{" "}
            <a 
              href="https://www.instagram.com/planode.vida" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Fale conosco no Instagram
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;