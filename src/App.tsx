import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Cadastro from "./pages/Cadastro";
import Consulta from "./pages/Consulta";
import ConsultaDetalhes from "./pages/ConsultaDetalhes";
import Relatorios from "./pages/Relatorios";
import Balanco from "./pages/Balanco";
import MeusDados from "./pages/MeusDados";
import Configuracoes from "./pages/Configuracoes";
import Conta from "./pages/Conta";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

// Rota protegida para usuários comuns (apenas autenticação)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
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
      
      {/* Rota de sucesso do checkout */}
      <Route path="/checkout-success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
      
      {/* Rotas de usuário (requerem login) */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/cadastro" element={<ProtectedRoute><Cadastro /></ProtectedRoute>} />
      <Route path="/consulta" element={<ProtectedRoute><Consulta /></ProtectedRoute>} />
      <Route path="/consulta/:id" element={<ProtectedRoute><ConsultaDetalhes /></ProtectedRoute>} />
      <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
      <Route path="/balanco" element={<ProtectedRoute><Balanco /></ProtectedRoute>} />
      <Route path="/meus-dados" element={<ProtectedRoute><MeusDados /></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
      <Route path="/conta" element={<ProtectedRoute><Conta /></ProtectedRoute>} />
      <Route path="/perfil" element={<Navigate to="/meus-dados" replace />} />
      <Route path="/assinatura" element={<Navigate to="/cadastro" replace />} />
      
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
