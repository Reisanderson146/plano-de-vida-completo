import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Lightbulb, 
  Compass, 
  Route, 
  Target, 
  Brain,
  Sparkles,
  ChevronRight,
  Quote,
  Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HowToCreatePlanDialogProps {
  trigger?: React.ReactNode;
}

export function HowToCreatePlanDialog({ trigger }: HowToCreatePlanDialogProps) {
  const [open, setOpen] = useState(false);

  const sections = [
    {
      icon: Lightbulb,
      title: "Visão de Futuro",
      subtitle: "Quem você quer ser?",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-500/10 to-orange-500/10",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
      content: [
        "Feche os olhos por um momento e imagine sua vida daqui a 10 anos.",
        "Quem você quer ter se tornado como pessoa?",
        "Como está sua saúde? Sua família? Sua carreira?",
        "Como você se sente ao acordar todos os dias?",
      ],
      highlight: "O primeiro passo não é fazer. É imaginar. Visualize antes de agir.",
      questions: [
        "Que tipo de pessoa você admira e gostaria de se tornar?",
        "O que você quer que as pessoas falem sobre você?",
        "Qual legado você quer deixar?",
      ],
    },
    {
      icon: Compass,
      title: "Direção",
      subtitle: "Onde você quer chegar?",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
      content: [
        "Sonhar é importante, mas não basta.",
        "É preciso transformar o sonho em destino.",
        "Um destino claro te dá foco. Foco te dá força.",
      ],
      highlight: "Não é sobre ter todas as respostas. É sobre saber para onde está caminhando.",
      questions: [
        "Qual é o seu objetivo mais importante para os próximos 10 anos?",
        "O que precisa estar diferente na sua vida?",
        "O que você não aceita mais continuar igual?",
      ],
    },
    {
      icon: Route,
      title: "Caminho",
      subtitle: "Como você vai chegar lá?",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-500/10 to-teal-500/10",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
      content: [
        "Um plano de vida se constrói de trás para frente.",
        "Comece pelo destino final e volte até hoje.",
        "Divida a jornada em etapas menores e alcançáveis.",
      ],
      highlight: "Se você sabe onde quer estar em 10 anos, consegue descobrir o que precisa fazer em 1 ano.",
      questions: [
        "Se o objetivo está em 10 anos, onde você precisa estar em 5?",
        "E em 3 anos? E em 1 ano?",
        "Qual é o primeiro passo que você pode dar ainda este mês?",
      ],
    },
    {
      icon: Target,
      title: "Metas",
      subtitle: "O que precisa ser feito?",
      gradient: "from-rose-500 to-pink-500",
      bgGradient: "from-rose-500/10 to-pink-500/10",
      iconBg: "bg-gradient-to-br from-rose-500 to-pink-500",
      content: [
        "Metas são ações concretas que tornam o plano possível.",
        "Elas transformam sonhos em compromissos.",
        "Metas claras eliminam a confusão e criam movimento.",
      ],
      highlight: "Uma meta bem definida já é meio caminho andado.",
      questions: [
        "O que você precisa fazer?",
        "O que precisa aprender?",
        "O que precisa mudar ou parar de fazer?",
      ],
    },
    {
      icon: Brain,
      title: "Mentalidade",
      subtitle: "Como pensar durante a jornada",
      gradient: "from-purple-500 to-violet-500",
      bgGradient: "from-purple-500/10 to-violet-500/10",
      iconBg: "bg-gradient-to-br from-purple-500 to-violet-500",
      content: [],
      highlight: null,
      principles: [
        {
          title: "Flexibilidade",
          text: "Um plano de vida não é engessado. Ele pode — e deve — ser ajustado conforme você evolui.",
          icon: "🔄",
        },
        {
          title: "Clareza primeiro",
          text: "Clareza vem antes da velocidade. É melhor ir devagar na direção certa do que correr sem rumo.",
          icon: "🎯",
        },
        {
          title: "Constância",
          text: "Constância é mais importante que perfeição. Faça um pouco todos os dias.",
          icon: "📈",
        },
        {
          title: "Pequenos passos",
          text: "Pequenos passos bem feitos constroem grandes resultados. Confie no processo.",
          icon: "👣",
        },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Como criar meu plano?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 overflow-hidden border-0 shadow-2xl">
        {/* Header with animated gradient */}
        <DialogHeader className="relative p-6 pb-5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rounded-2xl blur-lg opacity-50 animate-pulse" />
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Como criar seu Plano de Vida
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1.5">
                Um guia para pensar, planejar e agir com clareza
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="p-6 pt-4 space-y-6">
            {/* Intro Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 backdrop-blur-sm"
            >
              <div className="absolute top-3 right-3 text-4xl opacity-20">💭</div>
              <p className="text-muted-foreground leading-relaxed text-center">
                Criar um plano de vida não é complicado.
                <br />
                <span className="font-medium text-foreground">É sobre fazer as perguntas certas e dar passos na direção certa.</span>
              </p>
            </motion.div>

            {/* Sections */}
            <AnimatePresence>
              {sections.map((section, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  {/* Section Card */}
                  <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${section.bgGradient} border border-border/30 overflow-hidden`}>
                    {/* Decorative element */}
                    <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${section.gradient} opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
                    
                    {/* Section Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <div className={`absolute inset-0 ${section.iconBg} rounded-xl blur-md opacity-40`} />
                        <div className={`relative p-2.5 rounded-xl ${section.iconBg} shadow-lg`}>
                          <section.icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{section.title}</h3>
                        <p className="text-sm text-muted-foreground">{section.subtitle}</p>
                      </div>
                      <div className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-background/80 text-xs font-bold text-muted-foreground">
                        {index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    {section.content.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {section.content.map((text, i) => (
                          <p key={i} className="text-muted-foreground leading-relaxed text-sm pl-1">
                            {text}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Highlight Quote */}
                    {section.highlight && (
                      <div className={`relative p-4 rounded-xl bg-background/60 backdrop-blur-sm border-l-4 border-gradient-to-b ${section.gradient.replace('from-', 'border-').split(' ')[0]} mb-4`}>
                        <Quote className={`absolute top-2 right-2 h-8 w-8 opacity-10`} />
                        <p className="font-medium text-foreground italic pr-8 text-sm leading-relaxed">
                          "{section.highlight}"
                        </p>
                      </div>
                    )}

                    {/* Questions */}
                    {section.questions && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Pergunte a si mesmo
                        </p>
                        <div className="space-y-2">
                          {section.questions.map((q, i) => (
                            <div 
                              key={i} 
                              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-background/40 hover:bg-background/60 transition-colors"
                            >
                              <div className={`flex-shrink-0 w-5 h-5 rounded-full ${section.iconBg} flex items-center justify-center`}>
                                <ChevronRight className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-sm text-muted-foreground leading-relaxed">{q}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Principles (for Mentalidade section) */}
                    {section.principles && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {section.principles.map((p, i) => (
                          <div 
                            key={i} 
                            className="p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-border/30 hover:border-border/50 transition-all hover:shadow-md group"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{p.icon}</span>
                              <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                                {p.title}
                              </h4>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {p.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Connector Line */}
                  {index < sections.length - 1 && (
                    <div className="flex justify-center py-2">
                      <div className={`w-0.5 h-6 bg-gradient-to-b ${section.gradient} opacity-30 rounded-full`} />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* CTA Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative overflow-hidden"
            >
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border border-primary/20">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-2xl" />
                
                <div className="relative text-center space-y-4">
                  <div className="inline-flex p-3 rounded-full bg-primary/10 mb-2">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-xl">Pronto para começar?</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
                    Você não precisa ter todas as respostas agora.
                    <br />
                    <span className="font-medium text-foreground">O importante é dar o primeiro passo.</span>
                  </p>
                  <Button 
                    onClick={() => setOpen(false)} 
                    size="lg"
                    className="mt-3 px-8 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Começar meu plano
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
