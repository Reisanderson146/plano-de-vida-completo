import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  to: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[TEST-EMAIL] Function started");

    const { to, userName = "Usuário" }: TestEmailRequest = await req.json();
    
    if (!to) {
      throw new Error("Email destinatário é obrigatório");
    }

    console.log("[TEST-EMAIL] Sending to:", to);

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
                        Este é um email de teste para confirmar que o sistema de envio de emails está funcionando corretamente com o domínio <strong style="color: #2A8C68;">planodevida.io</strong>.
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

                      <!-- Success Badge -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <div style="display: inline-block; background-color: #dcfce7; color: #166534; 
                                        padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                              ✅ Email enviado com sucesso via planodevida.io
                            </div>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 15px; line-height: 1.7;">
                        Este é um email de teste. Se você recebeu, significa que tudo está configurado corretamente!
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
                        Este é um email de teste do sistema.
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
      to: [to],
      subject: `🎉 Bem-vindo ao Plano de Vida, ${userName}!`,
      html: emailHtml,
      headers: {
        "List-Unsubscribe": "<mailto:cancelar@planodevida.io?subject=Unsubscribe>, <https://planodevida.io/configuracoes>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    console.log("[TEST-EMAIL] Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.log("[TEST-EMAIL] ERROR:", error.message);
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
