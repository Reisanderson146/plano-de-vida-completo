import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import HeroSection from "@/components/landing/HeroSection";
import AreasSection from "@/components/landing/AreasSection";
import VersiculosSection from "@/components/landing/VersiculosSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import StatsCounterSection from "@/components/landing/StatsCounterSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import FooterSection from "@/components/landing/FooterSection";
import { DarkModeToggle } from "@/components/theme/DarkModeToggle";

const LandingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<'basic' | 'premium' | null>(null);

  const handleCheckout = async (tier: 'basic' | 'premium') => {
    setLoading(tier);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // User not logged in, redirect to auth page first
        navigate(`/auth?redirect=checkout&tier=${tier}`);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error("Erro ao iniciar checkout. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Theme Toggle - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>
      
      <HeroSection onCtaClick={scrollToPricing} />
      <AreasSection />
      <VersiculosSection />
      <FeaturesSection />
      <StatsCounterSection />
      <PricingSection
        onCheckout={handleCheckout}
        onLogin={handleLogin}
        loading={loading}
      />
      <FAQSection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
