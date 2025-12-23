import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AccountConfirmationRequest {
  email: string;
  confirmationLink: string;
  userName?: string;
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
    console.error('[SEND-ACCOUNT-CONFIRMATION] Error logging email:', error);
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("[SEND-ACCOUNT-CONFIRMATION] Function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { email, confirmationLink, userName }: AccountConfirmationRequest = await req.json();

    if (!email || !confirmationLink) {
      return new Response(
        JSON.stringify({ error: "Email and confirmationLink are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const displayName = userName || email.split('@')[0];
    const subject = "✉️ Confirme seu email - Plano de Vida";

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
                      ✉️ Confirme seu Email
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
                      Olá, <strong>${displayName}</strong>! 👋
                    </p>
                    
                    <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
                      Você está a um passo de começar sua jornada no <strong style="color: #2A8C68;">Plano de Vida</strong>!
                    </p>

                    <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
                      Clique no botão abaixo para confirmar seu email e ativar sua conta:
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${confirmationLink}" 
                             style="display: inline-block; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); 
                                    color: #ffffff; text-decoration: none; padding: 16px 40px; 
                                    border-radius: 12px; font-weight: 600; font-size: 16px;
                                    box-shadow: 0 4px 14px rgba(42, 140, 104, 0.4);">
                            Confirmar meu email →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.7;">
                      Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                      <span style="color: #2A8C68; word-break: break-all;">${confirmationLink}</span>
                    </p>

                    <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 25px 0;">
                      <p style="margin: 0 0 10px 0; color: #166534; font-weight: 600; font-size: 14px;">
                        🌟 O que você terá acesso:
                      </p>
                      <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                        <li>Planejamento em 7 áreas da vida</li>
                        <li>Metas organizadas por idade</li>
                        <li>Acompanhamento de progresso</li>
                        <li>Exportação em PDF</li>
                      </ul>
                    </div>
                    
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
                      Se você não criou uma conta, ignore este email.
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
      to: [email],
      subject,
      html: emailHtml,
    });

    console.log("[SEND-ACCOUNT-CONFIRMATION] Email sent:", emailResponse);

    // Log email
    await logEmail(supabaseClient, {
      recipientEmail: email,
      recipientName: displayName,
      emailType: 'account_confirmation',
      subject,
      status: emailResponse.error ? 'error' : 'sent',
      resendId: emailResponse.data?.id,
      errorMessage: emailResponse.error?.message,
    });

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[SEND-ACCOUNT-CONFIRMATION] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
