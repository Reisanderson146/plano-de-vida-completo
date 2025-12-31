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

const year = new Date().getFullYear();

// Simple footer - less promotional
const getEmailFooter = () => `
  <tr>
    <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        Plano de Vida - ${year}
      </p>
      <p style="margin: 10px 0 0 0;">
        <a href="https://planodevida.io/configuracoes" style="color: #6b7280; font-size: 11px; text-decoration: underline;">
          Preferências
        </a>
        <span style="color: #d1d5db; margin: 0 5px;">|</span>
        <a href="mailto:contato@planodevida.io" style="color: #6b7280; font-size: 11px; text-decoration: underline;">
          Contato
        </a>
      </p>
    </td>
  </tr>
`;

// Simple transactional wrapper
const generateEmailWrapper = (headerTitle: string, content: string) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f9fafb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 30px 20px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb;">
            <tr>
              <td style="background-color: #2A8C68; padding: 24px 30px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">
                  ${headerTitle}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px;">
                ${content}
              </td>
            </tr>
            ${getEmailFooter()}
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

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
      subject = `${fromName} compartilhou um Plano de Vida com você`;
      emailType = 'pdf_share';

      const content = `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Olá ${displayName},
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          ${fromName} compartilhou um Plano de Vida com você.
        </p>
        <div style="background: #f0fdf4; border-radius: 6px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; color: #065f46; font-size: 14px;">
            <strong>Plano:</strong> ${planTitle}
          </p>
        </div>
        ${body.customMessage ? `
          <div style="background: #f3f4f6; border-left: 3px solid #2A8C68; padding: 12px 16px; margin: 16px 0;">
            <p style="margin: 0; color: #4b5563; font-size: 14px; font-style: italic;">"${body.customMessage}"</p>
          </div>
        ` : ''}
        <p style="margin: 16px 0; color: #6b7280; font-size: 13px;">
          O arquivo PDF está anexado a este email.
        </p>
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
          Atenciosamente,<br>Equipe Plano de Vida
        </p>
      `;

      emailHtml = generateEmailWrapper("Plano Compartilhado", content);

      // Convert base64 to buffer for attachment
      const pdfBuffer = Uint8Array.from(atob(body.pdfBase64!), c => c.charCodeAt(0));
      attachments = [{ filename: body.pdfFileName, content: pdfBuffer }];

    } else {
      // Mode 2: Send HTML summary (no attachment)
      subject = `Resumo do seu Plano de Vida: ${planTitle}`;
      emailType = 'plan_summary';

      const progressBar = `
        <div style="background: #e5e7eb; border-radius: 6px; height: 12px; overflow: hidden; margin: 10px 0;">
          <div style="background: #2A8C68; height: 100%; width: ${body.progressPercent || 0}%; border-radius: 6px;"></div>
        </div>
      `;

      const content = `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Olá ${displayName},
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          Aqui está o resumo do seu Plano de Vida.
        </p>
        ${body.planMotto ? `
          <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; font-style: italic;">
            "${body.planMotto}"
          </p>
        ` : ''}
        <div style="background: #f0fdf4; border-radius: 6px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0; color: #065f46; font-size: 14px; font-weight: 600;">
            Progresso: ${body.progressPercent || 0}%
          </p>
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">
            ${body.completedGoals || 0} de ${body.totalGoals || 0} metas concluídas
          </p>
          ${progressBar}
        </div>
        <div style="margin: 20px 0;">
          <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">Suas Metas:</p>
          ${body.goalsHtml || '<p style="color: #6b7280; font-size: 14px;">Nenhuma meta encontrada.</p>'}
        </div>
        <p style="margin: 20px 0;">
          <a href="https://planodevida.io" style="color: #2A8C68; text-decoration: underline; font-weight: 500;">Acessar meu plano</a>
        </p>
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
          Atenciosamente,<br>Equipe Plano de Vida
        </p>
      `;

      emailHtml = generateEmailWrapper(planTitle, content);
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
