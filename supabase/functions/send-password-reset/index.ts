import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetLink: string;
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
    console.error('[SEND-PASSWORD-RESET] Error logging email:', error);
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("[SEND-PASSWORD-RESET] Function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { email, resetLink, userName }: PasswordResetRequest = await req.json();

    if (!email || !resetLink) {
      return new Response(
        JSON.stringify({ error: "Email and resetLink are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const displayName = userName || email.split('@')[0];
    const subject = "🔐 Recuperação de Senha - Plano de Vida";

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
                  <td style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                      🔐 Recuperação de Senha
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
                      Olá, <strong>${displayName}</strong>!
                    </p>
                    
                    <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
                      Recebemos uma solicitação para redefinir a senha da sua conta no <strong style="color: #6366f1;">Plano de Vida</strong>.
                    </p>

                    <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
                      Clique no botão abaixo para criar uma nova senha:
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${resetLink}" 
                             style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); 
                                    color: #ffffff; text-decoration: none; padding: 16px 40px; 
                                    border-radius: 12px; font-weight: 600; font-size: 16px;
                                    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                            Redefinir minha senha →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 25px 0;">
                      <p style="margin: 0; color: #92400e; font-size: 14px;">
                        <strong>⚠️ Atenção:</strong> Este link expira em 1 hora. Se você não solicitou esta recuperação, ignore este email.
                      </p>
                    </div>

                    <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.7;">
                      Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                      <span style="color: #6366f1; word-break: break-all;">${resetLink}</span>
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
                      Este é um email automático. Não responda.
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
      to: [email],
      subject,
      html: emailHtml,
      headers: {
        "List-Unsubscribe": "<mailto:cancelar@planodevida.io?subject=Unsubscribe>, <https://planodevida.io/configuracoes>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    console.log("[SEND-PASSWORD-RESET] Email sent:", emailResponse);

    // Log email
    await logEmail(supabaseClient, {
      recipientEmail: email,
      recipientName: displayName,
      emailType: 'password_reset',
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
    console.error("[SEND-PASSWORD-RESET] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
