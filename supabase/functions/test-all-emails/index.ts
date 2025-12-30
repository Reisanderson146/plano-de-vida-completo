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

const getEmailFooter = () => `
  <tr>
    <td style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #9ca3af; font-size: 13px;">
        © ${year} Plano de Vida. Todos os direitos reservados.
      </p>
      <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
        Este é um email de TESTE.
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

const generateEmailWrapper = (headerGradient: string, headerTitle: string, headerSubtitle: string, content: string) => `
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
              <td style="background: ${headerGradient}; padding: 40px 30px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                  ${headerTitle}
                </h1>
                <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                  ${headerSubtitle}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px;">
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

// All email templates
const emailTemplates = {
  // 1. Welcome Email (after subscription)
  welcome_basic: (name: string) => ({
    subject: "🎉 [TESTE] Bem-vindo ao Plano de Vida - Plano Basic!",
    html: generateEmailWrapper(
      "linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%)",
      "🎉 Bem-vindo ao Plano de Vida!",
      "Sua jornada de transformação começa agora",
      `
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
          Olá, <strong>${name}</strong>! 👋
        </p>
        <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
          É com muita alegria que recebemos você na nossa comunidade! Sua assinatura do 
          <strong style="color: #2A8C68;">Plano Basic</strong> foi ativada com sucesso.
        </p>
        <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 25px 0;">
          <p style="margin: 0 0 10px 0; color: #166534; font-weight: 600; font-size: 14px;">
            ✨ O que você tem acesso no Plano Basic:
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
            <li>1 Plano Individual</li>
            <li>Planejamento das 7 Áreas</li>
            <li>Exportação em PDF</li>
            <li>Dados Seguros na Nuvem</li>
          </ul>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
          <tr>
            <td align="center">
              <a href="https://planodevida.io/cadastro" style="display: inline-block; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(42, 140, 104, 0.4);">
                Criar meu Plano de Vida →
              </a>
            </td>
          </tr>
        </table>
        <p style="margin: 25px 0 0 0; color: #374151; font-size: 15px;">
          Com carinho,<br>
          <strong>Equipe Plano de Vida</strong> 🌱
        </p>
      `
    )
  }),

  welcome_premium: (name: string) => ({
    subject: "🎉 [TESTE] Bem-vindo ao Plano de Vida - Plano Premium!",
    html: generateEmailWrapper(
      "linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%)",
      "🎉 Bem-vindo ao Plano de Vida!",
      "Sua jornada de transformação começa agora",
      `
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
          Olá, <strong>${name}</strong>! 👋
        </p>
        <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
          É com muita alegria que recebemos você na nossa comunidade! Sua assinatura do 
          <strong style="color: #2A8C68;">Plano Premium</strong> foi ativada com sucesso.
        </p>
        <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 25px 0;">
          <p style="margin: 0 0 10px 0; color: #166534; font-weight: 600; font-size: 14px;">
            ✨ O que você tem acesso no Plano Premium:
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
            <li>1 Plano Individual</li>
            <li>1 Plano Familiar</li>
            <li>2 Planos para Filhos</li>
            <li>🤖 Resumo Inteligente com IA</li>
            <li>📊 Relatórios de Progresso</li>
            <li>📧 Lembretes por Email</li>
          </ul>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
          <tr>
            <td align="center">
              <a href="https://planodevida.io/cadastro" style="display: inline-block; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(42, 140, 104, 0.4);">
                Criar meu Plano de Vida →
              </a>
            </td>
          </tr>
        </table>
        <p style="margin: 25px 0 0 0; color: #374151; font-size: 15px;">
          Com carinho,<br>
          <strong>Equipe Plano de Vida</strong> 🌱
        </p>
      `
    )
  }),

  // 2. Account Confirmation
  account_confirmation: (name: string) => ({
    subject: "✉️ [TESTE] Confirme seu email - Plano de Vida",
    html: generateEmailWrapper(
      "linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%)",
      "✉️ Confirme seu Email",
      "Bem-vindo ao Plano de Vida!",
      `
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
          Olá, <strong>${name}</strong>! 👋
        </p>
        <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
          Você está a um passo de começar sua jornada no <strong style="color: #2A8C68;">Plano de Vida</strong>! Clique no botão abaixo para confirmar seu email.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
          <tr>
            <td align="center">
              <a href="#" style="display: inline-block; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(42, 140, 104, 0.4);">
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
        <p style="margin: 25px 0 0 0; color: #374151; font-size: 15px;">
          Com carinho,<br>
          <strong>Equipe Plano de Vida</strong> 🌱
        </p>
      `
    )
  }),

  // 3. Password Reset
  password_reset: (name: string) => ({
    subject: "🔐 [TESTE] Recuperação de Senha - Plano de Vida",
    html: generateEmailWrapper(
      "linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%)",
      "🔐 Recuperação de Senha",
      "Plano de Vida",
      `
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
          Olá, <strong>${name}</strong>! 👋
        </p>
        <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
          Recebemos uma solicitação para redefinir a senha da sua conta no <strong style="color: #2A8C68;">Plano de Vida</strong>.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
          <tr>
            <td align="center">
              <a href="#" style="display: inline-block; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(42, 140, 104, 0.4);">
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
        <p style="margin: 25px 0 0 0; color: #374151; font-size: 15px;">
          Com carinho,<br>
          <strong>Equipe Plano de Vida</strong> 🌱
        </p>
      `
    )
  }),

  // 4. Magic Link
  magic_link: (name: string) => ({
    subject: "🔗 [TESTE] Seu link de acesso - Plano de Vida",
    html: generateEmailWrapper(
      "linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%)",
      "🔗 Link de Acesso",
      "Plano de Vida",
      `
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
          Olá, <strong>${name}</strong>! 👋
        </p>
        <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
          Clique no botão abaixo para acessar sua conta no <strong style="color: #2A8C68;">Plano de Vida</strong>.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
          <tr>
            <td align="center">
              <a href="#" style="display: inline-block; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(42, 140, 104, 0.4);">
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
        <p style="margin: 25px 0 0 0; color: #374151; font-size: 15px;">
          Com carinho,<br>
          <strong>Equipe Plano de Vida</strong> 🌱
        </p>
      `
    )
  }),

  // 5. Check-in Reminder
  reminder_check_in: (name: string) => ({
    subject: "📊 [TESTE] Hora de atualizar seu progresso! - Plano de Vida",
    html: generateEmailWrapper(
      "linear-gradient(135deg, #6366f1, #8b5cf6)",
      "📊 Atualize suas Metas!",
      "Plano de Vida",
      `
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px;">Olá, <strong>${name}</strong>! 👋</p>
        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
          É hora de marcar suas metas realizadas no seu Plano de Vida!
        </p>
        <p style="margin: 0 0 15px 0; color: #374151;">Meta em destaque: <strong>Ler 12 livros este ano</strong></p>
        <p style="margin: 0 0 15px 0; color: #374151;">Plano: <strong>Meu Plano Individual</strong></p>
        <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px;">
          Manter o acompanhamento regular é essencial para alcançar seus objetivos.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <a href="https://planodevida.io" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600;">
                Acessar meu Plano →
              </a>
            </td>
          </tr>
        </table>
      `
    )
  }),

  // 6. Deadline Reminder
  reminder_deadline: (name: string) => ({
    subject: "⚠️ [TESTE] Meta próxima do vencimento! - Plano de Vida",
    html: generateEmailWrapper(
      "linear-gradient(135deg, #f59e0b, #ef4444)",
      "⚠️ Atenção: Prazo Próximo!",
      "Plano de Vida",
      `
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px;">Olá, <strong>${name}</strong>!</p>
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong style="color: #92400e;">Uma meta está próxima do vencimento!</strong>
        </div>
        <p style="margin: 15px 0; color: #374151;">Meta: <strong>Economizar R$ 10.000</strong></p>
        <p style="margin: 15px 0; color: #374151;">Prazo: <strong>31 de Dezembro de 2024</strong></p>
        <p style="margin: 15px 0; color: #374151;">Plano: <strong>Plano Financeiro</strong></p>
        <p style="margin: 20px 0; color: #6b7280; font-size: 16px;">
          Não deixe para última hora! Acesse seu plano e verifique o que precisa ser feito.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <a href="https://planodevida.io" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ef4444); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600;">
                Ver Meta →
              </a>
            </td>
          </tr>
        </table>
      `
    )
  }),

  // 7. Annual Review
  reminder_annual_review: (name: string) => ({
    subject: "🎯 [TESTE] É hora do seu Balanço Anual! - Plano de Vida",
    html: generateEmailWrapper(
      "linear-gradient(135deg, #10b981, #059669)",
      "🎯 Balanço Anual",
      "Plano de Vida",
      `
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px;">Olá, <strong>${name}</strong>! 👋</p>
        <div style="background: #d1fae5; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
          <h2 style="margin: 0; color: #065f46;">É hora de fazer seu balanço anual!</h2>
        </div>
        <p style="margin: 20px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
          O fim do ano está chegando e é o momento perfeito para:
        </p>
        <ul style="color: #374151; font-size: 15px; line-height: 2;">
          <li>Revisar suas conquistas do ano</li>
          <li>Identificar áreas que precisam de mais atenção</li>
          <li>Planejar seus objetivos para o próximo ano</li>
        </ul>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 25px;">
          <tr>
            <td align="center">
              <a href="https://planodevida.io/balanco" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600;">
                Fazer meu Balanço →
              </a>
            </td>
          </tr>
        </table>
      `
    )
  }),

  // 8. Goal Completed
  reminder_goal_completed: (name: string) => ({
    subject: "🎉 [TESTE] Parabéns! Meta concluída! - Plano de Vida",
    html: generateEmailWrapper(
      "linear-gradient(135deg, #2A8C68, #7BC8A4)",
      "🎉 Parabéns!",
      "Você concluiu uma meta!",
      `
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px;">Olá, <strong>${name}</strong>! 👋</p>
        <div style="background: #d1fae5; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #065f46; font-size: 14px;">META CONCLUÍDA</p>
          <h2 style="margin: 0; color: #065f46;">Correr uma maratona</h2>
        </div>
        <p style="margin: 20px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
          Cada meta concluída é um passo em direção aos seus sonhos. Continue assim! 💪
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 25px;">
          <tr>
            <td align="center">
              <a href="https://planodevida.io" style="display: inline-block; background: linear-gradient(135deg, #2A8C68, #7BC8A4); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600;">
                Ver minhas conquistas →
              </a>
            </td>
          </tr>
        </table>
      `
    )
  }),

  // 9. New Goal Added
  reminder_new_goal: (name: string) => ({
    subject: "🚀 [TESTE] Nova meta adicionada! - Plano de Vida",
    html: generateEmailWrapper(
      "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      "🚀 Nova Meta Registrada!",
      "Plano de Vida",
      `
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px;">Olá, <strong>${name}</strong>! 👋</p>
        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
          Você acabou de adicionar uma nova meta ao seu Plano de Vida!
        </p>
        <div style="background: #dbeafe; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; color: #1e40af; font-size: 14px;">NOVA META</p>
          <h2 style="margin: 0; color: #1e40af;">Aprender um novo idioma</h2>
        </div>
        <p style="margin: 20px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
          O primeiro passo para realizar um sonho é registrá-lo. Agora é hora de trabalhar para alcançá-lo!
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 25px;">
          <tr>
            <td align="center">
              <a href="https://planodevida.io" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600;">
                Ver minha meta →
              </a>
            </td>
          </tr>
        </table>
      `
    )
  }),

  // 10. Subscription Expiry Reminder
  subscription_expiry: (name: string) => ({
    subject: "🔔 [TESTE] Sua assinatura será renovada em 3 dias - Plano de Vida",
    html: generateEmailWrapper(
      "linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%)",
      "🔔 Plano de Vida",
      "Lembrete de Renovação",
      `
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px;">
          Olá, <strong>${name}</strong>! 👋
        </p>
        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
          Queremos te informar que sua assinatura do <strong style="color: #2A8C68;">Plano Premium</strong> será renovada automaticamente em <strong>3 dias</strong>.
        </p>
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0;">
          <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">
            📅 Data de Renovação
          </p>
          <p style="margin: 0; color: #78350f; font-size: 18px; font-weight: bold;">
            31 de Dezembro de 2024
          </p>
        </div>
        <p style="margin: 0 0 30px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
          Se você deseja continuar aproveitando todos os benefícios do seu plano, não precisa fazer nada - a renovação acontecerá automaticamente.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <a href="https://planodevida.io/conta" style="display: inline-block; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(42, 140, 104, 0.4);">
                Gerenciar Assinatura
              </a>
            </td>
          </tr>
        </table>
      `
    )
  }),

  // 11. PDF Share
  pdf_share: (name: string) => ({
    subject: "📄 [TESTE] Alguém compartilhou um Plano de Vida com você!",
    html: generateEmailWrapper(
      "linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%)",
      "📄 Plano de Vida Compartilhado",
      "Plano de Vida",
      `
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
          Olá, <strong>${name}</strong>! 👋
        </p>
        <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
          <strong style="color: #2A8C68;">Anderson Reis</strong> compartilhou um Plano de Vida com você!
        </p>
        <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 25px 0;">
          <p style="margin: 0 0 10px 0; color: #166534; font-weight: 600; font-size: 14px;">📋 PLANO COMPARTILHADO:</p>
          <h3 style="margin: 0; color: #065f46; font-size: 20px;">Meu Plano de Vida 2024</h3>
        </div>
        <div style="background: #f3f4f6; border-left: 4px solid #2A8C68; padding: 15px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0 0 8px 0; color: #374151; font-weight: 600; font-size: 14px;">💬 Mensagem:</p>
          <p style="margin: 0; color: #6b7280; font-size: 15px; font-style: italic;">"Dá uma olhada no meu plano! Quero sua opinião."</p>
        </div>
        <div style="background: #dbeafe; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">📎 <strong>Arquivo anexado:</strong> plano-de-vida.pdf</p>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
          <tr>
            <td align="center">
              <a href="https://planodevida.io" style="display: inline-block; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(42, 140, 104, 0.4);">
                Criar meu próprio Plano →
              </a>
            </td>
          </tr>
        </table>
        <p style="margin: 25px 0 0 0; color: #374151; font-size: 15px;">Com carinho,<br><strong>Equipe Plano de Vida</strong> 🌱</p>
      `
    )
  }),

  // 12. Plan Summary
  plan_summary: (name: string) => ({
    subject: "📋 [TESTE] Resumo do seu Plano de Vida - Plano de Vida",
    html: generateEmailWrapper(
      "linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%)",
      "📋 Meu Plano de Vida",
      '"Constância que constrói resultados"',
      `
        <p style="margin: 0 0 20px 0; color: #374151; font-size: 18px; line-height: 1.6;">
          Olá, <strong>${name}</strong>! 👋
        </p>
        <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
          Aqui está o resumo do seu Plano de Vida!
        </p>
        <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin: 25px 0;">
          <p style="margin: 0 0 10px 0; color: #166534; font-weight: 600; font-size: 14px;">📊 PROGRESSO:</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="color: #065f46; font-size: 32px; font-weight: 700;">65%</span>
            <span style="color: #6b7280; font-size: 14px;">13 de 20 metas</span>
          </div>
          <div style="background: #e5e7eb; border-radius: 10px; height: 20px; overflow: hidden; margin: 15px 0;">
            <div style="background: linear-gradient(90deg, #2A8C68, #7BC8A4); height: 100%; width: 65%; border-radius: 10px;"></div>
          </div>
        </div>
        <div style="margin: 30px 0;">
          <p style="margin: 0 0 15px 0; color: #374151; font-weight: 600; font-size: 16px;">🎯 Suas Metas por Área:</p>
          <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.8;">
            <li>🙏 Espiritual: 2 metas</li>
            <li>📚 Intelectual: 3 metas</li>
            <li>❤️ Familiar: 2 metas</li>
            <li>💰 Financeiro: 4 metas</li>
            <li>💼 Profissional: 3 metas</li>
            <li>🏃 Saúde: 4 metas</li>
            <li>🤝 Social: 2 metas</li>
          </ul>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
          <tr>
            <td align="center">
              <a href="https://planodevida.io" style="display: inline-block; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(42, 140, 104, 0.4);">
                Acessar meu Plano →
              </a>
            </td>
          </tr>
        </table>
        <p style="margin: 25px 0 0 0; color: #374151; font-size: 15px;">Com carinho,<br><strong>Equipe Plano de Vida</strong> 🌱</p>
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
          headers: {
            "List-Unsubscribe": "<mailto:cancelar@planodevida.io?subject=Unsubscribe>, <https://planodevida.io/configuracoes>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
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
