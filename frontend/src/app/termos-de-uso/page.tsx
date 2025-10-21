'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TermosDeUso() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">Termos de Uso</h1>
          <p className="text-slate-600 mt-2">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-slate max-w-none">
            <h2>1. Objetivo</h2>
            <p>Estes Termos de Uso regulam o acesso e a utilização da plataforma DespaFacil, estabelecendo direitos e obrigações entre os usuários e a empresa responsável pelo serviço.</p>
            <h2>2. Cadastro e Consentimento</h2>
            <p>Para utilizar a plataforma, o usuário deve realizar cadastro, fornecendo dados pessoais verdadeiros e atualizados. Ao se cadastrar, o usuário declara estar ciente e concordar com estes Termos de Uso e com a Política de Privacidade.</p>
            <h2>3. Direitos do Usuário</h2>
            <p>O usuário tem direito de acessar, corrigir, excluir e solicitar a portabilidade de seus dados pessoais, conforme previsto na LGPD. Solicitações podem ser feitas pelo canal de contato do DPO.</p>
            <h2>4. Uso da Plataforma</h2>
            <p>O usuário compromete-se a utilizar a plataforma de forma ética, lícita e responsável, abstendo-se de praticar atos que possam prejudicar terceiros, a empresa ou violar a legislação vigente.</p>
            <h2>5. Retenção e Segurança de Dados</h2>
            <p>Os dados pessoais do usuário serão armazenados e protegidos conforme as melhores práticas de segurança, pelo tempo necessário para cumprimento das finalidades do serviço e obrigações legais.</p>
            <h2>6. Cookies e Tecnologias de Rastreamento</h2>
            <p>A plataforma utiliza cookies e tecnologias similares para aprimorar a experiência do usuário, conforme detalhado na Política de Privacidade.</p>
            <h2>7. Provedores Terceirizados</h2>
            <p>Certas funcionalidades podem depender de serviços de terceiros, como APIs de e-mail. O usuário autoriza o compartilhamento de dados estritamente necessário para o funcionamento da plataforma, conforme a LGPD.</p>
            <h2>8. Responsabilidades do Usuário</h2>
            <p>O usuário é responsável pela veracidade das informações fornecidas e pelo uso adequado da plataforma. É vedado o uso para fins ilícitos, fraudulentos ou que violem direitos de terceiros.</p>
            <h2>9. Limitações de Responsabilidade da Plataforma</h2>
            <p>A DespaFacil não se responsabiliza por danos decorrentes de uso indevido, falhas de terceiros, indisponibilidade temporária, caso fortuito ou força maior.</p>
            <h2>10. Canal de Contato do DPO</h2>
            <p>Para dúvidas, reclamações ou exercício de direitos relativos à proteção de dados, o usuário pode contatar o Encarregado de Proteção de Dados (DPO) pelo e-mail: <a href="mailto:despafacilrepo@gmail.com">despafacilrepo@gmail.com</a>.</p>
            <h2>11. Vigência e Atualizações</h2>
            <p>Estes Termos de Uso entram em vigor na data de sua publicação. Atualizações serão comunicadas pela plataforma, sendo recomendada a consulta periódica deste documento.</p>
            <p><strong>Última atualização: 21/10/2025</strong></p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
