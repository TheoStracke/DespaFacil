import axios from 'axios';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

export async function sendSendGridEmail({ 
  to, 
  subject, 
  html, 
  from = 'despafacilrepo@gmail.com',
  replyTo = 'despafacilrepo@gmail.com' 
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}) {
  try {
    const response = await axios.post(
      SENDGRID_API_URL,
      {
        personalizations: [
          {
            to: [{ email: to }],
          }
        ],
        from: { 
          email: from,
          name: 'DespaFacil'
        },
        reply_to: {
          email: replyTo,
          name: 'DespaFacil Suporte'
        },
        subject,
        content: [
          {
            type: 'text/html',
            value: html,
          }
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('✅ Email enviado via SendGrid com sucesso!');
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao enviar e-mail via SendGrid:', error.response?.data || error.message);
    throw error;
  }
}
