import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AIStyle = 'friendly' | 'balanced' | 'direct';

const getSystemPrompt = (style: AIStyle): string => {
  switch (style) {
    case 'friendly':
      return `Você é um coach de vida amigável e motivador. Use emojis com moderação (1-2 por parágrafo). 
Seja encorajador e celebre as conquistas. Ao apontar áreas de melhoria, seja gentil e ofereça apoio.
Use frases como "Você está indo muito bem!", "Continue assim!", "Que progresso incrível!".
Máximo 4-5 frases. Português brasileiro.`;
    
    case 'balanced':
      return `Você é um mentor equilibrado e construtivo. Reconheça conquistas de forma sincera.
Aponte melhorias de forma construtiva e ponderada. Seja objetivo mas empático.
Ofereça uma visão clara do progresso sem ser nem muito formal nem muito informal.
Máximo 4 frases. Português brasileiro.`;
    
    case 'direct':
      return `Você é um consultor direto e prático. Vá direto ao ponto sem rodeios.
Liste o que está bom e o que precisa melhorar de forma objetiva.
Sem elogios excessivos ou linguagem motivacional. Apenas fatos e próximos passos.
Máximo 3 frases curtas. Português brasileiro.`;
    
    default:
      return `Você é um assistente direto. Máximo 3 frases curtas. Sem introduções ou despedidas. Apenas o essencial.`;
  }
};

const getUserPrompt = (
  style: AIStyle, 
  planTitle: string, 
  period: string, 
  completedGoals: number, 
  totalGoals: number, 
  overallPercentage: number, 
  areasCompleted: any[], 
  areasNeedWork: any[],
  monthlyComparison?: { currentMonth: { completed: number }; previousMonth: { completed: number }; difference: number; trend: 'up' | 'down' | 'same' }
): string => {
  let comparisonText = '';
  if (monthlyComparison) {
    const trendText = monthlyComparison.trend === 'up' 
      ? `+${monthlyComparison.difference} metas em relação ao mês anterior (melhora!)`
      : monthlyComparison.trend === 'down'
      ? `-${monthlyComparison.difference} metas em relação ao mês anterior (queda)`
      : 'mesmo desempenho do mês anterior';
    
    comparisonText = `\nComparativo mensal: Este mês ${monthlyComparison.currentMonth.completed} metas, mês passado ${monthlyComparison.previousMonth.completed} metas (${trendText})`;
  }

  const baseData = `Plano: "${planTitle}" (${period})
Progresso: ${completedGoals}/${totalGoals} metas (${overallPercentage}%)
Áreas BOM (70%+): ${areasCompleted.length > 0 ? areasCompleted.map((a: any) => a.label).join(', ') : 'Nenhuma'}
Áreas ATENÇÃO (<40%): ${areasNeedWork.length > 0 ? areasNeedWork.map((a: any) => a.label).join(', ') : 'Nenhuma'}${comparisonText}`;

  switch (style) {
    case 'friendly':
      return `${baseData}

Faça uma análise motivadora e encorajadora deste progresso. 
Celebre as conquistas e ofereça apoio gentil para as áreas que precisam de atenção.
${monthlyComparison ? 'Comente sobre a evolução em relação ao mês anterior de forma positiva.' : ''}`;
    
    case 'balanced':
      return `${baseData}

Faça uma análise equilibrada:
1. Reconheça o progresso de forma sincera
2. Aponte áreas de melhoria de forma construtiva
3. Sugira brevemente um próximo passo
${monthlyComparison ? '4. Comente brevemente sobre a comparação com o mês anterior' : ''}`;
    
    case 'direct':
      return `${baseData}

Análise direta:
1. O que está funcionando
2. O que precisa melhorar
${monthlyComparison ? '3. Evolução mensal (objetivo)' : ''}
Seja objetivo e prático.`;
    
    default:
      return baseData;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stats, totalGoals, completedGoals, planTitle, period, style = 'balanced', monthlyComparison } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context about goals
    const areasCompleted = stats.filter((s: any) => s.percentage >= 70 && s.total > 0);
    const areasNeedWork = stats.filter((s: any) => s.percentage < 40 && s.total > 0);

    const overallPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    const systemPrompt = getSystemPrompt(style as AIStyle);
    const userPrompt = getUserPrompt(
      style as AIStyle, 
      planTitle, 
      period, 
      completedGoals, 
      totalGoals, 
      overallPercentage, 
      areasCompleted, 
      areasNeedWork,
      monthlyComparison
    );

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Entre em contato com o suporte." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao gerar resumo");
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "Não foi possível gerar o resumo.";

    return new Response(JSON.stringify({ summary, style }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-balance-summary:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
