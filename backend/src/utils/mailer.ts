import nodemailer from 'nodemailer';

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
