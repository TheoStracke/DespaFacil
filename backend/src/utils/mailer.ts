import nodemailer from 'nodemailer';
import { ServerClient } from 'postmark';
import { Resend } from 'resend';

// Providers (prioridade: Resend -> Postmark -> SMTP)
const useResend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.length > 0;
const resend = useResend ? new Resend(process.env.RESEND_API_KEY) : null;

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
  // Definir remetente preferencial (Resend/Postmark) ou SMTP user
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@despafacil.com';

  console.log('📧 Tentando enviar email...');
  console.log('   Preferência:', useResend ? 'Resend' : usePostmark ? 'Postmark' : 'SMTP');
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
    // 1. Resend (melhor via HTTP, sem bloqueio de porta)
    if (resend) {
      console.log('🚀 Usando Resend API...');
      try {
        const resendResult = await resend.emails.send({
          from,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        });
        if ((resendResult as any)?.id) {
          console.log('✅ Email enviado via Resend!');
          console.log('   ID:', (resendResult as any).id);
          return resendResult;
        }
        console.warn('⚠️ Resend não retornou ID, seguindo para fallback...');
      } catch (resendErr: any) {
        console.error('❌ Resend falhou:', resendErr.message);
      }
    }

    // 2. Postmark (se configurado e sem anexos grandes)
    if (postmark && !options.attachments) {
      console.log('🚀 Usando Postmark API...');
      try {
        const result = await postmark.sendEmail({
          From: from,
          To: options.to,
          Subject: options.subject,
          HtmlBody: options.html || '',
          TextBody: options.text || '',
          MessageStream: 'outbound',
        });
        console.log('✅ Email enviado via Postmark!');
        console.log('   MessageID:', result.MessageID);
        return result;
      } catch (postmarkError: any) {
        if (postmarkError.code === 412) {
          console.warn('⚠️ Postmark sandbox (412). Fallback SMTP...');
        } else {
          console.error('❌ Postmark falhou:', postmarkError.message);
        }
      }
    }

    // 3. SMTP (último recurso - pode estar bloqueado no Railway)
    console.log('📮 Usando SMTP (fallback)...');
    const info = await transporter.sendMail({
      from,
      to: options.to,
      cc: options.cc,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });
    console.log('✅ Email enviado via SMTP!');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    return info;
  } catch (error: any) {
    console.error('❌ ERRO final ao enviar email:');
    console.error('   Mensagem:', error.message);
    console.error('   Code:', error.code);
    console.error('   Command:', error.command);
    throw error;
  }
}

export default {
  sendEmail,
};
