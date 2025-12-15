import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface UserSettings {
  user_id: string;
  email: string;
  full_name: string;
  reminder_type: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  frequency: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("process-reminders function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get all users with their reminder settings
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name');

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    console.log(`Found ${users?.length || 0} users`);

    // Get all reminder settings
    const { data: allSettings, error: settingsError } = await supabase
      .from('reminder_settings')
      .select('*')
      .eq('enabled', true);

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      throw settingsError;
    }

    // Get user emails from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error("Error fetching auth users:", authError);
      throw authError;
    }

    const userEmailMap = new Map(
      authUsers.users.map(u => [u.id, u.email])
    );

    const processedUsers: string[] = [];
    const notificationsCreated: number[] = [];

    for (const user of users || []) {
      const userSettings = allSettings?.filter(s => s.user_id === user.id) || [];
      const userEmail = userEmailMap.get(user.id);

      if (!userEmail) {
        console.log(`No email found for user ${user.id}`);
        continue;
      }

      // Get user's goals for check-in and deadline reminders
      const { data: goals } = await supabase
        .from('life_goals')
        .select('*, life_plans(title)')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .eq('period_year', currentYear);

      // Process check-in reminders
      const checkInSettings = userSettings.find(s => s.reminder_type === 'check_in');
      if (checkInSettings) {
        const shouldSend = shouldSendReminder(checkInSettings.frequency, now);
        
        if (shouldSend && goals && goals.length > 0) {
          const randomGoal = goals[Math.floor(Math.random() * goals.length)];

          if (checkInSettings.in_app_enabled) {
            const { data: notif } = await supabase.from('notifications').insert({
              user_id: user.id,
              title: 'Atualize suas Metas!',
              message: `Não esqueça de marcar como realizada: ${randomGoal.goal_text?.substring(0, 50)}...`,
              type: 'check_in',
              related_goal_id: randomGoal.id,
              related_plan_id: randomGoal.life_plan_id,
            }).select();
            
            if (notif) notificationsCreated.push(1);
          }

          if (checkInSettings.email_enabled) {
            await sendReminderEmail({
              to: userEmail,
              userName: user.full_name || 'Usuário',
              reminderType: 'check_in',
              goalTitle: randomGoal.goal_text,
              planTitle: (randomGoal as any).life_plans?.title,
            });
          }
        }
      }

      // Process deadline reminders - check for goals in current year that haven't been completed
      const deadlineSettings = userSettings.find(s => s.reminder_type === 'deadline');
      if (deadlineSettings && goals && goals.length > 0) {
        // Check if we're in the last quarter of the year (reminder about year-end deadlines)
        if (currentMonth >= 9) {
          const shouldSend = shouldSendReminder(deadlineSettings.frequency, now);
          
          if (shouldSend) {
            const pendingGoal = goals[0];

            if (deadlineSettings.in_app_enabled) {
              await supabase.from('notifications').insert({
                user_id: user.id,
                title: 'Meta próxima do prazo!',
                message: `O ano está acabando! Não esqueça de completar: ${pendingGoal.goal_text?.substring(0, 50)}...`,
                type: 'deadline',
                related_goal_id: pendingGoal.id,
                related_plan_id: pendingGoal.life_plan_id,
              });
              notificationsCreated.push(1);
            }

            if (deadlineSettings.email_enabled) {
              await sendReminderEmail({
                to: userEmail,
                userName: user.full_name || 'Usuário',
                reminderType: 'deadline',
                goalTitle: pendingGoal.goal_text,
                planTitle: (pendingGoal as any).life_plans?.title,
                dueDate: `Fim de ${currentYear}`,
              });
            }
          }
        }
      }

      // Process annual review reminders - send in November/December
      const annualSettings = userSettings.find(s => s.reminder_type === 'annual_review');
      if (annualSettings && (currentMonth === 10 || currentMonth === 11)) {
        const shouldSend = shouldSendReminder(annualSettings.frequency, now);
        
        if (shouldSend) {
          if (annualSettings.in_app_enabled) {
            await supabase.from('notifications').insert({
              user_id: user.id,
              title: 'Hora do Balanço Anual!',
              message: 'O ano está terminando. É hora de fazer seu balanço e planejar o próximo ano!',
              type: 'annual_review',
            });
            notificationsCreated.push(1);
          }

          if (annualSettings.email_enabled) {
            await sendReminderEmail({
              to: userEmail,
              userName: user.full_name || 'Usuário',
              reminderType: 'annual_review',
            });
          }
        }
      }

      processedUsers.push(user.id);
    }

    console.log(`Processed ${processedUsers.length} users, created ${notificationsCreated.length} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        processedUsers: processedUsers.length,
        notificationsCreated: notificationsCreated.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in process-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

function shouldSendReminder(frequency: string, now: Date): boolean {
  const dayOfWeek = now.getDay();
  const dayOfMonth = now.getDate();

  switch (frequency) {
    case 'daily':
      return true;
    case 'weekly':
      return dayOfWeek === 1; // Monday
    case 'monthly':
      return dayOfMonth === 1; // First day of month
    default:
      return false;
  }
}

async function sendReminderEmail(params: {
  to: string;
  userName: string;
  reminderType: 'check_in' | 'deadline' | 'annual_review';
  goalTitle?: string;
  planTitle?: string;
  dueDate?: string;
}) {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-reminder-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();
    console.log("Email sent:", result);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

serve(handler);
