import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
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
      {/* Refined overlay with smoother gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-slate-900/50 backdrop-blur-[3px]" />
      
      {/* Subtle animated glow effect */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="w-full max-w-[420px] animate-fade-in relative z-10">
        {/* Logo Section - Enhanced */}
        <div className="flex flex-col items-center mb-8 sm:mb-10">
          <Logo size="xl" showText={true} variant="light" className="drop-shadow-2xl" />
          <div className="flex items-center gap-2 mt-4">
            <Sparkles className="w-4 h-4 text-amber-300/80" />
            <p className="text-white/90 text-center text-sm sm:text-base font-medium tracking-wide">
              Organize suas metas nas 7 áreas da vida
            </p>
            <Sparkles className="w-4 h-4 text-amber-300/80" />
          </div>
        </div>

        {/* Glassmorphism Card */}
        <Card className="border border-white/20 backdrop-blur-xl bg-white/90 dark:bg-slate-900/80 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[24px] overflow-hidden">
          <CardHeader className="pb-2 pt-8 px-6 sm:px-8 text-center space-y-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Bem-vindo!
            </CardTitle>
            <CardDescription className="text-muted-foreground/80 text-sm sm:text-base font-normal">
              Comece sua jornada de transformação pessoal
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-8">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-muted/40 rounded-2xl p-1.5">
                <TabsTrigger 
                  value="signin" 
                  className="text-sm sm:text-base font-semibold h-full rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-700 transition-all duration-300"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="text-sm sm:text-base font-semibold h-full rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-700 transition-all duration-300"
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
                      className="h-13 rounded-2xl border-border/40 bg-muted/30 focus:bg-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 text-base placeholder:text-muted-foreground/50"
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
                        className="h-13 rounded-2xl border-border/40 bg-muted/30 focus:bg-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 pr-12 text-base placeholder:text-muted-foreground/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-base sm:text-lg font-bold rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 group" 
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
                      className="h-13 rounded-2xl border-border/40 bg-muted/30 focus:bg-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 text-base placeholder:text-muted-foreground/50"
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
                      className="h-13 rounded-2xl border-border/40 bg-muted/30 focus:bg-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 text-base placeholder:text-muted-foreground/50"
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
                        className="h-13 rounded-2xl border-border/40 bg-muted/30 focus:bg-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 pr-12 text-base placeholder:text-muted-foreground/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
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
                        className="h-13 rounded-2xl border-border/40 bg-muted/30 focus:bg-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 pr-12 text-base placeholder:text-muted-foreground/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
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
                    className="w-full h-14 text-base sm:text-lg font-bold rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 group" 
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
        </Card>

        {/* Footer */}
        <p className="text-center text-xs sm:text-sm text-white/70 mt-8 font-medium">
          Ao continuar, você concorda com nossos termos de uso
        </p>
      </div>
    </div>
  );
}