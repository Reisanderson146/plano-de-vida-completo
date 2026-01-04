import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-BIRTHDAYS] ${step}${detailsStr}`);
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
    logStep("Function started - checking for birthdays today");

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    logStep("Checking for birthdays on", { month: currentMonth, day: currentDay });

    // Get all profiles with birth_date that match today's month and day
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, birth_date')
      .not('birth_date', 'is', null);

    if (profilesError) {
      throw new Error(`Error fetching profiles: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      logStep("No profiles with birth dates found");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No birthdays to process",
        processed: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found profiles with birth dates", { count: profiles.length });

    // Filter profiles where birth date matches today's month and day
    const birthdaysToday = profiles.filter(profile => {
      if (!profile.birth_date) return false;
      const birthDate = new Date(profile.birth_date);
      return birthDate.getMonth() + 1 === currentMonth && birthDate.getDate() === currentDay;
    });

    logStep("Birthdays today", { count: birthdaysToday.length });

    let emailsSent = 0;
    const errors: string[] = [];

    for (const profile of birthdaysToday) {
      try {
        // Get user email from auth.users
        const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(profile.id);
        
        if (userError || !userData?.user?.email) {
          logStep("Error fetching user email", { userId: profile.id });
          continue;
        }

        const userEmail = userData.user.email;

        // Calculate age
        let age: number | undefined;
        if (profile.birth_date) {
          const birthDate = new Date(profile.birth_date);
          age = today.getFullYear() - birthDate.getFullYear();
        }

        // Call the send-birthday-email function
        const response = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-birthday-email`,
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
              age,
            }),
          }
        );

        if (response.ok) {
          emailsSent++;
          logStep("Birthday email sent", { profileId: profile.id, email: userEmail });
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

    logStep("Processing complete", { emailsSent, errors: errors.length });

    return new Response(JSON.stringify({
      success: true,
      processed: birthdaysToday.length,
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
