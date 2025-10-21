'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PoliticaDePrivacidade() {
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
          <h1 className="text-4xl font-bold text-slate-900">Política de Privacidade</h1>
          <p className="text-slate-600 mt-2">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-slate max-w-none">
            <h2>1. Objetivo</h2>
            <p>Esta Política de Privacidade tem como finalidade informar aos usuários da plataforma DespaFacil sobre a coleta, uso, armazenamento, proteção e compartilhamento de dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).</p>
            <h2>2. Coleta de Dados</h2>
            <p>A plataforma coleta dados pessoais fornecidos pelo usuário no momento do cadastro, tais como nome, e-mail, telefone, CNPJ, senha e demais informações necessárias para utilização dos serviços. Dados de navegação, como endereço IP, data e hora de acesso, e informações sobre o dispositivo também podem ser coletados automaticamente.</p>
            <h2>3. Consentimento do Usuário</h2>
            <p>Ao utilizar a plataforma e fornecer seus dados pessoais, o usuário manifesta consentimento livre, informado e inequívoco para o tratamento de seus dados, conforme as finalidades descritas nesta política.</p>
            <h2>4. Direitos do Titular</h2>
            <ul>
              <li>Confirmação da existência de tratamento;</li>
              <li>Acesso aos dados;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade;</li>
              <li>Portabilidade dos dados a outro fornecedor de serviço ou produto, mediante requisição expressa;</li>
              <li>Eliminação dos dados pessoais tratados com consentimento do titular, exceto nas hipóteses previstas em lei;</li>
              <li>Informação sobre compartilhamento de dados com entidades públicas e privadas;</li>
              <li>Revogação do consentimento.</li>
            </ul>
            <h2>5. Retenção e Segurança de Dados</h2>
            <p>Os dados pessoais são armazenados pelo tempo necessário para cumprir as finalidades para as quais foram coletados, observando obrigações legais e regulatórias. A plataforma adota medidas técnicas e administrativas para proteger os dados contra acessos não autorizados, destruição, perda, alteração, comunicação ou difusão.</p>
            <h2>6. Cookies e Tecnologias de Rastreamento</h2>
            <p>Utilizamos cookies e tecnologias similares para melhorar a experiência do usuário, analisar estatísticas de uso e personalizar conteúdos. O usuário pode gerenciar as preferências de cookies diretamente em seu navegador.</p>
            <h2>7. Uso de Dados por Provedores Terceirizados</h2>
            <p>A plataforma pode compartilhar dados pessoais com provedores terceirizados, como serviços de e-mail (APIs), exclusivamente para viabilizar funcionalidades essenciais, sempre observando os princípios da LGPD e exigindo o mesmo nível de proteção.</p>
            <h2>8. Responsabilidades e Limitações de Uso da Plataforma</h2>
            <p>O usuário é responsável pela veracidade das informações fornecidas e pelo uso adequado da plataforma. A DespaFacil não se responsabiliza por danos decorrentes de uso indevido, falhas de terceiros ou caso fortuito/força maior.</p>
            <h2>9. Canal de Contato do Encarregado de Proteção de Dados (DPO)</h2>
            <p>Para dúvidas, solicitações ou exercício de direitos relativos à proteção de dados pessoais, o usuário pode entrar em contato com o Encarregado de Proteção de Dados (DPO) pelo e-mail: <a href="mailto:despafacilrepo@gmail.com">despafacilrepo@gmail.com</a>.</p>
            <h2>10. Data de Vigência e Atualizações</h2>
            <p>Esta Política de Privacidade entra em vigor na data de sua publicação. Eventuais atualizações serão comunicadas por meio da plataforma, sendo recomendada a consulta periódica deste documento.</p>
            <p><strong>Última atualização: 21/10/2025</strong></p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
