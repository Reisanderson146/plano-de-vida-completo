import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-SEASONAL-EMAILS] ${step}${detailsStr}`);
};

// Determine which seasonal email to send based on current date
const getSeasonalEmailType = (date: Date): string | null => {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // New Year - January 1st
  if (month === 1 && day === 1) {
    return 'new_year';
  }

  // Christmas - December 25th
  if (month === 12 && day === 25) {
    return 'christmas';
  }

  // Easter - needs dynamic calculation
  // Easter Sunday calculation (Computus algorithm)
  const year = date.getFullYear();
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const easterMonth = Math.floor((h + l - 7 * m + 114) / 31);
  const easterDay = ((h + l - 7 * m + 114) % 31) + 1;

  if (month === easterMonth && day === easterDay) {
    return 'easter';
  }

  return null;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started - checking for seasonal emails");

    const today = new Date();
    
    // Check for test mode
    let testEmailType: string | null = null;
    try {
      const body = await req.json();
      testEmailType = body.email_type || null;
      if (testEmailType) {
        logStep("Test mode enabled", { emailType: testEmailType });
      }
    } catch {
      // No body provided
    }

    const emailType = testEmailType || getSeasonalEmailType(today);

    if (!emailType) {
      logStep("No seasonal email to send today");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No seasonal email to send today",
        processed: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Sending seasonal email", { type: emailType });

    // Get all active users (with active subscription or in trial)
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, subscription_status')
      .or('subscription_status.eq.active,subscription_status.eq.trialing');

    if (profilesError) {
      throw new Error(`Error fetching profiles: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      logStep("No active users found");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No active users to send emails",
        processed: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found active users", { count: profiles.length });

    let emailsSent = 0;
    const errors: string[] = [];

    for (const profile of profiles) {
      try {
        // Get user email from auth.users
        const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(profile.id);
        
        if (userError || !userData?.user?.email) {
          logStep("Error fetching user email", { userId: profile.id });
          continue;
        }

        const userEmail = userData.user.email;

        // Call the send-seasonal-email function
        const response = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-seasonal-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              userId: profile.id,
              email: userEmail,
              userName: profile.full_name,
              emailType,
            }),
          }
        );

        if (response.ok) {
          emailsSent++;
          logStep("Seasonal email sent", { profileId: profile.id, email: userEmail, type: emailType });
        } else {
          const errorText = await response.text();
          errors.push(`Failed to send to ${userEmail}: ${errorText}`);
          logStep("Failed to send email", { profileId: profile.id, error: errorText });
        }
      } catch (error: any) {
        errors.push(`Error processing profile ${profile.id}: ${error.message}`);
        logStep("Error processing profile", { profileId: profile.id, error: error.message });
      }
    }

    logStep("Processing complete", { emailType, emailsSent, errors: errors.length });

    return new Response(JSON.stringify({
      success: true,
      emailType,
      processed: profiles.length,
      emailsSent,
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
