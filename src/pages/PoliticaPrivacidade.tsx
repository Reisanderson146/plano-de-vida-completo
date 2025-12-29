import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const PoliticaPrivacidade = () => {
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
          Política de Privacidade
        </h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Introdução</h2>
            <p>
              O Plano de Vida está comprometido em proteger sua privacidade. Esta Política de Privacidade 
              explica como coletamos, usamos, divulgamos e protegemos suas informações pessoais quando 
              você usa nosso serviço.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Informações que Coletamos</h2>
            <p>Coletamos os seguintes tipos de informações:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Informações de Cadastro:</strong> nome, e-mail, ano de nascimento</li>
              <li><strong>Dados de Uso:</strong> metas, planos de vida, notas pessoais</li>
              <li><strong>Informações de Pagamento:</strong> processadas de forma segura por nossos parceiros</li>
              <li><strong>Dados Técnicos:</strong> endereço IP, tipo de navegador, dispositivo utilizado</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. Como Usamos suas Informações</h2>
            <p>Utilizamos suas informações para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fornecer e manter nosso serviço</li>
              <li>Personalizar sua experiência</li>
              <li>Processar transações e gerenciar sua assinatura</li>
              <li>Enviar comunicações importantes sobre o serviço</li>
              <li>Melhorar nossos produtos e serviços</li>
              <li>Garantir a segurança da plataforma</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Compartilhamento de Dados</h2>
            <p>
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para 
              fins de marketing. Podemos compartilhar dados apenas:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Com prestadores de serviços que nos auxiliam na operação (processadores de pagamento)</li>
              <li>Quando exigido por lei ou ordem judicial</li>
              <li>Para proteger nossos direitos legais</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. Segurança dos Dados</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, 
              incluindo criptografia, controles de acesso e monitoramento contínuo. No entanto, nenhum 
              método de transmissão pela internet é 100% seguro.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">6. Seus Direitos</h2>
            <p>Você tem o direito de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir informações incorretas</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Exportar seus dados</li>
              <li>Revogar consentimentos dados anteriormente</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">7. Cookies</h2>
            <p>
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso 
              do serviço e personalizar conteúdo. Você pode controlar as preferências de cookies através 
              das configurações do seu navegador.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">8. Retenção de Dados</h2>
            <p>
              Mantemos suas informações pessoais enquanto sua conta estiver ativa ou conforme necessário 
              para fornecer nossos serviços. Após o encerramento da conta, seus dados serão excluídos 
              dentro de 30 dias, exceto quando a retenção for exigida por lei.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">9. Menores de Idade</h2>
            <p>
              Nosso serviço não é destinado a menores de 18 anos. Não coletamos intencionalmente 
              informações de menores. Se tomarmos conhecimento de que coletamos dados de um menor, 
              excluiremos essas informações imediatamente.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">10. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre 
              quaisquer alterações significativas por e-mail ou através de um aviso em nosso serviço.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">11. Contato</h2>
            <p>
              Para questões sobre esta Política de Privacidade ou para exercer seus direitos, 
              entre em contato através do nosso Instagram 
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

export default PoliticaPrivacidade;
