import nodemailer from 'nodemailer';
import { ServerClient } from 'postmark';

// Tentar Postmark primeiro (API HTTP), fallback para SMTP
const usePostmark = process.env.POSTMARK_API_TOKEN && process.env.POSTMARK_API_TOKEN.length > 0;
const postmark = usePostmark ? new ServerClient(process.env.POSTMARK_API_TOKEN!) : null;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  debug: true,
  logger: true,
  connectionTimeout: 10000, // 10 segundos
  greetingTimeout: 10000,
  socketTimeout: 20000,
});

export interface EmailOptions {
  to: string;
  cc?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer;
    contentType?: string;
  }>;
}

export async function sendEmail(options: EmailOptions) {
  const from = process.env.SMTP_USER;
  
  console.log('📧 Tentando enviar email...');
  console.log('   Método:', usePostmark ? 'Postmark API' : 'SMTP');
  console.log('   De:', from);
  console.log('   Para:', options.to);
  console.log('   CC:', options.cc);
  console.log('   Assunto:', options.subject);
  if (options.attachments && options.attachments.length > 0) {
    console.log('   Anexos:', options.attachments.length);
    options.attachments.forEach((att, idx) => {
      console.log(`      [${idx + 1}] ${att.filename} (${att.contentType || 'unknown'})`);
    });
  }
  
  try {
    // Tentar Postmark primeiro (funciona melhor no Railway)
    if (postmark && !options.attachments) {
      console.log('🚀 Usando Postmark API...');
      const result = await postmark.sendEmail({
        From: from || 'noreply@despafacil.com',
        To: options.to,
        Subject: options.subject,
        HtmlBody: options.html || '',
        TextBody: options.text || '',
        MessageStream: 'outbound',
      });
      
      console.log('✅ Email enviado via Postmark!');
      console.log('   MessageID:', result.MessageID);
      return result;
    }
    
    // Fallback para SMTP (Gmail)
    console.log('📮 Usando SMTP tradicional...');
    const info = await transporter.sendMail({
      from,
      to: options.to,
      cc: options.cc,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });
    
    console.log('✅ Email enviado com sucesso!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    
    return info;
  } catch (error: any) {
    console.error('❌ ERRO ao enviar email:');
    console.error('   Mensagem:', error.message);
    console.error('   Code:', error.code);
    console.error('   Command:', error.command);
    throw error;
  }
}

export default {
  sendEmail,
};
