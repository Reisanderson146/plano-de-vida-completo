import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendPdfRequest {
  // Option 1: Send PDF as base64
  toEmail?: string;
  toName?: string;
  pdfBase64?: string;
  pdfFileName?: string;
  planTitle?: string;
  senderName?: string;
  customMessage?: string;
  
  // Option 2: Send summary via HTML (no PDF attachment)
  recipientEmail?: string;
  recipientName?: string;
  totalGoals?: number;
  completedGoals?: number;
  progressPercent?: number;
  goalsHtml?: string;
  planMotto?: string;
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
    console.error('[SEND-PDF-EMAIL] Error logging email:', error);
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("[SEND-PDF-EMAIL] Function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    let userId: string | undefined;
    let senderEmail: string | undefined;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      userId = userData.user?.id;
      senderEmail = userData.user?.email;
    }

    const body: SendPdfRequest = await req.json();
    console.log("[SEND-PDF-EMAIL] Request body:", JSON.stringify(body, null, 2));

    // Determine which mode: PDF attachment or HTML summary
    const hasPdfData = body.pdfBase64 && body.pdfFileName;
    const hasHtmlData = body.recipientEmail && body.goalsHtml;

    const targetEmail = body.toEmail || body.recipientEmail;
    const targetName = body.toName || body.recipientName;

    if (!targetEmail) {
      return new Response(
        JSON.stringify({ error: "Email do destinatário é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasPdfData && !hasHtmlData) {
      return new Response(
        JSON.stringify({ error: "Forneça pdfBase64/pdfFileName ou goalsHtml" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const displayName = targetName || targetEmail.split('@')[0];
    const planTitle = body.planTitle || 'Meu Plano de Vida';
    
    let subject: string;
    let emailHtml: string;
    let attachments: any[] = [];
    let emailType: string;

    if (hasPdfData) {
      // Mode 1: Send with PDF attachment
      const fromName = body.senderName || 'Alguém';
      subject = `📄 ${fromName} compartilhou um Plano de Vida com você!`;
      emailType = 'pdf_share';

      emailHtml = `
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
                    <td style="background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        📄 Plano de Vida Compartilhado
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
                        Olá, <strong>${displayName}</strong>! 👋
                      </p>
                      <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
                        <strong style="color: #2A8C68;">${fromName}</strong> compartilhou um Plano de Vida com você!
                      </p>
                      <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 25px 0;">
                        <p style="margin: 0 0 10px 0; color: #166534; font-weight: 600; font-size: 14px;">📋 PLANO COMPARTILHADO:</p>
                        <h3 style="margin: 0; color: #065f46; font-size: 20px;">${planTitle}</h3>
                      </div>
                      ${body.customMessage ? `
                        <div style="background: #f3f4f6; border-left: 4px solid #2A8C68; padding: 15px; border-radius: 8px; margin: 25px 0;">
                          <p style="margin: 0 0 8px 0; color: #374151; font-weight: 600; font-size: 14px;">💬 Mensagem:</p>
                          <p style="margin: 0; color: #6b7280; font-size: 15px; font-style: italic;">"${body.customMessage}"</p>
                        </div>
                      ` : ''}
                      <div style="background: #dbeafe; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
                        <p style="margin: 0; color: #1e40af; font-size: 14px;">📎 <strong>Arquivo anexado:</strong> ${body.pdfFileName}</p>
                      </div>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="https://planodevida.io" style="display: inline-block; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(42, 140, 104, 0.4);">
                              Criar meu próprio Plano →
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 25px 0 0 0; color: #374151; font-size: 15px;">Com carinho,<br><strong>Equipe Plano de Vida</strong> 🌱</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #9ca3af; font-size: 13px;">© ${new Date().getFullYear()} Plano de Vida. Todos os direitos reservados.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      // Convert base64 to buffer for attachment
      const pdfBuffer = Uint8Array.from(atob(body.pdfBase64!), c => c.charCodeAt(0));
      attachments = [{ filename: body.pdfFileName, content: pdfBuffer }];

    } else {
      // Mode 2: Send HTML summary (no attachment)
      subject = `📋 Resumo do seu Plano de Vida: ${planTitle}`;
      emailType = 'plan_summary';

      const progressBar = `
        <div style="background: #e5e7eb; border-radius: 10px; height: 20px; overflow: hidden; margin: 15px 0;">
          <div style="background: linear-gradient(90deg, #2A8C68, #7BC8A4); height: 100%; width: ${body.progressPercent || 0}%; border-radius: 10px;"></div>
        </div>
      `;

      emailHtml = `
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
                    <td style="background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">📋 ${planTitle}</h1>
                      ${body.planMotto ? `<p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-style: italic;">"${body.planMotto}"</p>` : ''}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
                        Olá, <strong>${displayName}</strong>! 👋
                      </p>
                      <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
                        Aqui está o resumo do seu Plano de Vida!
                      </p>
                      
                      <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 25px 0;">
                        <p style="margin: 0 0 10px 0; color: #166534; font-weight: 600; font-size: 14px;">📊 PROGRESSO:</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                          <span style="color: #065f46; font-size: 32px; font-weight: 700;">${body.progressPercent || 0}%</span>
                          <span style="color: #6b7280; font-size: 14px;">${body.completedGoals || 0} de ${body.totalGoals || 0} metas</span>
                        </div>
                        ${progressBar}
                      </div>

                      <div style="margin: 30px 0;">
                        <p style="margin: 0 0 15px 0; color: #374151; font-weight: 600; font-size: 16px;">🎯 Suas Metas:</p>
                        ${body.goalsHtml || '<p style="color: #6b7280;">Nenhuma meta encontrada.</p>'}
                      </div>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="https://planodevida.io" style="display: inline-block; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(42, 140, 104, 0.4);">
                              Acessar meu Plano →
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 25px 0 0 0; color: #374151; font-size: 15px;">Com carinho,<br><strong>Equipe Plano de Vida</strong> 🌱</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #9ca3af; font-size: 13px;">© ${new Date().getFullYear()} Plano de Vida. Todos os direitos reservados.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
    }

    const emailPayload: any = {
      from: "Plano de Vida <contato@planodevida.io>",
      to: [targetEmail],
      subject,
      html: emailHtml,
      headers: {
        "List-Unsubscribe": "<mailto:cancelar@planodevida.io?subject=Unsubscribe>, <https://planodevida.io/configuracoes>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };

    if (attachments.length > 0) {
      emailPayload.attachments = attachments;
    }

    const emailResponse = await resend.emails.send(emailPayload);
    console.log("[SEND-PDF-EMAIL] Email sent:", emailResponse);

    // Log email
    await logEmail(supabaseClient, {
      userId,
      recipientEmail: targetEmail,
      recipientName: displayName,
      emailType,
      subject,
      status: emailResponse.error ? 'error' : 'sent',
      resendId: emailResponse.data?.id,
      errorMessage: emailResponse.error?.message,
      metadata: { planTitle, senderEmail },
    });

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[SEND-PDF-EMAIL] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
