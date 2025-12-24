import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import HeroSection from "@/components/landing/HeroSection";
import AreasSection from "@/components/landing/AreasSection";
import VersiculosSection from "@/components/landing/VersiculosSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import FooterSection from "@/components/landing/FooterSection";
import { DarkModeToggle } from "@/components/theme/DarkModeToggle";
import { Logo } from "@/components/Logo";

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
      {/* Header with theme toggle on left and login button on right */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-4">
          <Logo size="sm" showText singleLine />
          <DarkModeToggle />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogin}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Já sou assinante
          </button>
          <button
            onClick={handleLogin}
            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            Login
          </button>
        </div>
      </div>
      
      <HeroSection onCtaClick={scrollToPricing} />
      <AreasSection />
      <VersiculosSection />
      <FeaturesSection />
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
