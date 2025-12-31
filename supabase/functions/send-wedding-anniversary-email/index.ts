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
  console.log(`[WEDDING-ANNIVERSARY-EMAIL] ${step}${detailsStr}`);
};

// Biblical verses about marriage and love
const weddingVerses = [
  {
    verse: "Portanto, o que Deus ajuntou não separe o homem.",
    reference: "Marcos 10:9"
  },
  {
    verse: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.",
    reference: "1 Coríntios 13:4"
  },
  {
    verse: "Maridos, amem suas mulheres, assim como Cristo amou a igreja e entregou-se por ela.",
    reference: "Efésios 5:25"
  },
  {
    verse: "Acima de tudo, porém, revistam-se do amor, que é o elo perfeito.",
    reference: "Colossenses 3:14"
  },
  {
    verse: "Melhor é serem dois do que um, porque têm melhor paga do seu trabalho.",
    reference: "Eclesiastes 4:9"
  },
  {
    verse: "Onde estiver o teu tesouro, aí também estará o teu coração.",
    reference: "Mateus 6:21"
  },
  {
    verse: "A mulher virtuosa é a coroa de seu marido.",
    reference: "Provérbios 12:4"
  },
  {
    verse: "O amor jamais acaba.",
    reference: "1 Coríntios 13:8"
  }
];

function getRandomVerse() {
  return weddingVerses[Math.floor(Math.random() * weddingVerses.length)];
}

function calculateYearsMarried(weddingDate: Date): number {
  const today = new Date();
  const years = today.getFullYear() - weddingDate.getFullYear();
  return years;
}

interface WeddingAnniversaryRequest {
  userId: string;
  email: string;
  memberName: string;
  weddingDate: string;
  planTitle: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { userId, email, memberName, weddingDate, planTitle }: WeddingAnniversaryRequest = await req.json();

    if (!email || !weddingDate) {
      throw new Error("Email and wedding date are required");
    }

    const weddingDateObj = new Date(weddingDate);
    const yearsMarried = calculateYearsMarried(weddingDateObj);
    const verse = getRandomVerse();
    const formattedDate = weddingDateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

    logStep("Sending anniversary email", { email, yearsMarried, memberName });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
        💒 Feliz Aniversário de Casamento! 💍
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
        ${yearsMarried} ${yearsMarried === 1 ? 'ano' : 'anos'} de uma linda jornada juntos
      </p>
    </div>
    
    <!-- Content -->
    <div style="padding: 35px 30px;">
      <p style="color: #1f2937; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
        Olá${memberName ? `, <strong>${memberName}</strong>` : ''}! 👋
      </p>
      
      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 25px 0;">
        Hoje, <strong>${formattedDate}</strong>, celebramos mais um ano do seu casamento! 
        Que Deus continue abençoando sua união com muito amor, paz e cumplicidade.
      </p>
      
      <!-- Anniversary Years Badge -->
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); padding: 20px 40px; border-radius: 16px; border: 2px solid #f9a8d4;">
          <div style="font-size: 48px; font-weight: 700; color: #db2777;">
            ${yearsMarried}
          </div>
          <div style="font-size: 14px; color: #9d174d; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            ${yearsMarried === 1 ? 'Ano de Casados' : 'Anos de Casados'}
          </div>
        </div>
      </div>

      <!-- Bible Verse -->
      <div style="background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%); border-left: 4px solid #d946ef; padding: 20px 25px; margin: 25px 0; border-radius: 0 12px 12px 0;">
        <p style="color: #6b21a8; font-size: 16px; font-style: italic; margin: 0 0 10px 0; line-height: 1.6;">
          "${verse.verse}"
        </p>
        <p style="color: #9333ea; font-size: 13px; font-weight: 600; margin: 0; text-align: right;">
          — ${verse.reference}
        </p>
      </div>
      
      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 25px 0;">
        Continue construindo seus sonhos juntos através do seu plano de vida "<strong>${planTitle || 'Plano Familiar'}</strong>". 
        Cada meta alcançada em família é uma vitória compartilhada!
      </p>
      
      <!-- CTA -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://app.planosdevida.com/consulta" 
           style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #d946ef 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 10px; font-weight: 600; font-size: 15px;">
          Ver nosso plano de vida
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #fdf4ff; padding: 25px 30px; text-align: center; border-top: 1px solid #f3e8ff;">
      <p style="color: #7c3aed; font-size: 13px; margin: 0;">
        Com carinho,<br>
        <strong>Equipe Planos de Vida</strong>
      </p>
      <p style="color: #a78bfa; font-size: 11px; margin: 15px 0 0 0;">
        Você recebeu este email porque tem um plano familiar cadastrado.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Planos de Vida <contato@planodevida.io>",
      to: [email],
      subject: `💒 Feliz ${yearsMarried}º Aniversário de Casamento! 💍`,
      html: emailHtml,
    });

    logStep("Email sent successfully", { emailResponse });

    // Log the email
    await supabaseClient.from('email_logs').insert({
      user_id: userId || null,
      recipient_email: email,
      recipient_name: memberName || null,
      email_type: 'wedding_anniversary',
      subject: `Feliz ${yearsMarried}º Aniversário de Casamento!`,
      status: 'sent',
      resend_id: emailResponse.data?.id || null,
      metadata: { years_married: yearsMarried, wedding_date: weddingDate, plan_title: planTitle }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      yearsMarried 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
