import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const TermosDeUso = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/landing">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
          Termos de Uso
        </h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e usar o Plano de Vida, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Descrição do Serviço</h2>
            <p>
              O Plano de Vida é uma plataforma digital que auxilia os usuários no planejamento e acompanhamento 
              de metas pessoais em diversas áreas da vida, incluindo espiritual, financeira, profissional, 
              familiar, saúde e lazer.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. Cadastro e Conta</h2>
            <p>
              Para utilizar nossos serviços, você deve criar uma conta fornecendo informações verdadeiras, 
              completas e atualizadas. Você é responsável por manter a confidencialidade de sua senha e 
              por todas as atividades que ocorram em sua conta.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Assinatura e Pagamentos</h2>
            <p>
              O Plano de Vida oferece um período de teste gratuito. Após o período de teste, o acesso 
              completo requer uma assinatura paga. Os pagamentos são processados de forma segura através 
              de nossos parceiros de pagamento autorizados.
            </p>
            <p>
              A renovação da assinatura é automática, podendo ser cancelada a qualquer momento através 
              das configurações da sua conta.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. Uso Aceitável</h2>
            <p>Você concorda em não:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usar o serviço para qualquer finalidade ilegal ou não autorizada</li>
              <li>Tentar obter acesso não autorizado a qualquer parte do serviço</li>
              <li>Interferir ou interromper o serviço ou servidores</li>
              <li>Compartilhar sua conta com terceiros</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">6. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo do Plano de Vida, incluindo textos, gráficos, logos, ícones e software, 
              é propriedade exclusiva do Plano de Vida e está protegido por leis de direitos autorais.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">7. Limitação de Responsabilidade</h2>
            <p>
              O Plano de Vida é fornecido "como está". Não garantimos que o serviço será ininterrupto 
              ou livre de erros. Não nos responsabilizamos por quaisquer danos indiretos, incidentais 
              ou consequentes.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">8. Modificações</h2>
            <p>
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações 
              entrarão em vigor imediatamente após a publicação. O uso continuado do serviço após 
              as modificações constitui aceitação dos novos termos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">9. Contato</h2>
            <p>
              Para dúvidas sobre estes Termos de Uso, entre em contato através do nosso Instagram 
              <a href="https://www.instagram.com/planode.vida" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                @planode.vida
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermosDeUso;
