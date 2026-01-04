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
  console.log(`[SEND-SEASONAL-EMAIL] ${step}${detailsStr}`);
};

interface SeasonalEmailRequest {
  userId?: string;
  email: string;
  userName: string;
  emailType: 'new_year' | 'christmas' | 'easter';
}

const getEmailContent = (emailType: string, userName: string) => {
  const year = new Date().getFullYear();
  
  switch (emailType) {
    case 'new_year':
      return {
        subject: `🎆 Feliz Ano Novo, ${userName}!`,
        emoji: "🎆",
        title: "Feliz Ano Novo!",
        greeting: `Olá, ${userName}!`,
        message: `Que ${year} seja um ano de grandes conquistas, realizações e bênçãos em sua vida. Que todos os seus sonhos e metas se concretizem!`,
        verse: "Eis que faço uma coisa nova; agora ela surge. Não a percebeis?",
        verseRef: "Isaías 43:19",
        cta: "Este é o momento perfeito para revisar e atualizar seu Plano de Vida para o novo ano!",
        buttonText: "Atualizar Meu Plano",
      };
    case 'christmas':
      return {
        subject: `🎄 Feliz Natal, ${userName}!`,
        emoji: "🎄",
        title: "Feliz Natal!",
        greeting: `Olá, ${userName}!`,
        message: "Que a paz, o amor e a esperança do Natal encham o seu coração e o da sua família. Celebre este momento especial com gratidão!",
        verse: "Porque um menino nos nasceu, um filho nos foi dado, e o governo está sobre os seus ombros.",
        verseRef: "Isaías 9:6",
        cta: "Aproveite este momento para refletir sobre suas conquistas e agradecer pelas bênçãos recebidas.",
        buttonText: "Ver Minhas Conquistas",
      };
    case 'easter':
      return {
        subject: `🐣 Feliz Páscoa, ${userName}!`,
        emoji: "🐣",
        title: "Feliz Páscoa!",
        greeting: `Olá, ${userName}!`,
        message: "A Páscoa é tempo de renovação e esperança. Que este momento traga paz, amor e novas perspectivas para sua vida!",
        verse: "Ele não está aqui; ressuscitou!",
        verseRef: "Lucas 24:6",
        cta: "Assim como a Páscoa representa renovação, que tal revisar seus objetivos e renovar seu compromisso com suas metas?",
        buttonText: "Renovar Meus Objetivos",
      };
    default:
      throw new Error(`Unknown email type: ${emailType}`);
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function called");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, email, userName, emailType }: SeasonalEmailRequest = await req.json();

    logStep("Processing seasonal email", { email, userName, emailType });

    if (!email || !emailType) {
      throw new Error("Email and emailType are required");
    }

    const displayName = userName || "Querido(a) usuário(a)";
    const content = getEmailContent(emailType, displayName);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2A8C68 0%, #1e6b4d 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">${content.emoji}</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                ${content.title}
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #333333; margin: 0 0 20px 0; line-height: 1.6;">
                ${content.greeting}
              </p>
              
              <p style="font-size: 16px; color: #555555; margin: 0 0 30px 0; line-height: 1.6;">
                ${content.message}
              </p>
              
              <!-- Verse Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="background-color: #f0fdf4; border-left: 4px solid #2A8C68; padding: 20px; border-radius: 0 8px 8px 0;">
                    <p style="font-size: 16px; color: #2A8C68; margin: 0 0 8px 0; font-style: italic; line-height: 1.6;">
                      "${content.verse}"
                    </p>
                    <p style="font-size: 14px; color: #666666; margin: 0; font-weight: 600;">
                      ${content.verseRef}
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 16px; color: #555555; margin: 0 0 30px 0; line-height: 1.6;">
                ${content.cta}
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://planodevida.io/dashboard" style="display: inline-block; background-color: #2A8C68; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      ${content.buttonText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 14px; color: #666666; margin: 0 0 8px 0;">
                Com carinho,
              </p>
              <p style="font-size: 16px; color: #2A8C68; margin: 0; font-weight: 600;">
                Equipe Plano de Vida
              </p>
              <p style="font-size: 12px; color: #999999; margin: 16px 0 0 0;">
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
    `;

    const emailResponse = await resend.emails.send({
      from: "Plano de Vida <contato@planodevida.io>",
      to: [email],
      subject: content.subject,
      html: emailHtml,
    });

    const resendId = (emailResponse as any).id || (emailResponse as any).data?.id || 'unknown';
    logStep("Email sent successfully", { resendId });

    // Log the email
    await supabase.from("email_logs").insert({
      user_id: userId || null,
      recipient_email: email,
      recipient_name: userName,
      email_type: emailType,
      subject: content.subject,
      status: "sent",
      resend_id: resendId,
    });

    return new Response(JSON.stringify({ success: true, id: resendId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
