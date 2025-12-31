import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-WEDDING-ANNIVERSARIES] ${step}${detailsStr}`);
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
    logStep("Function started - checking for wedding anniversaries today");

    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate();

    logStep("Checking for anniversaries on", { month: currentMonth, day: currentDay });

    // Get all family plans with wedding dates that match today's month and day
    const { data: plans, error: plansError } = await supabaseClient
      .from('life_plans')
      .select(`
        id,
        title,
        member_name,
        wedding_date,
        user_id,
        plan_type
      `)
      .eq('plan_type', 'familiar')
      .not('wedding_date', 'is', null);

    if (plansError) {
      throw new Error(`Error fetching plans: ${plansError.message}`);
    }

    if (!plans || plans.length === 0) {
      logStep("No family plans with wedding dates found");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No anniversaries to process",
        processed: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Found family plans with wedding dates", { count: plans.length });

    // Filter plans where wedding date matches today's month and day
    const anniversariesToday = plans.filter(plan => {
      if (!plan.wedding_date) return false;
      const weddingDate = new Date(plan.wedding_date);
      return weddingDate.getMonth() + 1 === currentMonth && weddingDate.getDate() === currentDay;
    });

    logStep("Anniversaries today", { count: anniversariesToday.length });

    let emailsSent = 0;
    const errors: string[] = [];

    for (const plan of anniversariesToday) {
      try {
        // Get user email from auth
        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('id', plan.user_id)
          .single();

        if (profileError) {
          logStep("Error fetching profile", { userId: plan.user_id, error: profileError.message });
          continue;
        }

        // Get user email from auth.users
        const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(plan.user_id);
        
        if (userError || !userData?.user?.email) {
          logStep("Error fetching user email", { userId: plan.user_id });
          continue;
        }

        const userEmail = userData.user.email;

        // Call the send-wedding-anniversary-email function
        const response = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-wedding-anniversary-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              userId: plan.user_id,
              email: userEmail,
              memberName: plan.member_name,
              weddingDate: plan.wedding_date,
              planTitle: plan.title,
            }),
          }
        );

        if (response.ok) {
          emailsSent++;
          logStep("Anniversary email sent", { planId: plan.id, email: userEmail });
        } else {
          const errorText = await response.text();
          errors.push(`Failed to send to ${userEmail}: ${errorText}`);
          logStep("Failed to send email", { planId: plan.id, error: errorText });
        }
      } catch (error: any) {
        errors.push(`Error processing plan ${plan.id}: ${error.message}`);
        logStep("Error processing plan", { planId: plan.id, error: error.message });
      }
    }

    logStep("Processing complete", { emailsSent, errors: errors.length });

    return new Response(JSON.stringify({
      success: true,
      processed: anniversariesToday.length,
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
