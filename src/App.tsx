import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Cadastro from "./pages/Cadastro";
import Consulta from "./pages/Consulta";
import ConsultaDetalhes from "./pages/ConsultaDetalhes";
import Relatorios from "./pages/Relatorios";
import Balanco from "./pages/Balanco";
import MeusDados from "./pages/MeusDados";
import Configuracoes from "./pages/Configuracoes";
import Assinatura from "./pages/Assinatura";
import Conta from "./pages/Conta";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

// Hook para verificar status da assinatura
function useSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkSubscription = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .maybeSingle();

      setStatus(data?.subscription_status || 'inactive');
      setLoading(false);
    };

    checkSubscription();
  }, [user]);

  return { status, loading, isActive: status === 'active' };
}

// Rota protegida para usuários comuns (com verificação de assinatura)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { status, loading: subLoading, isActive } = useSubscription();

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isActive) {
    return <Navigate to="/assinatura" replace />;
  }

  return <>{children}</>;
}

// Rota protegida apenas para autenticação (sem verificar assinatura)
function AuthOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Rota protegida para admin
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      
      {/* Rota de assinatura (requer login, mas não assinatura ativa) */}
      <Route path="/assinatura" element={<AuthOnlyRoute><Assinatura /></AuthOnlyRoute>} />
      
      {/* Rota de conta (requer login e assinatura ativa) */}
      <Route path="/conta" element={<ProtectedRoute><Conta /></ProtectedRoute>} />
      
      {/* Rotas de usuário comum (requerem login E assinatura ativa) */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/cadastro" element={<ProtectedRoute><Cadastro /></ProtectedRoute>} />
      <Route path="/consulta" element={<ProtectedRoute><Consulta /></ProtectedRoute>} />
      <Route path="/consulta/:id" element={<ProtectedRoute><ConsultaDetalhes /></ProtectedRoute>} />
      <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
      <Route path="/balanco" element={<ProtectedRoute><Balanco /></ProtectedRoute>} />
      <Route path="/meus-dados" element={<ProtectedRoute><MeusDados /></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
      <Route path="/perfil" element={<Navigate to="/meus-dados" replace />} />
      
      {/* Rotas de admin separadas */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
