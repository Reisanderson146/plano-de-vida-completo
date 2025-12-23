import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAUSE-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'pause'; // 'pause' or 'resume'

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Find customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found");
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });

    const activeSubscriptions = subscriptions.data.filter((s: any) => 
      s.status === 'active' || s.status === 'paused'
    );

    if (activeSubscriptions.length === 0) {
      throw new Error("No active or paused subscriptions found");
    }

    const results = [];
    for (const subscription of activeSubscriptions) {
      if (action === 'pause' && subscription.status === 'active') {
        // Pause the subscription
        await stripe.subscriptions.update(subscription.id, {
          pause_collection: {
            behavior: 'mark_uncollectible',
          },
        });
        logStep("Paused subscription", { subscriptionId: subscription.id });
        results.push({ id: subscription.id, action: 'paused' });
      } else if (action === 'resume' && subscription.pause_collection) {
        // Resume the subscription
        await stripe.subscriptions.update(subscription.id, {
          pause_collection: null,
        });
        logStep("Resumed subscription", { subscriptionId: subscription.id });
        results.push({ id: subscription.id, action: 'resumed' });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: action === 'pause' 
        ? 'Assinatura pausada com sucesso'
        : 'Assinatura reativada com sucesso',
      results,
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
