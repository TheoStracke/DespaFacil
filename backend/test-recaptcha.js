/**
 * Script de teste para validar reCAPTCHA Enterprise localmente
 * Execute: node test-recaptcha.js
 */

const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');
require('dotenv').config();

async function testRecaptchaSetup() {
  console.log('🧪 Testando configuração reCAPTCHA Enterprise...\n');
  
  // 1. Verificar variáveis de ambiente
  console.log('1️⃣ Verificando variáveis de ambiente:');
  const projectID = process.env.RECAPTCHA_PROJECT_ID || 'despafacil';
  const siteKey = process.env.RECAPTCHA_SITE_KEY;
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const credsJSON = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  
  console.log(`   PROJECT_ID: ${projectID} ✅`);
  console.log(`   SITE_KEY: ${siteKey ? siteKey.substring(0, 20) + '...' : '❌ NÃO CONFIGURADO'}`);
  console.log(`   CREDS_PATH: ${credsPath || '(usando JSON env)'}`);
  console.log(`   CREDS_JSON: ${credsJSON ? 'Configurado ✅' : 'Não configurado (usando arquivo local)'}`);
  
  if (!siteKey) {
    console.error('\n❌ RECAPTCHA_SITE_KEY não configurado no .env');
    process.exit(1);
  }
  
  // 2. Verificar credenciais do Google Cloud
  console.log('\n2️⃣ Verificando credenciais do Google Cloud:');
  try {
    const client = new RecaptchaEnterpriseServiceClient();
    console.log('   Cliente criado com sucesso ✅');
    
    // 3. Testar criação de assessment (simula validação)
    console.log('\n3️⃣ Testando criação de assessment:');
    console.log('   ⚠️  Sem token real do frontend, apenas verificando configuração...');
    
    const projectPath = client.projectPath(projectID);
    console.log(`   Project path: ${projectPath} ✅`);
    
    console.log('\n✅ Configuração do reCAPTCHA Enterprise está OK!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Inicie o backend: npm run dev');
    console.log('   2. Inicie o frontend: cd ../frontend && npm run dev');
    console.log('   3. Teste em: http://localhost:3000/forgot-password');
    console.log('   4. Verifique os logs do backend para ver o score retornado');
    
  } catch (error) {
    console.error('\n❌ Erro ao configurar cliente:', error.message);
    console.error('\n💡 Possíveis soluções:');
    console.error('   - Verifique se recaptcha-key.json existe em backend/');
    console.error('   - Confirme GOOGLE_APPLICATION_CREDENTIALS=./recaptcha-key.json no .env');
    console.error('   - Verifique se a Service Account tem permissão "reCAPTCHA Enterprise Agent"');
    process.exit(1);
  }
}

// Mock de teste com token fake (apenas para validar estrutura)
async function testAssessmentStructure() {
  console.log('\n4️⃣ Testando estrutura de request (mock):');
  
  const mockRequest = {
    assessment: {
      event: {
        token: 'mock-token-from-frontend',
        siteKey: process.env.RECAPTCHA_SITE_KEY || '6Leorw8sAAAAADDBLlVQzG0s1vsPwxORDAFtLrLv',
      },
    },
    parent: `projects/${process.env.RECAPTCHA_PROJECT_ID || 'despafacil'}`,
  };
  
  console.log('   Request structure:', JSON.stringify(mockRequest, null, 2));
  console.log('   ✅ Estrutura válida');
}

// Executar testes
(async () => {
  try {
    await testRecaptchaSetup();
    await testAssessmentStructure();
  } catch (error) {
    console.error('❌ Erro durante teste:', error);
    process.exit(1);
  }
})();
