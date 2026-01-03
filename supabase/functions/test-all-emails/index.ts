import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  testEmail: string;
  testName?: string;
}

const year = new Date().getFullYear();

// Simplified footer - less promotional
const getEmailFooter = () => `
  <tr>
    <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        Plano de Vida - ${year}
      </p>
      <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 11px;">
        Este é um email de teste do sistema.
      </p>
      <p style="margin: 10px 0 0 0;">
        <a href="https://planodevida.io/configuracoes" style="color: #6b7280; font-size: 11px; text-decoration: underline;">
          Preferências
        </a>
        <span style="color: #d1d5db; margin: 0 5px;">|</span>
        <a href="mailto:contato@planodevida.io" style="color: #6b7280; font-size: 11px; text-decoration: underline;">
          Contato
        </a>
      </p>
    </td>
  </tr>
`;

// Simple, clean transactional wrapper - avoids promotional signals
const generateEmailWrapper = (headerColor: string, headerTitle: string, content: string) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f9fafb;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 30px 20px;">
      <tr>
        <td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb;">
            <tr>
              <td style="background-color: ${headerColor}; padding: 24px 30px; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">
                  ${headerTitle}
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px;">
                ${content}
              </td>
            </tr>
            ${getEmailFooter()}
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

// Simple text link instead of promotional button
const getSimpleLink = (url: string, text: string) => `
  <p style="margin: 20px 0;">
    <a href="${url}" style="color: #2A8C68; text-decoration: underline; font-weight: 500;">${text}</a>
  </p>
`;

