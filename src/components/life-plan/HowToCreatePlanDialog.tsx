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
  Quote
} from "lucide-react";

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
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
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
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
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
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
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
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
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
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      content: [],
      highlight: null,
      principles: [
        {
          title: "Flexibilidade",
          text: "Um plano de vida não é engessado. Ele pode — e deve — ser ajustado conforme você evolui.",
        },
        {
          title: "Clareza primeiro",
          text: "Clareza vem antes da velocidade. É melhor ir devagar na direção certa do que correr sem rumo.",
        },
        {
          title: "Constância",
          text: "Constância é mais importante que perfeição. Faça um pouco todos os dias.",
        },
        {
          title: "Pequenos passos",
          text: "Pequenos passos bem feitos constroem grandes resultados. Confie no processo.",
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
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Como criar seu Plano de Vida
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Um guia para pensar, planejar e agir com clareza
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-8">
            {/* Intro */}
            <div className="text-center space-y-3 pb-4">
              <p className="text-muted-foreground leading-relaxed">
                Criar um plano de vida não é complicado.
                <br />
                É sobre fazer as perguntas certas e dar passos na direção certa.
              </p>
            </div>

            {/* Sections */}
            {sections.map((section, index) => (
              <div key={index} className="space-y-4">
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${section.bgColor}`}>
                    <section.icon className={`h-5 w-5 ${section.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.subtitle}</p>
                  </div>
                </div>

                {/* Content */}
                {section.content.length > 0 && (
                  <div className="pl-12 space-y-2">
                    {section.content.map((text, i) => (
                      <p key={i} className="text-muted-foreground leading-relaxed">
                        {text}
                      </p>
                    ))}
                  </div>
                )}

                {/* Highlight */}
                {section.highlight && (
                  <div className="pl-12">
                    <div className={`p-4 rounded-xl ${section.bgColor} border-l-4`} style={{ borderColor: `var(--${section.color.replace('text-', '')})` }}>
                      <div className="flex gap-2">
                        <Quote className={`h-4 w-4 ${section.color} flex-shrink-0 mt-0.5`} />
                        <p className="font-medium text-foreground italic">
                          {section.highlight}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Questions */}
                {section.questions && (
                  <div className="pl-12 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Pergunte a si mesmo:
                    </p>
                    <ul className="space-y-1.5">
                      {section.questions.map((q, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                          <ChevronRight className={`h-4 w-4 ${section.color} flex-shrink-0 mt-0.5`} />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Principles (for Mentalidade section) */}
                {section.principles && (
                  <div className="pl-12 grid gap-3">
                    {section.principles.map((p, i) => (
                      <div key={i} className={`p-4 rounded-xl ${section.bgColor}`}>
                        <h4 className={`font-semibold ${section.color} mb-1`}>
                          {p.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {p.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {index < sections.length - 1 && (
                  <div className="border-b pt-4" />
                )}
              </div>
            ))}

            {/* CTA */}
            <div className="pt-4 pb-2">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-center space-y-3">
                <h4 className="font-semibold text-lg">Pronto para começar?</h4>
                <p className="text-muted-foreground">
                  Você não precisa ter todas as respostas agora.
                  <br />
                  O importante é dar o primeiro passo.
                </p>
                <Button onClick={() => setOpen(false)} className="mt-2">
                  Começar meu plano
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
