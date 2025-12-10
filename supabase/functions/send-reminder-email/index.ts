import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(params: { from: string; to: string[]; subject: string; html: string }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }
  
  return response.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderEmailRequest {
  to: string;
  userName: string;
  reminderType: 'check_in' | 'deadline' | 'annual_review';
  goalTitle?: string;
  planTitle?: string;
  dueDate?: string;
}

const getEmailContent = (request: ReminderEmailRequest) => {
  const { reminderType, userName, goalTitle, planTitle, dueDate } = request;

  switch (reminderType) {
    case 'check_in':
      return {
        subject: 'Hora de atualizar seu progresso! - Plano de Vida',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
              .button { display: inline-block; background: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 600; }
              .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Hora do Check-in!</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${userName}</strong>,</p>
              <p>É hora de atualizar o progresso das suas metas no seu Plano de Vida!</p>
              ${goalTitle ? `<p>Meta em destaque: <strong>${goalTitle}</strong></p>` : ''}
              ${planTitle ? `<p>Plano: <strong>${planTitle}</strong></p>` : ''}
              <p>Manter o acompanhamento regular é essencial para alcançar seus objetivos.</p>
              <a href="https://plano-de-vida.lovable.app" class="button">Acessar meu Plano</a>
            </div>
            <div class="footer">
              <p>Plano de Vida - Seu parceiro no planejamento pessoal</p>
            </div>
          </body>
          </html>
        `,
      };

    case 'deadline':
      return {
        subject: 'Meta próxima do vencimento! - Plano de Vida',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
              .alert { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; }
              .button { display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 600; }
              .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Atenção: Prazo Próximo!</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${userName}</strong>,</p>
              <div class="alert">
                <strong>Uma meta está próxima do vencimento!</strong>
              </div>
              ${goalTitle ? `<p>Meta: <strong>${goalTitle}</strong></p>` : ''}
              ${dueDate ? `<p>Prazo: <strong>${dueDate}</strong></p>` : ''}
              ${planTitle ? `<p>Plano: <strong>${planTitle}</strong></p>` : ''}
              <p>Não deixe para última hora! Acesse seu plano e verifique o que precisa ser feito.</p>
              <a href="https://plano-de-vida.lovable.app" class="button">Ver Meta</a>
            </div>
            <div class="footer">
              <p>Plano de Vida - Seu parceiro no planejamento pessoal</p>
            </div>
          </body>
          </html>
        `,
      };

    case 'annual_review':
      return {
        subject: 'É hora do seu Balanço Anual! - Plano de Vida',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; }
              .highlight { background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
              .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 600; }
              .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Balanço Anual</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${userName}</strong>,</p>
              <div class="highlight">
                <h2>É hora de fazer seu balanço anual!</h2>
              </div>
              <p>O fim do ano está chegando e é o momento perfeito para:</p>
              <ul>
                <li>Revisar suas conquistas do ano</li>
                <li>Identificar áreas que precisam de mais atenção</li>
                <li>Planejar seus objetivos para o próximo ano</li>
              </ul>
              <p>Acesse a tela de Balanço para fazer sua análise completa.</p>
              <a href="https://plano-de-vida.lovable.app/balanco" class="button">Fazer meu Balanço</a>
            </div>
            <div class="footer">
              <p>Plano de Vida - Seu parceiro no planejamento pessoal</p>
            </div>
          </body>
          </html>
        `,
      };

    default:
      return {
        subject: 'Lembrete - Plano de Vida',
        html: `<p>Olá ${userName}, você tem um lembrete no seu Plano de Vida!</p>`,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-reminder-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: ReminderEmailRequest = await req.json();
    console.log("Received request:", JSON.stringify(request, null, 2));

    const { to, reminderType, userName } = request;

    if (!to || !reminderType || !userName) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, reminderType, userName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, html } = getEmailContent(request);

    console.log(`Sending ${reminderType} email to ${to}`);

    const emailResponse = await sendEmail({
      from: "Plano de Vida <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-reminder-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
