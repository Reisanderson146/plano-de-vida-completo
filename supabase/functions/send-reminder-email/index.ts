import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderEmailRequest {
  to: string;
  userName: string;
  userId?: string;
  reminderType: 'check_in' | 'deadline' | 'annual_review' | 'goal_completed' | 'new_goal';
  goalTitle?: string;
  planTitle?: string;
  dueDate?: string;
  metadata?: any;
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
    console.error('[SEND-REMINDER-EMAIL] Error logging email:', error);
  }
};

const getEmailContent = (request: ReminderEmailRequest) => {
  const { reminderType, userName, goalTitle, planTitle, dueDate } = request;

  switch (reminderType) {
    case 'check_in':
      return {
        subject: '📊 Hora de atualizar seu progresso! - Plano de Vida',
        html: `
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
                    <tr>
                      <td style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                          📊 Atualize suas Metas!
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px;">Olá, <strong>${userName}</strong>! 👋</p>
                        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
                          É hora de marcar suas metas realizadas no seu Plano de Vida!
                        </p>
                        ${goalTitle ? `<p style="margin: 0 0 15px 0; color: #374151;">Meta em destaque: <strong>${goalTitle}</strong></p>` : ''}
                        ${planTitle ? `<p style="margin: 0 0 15px 0; color: #374151;">Plano: <strong>${planTitle}</strong></p>` : ''}
                        <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px;">
                          Manter o acompanhamento regular é essencial para alcançar seus objetivos.
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center">
                              <a href="https://planodevida.io" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600;">
                                Acessar meu Plano →
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                          © ${new Date().getFullYear()} Plano de Vida. Todos os direitos reservados.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };

    case 'deadline':
      return {
        subject: '⚠️ Meta próxima do vencimento! - Plano de Vida',
        html: `
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
                    <tr>
                      <td style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                          ⚠️ Atenção: Prazo Próximo!
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px;">Olá, <strong>${userName}</strong>!</p>
                        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
                          <strong style="color: #92400e;">Uma meta está próxima do vencimento!</strong>
                        </div>
                        ${goalTitle ? `<p style="margin: 15px 0; color: #374151;">Meta: <strong>${goalTitle}</strong></p>` : ''}
                        ${dueDate ? `<p style="margin: 15px 0; color: #374151;">Prazo: <strong>${dueDate}</strong></p>` : ''}
                        ${planTitle ? `<p style="margin: 15px 0; color: #374151;">Plano: <strong>${planTitle}</strong></p>` : ''}
                        <p style="margin: 20px 0; color: #6b7280; font-size: 16px;">
                          Não deixe para última hora! Acesse seu plano e verifique o que precisa ser feito.
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center">
                              <a href="https://planodevida.io" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ef4444); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600;">
                                Ver Meta →
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                          © ${new Date().getFullYear()} Plano de Vida. Todos os direitos reservados.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };

    case 'annual_review':
      return {
        subject: '🎯 É hora do seu Balanço Anual! - Plano de Vida',
        html: `
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
                    <tr>
                      <td style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                          🎯 Balanço Anual
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px;">Olá, <strong>${userName}</strong>! 👋</p>
                        <div style="background: #d1fae5; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                          <h2 style="margin: 0; color: #065f46;">É hora de fazer seu balanço anual!</h2>
                        </div>
                        <p style="margin: 20px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
                          O fim do ano está chegando e é o momento perfeito para:
                        </p>
                        <ul style="color: #374151; font-size: 15px; line-height: 2;">
                          <li>Revisar suas conquistas do ano</li>
                          <li>Identificar áreas que precisam de mais atenção</li>
                          <li>Planejar seus objetivos para o próximo ano</li>
                        </ul>
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 25px;">
                          <tr>
                            <td align="center">
                              <a href="https://planodevida.io/balanco" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600;">
                                Fazer meu Balanço →
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                          © ${new Date().getFullYear()} Plano de Vida. Todos os direitos reservados.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };

    case 'goal_completed':
      return {
        subject: '🎉 Parabéns! Meta concluída! - Plano de Vida',
        html: `
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
                    <tr>
                      <td style="background: linear-gradient(135deg, #2A8C68, #7BC8A4); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                          🎉 Parabéns!
                        </h1>
                        <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                          Você concluiu uma meta!
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px;">Olá, <strong>${userName}</strong>! 👋</p>
                        <div style="background: #d1fae5; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                          <p style="margin: 0 0 10px 0; color: #065f46; font-size: 14px;">META CONCLUÍDA</p>
                          <h2 style="margin: 0; color: #065f46;">${goalTitle || 'Sua meta'}</h2>
                        </div>
                        <p style="margin: 20px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
                          Cada meta concluída é um passo em direção aos seus sonhos. Continue assim! 💪
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 25px;">
                          <tr>
                            <td align="center">
                              <a href="https://planodevida.io" style="display: inline-block; background: linear-gradient(135deg, #2A8C68, #7BC8A4); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600;">
                                Ver minhas conquistas →
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                          © ${new Date().getFullYear()} Plano de Vida. Todos os direitos reservados.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };

    case 'new_goal':
      return {
        subject: '🎯 Nova meta criada! - Plano de Vida',
        html: `
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
                    <tr>
                      <td style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                          🎯 Nova Meta Criada!
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px;">Olá, <strong>${userName}</strong>!</p>
                        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
                          Você acabou de criar uma nova meta no seu Plano de Vida:
                        </p>
                        <div style="background: #dbeafe; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                          <h3 style="margin: 0; color: #1e40af;">${goalTitle || 'Nova meta'}</h3>
                          ${planTitle ? `<p style="margin: 10px 0 0 0; color: #3b82f6; font-size: 14px;">Plano: ${planTitle}</p>` : ''}
                        </div>
                        <p style="margin: 20px 0; color: #6b7280; font-size: 16px;">
                          Lembre-se: <em>"Constância que constrói resultados"</em>. Boa sorte! 🍀
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 25px;">
                          <tr>
                            <td align="center">
                              <a href="https://planodevida.io" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600;">
                                Ver meu Plano →
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                          © ${new Date().getFullYear()} Plano de Vida. Todos os direitos reservados.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      };

    default:
      return {
        subject: '📬 Lembrete - Plano de Vida',
        html: `<p>Olá ${userName}, você tem um lembrete no seu Plano de Vida!</p>`,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("[SEND-REMINDER-EMAIL] Function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const request: ReminderEmailRequest = await req.json();
    console.log("[SEND-REMINDER-EMAIL] Request:", JSON.stringify(request, null, 2));

    const { to, reminderType, userName, userId, metadata } = request;

    if (!to || !reminderType || !userName) {
      console.error("[SEND-REMINDER-EMAIL] Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, reminderType, userName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, html } = getEmailContent(request);

    console.log(`[SEND-REMINDER-EMAIL] Sending ${reminderType} email to ${to}`);

    const emailResponse = await resend.emails.send({
      from: "Plano de Vida <contato@planodevida.io>",
      to: [to],
      subject,
      html,
      headers: {
        "List-Unsubscribe": "<mailto:cancelar@planodevida.io?subject=Unsubscribe>, <https://planodevida.io/configuracoes>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    console.log("[SEND-REMINDER-EMAIL] Email sent:", emailResponse);

    // Log email
    await logEmail(supabaseClient, {
      userId,
      recipientEmail: to,
      recipientName: userName,
      emailType: `reminder_${reminderType}`,
      subject,
      status: emailResponse.error ? 'error' : 'sent',
      resendId: emailResponse.data?.id,
      errorMessage: emailResponse.error?.message,
      metadata: { ...metadata, reminderType },
    });

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[SEND-REMINDER-EMAIL] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
