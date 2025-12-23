import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-UPDATE-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const adminUser = userData.user;
    if (!adminUser) throw new Error("User not authenticated");

    // Check if user is admin
    const { data: isAdmin } = await supabaseClient.rpc('is_admin');
    if (!isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }
    logStep("Admin verified", { adminId: adminUser.id });

    // Get request body
    const body = await req.json();
    const { targetUserId, newTier } = body;

    if (!targetUserId || !newTier) {
      throw new Error("Missing required fields: targetUserId, newTier");
    }

    if (!['basic', 'premium'].includes(newTier)) {
      throw new Error("Invalid tier. Must be 'basic' or 'premium'");
    }

    logStep("Updating subscription", { targetUserId, newTier });

    // Get target user's email
    const { data: targetProfile, error: profileError } = await supabaseClient.auth.admin.getUserById(targetUserId);
    if (profileError || !targetProfile.user) {
      throw new Error("Target user not found");
    }

    const targetEmail = targetProfile.user.email;
    if (!targetEmail) throw new Error("Target user has no email");

    logStep("Found target user", { email: targetEmail });

    // Update the profile directly
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ 
        subscription_status: 'active',
        subscription_plan: newTier 
      })
      .eq('id', targetUserId);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    logStep("Profile updated successfully", { targetUserId, newTier });

    return new Response(JSON.stringify({ 
      success: true,
      message: `Subscription updated to ${newTier} for user ${targetEmail}`
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
