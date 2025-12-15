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
    const { content, pdfBase64, fileName, fileType, isPDF } = await req.json();
    
    if (!content && !pdfBase64) {
      return new Response(
        JSON.stringify({ success: false, error: "Nenhum conteúdo fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "API key não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentYear = new Date().getFullYear();
    
    const systemPrompt = `Você é um assistente especializado em extrair dados de planos de vida de arquivos.
    
O usuário vai enviar o conteúdo de um arquivo (pode ser Excel, PDF, TXT, CSV, etc.) que contém um plano de vida.

O ANO ATUAL É ${currentYear}. REGRA IMPORTANTE: Se o documento NÃO especificar anos para as metas, comece a partir de ${currentYear} e incremente para períodos subsequentes.

Seu trabalho é identificar e extrair as metas/objetivos organizados por:
- Ano ou período (SE NÃO ESPECIFICADO, USE ${currentYear} COMO ANO INICIAL)
- Idade (se disponível)
- Área da vida (as 7 áreas são: espiritual, intelectual, familiar, social, financeiro, profissional, saude)

IMPORTANTE:
- Identifique o formato do arquivo e extraia os dados da melhor forma possível
- Mapeie os nomes das áreas para os IDs corretos: espiritual, intelectual, familiar, social, financeiro, profissional, saude
- Se a área não for reconhecida, tente inferir baseado no contexto
- Se não encontrar ano explícito no documento, use ${currentYear} como ano inicial
- Se houver múltiplos períodos sem ano definido, incremente a partir de ${currentYear} (ex: ${currentYear}, ${currentYear + 1}, ${currentYear + 2}, etc.)
- Se não encontrar idade, deixe como null

Responda APENAS com um JSON válido no seguinte formato:
{
  "success": true,
  "goals": [
    {
      "year": ${currentYear},
      "age": 30,
      "area": "espiritual",
      "goalText": "Texto da meta"
    }
  ],
  "warnings": ["avisos opcionais sobre dados que não puderam ser extraídos"]
}

Se não conseguir extrair nenhuma meta, responda:
{
  "success": false,
  "goals": [],
  "errors": ["Descrição do problema encontrado"],
  "warnings": []
}`;
    let messages: any[];

    if (isPDF && pdfBase64) {
      // For PDF files, use vision capabilities with the PDF as base64
      console.log("Processing PDF file with vision:", fileName);
      messages = [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: [
            {
              type: "text",
              text: `Este é um PDF de um plano de vida. Analise a imagem/documento e extraia todas as metas/objetivos encontrados. Arquivo: ${fileName}`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:application/pdf;base64,${pdfBase64}`
              }
            }
          ]
        },
      ];
    } else {
      // For text-based files
      const userPrompt = `Arquivo: ${fileName} (tipo: ${fileType})

Conteúdo do arquivo:
${content}

Extraia todas as metas/objetivos do plano de vida deste arquivo.`;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ];
    }

    console.log("Sending request to Lovable AI for file parsing:", fileName);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: isPDF ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash",
        messages,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: "Erro ao processar arquivo com IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices?.[0]?.message?.content;

    if (!aiContent) {
      return new Response(
        JSON.stringify({ success: false, error: "Resposta vazia da IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI response received:", aiContent.substring(0, 200));

    // Extract JSON from the response (handle markdown code blocks)
    let jsonContent = aiContent;
    const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    try {
      const parsedResult = JSON.parse(jsonContent);
      return new Response(
        JSON.stringify(parsedResult),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", jsonContent);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Erro ao interpretar resposta da IA",
          goals: [],
          warnings: []
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in parse-plan-import:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Erro desconhecido" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
