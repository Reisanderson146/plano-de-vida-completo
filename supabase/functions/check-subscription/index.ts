import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product IDs for tier identification
const TIER_PRODUCTS = {
  basic: "prod_Tbw6ZCYRIgPNee", // Plano Basic – Plano de Vida - R$ 9,99/mês
  familiar: "prod_familiar", // Plano Familiar – R$ 19,90/mês - TODO: Replace with real Stripe product ID
  premium: "prod_TeeUMyrZLlnteX", // Plano Premium– Plano de Vida - R$ 29,99/mês
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

function getTierFromProductId(productId: string | null): 'basic' | 'familiar' | 'premium' | null {
  if (!productId) return null;
  if (productId === TIER_PRODUCTS.premium) return 'premium';
  if (productId === TIER_PRODUCTS.familiar) return 'familiar';
  if (productId === TIER_PRODUCTS.basic) return 'basic';
  // Default to basic for any active subscription with unknown product
  return 'basic';
}

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
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      
      // Update profile to inactive
      await supabaseClient
        .from('profiles')
        .update({ 
          subscription_status: 'inactive', 
          subscription_plan: null,
          stripe_subscription_id: null,
          trial_end: null
        })
        .eq('id', user.id);

      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_status: 'inactive',
        subscription_plan: null,
        product_id: null,
        is_trial: false,
        trial_end: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active or trialing subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });

    // Find active or trialing subscription
    const activeSubscription = subscriptions.data.find(
      (sub: { status: string }) => sub.status === 'active' || sub.status === 'trialing'
    );

    const hasActiveSub = !!activeSubscription;
    let subscriptionEnd: string | null = null;
    let productId = null;
    let tier: 'basic' | 'familiar' | 'premium' | null = null;
    let isTrial = false;
    let trialEnd = null;
    let subscriptionId = null;

    if (hasActiveSub && activeSubscription) {
      subscriptionId = activeSubscription.id;
      
      // Check if it's a trial
      isTrial = activeSubscription.status === 'trialing';
      
      // Get trial end date
      if (activeSubscription.trial_end && typeof activeSubscription.trial_end === 'number') {
        trialEnd = new Date(activeSubscription.trial_end * 1000).toISOString();
      }
      
      // Safely handle subscription end date
      if (activeSubscription.current_period_end && typeof activeSubscription.current_period_end === 'number') {
        subscriptionEnd = new Date(activeSubscription.current_period_end * 1000).toISOString();
      }
      
      productId = activeSubscription.items?.data?.[0]?.price?.product as string || null;
      tier = getTierFromProductId(productId);
      
      logStep("Active subscription found", { 
        subscriptionId, 
        status: activeSubscription.status,
        endDate: subscriptionEnd, 
        productId, 
        tier,
        isTrial,
        trialEnd 
      });

      // Update profile with tier and trial info
      await supabaseClient
        .from('profiles')
        .update({ 
          subscription_status: isTrial ? 'trialing' : 'active', 
          subscription_plan: tier,
          stripe_subscription_id: subscriptionId,
          trial_end: trialEnd
        })
        .eq('id', user.id);
    } else {
      logStep("No active subscription found");
      
      // Update profile to inactive
      await supabaseClient
        .from('profiles')
        .update({ 
          subscription_status: 'inactive', 
          subscription_plan: null,
          stripe_subscription_id: null,
          trial_end: null
        })
        .eq('id', user.id);
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_status: hasActiveSub ? (isTrial ? 'trialing' : 'active') : 'inactive',
      subscription_plan: tier,
      subscription_end: subscriptionEnd,
      product_id: productId,
      is_trial: isTrial,
      trial_end: trialEnd,
      subscription_id: subscriptionId,
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
