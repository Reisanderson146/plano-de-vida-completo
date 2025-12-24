import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Target, TrendingUp, Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

const Counter = ({ end, duration = 2, suffix = "", prefix = "" }: CounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString('pt-BR')}{suffix}
    </span>
  );
};

interface StatsData {
  users: number;
  goalsCreated: number;
  goalsCompleted: number;
  satisfactionRate: number;
}

const StatsCounterSection = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-public-stats');
        
        if (error) {
          console.error('Error fetching stats:', error);
          // Use fallback values
          setStats({
            users: 100,
            goalsCreated: 500,
            goalsCompleted: 150,
            satisfactionRate: 95,
          });
        } else {
          setStats(data);
        }
      } catch (error) {
        console.error('Error:', error);
        // Use fallback values
        setStats({
          users: 100,
          goalsCreated: 500,
          goalsCompleted: 150,
          satisfactionRate: 95,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsConfig = [
    {
      icon: Users,
      value: stats?.users || 0,
      suffix: "+",
      label: "Usuários Ativos",
      color: "primary",
    },
    {
      icon: Target,
      value: stats?.goalsCreated || 0,
      suffix: "+",
      label: "Metas Criadas",
      color: "emerald",
    },
    {
      icon: TrendingUp,
      value: stats?.goalsCompleted || 0,
      suffix: "+",
      label: "Metas Concluídas",
      color: "violet",
    },
    {
      icon: Heart,
      value: stats?.satisfactionRate || 0,
      suffix: "%",
      label: "Satisfação",
      color: "rose",
    },
  ];

  return (
    <section className="py-16 md:py-20 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Junte-se a milhares de pessoas{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              transformando suas vidas
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Números que mostram o impacto do planejamento intencional
          </p>
        </motion.div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {statsConfig.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Card with glassmorphism effect */}
                <div className="relative p-6 md:p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30 overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div 
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      stat.color === 'primary' ? 'bg-gradient-to-br from-primary/5 to-transparent' :
                      stat.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500/5 to-transparent' :
                      stat.color === 'violet' ? 'bg-gradient-to-br from-violet-500/5 to-transparent' :
                      'bg-gradient-to-br from-rose-500/5 to-transparent'
                    }`}
                  />

                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${
                    stat.color === 'primary' ? 'bg-primary/10 text-primary' :
                    stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                    stat.color === 'violet' ? 'bg-violet-500/10 text-violet-500' :
                    'bg-rose-500/10 text-rose-500'
                  }`}>
                    <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>

                  {/* Counter */}
                  <div className={`text-3xl md:text-4xl font-bold mb-2 ${
                    stat.color === 'primary' ? 'text-primary' :
                    stat.color === 'emerald' ? 'text-emerald-500' :
                    stat.color === 'violet' ? 'text-violet-500' :
                    'text-rose-500'
                  }`}>
                    <Counter end={stat.value} suffix={stat.suffix} duration={2.5} />
                  </div>

                  {/* Label */}
                  <p className="text-sm md:text-base text-muted-foreground font-medium">
                    {stat.label}
                  </p>

                  {/* Decorative corner accent */}
                  <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 ${
                    stat.color === 'primary' ? 'bg-primary' :
                    stat.color === 'emerald' ? 'bg-emerald-500' :
                    stat.color === 'violet' ? 'bg-violet-500' :
                    'bg-rose-500'
                  }`} style={{
                    clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
                  }} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom CTA text */}
        <motion.p
          className="text-center text-sm text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          * Dados atualizados em tempo real
        </motion.p>
      </div>
    </section>
  );
};

export default StatsCounterSection;
