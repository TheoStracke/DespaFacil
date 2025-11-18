import { render } from '@react-email/render';
import PasswordResetEmail from './templates/emails/PasswordResetEmail';
import * as fs from 'fs';
import * as path from 'path';

async function previewEmail() {
  const html = await render(
    PasswordResetEmail({
      name: 'João da Silva',
      resetUrl: 'http://localhost:3000/reset-password?token=exemplo123'
    })
  );

  const outputPath = path.join(__dirname, '../email-preview.html');
  fs.writeFileSync(outputPath, html);
  
  console.log('✅ Email preview gerado em:', outputPath);
  console.log('📧 Abra o arquivo no navegador para visualizar');
}

previewEmail();
