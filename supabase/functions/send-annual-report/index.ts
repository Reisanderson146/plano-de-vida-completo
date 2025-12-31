import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const AREAS_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  espiritual: { label: "Espiritual", color: "#8B5CF6", emoji: "🙏" },
  intelectual: { label: "Intelectual", color: "#3B82F6", emoji: "📚" },
  familiar: { label: "Familiar", color: "#EC4899", emoji: "👨‍👩‍👧‍👦" },
  social: { label: "Social", color: "#F97316", emoji: "🤝" },
  profissional: { label: "Profissional", color: "#EAB308", emoji: "💼" },
  financeiro: { label: "Financeiro", color: "#22C55E", emoji: "💰" },
  saude: { label: "Saúde", color: "#14B8A6", emoji: "❤️" },
};

interface GoalsByArea {
  [area: string]: {
    total: number;
    completed: number;
    goals: { text: string; completed: boolean }[];
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const previousYear = new Date().getFullYear() - 1;
    const currentYear = new Date().getFullYear();

    console.log(`Processing annual report for year ${previousYear}`);

    // Get all users with profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("is_blocked", false);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} users to process`);

    let successCount = 0;
    let errorCount = 0;

    for (const profile of profiles || []) {
      try {
        // Get user email from auth
        const { data: authData } = await supabase.auth.admin.getUserById(profile.id);
        const userEmail = authData?.user?.email;

        if (!userEmail) {
          console.log(`No email found for user ${profile.id}`);
          continue;
        }

        // Get goals for the previous year
        const { data: goals, error: goalsError } = await supabase
          .from("life_goals")
          .select("area, goal_text, is_completed")
          .eq("user_id", profile.id)
          .eq("period_year", previousYear);

        if (goalsError) {
          console.error(`Error fetching goals for user ${profile.id}:`, goalsError);
          continue;
        }

        // Skip users with no goals
        if (!goals || goals.length === 0) {
          console.log(`No goals found for user ${profile.id} in year ${previousYear}`);
          continue;
        }

        // Organize goals by area
        const goalsByArea: GoalsByArea = {};
        for (const goal of goals) {
          if (!goalsByArea[goal.area]) {
            goalsByArea[goal.area] = { total: 0, completed: 0, goals: [] };
          }
          goalsByArea[goal.area].total++;
          if (goal.is_completed) {
            goalsByArea[goal.area].completed++;
          }
          goalsByArea[goal.area].goals.push({
            text: goal.goal_text,
            completed: goal.is_completed,
          });
        }

        // Calculate overall stats
        const totalGoals = goals.length;
        const completedGoals = goals.filter((g) => g.is_completed).length;
        const completionRate = Math.round((completedGoals / totalGoals) * 100);

        // Generate email HTML
        const userName = profile.full_name || "Usuário";
        const areasHtml = Object.entries(goalsByArea)
          .map(([areaKey, areaData]) => {
            const areaConfig = AREAS_CONFIG[areaKey] || { label: areaKey, color: "#6B7280", emoji: "📌" };
            const areaCompletionRate = Math.round((areaData.completed / areaData.total) * 100);
            
            const goalsListHtml = areaData.goals
              .map((goal) => `
                <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
                  <span style="color: ${goal.completed ? '#22C55E' : '#EF4444'}; font-size: 16px;">
                    ${goal.completed ? '✓' : '○'}
                  </span>
                  <span style="color: ${goal.completed ? '#4B5563' : '#1F2937'}; ${goal.completed ? 'text-decoration: line-through;' : ''}">
                    ${goal.text}
                  </span>
                </li>
              `)
              .join("");

            return `
              <div style="background: #F9FAFB; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                  <span style="font-size: 24px;">${areaConfig.emoji}</span>
                  <div>
                    <h3 style="margin: 0; color: ${areaConfig.color}; font-size: 18px;">${areaConfig.label}</h3>
                    <p style="margin: 4px 0 0 0; color: #6B7280; font-size: 14px;">
                      ${areaData.completed} de ${areaData.total} metas concluídas (${areaCompletionRate}%)
                    </p>
                  </div>
                </div>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${goalsListHtml}
                </ul>
              </div>
            `;
          })
          .join("");

        const motivationalMessage = completionRate >= 80
          ? "Parabéns! Você teve um ano incrível de conquistas! 🎉"
          : completionRate >= 50
          ? "Bom trabalho! Você avançou bastante em suas metas! 💪"
          : completionRate >= 25
          ? "Cada passo conta! Continue focado em suas metas para o novo ano! 🌟"
          : "Um novo ano é uma nova oportunidade. Vamos juntos conquistar mais! 🚀";

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F3F4F6; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">📊 Seu Relatório Anual</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px;">
                  Plano de Vida ${previousYear}
                </p>
              </div>

              <!-- Content -->
              <div style="padding: 30px;">
                <p style="color: #374151; font-size: 16px; margin: 0 0 20px 0;">
                  Olá, <strong>${userName}</strong>! 👋
                </p>
                
                <p style="color: #6B7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                  O ano de ${previousYear} chegou ao fim! Aqui está um resumo completo do seu progresso nas metas que você definiu para sua vida.
                </p>

                <!-- Stats Card -->
                <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
                  <div style="font-size: 48px; font-weight: bold; color: #22C55E; margin-bottom: 8px;">
                    ${completionRate}%
                  </div>
                  <p style="color: #166534; margin: 0; font-size: 16px;">
                    Taxa de Conclusão Geral
                  </p>
                  <p style="color: #15803D; margin: 8px 0 0 0; font-size: 14px;">
                    ${completedGoals} de ${totalGoals} metas concluídas
                  </p>
                </div>

                <!-- Motivational Message -->
                <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                  <p style="color: #92400E; margin: 0; font-size: 15px;">
                    ${motivationalMessage}
                  </p>
                </div>

                <!-- Areas Breakdown -->
                <h2 style="color: #1F2937; font-size: 20px; margin: 0 0 16px 0;">
                  Suas Metas por Área
                </h2>
                
                ${areasHtml}

                <!-- New Year Message -->
                <div style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border-radius: 12px; padding: 24px; margin-top: 24px; text-align: center;">
                  <h3 style="color: #4338CA; margin: 0 0 12px 0; font-size: 18px;">
                    🎆 Bem-vindo a ${currentYear}!
                  </h3>
                  <p style="color: #6366F1; margin: 0; font-size: 14px; line-height: 1.6;">
                    Um novo ano significa novas oportunidades. Acesse o Plano de Vida para definir suas metas para ${currentYear} e continue sua jornada de crescimento!
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div style="background: #F9FAFB; padding: 24px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                  Este email foi enviado automaticamente pelo Plano de Vida.<br>
                  © ${currentYear} Plano de Vida. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Send email
        const emailResponse = await resend.emails.send({
          from: "Plano de Vida <contato@planodevida.io>",
          to: [userEmail],
          subject: `📊 Seu Relatório Anual ${previousYear} - Plano de Vida`,
          html: emailHtml,
        });

        // Log the email
        await supabase.from("email_logs").insert({
          user_id: profile.id,
          recipient_email: userEmail,
          recipient_name: userName,
          email_type: "annual_report",
          subject: `Seu Relatório Anual ${previousYear} - Plano de Vida`,
          status: emailResponse.error ? "error" : "sent",
          resend_id: emailResponse.data?.id || null,
          error_message: emailResponse.error?.message || null,
          metadata: {
            year: previousYear,
            total_goals: totalGoals,
            completed_goals: completedGoals,
            completion_rate: completionRate,
          },
        });

        if (emailResponse.error) {
          console.error(`Error sending email to ${userEmail}:`, emailResponse.error);
          errorCount++;
        } else {
          console.log(`Email sent successfully to ${userEmail}`);
          successCount++;
        }
      } catch (userError) {
        console.error(`Error processing user ${profile.id}:`, userError);
        errorCount++;
      }
    }

    console.log(`Annual report complete: ${successCount} sent, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Annual reports processed: ${successCount} sent, ${errorCount} errors`,
        year: previousYear,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-annual-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
