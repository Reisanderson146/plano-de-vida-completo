import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AIStyle = 'friendly' | 'balanced' | 'direct';

const getSystemPrompt = (style: AIStyle): string => {
  const baseRules = `REGRAS IMPORTANTES:
- NÃO use asteriscos (*), marcadores ou formatação markdown
- NÃO use emojis ou ícones
- Escreva em parágrafos fluidos e naturais
- Use português brasileiro formal mas acessível`;

  switch (style) {
    case 'friendly':
      return `Você é um coach de vida amigável e motivador.
Seja encorajador e celebre as conquistas. Ao apontar áreas de melhoria, seja gentil e ofereça apoio.
Use um tom caloroso e pessoal, como um amigo que torce pelo sucesso da pessoa.
Máximo 3 parágrafos curtos.
${baseRules}`;
    
    case 'balanced':
      return `Você é um mentor equilibrado e construtivo.
Reconheça conquistas de forma sincera e aponte melhorias de forma construtiva e ponderada.
Seja objetivo mas empático, oferecendo uma visão clara do progresso.
Máximo 2-3 parágrafos curtos.
${baseRules}`;
    
    case 'direct':
      return `Você é um consultor direto e prático.
Vá direto ao ponto sem rodeios. Fale o que está bom e o que precisa melhorar de forma objetiva.
Sem elogios excessivos ou linguagem muito motivacional. Apenas fatos e próximos passos.
Máximo 2 parágrafos curtos.
${baseRules}`;
    
    default:
      return `Você é um assistente direto. Máximo 2 parágrafos curtos.
${baseRules}`;
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
  areasNeedWork: any[]
): string => {
  const baseData = `Plano: "${planTitle}" (${period})
Progresso geral: ${completedGoals} de ${totalGoals} metas concluídas (${overallPercentage}%)
Áreas com bom desempenho (acima de 70%): ${areasCompleted.length > 0 ? areasCompleted.map((a: any) => a.label).join(', ') : 'Nenhuma ainda'}
Áreas que precisam de atenção (abaixo de 40%): ${areasNeedWork.length > 0 ? areasNeedWork.map((a: any) => a.label).join(', ') : 'Nenhuma'}`;

  switch (style) {
    case 'friendly':
      return `${baseData}

Por favor, faça uma análise motivadora e encorajadora deste progresso.
Celebre as conquistas e ofereça apoio gentil para as áreas que precisam de atenção.
Lembre-se: texto limpo, sem formatação especial, emojis ou marcadores.`;
    
    case 'balanced':
      return `${baseData}

Faça uma análise equilibrada deste progresso:
Reconheça o que está funcionando, aponte o que pode melhorar e sugira um próximo passo.
Lembre-se: texto limpo, sem formatação especial, emojis ou marcadores.`;
    
    case 'direct':
      return `${baseData}

Faça uma análise direta e objetiva: o que está funcionando e o que precisa melhorar.
Seja prático e vá direto ao ponto.
Lembre-se: texto limpo, sem formatação especial, emojis ou marcadores.`;
    
    default:
      return baseData;
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stats, totalGoals, completedGoals, planTitle, period, style = 'balanced' } = await req.json();
    
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
      areasNeedWork
    );

    console.log("Generating summary with style:", style);

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
    let summary = data.choices?.[0]?.message?.content || "Não foi possível gerar o resumo.";
    
    // Clean up any remaining markdown or formatting
    summary = summary
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/^[-•]\s*/gm, '')
      .replace(/^\d+\.\s*/gm, '')
      .trim();

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
