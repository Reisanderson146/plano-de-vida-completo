import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SUBSCRIPTION-EXPIRY-REMINDER] ${step}${detailsStr}`);
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const logEmail = async (
  supabaseClient: any,
  data: {
    userId?: string;
    recipientEmail: string;
    recipientName?: string;
    emailType: string;
    subject: string;
    status: string;
    resendId?: string;
    errorMessage?: string;
    metadata?: any;
  }
) => {
  try {
    await supabaseClient.from('email_logs').insert({
      user_id: data.userId,
      recipient_email: data.recipientEmail,
      recipient_name: data.recipientName,
      email_type: data.emailType,
      subject: data.subject,
      status: data.status,
      resend_id: data.resendId,
      error_message: data.errorMessage,
      metadata: data.metadata || {},
    });
  } catch (error) {
    console.error('[SUBSCRIPTION-EXPIRY-REMINDER] Error logging email:', error);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get all active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
    });

    logStep("Found subscriptions", { count: subscriptions.data.length });

    const now = new Date();
    const remindersSent: string[] = [];
    const errors: string[] = [];

    for (const subscription of subscriptions.data) {
      const periodEnd = new Date(subscription.current_period_end * 1000);
      const daysUntilExpiry = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Send reminder if subscription expires in 3 or 7 days
      if (daysUntilExpiry === 7 || daysUntilExpiry === 3 || daysUntilExpiry === 1) {
        const customerId = subscription.customer as string;
        
        try {
          const customer = await stripe.customers.retrieve(customerId);
          
          if ('email' in customer && customer.email) {
            const customerName = ('name' in customer && customer.name) || 'Usuário';
            const formattedDate = periodEnd.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            });

            // Determine plan name from price
            const priceId = subscription.items.data[0]?.price.id;
            const planName = priceId?.includes('premium') || priceId?.includes('price_1ShLBERX3OjZbCrQFUF993DL') 
              ? 'Premium' 
              : 'Basic';

            const subject = `🔔 Sua assinatura ${planName} será renovada em ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'dia' : 'dias'}`;

            const emailHtml = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Lembrete de Renovação - Plano de Vida</title>
              </head>
              <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td align="center" style="padding: 40px 0;">
                      <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        
                        <!-- Header -->
                        <tr>
                          <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); border-radius: 16px 16px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                              🔔 Plano de Vida
                            </h1>
                            <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                              Lembrete de Renovação
                            </p>
                          </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                          <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px;">
                              Olá, ${customerName}! 👋
                            </h2>
                            
                            <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                              Queremos te informar que sua assinatura do <strong style="color: #2A8C68;">Plano ${planName}</strong> será renovada automaticamente em <strong>${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'dia' : 'dias'}</strong>.
                            </p>

                            <!-- Alert Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                              <tr>
                                <td style="padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border-left: 4px solid #f59e0b;">
                                  <p style="margin: 0 0 8px; color: #92400e; font-size: 14px; font-weight: 600;">
                                    📅 Data de Renovação
                                  </p>
                                  <p style="margin: 0; color: #78350f; font-size: 18px; font-weight: bold;">
                                    ${formattedDate}
                                  </p>
                                </td>
                              </tr>
                            </table>

                            <p style="margin: 0 0 30px; color: #52525b; font-size: 16px; line-height: 1.6;">
                              Se você deseja continuar aproveitando todos os benefícios do seu plano, não precisa fazer nada - a renovação acontecerá automaticamente.
                            </p>

                            <p style="margin: 0 0 30px; color: #52525b; font-size: 16px; line-height: 1.6;">
                              Caso prefira cancelar ou alterar sua assinatura, você pode fazer isso a qualquer momento através da página "Minha Conta" no aplicativo.
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td align="center">
                                  <a href="https://planodevida.io/conta" 
                                     style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #2A8C68 0%, #7BC8A4 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 14px rgba(42, 140, 104, 0.4);">
                                    Gerenciar Assinatura
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        <!-- Benefits Reminder -->
                        <tr>
                          <td style="padding: 0 40px 40px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f0fdf4; border-radius: 12px;">
                              <tr>
                                <td style="padding: 24px;">
                                  <p style="margin: 0 0 16px; color: #166534; font-size: 16px; font-weight: 600;">
                                    ✨ Benefícios do seu Plano ${planName}:
                                  </p>
                                  <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 1.8;">
                                    ${planName === 'Premium' ? `
                                      <li>1 Plano Individual + 1 Familiar + 3 para Filhos</li>
                                      <li>Resumo inteligente com IA</li>
                                      <li>Relatórios de progresso</li>
                                      <li>Lembretes por email</li>
                                      <li>Exportação em PDF</li>
                                    ` : `
                                      <li>1 Plano Individual</li>
                                      <li>Planejamento das 7 áreas</li>
                                      <li>Dados seguros na nuvem</li>
                                      <li>Exportação em PDF</li>
                                    `}
                                  </ul>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                          <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #71717a; font-size: 14px;">
                              Obrigado por fazer parte do Plano de Vida! 🌱
                            </p>
                            <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                              Este é um email automático. Não responda.
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
              to: [customer.email],
              subject,
              html: emailHtml,
              headers: {
                "List-Unsubscribe": "<mailto:cancelar@planodevida.io?subject=Unsubscribe>, <https://planodevida.io/configuracoes>",
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
            });

            if (emailResponse.error) {
              logStep("Error sending email", { email: customer.email, error: emailResponse.error });
              errors.push(`${customer.email}: ${emailResponse.error.message}`);
              
              await logEmail(supabaseClient, {
                recipientEmail: customer.email,
                recipientName: customerName,
                emailType: 'subscription_expiry_reminder',
                subject,
                status: 'error',
                errorMessage: emailResponse.error.message,
                metadata: { daysUntilExpiry, planName },
              });
            } else {
              logStep("Reminder sent", { email: customer.email, daysUntilExpiry });
              remindersSent.push(customer.email);
              
              await logEmail(supabaseClient, {
                recipientEmail: customer.email,
                recipientName: customerName,
                emailType: 'subscription_expiry_reminder',
                subject,
                status: 'sent',
                resendId: emailResponse.data?.id,
                metadata: { daysUntilExpiry, planName },
              });
            }
          }
        } catch (customerError) {
          logStep("Error processing customer", { customerId, error: customerError });
          errors.push(`Customer ${customerId}: ${String(customerError)}`);
        }
      }
    }

    logStep("Function completed", { 
      remindersSent: remindersSent.length, 
      errors: errors.length 
    });

    return new Response(JSON.stringify({ 
      success: true,
      remindersSent: remindersSent.length,
      emails: remindersSent,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
