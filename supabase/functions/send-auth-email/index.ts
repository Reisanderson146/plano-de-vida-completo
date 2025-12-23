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
  const baseStyles = `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f8fafc;
  `;
  
  const footer = `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
      <p style="margin: 0 0 8px 0;">Este email foi enviado por Plano de Vida</p>
      <p style="margin: 0 0 8px 0;">
        <a href="https://planodevida.io/configuracoes" style="color: #0ea5e9; text-decoration: none;">Gerenciar preferências de email</a>
        &nbsp;|&nbsp;
        <a href="mailto:cancelar@planodevida.io?subject=Cancelar%20inscri%C3%A7%C3%A3o" style="color: #0ea5e9; text-decoration: none;">Cancelar inscrição</a>
      </p>
      <p style="margin: 0; color: #94a3b8;">© ${new Date().getFullYear()} Plano de Vida. Todos os direitos reservados.</p>
    </div>
  `;

  if (type === "recovery") {
    return {
      subject: "Recupere sua senha - Plano de Vida",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="${baseStyles}">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f766e 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔐 Recuperação de Senha</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">Olá ${displayName},</p>
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">Recebemos uma solicitação para redefinir a senha da sua conta no Plano de Vida.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0891b2 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Redefinir Minha Senha</a>
              </div>
              <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Este link expira em 1 hora. Se você não solicitou a redefinição de senha, pode ignorar este email.</p>
              <p style="color: #64748b; font-size: 12px; margin-top: 20px; word-break: break-all;">Link: ${link}</p>
            </div>
            ${footer}
          </div>
        </body>
        </html>
      `,
    };
  }

  if (type === "signup") {
    return {
      subject: "Confirme seu email - Plano de Vida",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="${baseStyles}">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f766e 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✨ Bem-vindo ao Plano de Vida!</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">Olá ${displayName},</p>
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">Obrigado por se cadastrar! Para ativar sua conta e começar a planejar sua vida, confirme seu email clicando no botão abaixo.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0891b2 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Confirmar Meu Email</a>
              </div>
              <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Se você não criou uma conta, pode ignorar este email.</p>
              <p style="color: #64748b; font-size: 12px; margin-top: 20px; word-break: break-all;">Link: ${link}</p>
            </div>
            ${footer}
          </div>
        </body>
        </html>
      `,
    };
  }

  // Magic link
  return {
    subject: "Seu link de acesso - Plano de Vida",
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="${baseStyles}">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0f766e 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🔗 Link de Acesso</h1>
          </div>
          <div style="background: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">Olá ${displayName},</p>
            <p style="color: #334155; font-size: 16px; line-height: 1.6;">Clique no botão abaixo para acessar sua conta no Plano de Vida.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #0891b2 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Acessar Minha Conta</a>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Este link expira em 1 hora.</p>
            <p style="color: #64748b; font-size: 12px; margin-top: 20px; word-break: break-all;">Link: ${link}</p>
          </div>
          ${footer}
        </div>
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

    // Use dedicated reset-password page for recovery, /auth for others
    let baseUrl: string;
    if (redirectTo) {
      baseUrl = redirectTo;
    } else if (type === "recovery") {
      baseUrl = "https://planodevida.io/reset-password";
    } else {
      baseUrl = "https://planodevida.io/auth";
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
    // The original link is like: https://xxx.supabase.co/auth/v1/verify?token=...&type=...&redirect_to=...
    // We need to redirect to our app which will then verify the token
    const url = new URL(originalLink);
    const token = url.searchParams.get("token");
    const tokenType = url.searchParams.get("type");
    
    // Build the proper auth link that goes through Supabase's verify endpoint with correct redirect
    // The key is to ensure the redirect_to is properly set
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
