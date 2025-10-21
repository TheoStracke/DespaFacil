
import { sendSendGridEmail } from './sendGridService';
import {
  getWelcomeTemplate,
  getFirstLoginTemplate,
  getPartnerRequestTemplate,
  getAdminNotificationTemplate,
  getApprovalTemplate,
  getRejectionTemplate,
  getCertificateTemplate
} from './emailTemplateService';

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
  const html = getWelcomeTemplate({
    nome,
    loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
  });
  
  await sendMail({
    to: email,
    subject: '🎉 Cadastro criado com sucesso - DespaFacil',
    html,
  });
}

// 2. Notificação de primeiro login
export async function notifyPrimeiroLogin(email: string, nome: string) {
  const html = getFirstLoginTemplate({ nome });
  
  await sendMail({
    to: email,
    subject: '👋 Bem-vindo ao DespaFacil!',
    html,
  });
}

// 3. Notificação de solicitação de cadastro recebida (para o usuário)
export async function notifySolicitacaoCadastro(email: string, nome: string) {
  const html = getPartnerRequestTemplate({ nome });
  
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
  const html = getAdminNotificationTemplate({
    empresa: dados.empresa,
    cnpj: dados.cnpj,
    email: dados.email,
    telefone: dados.telefone,
    nomeResponsavel: dados.nomeResponsavel,
    mensagem: dados.mensagem || 'Sem mensagem',
    adminPanelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/solicitacoes`
  });
  
  await sendMail({
    to: process.env.NOTIFICATION_EMAIL || 'despafacilrepo@gmail.com',
    subject: '🔔 Nova Solicitação de Cadastro - DespaFacil',
    html,
  });
}

// 5. Notificação de solicitação aprovada
export async function notifySolicitacaoAprovada(email: string, nome: string) {
  const html = getApprovalTemplate({
    nome,
    loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
  });
  
  await sendMail({
    to: email,
    subject: '✅ Solicitação Aprovada - DespaFacil',
    html,
  });
}

// 6. Notificação de solicitação negada
export async function notifySolicitacaoNegada(email: string, nome: string, observacoes?: string) {
  const html = getRejectionTemplate({
    nome,
    motivo: observacoes || 'Não especificado'
  });
  
  await sendMail({
    to: email,
    subject: '❌ Solicitação Negada - DespaFacil',
    html,
  });
}

// 7. Notificação de certificado disponível
export async function notifyCertificadoDisponivel(email: string, nome: string, link: string) {
  const html = getCertificateTemplate({
    nome,
    curso: 'Despachante Documentalista',
    certificadoUrl: link
  });
  
  await sendMail({
    to: email,
    subject: '📄 Certificado Disponível para Download - DespaFacil',
    html,
  });
}