// All email templates - optimized for inbox delivery (not promotions)
const emailTemplates = {
  // 1. Welcome Email Basic
  welcome_basic: (name: string) => ({
    subject: "[TESTE] Sua conta foi ativada - Plano de Vida",
    html: generateEmailWrapper(
      "#2A8C68",
      "Plano de Vida",
      `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Olá ${name},
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          Sua conta no Plano de Vida foi ativada com sucesso. Você agora tem acesso ao Plano Basic.
        </p>
        <p style="margin: 0 0 12px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Recursos disponíveis:
        </p>
        <ul style="margin: 0 0 16px 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
          <li>1 Plano Individual</li>
          <li>Planejamento das 7 Áreas</li>
          <li>Exportação em PDF</li>
        </ul>
        ${getSimpleLink("https://planodevida.io/cadastro", "Acessar minha conta")}
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
          Atenciosamente,<br>Equipe Plano de Vida
        </p>
      `
    )
  }),

  // 2. Welcome Email Premium
  welcome_premium: (name: string) => ({
    subject: "[TESTE] Sua conta Premium foi ativada - Plano de Vida",
    html: generateEmailWrapper(
      "#2A8C68",
      "Plano de Vida",
      `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Olá ${name},
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          Sua conta Premium no Plano de Vida foi ativada com sucesso.
        </p>
        <p style="margin: 0 0 12px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Recursos disponíveis no Premium:
        </p>
        <ul style="margin: 0 0 16px 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
          <li>1 Plano Familiar</li>
          <li>3 Planos para Filhos</li>
          <li>Resumo Inteligente com IA</li>
          <li>Relatórios de Progresso</li>
          <li>Notificações Personalizadas</li>
        </ul>
        ${getSimpleLink("https://planodevida.io/cadastro", "Acessar minha conta")}
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
          Atenciosamente,<br>Equipe Plano de Vida
        </p>
      `
    )
  }),

  // 3. Account Confirmation
  account_confirmation: (name: string) => ({
    subject: "[TESTE] Confirme seu email - Plano de Vida",
    html: generateEmailWrapper(
      "#2A8C68",
      "Confirme seu Email",
      `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Olá ${name},
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          Para concluir seu cadastro no Plano de Vida, confirme seu endereço de email clicando no link abaixo:
        </p>
        ${getSimpleLink("#", "Confirmar meu email")}
        <p style="margin: 16px 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
          Se você não criou uma conta, pode ignorar este email.
        </p>
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
          Atenciosamente,<br>Equipe Plano de Vida
        </p>
      `
    )
  }),

  // 4. Password Reset
  password_reset: (name: string) => ({
    subject: "[TESTE] Redefinição de senha - Plano de Vida",
    html: generateEmailWrapper(
      "#2A8C68",
      "Redefinição de Senha",
      `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Olá ${name},
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          Recebemos uma solicitação para redefinir a senha da sua conta no Plano de Vida.
        </p>
        ${getSimpleLink("#", "Redefinir minha senha")}
        <p style="margin: 16px 0; color: #6b7280; font-size: 13px; line-height: 1.5; background: #fef3c7; padding: 12px; border-radius: 6px;">
          Este link expira em 1 hora. Se você não solicitou esta redefinição, ignore este email.
        </p>
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
          Atenciosamente,<br>Equipe Plano de Vida
        </p>
      `
    )
  }),

  // 5. Magic Link
  magic_link: (name: string) => ({
    subject: "[TESTE] Seu link de acesso - Plano de Vida",
    html: generateEmailWrapper(
      "#2A8C68",
      "Link de Acesso",
      `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Olá ${name},
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          Use o link abaixo para acessar sua conta no Plano de Vida:
        </p>
        ${getSimpleLink("#", "Acessar minha conta")}
        <p style="margin: 16px 0; color: #6b7280; font-size: 13px; line-height: 1.5; background: #fef3c7; padding: 12px; border-radius: 6px;">
          Este link expira em 1 hora.
        </p>
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
          Atenciosamente,<br>Equipe Plano de Vida
        </p>
      `
    )
  }),

  // 6. Check-in Reminder
  reminder_check_in: (name: string) => ({
    subject: "[TESTE] Atualize seu progresso - Plano de Vida",
    html: generateEmailWrapper(
      "#2A8C68",
      "Atualização de Metas",
      `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Olá ${name},
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          É hora de revisar suas metas no Plano de Vida. Manter o acompanhamento regular ajuda a alcançar seus objetivos.
        </p>
        <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">
          <strong>Meta em destaque:</strong> Ler 12 livros este ano
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px;">
          <strong>Plano:</strong> Meu Plano Individual
        </p>
        ${getSimpleLink("https://planodevida.io", "Acessar meu plano")}
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
          Atenciosamente,<br>Equipe Plano de Vida
        </p>
      `
    )
  }),

  // 7. Deadline Reminder
  reminder_deadline: (name: string) => ({
    subject: "[TESTE] Meta com prazo próximo - Plano de Vida",
    html: generateEmailWrapper(
      "#2A8C68",
      "Prazo Próximo",
      `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Olá ${name},
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          Uma das suas metas está próxima do prazo final.
        </p>
        <div style="background: #fef3c7; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">
            <strong>Meta:</strong> Economizar R$ 10.000
          </p>
          <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">
            <strong>Prazo:</strong> 31 de Dezembro de 2024
          </p>
          <p style="margin: 0; color: #374151; font-size: 14px;">
            <strong>Plano:</strong> Plano Financeiro
          </p>
        </div>
        ${getSimpleLink("https://planodevida.io", "Ver meta")}
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
          Atenciosamente,<br>Equipe Plano de Vida
        </p>
      `
    )
  }),

  // 8. Annual Review
  reminder_annual_review: (name: string) => ({
    subject: "[TESTE] Hora do balanço anual - Plano de Vida",
    html: generateEmailWrapper(
      "#2A8C68",
      "Balanço Anual",
      `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Olá ${name},
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          O final do ano está chegando. É um bom momento para revisar seu Plano de Vida e fazer um balanço das suas conquistas.
        </p>
        <p style="margin: 0 0 12px 0; color: #4b5563; font-size: 14px;">
          O que você pode fazer agora:
        </p>
        <ul style="margin: 0 0 16px 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
          <li>Revisar suas conquistas do ano</li>
          <li>Identificar áreas que precisam de atenção</li>
          <li>Planejar objetivos para o próximo ano</li>
        </ul>
        ${getSimpleLink("https://planodevida.io/balanco", "Fazer meu balanço")}
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
          Atenciosamente,<br>Equipe Plano de Vida
        </p>
      `
    )
  }),

  // 9. Goal Completed
  reminder_goal_completed: (name: string) => ({
    subject: "[TESTE] Meta concluída - Plano de Vida",
    html: generateEmailWrapper(
      "#2A8C68",
      "Meta Concluída",
      `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Olá ${name},
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          Parabéns! Você concluiu mais uma meta no seu Plano de Vida.
        </p>
        <div style="background: #d1fae5; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 0; color: #065f46; font-size: 14px;">
            <strong>Meta concluída:</strong> Correr uma maratona
          </p>
        </div>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Cada meta concluída é um passo em direção aos seus objetivos. Continue assim!
        </p>
        ${getSimpleLink("https://planodevida.io", "Ver minhas conquistas")}
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
          Atenciosamente,<br>Equipe Plano de Vida
        </p>
      `
    )
  }),

  // 10. New Goal Added
  reminder_new_goal: (name: string) => ({
    subject: "[TESTE] Nova meta registrada - Plano de Vida",
    html: generateEmailWrapper(
      "#2A8C68",
      "Nova Meta",
      `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Olá ${name},
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          Uma nova meta foi adicionada ao seu Plano de Vida.
        </p>
        <div style="background: #dbeafe; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            <strong>Nova meta:</strong> Aprender um novo idioma
          </p>
        </div>
        ${getSimpleLink("https://planodevida.io", "Ver minha meta")}
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
          Atenciosamente,<br>Equipe Plano de Vida
        </p>
      `
    )
  }),

  // 11. Subscription Expiry Reminder
  subscription_expiry: (name: string) => ({
    subject: "[TESTE] Renovação da assinatura em 3 dias - Plano de Vida",
    html: generateEmailWrapper(
      "#2A8C68",
      "Renovação de Assinatura",
      `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Olá ${name},
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          Sua assinatura do Plano Premium será renovada automaticamente em 3 dias.
        </p>
        <div style="background: #f3f4f6; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
          <p style="margin: 0; color: #374151; font-size: 14px;">
            <strong>Data de renovação:</strong> 31 de Dezembro de 2024
          </p>
        </div>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Se deseja continuar com seu plano, não é necessário fazer nada. A renovação acontecerá automaticamente.
        </p>
        ${getSimpleLink("https://planodevida.io/conta", "Gerenciar assinatura")}
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
          Atenciosamente,<br>Equipe Plano de Vida
        </p>
      `
    )
  }),

  // 12. PDF Share - Clean but professional
  pdf_share: (name: string) => ({
    subject: "[TESTE] Anderson Reis compartilhou um plano com voce",
    html: generateEmailWrapper(
      "#2A8C68",
      "Plano Compartilhado",
      `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Ola ${name},
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          Anderson Reis compartilhou um Plano de Vida com voce.
        </p>
        <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">
          <strong>Plano:</strong> Meu Plano de Vida 2024
        </p>
        <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 13px;">
          Mensagem: "Da uma olhada no meu plano!"
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px;">
          O arquivo PDF esta anexado a este email.
        </p>
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
          Atenciosamente,<br>Equipe Plano de Vida
        </p>
      `
    )
  }),

  // 13. Plan Summary - Clean but professional
  plan_summary: (name: string) => ({
    subject: "[TESTE] Resumo do seu plano",
    html: generateEmailWrapper(
      "#2A8C68",
      "Resumo do Plano",
      `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Ola ${name},
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          Aqui esta o resumo do seu Plano de Vida.
        </p>
        <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px;">
          <strong>Progresso:</strong> 65% (13 de 20 metas)
        </p>
        <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 13px;">Metas por area:</p>
        <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
          Espiritual: 2 | Intelectual: 3 | Familiar: 2 | Financeiro: 4 | Profissional: 3 | Saude: 4 | Social: 2
        </p>
        ${getSimpleLink("https://planodevida.io", "Acessar meu plano")}
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
          Atenciosamente,<br>Equipe Plano de Vida
        </p>
      `
    )
  }),

  // 14. Wedding Anniversary
  wedding_anniversary: (name: string) => ({
    subject: "[TESTE] Feliz 5º Aniversário de Casamento! - Plano de Vida",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #f9a8d4 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
        Feliz Aniversário de Casamento!
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
        5 anos de uma linda jornada juntos
      </p>
    </div>
    <div style="padding: 35px 30px;">
      <p style="color: #1f2937; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
        Olá, <strong>${name}</strong>!
      </p>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 25px 0;">
        Hoje, <strong>15 de março</strong>, celebramos mais um ano do seu casamento! 
        Que Deus continue abençoando sua união com muito amor, paz e cumplicidade.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); padding: 20px 40px; border-radius: 16px; border: 2px solid #f9a8d4;">
          <div style="font-size: 48px; font-weight: 700; color: #db2777;">5</div>
          <div style="font-size: 14px; color: #9d174d; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Anos de Casados</div>
        </div>
      </div>
      <div style="background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%); border-left: 4px solid #d946ef; padding: 20px 25px; margin: 25px 0; border-radius: 0 12px 12px 0;">
        <p style="color: #6b21a8; font-size: 16px; font-style: italic; margin: 0 0 10px 0; line-height: 1.6;">
          "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha."
        </p>
        <p style="color: #9333ea; font-size: 13px; font-weight: 600; margin: 0; text-align: right;">
          — 1 Coríntios 13:4
        </p>
      </div>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 25px 0;">
        Continue construindo seus sonhos juntos através do seu plano de vida. 
        Cada meta alcançada em família é uma vitória compartilhada!
      </p>
    </div>
    <div style="background-color: #fdf4ff; padding: 25px 30px; text-align: center; border-top: 1px solid #f3e8ff;">
      <p style="color: #7c3aed; font-size: 13px; margin: 0;">
        Com carinho,<br><strong>Equipe Plano de Vida</strong>
      </p>
    </div>
  </div>
</body>
</html>
    `
  }),

  // 15. Birthday
  birthday: (name: string) => ({
    subject: "[TESTE] Feliz Aniversário! - Plano de Vida",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
        Feliz Aniversário!
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
        Que este novo ciclo seja repleto de conquistas
      </p>
    </div>
    <div style="padding: 35px 30px;">
      <p style="color: #1f2937; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
        Olá, <strong>${name}</strong>!
      </p>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 25px 0;">
        Hoje é um dia especial! Celebramos mais um ano da sua vida e desejamos que Deus te abençoe com saúde, paz e realizações.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); padding: 25px 45px; border-radius: 16px; border: 2px solid #c4b5fd;">
          <div style="font-size: 42px; margin-bottom: 5px;">🎂</div>
          <div style="font-size: 18px; color: #6d28d9; font-weight: 600;">Parabéns!</div>
        </div>
      </div>
      <div style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border-left: 4px solid #8b5cf6; padding: 20px 25px; margin: 25px 0; border-radius: 0 12px 12px 0;">
        <p style="color: #5b21b6; font-size: 16px; font-style: italic; margin: 0 0 10px 0; line-height: 1.6;">
          "O Senhor te abençoe e te guarde; o Senhor faça resplandecer o seu rosto sobre ti e te conceda graça."
        </p>
        <p style="color: #7c3aed; font-size: 13px; font-weight: 600; margin: 0; text-align: right;">
          — Números 6:24-25
        </p>
      </div>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 25px 0;">
        Que tal aproveitar este novo ano para revisar suas metas e sonhos? Seu Plano de Vida está esperando por você!
      </p>
      ${getSimpleLink("https://planodevida.io", "Acessar meu plano")}
    </div>
    <div style="background-color: #f5f3ff; padding: 25px 30px; text-align: center; border-top: 1px solid #ede9fe;">
      <p style="color: #6d28d9; font-size: 13px; margin: 0;">
        Com carinho,<br><strong>Equipe Plano de Vida</strong>
      </p>
    </div>
  </div>
</body>
</html>
    `
  }),

  // 16. Happy New Year
  happy_new_year: (name: string) => ({
    subject: "[TESTE] Feliz Ano Novo! - Plano de Vida",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
        Feliz Ano Novo ${year}!
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
        Um novo ciclo de conquistas começa agora
      </p>
    </div>
    <div style="padding: 35px 30px;">
      <p style="color: #1f2937; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
        Olá, <strong>${name}</strong>!
      </p>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 25px 0;">
        Que este novo ano seja repleto de bênçãos, realizações e momentos especiais ao lado de quem você ama!
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px 40px; border-radius: 16px; border: 2px solid #fbbf24;">
          <div style="font-size: 48px; font-weight: 700; color: #b45309;">${year}</div>
          <div style="font-size: 14px; color: #92400e; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Novo Ano, Novas Metas</div>
        </div>
      </div>
      <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-left: 4px solid #f59e0b; padding: 20px 25px; margin: 25px 0; border-radius: 0 12px 12px 0;">
        <p style="color: #92400e; font-size: 16px; font-style: italic; margin: 0 0 10px 0; line-height: 1.6;">
          "Eis que faço coisa nova, e agora ela brotará; porventura não a percebereis?"
        </p>
        <p style="color: #b45309; font-size: 13px; font-weight: 600; margin: 0; text-align: right;">
          — Isaías 43:19
        </p>
      </div>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 25px 0;">
        É hora de atualizar seu Plano de Vida e definir as metas para este novo ano. Cada sonho merece um plano!
      </p>
      ${getSimpleLink("https://planodevida.io", "Atualizar meu plano")}
    </div>
    <div style="background-color: #fffbeb; padding: 25px 30px; text-align: center; border-top: 1px solid #fef3c7;">
      <p style="color: #b45309; font-size: 13px; margin: 0;">
        Com carinho,<br><strong>Equipe Plano de Vida</strong>
      </p>
    </div>
  </div>
</body>
</html>
    `
  }),

  // 17. Christmas
  christmas: (name: string) => ({
    subject: "[TESTE] Feliz Natal! - Plano de Vida",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
        Feliz Natal!
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
        Celebrando o amor que nasceu para nos salvar
      </p>
    </div>
    <div style="padding: 35px 30px;">
      <p style="color: #1f2937; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
        Olá, <strong>${name}</strong>!
      </p>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 25px 0;">
        Desejamos a você e sua família um Natal abençoado, cheio de paz, amor e momentos especiais ao lado de quem você ama.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%); padding: 25px 45px; border-radius: 16px; border: 2px solid #fca5a5;">
          <div style="font-size: 42px; margin-bottom: 5px;">🎄</div>
          <div style="font-size: 18px; color: #b91c1c; font-weight: 600;">Feliz Natal!</div>
        </div>
      </div>
      <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 4px solid #dc2626; padding: 20px 25px; margin: 25px 0; border-radius: 0 12px 12px 0;">
        <p style="color: #991b1b; font-size: 16px; font-style: italic; margin: 0 0 10px 0; line-height: 1.6;">
          "Porque um menino nos nasceu, um filho nos foi dado, e o governo está sobre os seus ombros."
        </p>
        <p style="color: #b91c1c; font-size: 13px; font-weight: 600; margin: 0; text-align: right;">
          — Isaías 9:6
        </p>
      </div>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 25px 0;">
        Que o verdadeiro espírito do Natal renove sua fé e esperança. Aproveite para refletir sobre suas conquistas e agradecer por cada bênção!
      </p>
    </div>
    <div style="background-color: #fef2f2; padding: 25px 30px; text-align: center; border-top: 1px solid #fecaca;">
      <p style="color: #b91c1c; font-size: 13px; margin: 0;">
        Com carinho,<br><strong>Equipe Plano de Vida</strong>
      </p>
    </div>
  </div>
</body>
</html>
    `
  }),

  // 18. Easter
  easter: (name: string) => ({
    subject: "[TESTE] Feliz Páscoa! - Plano de Vida",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
        Feliz Páscoa!
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
        Celebrando a ressurreição e a vida nova
      </p>
    </div>
    <div style="padding: 35px 30px;">
      <p style="color: #1f2937; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
        Olá, <strong>${name}</strong>!
      </p>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 25px 0;">
        Nesta Páscoa, celebramos a vitória da vida sobre a morte e a esperança que renova nossos corações. Que este tempo seja de reflexão e renovação para você e sua família.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); padding: 25px 45px; border-radius: 16px; border: 2px solid #6ee7b7;">
          <div style="font-size: 42px; margin-bottom: 5px;">✝️</div>
          <div style="font-size: 18px; color: #047857; font-weight: 600;">Ele Vive!</div>
        </div>
      </div>
      <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 4px solid #10b981; padding: 20px 25px; margin: 25px 0; border-radius: 0 12px 12px 0;">
        <p style="color: #065f46; font-size: 16px; font-style: italic; margin: 0 0 10px 0; line-height: 1.6;">
          "Eu sou a ressurreição e a vida. Aquele que crê em mim, ainda que morra, viverá."
        </p>
        <p style="color: #047857; font-size: 13px; font-weight: 600; margin: 0; text-align: right;">
          — João 11:25
        </p>
      </div>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.7; margin: 25px 0;">
        Assim como a Páscoa representa renovação, que tal renovar suas metas e sonhos no seu Plano de Vida?
      </p>
      ${getSimpleLink("https://planodevida.io", "Acessar meu plano")}
    </div>
    <div style="background-color: #ecfdf5; padding: 25px 30px; text-align: center; border-top: 1px solid #d1fae5;">
      <p style="color: #047857; font-size: 13px; margin: 0;">
        Com carinho,<br><strong>Equipe Plano de Vida</strong>
      </p>
    </div>
  </div>
</body>
</html>
    `
  }),

  // 19. Annual Report
  annual_report: (name: string) => ({
    subject: "[TESTE] Seu Relatório Anual - Plano de Vida",
    html: generateEmailWrapper(
      "#2A8C68",
      "Relatório Anual ${year - 1}",
      `
        <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">
          Olá ${name},
        </p>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
          Aqui está o resumo das suas conquistas em ${year - 1}!
        </p>
        <div style="background: #d1fae5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0; color: #065f46; font-size: 24px; font-weight: bold; text-align: center;">
            75%
          </p>
          <p style="margin: 0; color: #047857; font-size: 14px; text-align: center;">
            15 de 20 metas concluídas
          </p>
        </div>
        <p style="margin: 0 0 12px 0; color: #4b5563; font-size: 14px;">
          <strong>Destaques por área:</strong>
        </p>
        <ul style="margin: 0 0 16px 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
          <li>Espiritual: 3/3 (100%)</li>
          <li>Intelectual: 2/3 (67%)</li>
          <li>Familiar: 3/3 (100%)</li>
          <li>Social: 2/3 (67%)</li>
          <li>Financeiro: 2/3 (67%)</li>
          <li>Profissional: 2/3 (67%)</li>
          <li>Saúde: 1/2 (50%)</li>
        </ul>
        <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
          Parabéns pelas conquistas! Seu plano foi atualizado para ${year}. Continue construindo sua história!
        </p>
        ${getSimpleLink("https://planodevida.io", "Ver meu plano atualizado")}
        <p style="margin: 20px 0 0 0; color: #4b5563; font-size: 14px;">
          Atenciosamente,<br>Equipe Plano de Vida
        </p>
      `
    )
  }),
};

const handler = async (req: Request): Promise<Response> => {
  console.log("[TEST-ALL-EMAILS] Function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { testEmail, testName = "Anderson" }: TestEmailRequest = await req.json();

    if (!testEmail) {
      return new Response(
        JSON.stringify({ error: "testEmail is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[TEST-ALL-EMAILS] Sending all test emails to: ${testEmail}`);

    const results: { type: string; success: boolean; error?: string }[] = [];
    const templateKeys = Object.keys(emailTemplates) as (keyof typeof emailTemplates)[];

    for (const templateKey of templateKeys) {
      const template = emailTemplates[templateKey](testName);
      
      try {
        const emailResponse = await resend.emails.send({
          from: "Plano de Vida <contato@planodevida.io>",
          to: [testEmail],
          subject: template.subject,
          html: template.html,
        });

        if (emailResponse.error) {
          results.push({ type: templateKey, success: false, error: emailResponse.error.message });
          console.log(`[TEST-ALL-EMAILS] Error sending ${templateKey}:`, emailResponse.error);
        } else {
          results.push({ type: templateKey, success: true });
          console.log(`[TEST-ALL-EMAILS] Sent ${templateKey} successfully`);
          
          // Log to database
          await supabaseClient.from('email_logs').insert({
            recipient_email: testEmail,
            recipient_name: testName,
            email_type: `test_${templateKey}`,
            subject: template.subject,
            status: 'sent',
            resend_id: emailResponse.data?.id,
            metadata: { test: true },
          });
        }

        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        results.push({ type: templateKey, success: false, error: error.message });
        console.log(`[TEST-ALL-EMAILS] Error sending ${templateKey}:`, error.message);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`[TEST-ALL-EMAILS] Complete: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${successCount} emails to ${testEmail}`,
        totalEmails: templateKeys.length,
        successCount,
        failCount,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[TEST-ALL-EMAILS] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
