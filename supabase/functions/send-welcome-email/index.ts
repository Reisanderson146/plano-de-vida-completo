import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-WELCOME-EMAIL] ${step}${detailsStr}`);
};

interface WelcomeEmailRequest {
  subscriptionPlan: 'basic' | 'premium';
}

const logEmail = async (
  supabaseClient: any,
  data: {
    userId?: string;
    recipientEmail: string;
    recipientName?: string;
    emailType: string;
    subject: string;
    status: string;
    resendId?: string;
    errorMessage?: string;
    metadata?: any;
  }
) => {
  try {
    await supabaseClient.from('email_logs').insert({
      user_id: data.userId,
      recipient_email: data.recipientEmail,
      recipient_name: data.recipientName,
      email_type: data.emailType,
      subject: data.subject,
      status: data.status,
      resend_id: data.resendId,
      error_message: data.errorMessage,
      metadata: data.metadata || {},
    });
  } catch (error) {
    console.error('[SEND-WELCOME-EMAIL] Error logging email:', error);
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Get user from auth header
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    // Get subscription plan from request
    const { subscriptionPlan = 'basic' }: WelcomeEmailRequest = await req.json().catch(() => ({ subscriptionPlan: 'basic' }));
    logStep("Subscription plan", { subscriptionPlan });

    // Get user's name from profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const userName = profile?.full_name || user.email.split('@')[0];
    const planName = subscriptionPlan === 'premium' ? 'Premium' : 'Basic';
    const planFeatures = subscriptionPlan === 'premium' 
      ? `
        <li>👨‍👩‍👧‍👦 1 Plano Familiar</li>
        <li>👶 3 Planos para Filhos</li>
        <li>🤖 Resumo Inteligente com IA</li>
        <li>📊 Relatórios de Progresso</li>
        <li>🔔 Notificações Personalizadas</li>
      `
      : `
        <li>✨ 1 Plano Individual</li>
        <li>📊 Planejamento das 7 Áreas</li>
        <li>📄 Exportação em PDF</li>
        <li>☁️ Dados Seguros na Nuvem</li>
      `;

    const subject = `🎉 Bem-vindo ao Plano de Vida, ${userName}!`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        🎉 Bem-vindo ao Plano de Vida!
                      </h1>
                      <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                        Sua jornada de transformação começa agora
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
                        Olá, <strong>${userName}</strong>! 👋
                      </p>
                      
                      <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
                        É com muita alegria que recebemos você na nossa comunidade! Sua assinatura do 
                        <strong style="color: #2A8C68;">Plano ${planName}</strong> foi ativada com sucesso.
                      </p>

                      <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                        <em>"Constância que constrói resultados"</em> – essa é a nossa filosofia. Com o Plano de Vida, 
                        você terá uma ferramenta poderosa para organizar suas metas em 7 áreas fundamentais da vida:
                      </p>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                        <tr>
                          <td style="background-color: #f0fdf4; border-radius: 12px; padding: 20px;">
                            <p style="margin: 0 0 10px 0; color: #166534; font-weight: 600; font-size: 14px;">
                              AS 7 ÁREAS DO SEU PLANO:
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td width="50%" style="color: #374151; font-size: 14px; padding: 3px 0;">🙏 Espiritual</td>
                                <td width="50%" style="color: #374151; font-size: 14px; padding: 3px 0;">📚 Intelectual</td>
                              </tr>
                              <tr>
                                <td style="color: #374151; font-size: 14px; padding: 3px 0;">❤️ Familiar</td>
                                <td style="color: #374151; font-size: 14px; padding: 3px 0;">🤝 Social</td>
                              </tr>
                              <tr>
                                <td style="color: #374151; font-size: 14px; padding: 3px 0;">💰 Financeiro</td>
                                <td style="color: #374151; font-size: 14px; padding: 3px 0;">💼 Profissional</td>
                              </tr>
                              <tr>
                                <td colspan="2" style="color: #374151; font-size: 14px; padding: 3px 0;">🏃 Saúde</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Plan Features -->
                      <p style="margin: 25px 0 10px 0; color: #374151; font-weight: 600; font-size: 16px;">
                        O que você tem acesso no Plano ${planName}:
                      </p>
                      <ul style="margin: 0 0 25px 0; padding-left: 0; list-style: none; color: #374151; font-size: 15px; line-height: 2;">
                        ${planFeatures}
                      </ul>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="https://planodevida.io/cadastro" 
                               style="display: inline-block; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); 
                                      color: #ffffff; text-decoration: none; padding: 16px 40px; 
                                      border-radius: 12px; font-weight: 600; font-size: 16px;
                                      box-shadow: 0 4px 14px rgba(42, 140, 104, 0.4);">
                              Criar meu Plano de Vida →
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 15px; line-height: 1.7;">
                        Estamos aqui para apoiar você em cada passo dessa jornada. Se precisar de ajuda, 
                        basta responder a este email!
                      </p>
                      
                      <p style="margin: 25px 0 0 0; color: #374151; font-size: 15px;">
                        Com carinho,<br>
                        <strong>Equipe Plano de Vida</strong> 🌱
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                        © ${new Date().getFullYear()} Plano de Vida. Todos os direitos reservados.
                      </p>
                      <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                        Você recebeu este email porque se inscreveu no Plano de Vida.
                      </p>
                      <p style="margin: 15px 0 0 0;">
                        <a href="https://planodevida.io/configuracoes" style="color: #6b7280; font-size: 12px; text-decoration: underline;">
                          Gerenciar preferências de email
                        </a>
                        <span style="color: #d1d5db; margin: 0 8px;">|</span>
                        <a href="mailto:cancelar@planodevida.io?subject=Cancelar%20inscri%C3%A7%C3%A3o" style="color: #6b7280; font-size: 12px; text-decoration: underline;">
                          Cancelar inscrição
                        </a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Plano de Vida <contato@planodevida.io>",
      to: [user.email],
      subject,
      html: emailHtml,
      headers: {
        "List-Unsubscribe": "<mailto:cancelar@planodevida.io?subject=Unsubscribe>, <https://planodevida.io/configuracoes>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    logStep("Email sent successfully", { emailResponse });

    // Log email
    await logEmail(supabaseClient, {
      userId: user.id,
      recipientEmail: user.email,
      recipientName: userName,
      emailType: 'welcome',
      subject,
      status: emailResponse.error ? 'error' : 'sent',
      resendId: emailResponse.data?.id,
      errorMessage: emailResponse.error?.message,
      metadata: { subscriptionPlan },
    });

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
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
