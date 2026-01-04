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
  console.log(`[SEND-BIRTHDAY-EMAIL] ${step}${detailsStr}`);
};

const birthdayVerses = [
  { verse: "O Senhor te abençoe e te guarde.", reference: "Números 6:24" },
  { verse: "Que todos os dias da sua vida você experimente a bondade e a misericórdia do Senhor.", reference: "Salmos 23:6" },
  { verse: "Deleita-te também no Senhor, e ele te concederá os desejos do teu coração.", reference: "Salmos 37:4" },
  { verse: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.", reference: "Jeremias 29:11" },
  { verse: "O Senhor é a minha força e o meu escudo; nele o meu coração confia, e dele recebo ajuda.", reference: "Salmos 28:7" },
];

const getRandomVerse = () => {
  return birthdayVerses[Math.floor(Math.random() * birthdayVerses.length)];
};

interface BirthdayEmailRequest {
  userId: string;
  email: string;
  userName: string;
  age?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function called");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, email, userName, age }: BirthdayEmailRequest = await req.json();

    logStep("Processing birthday email", { email, userName, age });

    if (!email) {
      throw new Error("Email is required");
    }

    const verse = getRandomVerse();
    const displayName = userName || "Querido(a) usuário(a)";
    const ageText = age ? ` Hoje você completa ${age} anos de vida!` : "";

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
              <div style="font-size: 48px; margin-bottom: 16px;">🎂</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                Feliz Aniversário!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #333333; margin: 0 0 20px 0; line-height: 1.6;">
                Olá, <strong>${displayName}</strong>!
              </p>
              
              <p style="font-size: 16px; color: #555555; margin: 0 0 20px 0; line-height: 1.6;">
                🎉 Hoje é um dia muito especial!${ageText}
              </p>
              
              <p style="font-size: 16px; color: #555555; margin: 0 0 30px 0; line-height: 1.6;">
                A equipe do Plano de Vida deseja a você um aniversário repleto de alegria, realizações e bênçãos. Que este novo ciclo seja marcado por conquistas e crescimento em todas as áreas da sua vida.
              </p>
              
              <!-- Verse Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="background-color: #f0fdf4; border-left: 4px solid #2A8C68; padding: 20px; border-radius: 0 8px 8px 0;">
                    <p style="font-size: 16px; color: #2A8C68; margin: 0 0 8px 0; font-style: italic; line-height: 1.6;">
                      "${verse.verse}"
                    </p>
                    <p style="font-size: 14px; color: #666666; margin: 0; font-weight: 600;">
                      ${verse.reference}
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 16px; color: #555555; margin: 0 0 30px 0; line-height: 1.6;">
                Continue perseguindo seus sonhos e metas. Estamos aqui para ajudá-lo nessa jornada!
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://planodevida.io/dashboard" style="display: inline-block; background-color: #2A8C68; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Revisar Meu Plano de Vida
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
      subject: `🎂 Feliz Aniversário, ${displayName}!`,
      html: emailHtml,
    });

    const resendId = (emailResponse as any).id || (emailResponse as any).data?.id || 'unknown';
    logStep("Email sent successfully", { resendId });

    // Log the email
    await supabase.from("email_logs").insert({
      user_id: userId || null,
      recipient_email: email,
      recipient_name: userName,
      email_type: "birthday",
      subject: `Feliz Aniversário, ${displayName}!`,
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
