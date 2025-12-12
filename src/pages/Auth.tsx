import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/Logo';
import loginBackground from '@/assets/login-background.png';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    
    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: error.message === 'Invalid login credentials' 
          ? 'Email ou senha incorretos' 
          : error.message,
        variant: 'destructive',
      });
    } else {
      navigate('/');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'A senha e a confirmação devem ser iguais',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    
    if (error) {
      toast({
        title: 'Erro ao cadastrar',
        description: error.message.includes('already registered') 
          ? 'Este email já está cadastrado' 
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Cadastro realizado!',
        description: 'Bem-vindo ao Plano de Vida!',
      });
      navigate('/');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden"
      style={{
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Premium green overlay with smooth gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2A8C68]/60 via-[#7BC8A4]/40 to-[#2A8C68]/50 backdrop-blur-[2px]" />
      
      {/* Animated glow effects with green theme */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#A8E6CE]/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#7BC8A4]/15 rounded-full blur-[100px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2A8C68]/10 rounded-full blur-[150px]" />
      
      <div className="w-full max-w-[440px] animate-fade-in relative z-10">
        {/* Logo Section - Enhanced & Larger */}
        <div className="flex flex-col items-center mb-10 sm:mb-12">
          {/* Large Logo Icon */}
          <Logo size="2xl" showText={false} showIcon={true} variant="light" className="drop-shadow-2xl mb-6" />
          
          {/* Title on single line with enhanced typography */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] mb-4">
            Plano de Vida
          </h1>
          
          {/* New Slogan with refined typography */}
          <p className="text-white/90 text-center text-lg sm:text-xl font-light tracking-[0.15em] drop-shadow-md">
            Constância que constrói propósito.
          </p>
        </div>

        {/* Enhanced Glassmorphism Card */}
        <Card className="relative border-0 overflow-hidden rounded-[28px] shadow-[0_20px_60px_-10px_rgba(42,140,104,0.35)]">
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-[28px] p-[1px] bg-gradient-to-br from-white/40 via-[#A8E6CE]/30 to-white/20">
            <div className="w-full h-full rounded-[27px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl" />
          </div>
          
          {/* Card content */}
          <div className="relative z-10">
            <CardHeader className="pb-3 pt-8 px-7 sm:px-9 text-center space-y-3">
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] bg-clip-text text-transparent">
                Bem-vindo!
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm sm:text-base font-normal">
                Acesse sua conta e continue sua jornada
              </CardDescription>
            </CardHeader>
            <CardContent className="px-7 sm:px-9 pb-9">
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-gradient-to-r from-[#A8E6CE]/20 via-[#7BC8A4]/15 to-[#A8E6CE]/20 rounded-2xl p-1.5 border border-[#7BC8A4]/20">
                  <TabsTrigger 
                    value="signin" 
                    className="text-sm sm:text-base font-semibold h-full rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#2A8C68]/10 data-[state=active]:text-[#2A8C68] transition-all duration-300"
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="text-sm sm:text-base font-semibold h-full rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:shadow-[#2A8C68]/10 data-[state=active]:text-[#2A8C68] transition-all duration-300"
                  >
                    Cadastrar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="mt-0">
                  <form onSubmit={handleSignIn} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-sm font-semibold text-foreground/90">
                        Email
                      </Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-white focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 text-base placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-sm font-semibold text-foreground/90">
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-white focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 pr-12 text-base placeholder:text-muted-foreground/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-[#2A8C68] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-base sm:text-lg font-bold rounded-2xl bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] hover:from-[#238058] hover:via-[#6ab893] hover:to-[#238058] transition-all duration-300 shadow-lg shadow-[#2A8C68]/25 hover:shadow-xl hover:shadow-[#2A8C68]/35 hover:-translate-y-0.5 group text-white" 
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Entrar
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-semibold text-foreground/90">
                        Nome completo
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-white focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 text-base placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground/90">
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-white focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 text-base placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground/90">
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-white focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 pr-12 text-base placeholder:text-muted-foreground/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-[#2A8C68] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className="text-sm font-semibold text-foreground/90">
                        Confirmar Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Digite a senha novamente"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          className="h-14 rounded-2xl border-[#7BC8A4]/30 bg-[#A8E6CE]/10 focus:bg-white focus:border-[#2A8C68]/50 focus:ring-2 focus:ring-[#2A8C68]/20 transition-all duration-300 pr-12 text-base placeholder:text-muted-foreground/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-[#2A8C68] transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-destructive mt-1 font-medium">As senhas não coincidem</p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-base sm:text-lg font-bold rounded-2xl bg-gradient-to-r from-[#2A8C68] via-[#7BC8A4] to-[#2A8C68] hover:from-[#238058] hover:via-[#6ab893] hover:to-[#238058] transition-all duration-300 shadow-lg shadow-[#2A8C68]/25 hover:shadow-xl hover:shadow-[#2A8C68]/35 hover:-translate-y-0.5 group text-white" 
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Criar conta
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </div>
        </Card>

        {/* Footer with enhanced styling */}
        <p className="text-center text-xs sm:text-sm text-white/80 mt-8 font-medium drop-shadow-sm">
          Ao continuar, você concorda com nossos termos de uso
        </p>
      </div>
    </div>
  );
}