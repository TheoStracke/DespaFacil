import axios from 'axios';

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_2rGCPv8p_LUsrKW6i96pJNZmsnLVLeBg5';
const RESEND_API_URL = 'https://api.resend.com/emails';

export async function sendResendEmail({ to, subject, html, from = 'DespaFacil <despafacilrepo@gmail.com>' }: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const response = await axios.post(
      RESEND_API_URL,
      {
        to,
        from,
        subject,
        html,
      },
      {
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail via Resend:', error);
    throw error;
  }
}
