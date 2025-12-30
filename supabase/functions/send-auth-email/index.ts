import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  email: string;
  type: "recovery" | "signup" | "magiclink";
  redirectTo?: string;
}

const getEmailTemplate = (type: string, link: string, displayName: string) => {
  const year = new Date().getFullYear();
  
  const footer = `
    <tr>
      <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #9ca3af; font-size: 13px;">
          © ${year} Plano de Vida. Todos os direitos reservados.
        </p>
        <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
          Este é um email automático.
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
  `;

  if (type === "recovery") {
    return {
      subject: "🔐 Recuperação de Senha - Plano de Vida",
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
                    <td style="background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        🔐 Recuperação de Senha
                      </h1>
                      <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                        Plano de Vida
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
                        Olá, <strong>${displayName}</strong>! 👋
                      </p>
                      <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
                        Recebemos uma solicitação para redefinir a senha da sua conta no <strong style="color: #2A8C68;">Plano de Vida</strong>.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(42, 140, 104, 0.4);">
                              Redefinir Minha Senha →
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
                        <span style="color: #2A8C68; word-break: break-all; font-size: 12px;">${link}</span>
                      </p>
                      <p style="margin: 25px 0 0 0; color: #374151; font-size: 15px;">
                        Com carinho,<br>
                        <strong>Equipe Plano de Vida</strong> 🌱
                      </p>
                    </td>
                  </tr>
                  ${footer}
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };
  }

  if (type === "signup") {
    return {
      subject: "✉️ Confirme seu email - Plano de Vida",
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
                    <td style="background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        ✉️ Confirme seu Email
                      </h1>
                      <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                        Bem-vindo ao Plano de Vida!
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
                        Olá, <strong>${displayName}</strong>! 👋
                      </p>
                      <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
                        Você está a um passo de começar sua jornada no <strong style="color: #2A8C68;">Plano de Vida</strong>! Clique no botão abaixo para confirmar seu email e ativar sua conta.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(42, 140, 104, 0.4);">
                              Confirmar Meu Email →
                            </a>
                          </td>
                        </tr>
                      </table>
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
                      <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.7;">
                        Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                        <span style="color: #2A8C68; word-break: break-all; font-size: 12px;">${link}</span>
                      </p>
                      <p style="margin: 25px 0 0 0; color: #374151; font-size: 15px;">
                        Com carinho,<br>
                        <strong>Equipe Plano de Vida</strong> 🌱
                      </p>
                    </td>
                  </tr>
                  ${footer}
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };
  }

  // Magic link
  return {
    subject: "🔗 Seu link de acesso - Plano de Vida",
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
                  <td style="background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                      🔗 Link de Acesso
                    </h1>
                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                      Plano de Vida
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
                      Olá, <strong>${displayName}</strong>! 👋
                    </p>
                    <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
                      Clique no botão abaixo para acessar sua conta no <strong style="color: #2A8C68;">Plano de Vida</strong>.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(42, 140, 104, 0.4);">
                            Acessar Minha Conta →
                          </a>
                        </td>
                      </tr>
                    </table>
                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 25px 0;">
                      <p style="margin: 0; color: #92400e; font-size: 14px;">
                        <strong>⚠️ Atenção:</strong> Este link expira em 1 hora.
                      </p>
                    </div>
                    <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.7;">
                      Se o botão não funcionar, copie e cole este link no seu navegador:<br>
                      <span style="color: #2A8C68; word-break: break-all; font-size: 12px;">${link}</span>
                    </p>
                    <p style="margin: 25px 0 0 0; color: #374151; font-size: 15px;">
                      Com carinho,<br>
                      <strong>Equipe Plano de Vida</strong> 🌱
                    </p>
                  </td>
                </tr>
                ${footer}
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { email, type, redirectTo }: AuthEmailRequest = await req.json();

    if (!email || !type) {
      return new Response(
        JSON.stringify({ error: "Email and type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Detect origin to determine redirect base
    const origin = req.headers.get("origin") || req.headers.get("referer") || "";
    const isPreview = origin.includes("lovableproject.com");
    const productionUrl = "https://planodevida.io";
    
    // Extract preview base URL if in preview mode
    let previewBaseUrl = "";
    if (isPreview) {
      const match = origin.match(/(https:\/\/[^/]+\.lovableproject\.com)/);
      previewBaseUrl = match ? match[1] : "";
    }
    
    const siteUrl = isPreview && previewBaseUrl ? previewBaseUrl : productionUrl;

    // Use dedicated reset-password page for recovery, /auth for others
    let baseUrl: string;
    if (redirectTo) {
      baseUrl = redirectTo;
    } else if (type === "recovery") {
      baseUrl = `${siteUrl}/reset-password`;
    } else {
      baseUrl = `${siteUrl}/auth?confirmed=true`;
    }
    
    console.log(`Generating ${type} link for ${email} with redirect to ${baseUrl}`);

    // Build params based on type
    let generateParams: any;
    if (type === "signup") {
      generateParams = { type: "signup" as const, email, options: { redirectTo: baseUrl } };
    } else if (type === "recovery") {
      generateParams = { type: "recovery" as const, email, options: { redirectTo: baseUrl } };
    } else {
      generateParams = { type: "magiclink" as const, email, options: { redirectTo: baseUrl } };
    }

    // Generate the real auth link using Supabase Admin API
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink(generateParams);

    if (linkError) {
      console.error("Error generating link:", linkError);
      return new Response(
        JSON.stringify({ error: linkError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const originalLink = linkData?.properties?.action_link;
    
    if (!originalLink) {
      console.error("No action_link in response:", linkData);
      return new Response(
        JSON.stringify({ error: "Failed to generate auth link" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the token from the Supabase link and build a proper redirect URL
    const url = new URL(originalLink);
    const token = url.searchParams.get("token");
    const tokenType = url.searchParams.get("type");
    
    // Build the proper auth link that goes through Supabase's verify endpoint with correct redirect
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const authLink = `${supabaseUrl}/auth/v1/verify?token=${token}&type=${tokenType}&redirect_to=${encodeURIComponent(baseUrl)}`;

    console.log(`Generated link: ${authLink.substring(0, 80)}...`);

    // Get user display name if available
    let displayName = email.split("@")[0];
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", linkData.user?.id)
      .single();
    
    if (profile?.full_name) {
      displayName = profile.full_name;
    }

    // Get email template
    const template = getEmailTemplate(type, authLink, displayName);

    // Send the email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Plano de Vida <contato@planodevida.io>",
        to: [email],
        subject: template.subject,
        html: template.html,
        headers: {
          "List-Unsubscribe": "<mailto:cancelar@planodevida.io?subject=Unsubscribe>, <https://planodevida.io/configuracoes>",
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });

    const emailResult = await emailResponse.json();

    console.log("Email sent successfully:", emailResult);

    // Log the email
    await supabaseAdmin.from("email_logs").insert({
      email_type: `auth_${type}`,
      recipient_email: email,
      recipient_name: displayName,
      subject: template.subject,
      status: emailResponse.ok ? "sent" : "failed",
      resend_id: emailResult?.id || null,
      user_id: linkData.user?.id || null,
      error_message: emailResult?.error?.message || null,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${type} email sent to ${email}`,
        resend_id: emailResult?.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-auth-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
