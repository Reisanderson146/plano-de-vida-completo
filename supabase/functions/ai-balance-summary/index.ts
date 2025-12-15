import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stats, totalGoals, completedGoals, planTitle, period } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context about goals
    const areasCompleted = stats.filter((s: any) => s.percentage >= 70 && s.total > 0);
    const areasNeedWork = stats.filter((s: any) => s.percentage < 40 && s.total > 0);
    const areasModerate = stats.filter((s: any) => s.percentage >= 40 && s.percentage < 70 && s.total > 0);

    const overallPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    const prompt = `Você é um coach de vida profissional e motivador. Analise os dados do plano de vida "${planTitle}" para o período ${period} e forneça um resumo personalizado e encorajador.

DADOS DO PLANO:
- Total de metas: ${totalGoals}
- Metas concluídas: ${completedGoals}
- Progresso geral: ${overallPercentage}%

ÁREAS COM BOM DESEMPENHO (70%+ concluído):
${areasCompleted.length > 0 ? areasCompleted.map((a: any) => `- ${a.label}: ${a.completed}/${a.total} metas (${a.percentage}%)`).join('\n') : '- Nenhuma área atingiu 70% ainda'}

ÁREAS EM PROGRESSO (40-69% concluído):
${areasModerate.length > 0 ? areasModerate.map((a: any) => `- ${a.label}: ${a.completed}/${a.total} metas (${a.percentage}%)`).join('\n') : '- Nenhuma área nesta faixa'}

ÁREAS QUE PRECISAM DE ATENÇÃO (menos de 40%):
${areasNeedWork.length > 0 ? areasNeedWork.map((a: any) => `- ${a.label}: ${a.completed}/${a.total} metas (${a.percentage}%)`).join('\n') : '- Todas as áreas estão acima de 40%! 🎉'}

Por favor, forneça:
1. Um parágrafo de reconhecimento das conquistas (seja específico sobre as áreas)
2. Um parágrafo sobre as áreas que precisam de mais atenção (com sugestões práticas)
3. Uma frase motivacional de encerramento

Seja conciso, positivo e prático. Use emojis moderadamente para tornar mais acolhedor. Responda em português brasileiro.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um coach de vida experiente, empático e motivador. Sempre responda em português brasileiro." },
          { role: "user", content: prompt }
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

    return new Response(JSON.stringify({ summary }), {
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
