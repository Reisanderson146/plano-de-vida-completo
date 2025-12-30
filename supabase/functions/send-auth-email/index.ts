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

// Simplified email template to avoid promotions tab
const getEmailTemplate = (type: string, link: string, displayName: string) => {
  const year = new Date().getFullYear();
  
  const footer = `
    <p style="margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center;">
      Plano de Vida ${year}<br>
      <a href="https://planodevida.io/configuracoes" style="color: #6b7280; text-decoration: underline;">Gerenciar preferencias</a>
    </p>
  `;

  if (type === "recovery") {
    return {
      subject: "Recuperacao de Senha - Plano de Vida",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #ffffff; color: #374151; line-height: 1.6;">
          <div style="max-width: 500px; margin: 0 auto;">
            <p style="margin: 0 0 20px 0; color: #2A8C68; font-weight: 600; font-size: 18px;">Plano de Vida</p>
            
            <p style="margin: 0 0 15px 0;">Ola, ${displayName}.</p>
            
            <p style="margin: 0 0 20px 0;">Voce solicitou a recuperacao de senha da sua conta.</p>
            
            <p style="margin: 0 0 20px 0;">
              <a href="${link}" style="color: #2A8C68; text-decoration: underline;">Clique aqui para redefinir sua senha</a>
            </p>
            
            <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">Este link expira em 1 hora. Se voce nao solicitou esta recuperacao, ignore este email.</p>
            
            <p style="margin: 0;">Equipe Plano de Vida</p>
            
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
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #ffffff; color: #374151; line-height: 1.6;">
          <div style="max-width: 500px; margin: 0 auto;">
            <p style="margin: 0 0 20px 0; color: #2A8C68; font-weight: 600; font-size: 18px;">Plano de Vida</p>
            
            <p style="margin: 0 0 15px 0;">Ola, ${displayName}.</p>
            
            <p style="margin: 0 0 20px 0;">Para ativar sua conta, confirme seu email clicando no link abaixo.</p>
            
            <p style="margin: 0 0 20px 0;">
              <a href="${link}" style="color: #2A8C68; text-decoration: underline;">Confirmar meu email</a>
            </p>
            
            <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">Se voce nao criou esta conta, ignore este email.</p>
            
            <p style="margin: 0;">Equipe Plano de Vida</p>
            
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
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #ffffff; color: #374151; line-height: 1.6;">
        <div style="max-width: 500px; margin: 0 auto;">
          <p style="margin: 0 0 20px 0; color: #2A8C68; font-weight: 600; font-size: 18px;">Plano de Vida</p>
          
          <p style="margin: 0 0 15px 0;">Ola, ${displayName}.</p>
          
          <p style="margin: 0 0 20px 0;">Use o link abaixo para acessar sua conta.</p>
          
          <p style="margin: 0 0 20px 0;">
            <a href="${link}" style="color: #2A8C68; text-decoration: underline;">Acessar minha conta</a>
          </p>
          
          <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">Este link expira em 1 hora.</p>
          
          <p style="margin: 0;">Equipe Plano de Vida</p>
          
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
      error_message: emailResponse.ok ? null : JSON.stringify(emailResult),
    });

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
