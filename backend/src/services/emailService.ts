
import { sendSendGridEmail } from './sendGridService';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: EmailOptions) {
  try {
    await sendSendGridEmail({
      from: 'despafacilrepo@gmail.com',
      to,
      subject,
      html,
      replyTo: 'despafacilrepo@gmail.com'
    });
    console.log(`✅ E-mail enviado para ${to}`);
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail via SendGrid:', error);
    throw error;
  }
}

// 1. Notificação de cadastro criado
export async function notifyCadastroCriado(email: string, nome: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Bem-vindo ao DespaFacil!</h1>
        </div>
        <div class="content">
          <p>Olá, <strong>${nome}</strong>!</p>
          <p>Seu cadastro foi realizado com sucesso na plataforma DespaFacil.</p>
          <p>Agora você já pode acessar todos os recursos disponíveis e começar a gerenciar seus documentos de forma simples e eficiente.</p>
          <p>Se tiver alguma dúvida, entre em contato conosco.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Acessar Plataforma</a>
        </div>
        <div class="footer">
          <p>© 2025 DespaFacil - Todos os direitos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await sendMail({
    to: email,
    subject: '🎉 Cadastro criado com sucesso - DespaFacil',
    html,
  });
}

// 2. Notificação de primeiro login
export async function notifyPrimeiroLogin(email: string, nome: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👋 Bem-vindo ao seu primeiro acesso!</h1>
        </div>
        <div class="content">
          <p>Olá, <strong>${nome}</strong>!</p>
          <p>Este é o seu primeiro login na plataforma DespaFacil.</p>
          <p>Estamos felizes em tê-lo conosco. Explore a plataforma e aproveite todos os recursos disponíveis.</p>
          <p>Em caso de dúvidas, nossa equipe está à disposição.</p>
        </div>
        <div class="footer">
          <p>© 2025 DespaFacil - Todos os direitos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await sendMail({
    to: email,
    subject: '👋 Bem-vindo ao DespaFacil!',
    html,
  });
}

// 3. Notificação de solicitação de cadastro recebida (para o usuário)
export async function notifySolicitacaoCadastro(email: string, nome: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Solicitação de Cadastro Recebida</h1>
        </div>
        <div class="content">
          <p>Olá, <strong>${nome}</strong>!</p>
          <p>Recebemos sua solicitação de cadastro como parceiro DespaFacil.</p>
          <p>Nossa equipe irá analisar suas informações e você receberá um retorno em breve.</p>
          <p>Fique atento ao seu e-mail para acompanhar o status da solicitação.</p>
        </div>
        <div class="footer">
          <p>© 2025 DespaFacil - Todos os direitos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await sendMail({
    to: email,
    subject: '📋 Solicitação de Cadastro Recebida - DespaFacil',
    html,
  });
}

// 4. Notificação de solicitação para o admin
export async function notifyAdminNovaSolicitacao(dados: {
  empresa: string;
  cnpj: string;
  email: string;
  telefone: string;
  nomeResponsavel: string;
  mensagem?: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; border-radius: 4px; }
        .info-label { font-weight: bold; color: #667eea; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Nova Solicitação de Cadastro</h1>
        </div>
        <div class="content">
          <p>Uma nova solicitação de parceria foi recebida!</p>
          <div class="info-box">
            <p><span class="info-label">Empresa:</span> ${dados.empresa}</p>
            <p><span class="info-label">CNPJ:</span> ${dados.cnpj}</p>
            <p><span class="info-label">E-mail:</span> ${dados.email}</p>
            <p><span class="info-label">Telefone:</span> ${dados.telefone}</p>
            <p><span class="info-label">Responsável:</span> ${dados.nomeResponsavel}</p>
            ${dados.mensagem ? `<p><span class="info-label">Mensagem:</span> ${dados.mensagem}</p>` : ''}
          </div>
          <p>Acesse o painel administrativo para aprovar ou rejeitar esta solicitação.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/solicitacoes" class="button">Acessar Painel</a>
        </div>
        <div class="footer">
          <p>© 2025 DespaFacil - Todos os direitos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await sendMail({
    to: 'despafacilrepo@gmail.com',
    subject: '🔔 Nova Solicitação de Cadastro - DespaFacil',
    html,
  });
}

// 5. Notificação de solicitação aprovada
export async function notifySolicitacaoAprovada(email: string, nome: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #11998e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Solicitação Aprovada!</h1>
        </div>
        <div class="content">
          <p>Olá, <strong>${nome}</strong>!</p>
          <p>Ótimas notícias! Sua solicitação de cadastro foi <strong>aprovada</strong>.</p>
          <p>Agora você já pode acessar a plataforma DespaFacil com suas credenciais.</p>
          <p>Faça login e comece a utilizar todos os recursos disponíveis.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Fazer Login</a>
        </div>
        <div class="footer">
          <p>© 2025 DespaFacil - Todos os direitos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await sendMail({
    to: email,
    subject: '✅ Solicitação Aprovada - DespaFacil',
    html,
  });
}

// 6. Notificação de solicitação negada
export async function notifySolicitacaoNegada(email: string, nome: string, observacoes?: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: #fff3cd; padding: 15px; margin: 15px 0; border-left: 4px solid #ffc107; border-radius: 4px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Solicitação Negada</h1>
        </div>
        <div class="content">
          <p>Olá, <strong>${nome}</strong>.</p>
          <p>Infelizmente, sua solicitação de cadastro foi <strong>negada</strong>.</p>
          ${observacoes ? `<div class="info-box"><p><strong>Motivo:</strong> ${observacoes}</p></div>` : ''}
          <p>Você poderá solicitar novamente após 24 horas.</p>
          <p>Se tiver dúvidas, entre em contato conosco através do e-mail: <a href="mailto:despafacilrepo@gmail.com">despafacilrepo@gmail.com</a></p>
        </div>
        <div class="footer">
          <p>© 2025 DespaFacil - Todos os direitos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await sendMail({
    to: email,
    subject: '❌ Solicitação Negada - DespaFacil',
    html,
  });
}

// 7. Notificação de certificado disponível
export async function notifyCertificadoDisponivel(email: string, nome: string, link: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📄 Certificado Disponível</h1>
        </div>
        <div class="content">
          <p>Olá, <strong>${nome}</strong>!</p>
          <p>O certificado do motorista está disponível para download.</p>
          <p>Clique no botão abaixo para fazer o download do documento.</p>
          <a href="${link}" class="button">Baixar Certificado</a>
        </div>
        <div class="footer">
          <p>© 2025 DespaFacil - Todos os direitos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  await sendMail({
    to: email,
    subject: '📄 Certificado Disponível para Download - DespaFacil',
    html,
  });
}
