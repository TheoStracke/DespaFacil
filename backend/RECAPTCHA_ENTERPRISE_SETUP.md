# Configuração reCAPTCHA Enterprise - Google Cloud

## ✅ O que foi implementado:

1. **Backend integrado** com SDK oficial `@google-cloud/recaptcha-enterprise`
2. **Validação server-side** com pontuação de risco (0.0 a 1.0)
3. **Threshold configurável** (atualmente 0.3 - pode ajustar)

## 🔧 Próximos passos (VOCÊ precisa fazer):

### 1. Criar Service Account no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Selecione o projeto **despafacil** (ou crie um novo)
3. Vá em **IAM & Admin** → **Service Accounts**
4. Clique em **CREATE SERVICE ACCOUNT**
5. Preencha:
   - **Name**: `recaptcha-enterprise-backend`
   - **Description**: `Service account para validação reCAPTCHA Enterprise no backend`
6. Clique em **CREATE AND CONTINUE**
7. Na seção **Grant this service account access to project**:
   - Selecione role: **reCAPTCHA Enterprise Agent**
8. Clique em **DONE**

### 2. Gerar chave JSON da Service Account

1. Na lista de Service Accounts, clique na que você acabou de criar
2. Vá na aba **KEYS**
3. Clique em **ADD KEY** → **Create new key**
4. Selecione **JSON**
5. Clique em **CREATE**
6. O arquivo `despafacil-xxxxxxxx.json` será baixado automaticamente

### 3. Colocar a chave no projeto

1. **Renomeie** o arquivo baixado para `recaptcha-key.json`
2. **Mova** para a pasta `backend/` (mesma pasta do `.env`)
3. **IMPORTANTE**: Esse arquivo contém credenciais sensíveis!
   - Já está no `.gitignore` (não será commitado)
   - Nunca compartilhe esse arquivo

### 4. Verificar reCAPTCHA Enterprise está ativo

1. Acesse: https://console.cloud.google.com/security/recaptcha
2. Verifique se a chave `6LcOeQ8sAAAAAP-zmNIuH0r-J3T24be2bm625etr` está listada
3. Confirme que os domínios autorizados incluem:
   - `localhost` (para dev)
   - `despa-facil.vercel.app` (para produção)

### 5. Testar localmente

Depois de colocar o arquivo `recaptcha-key.json`:

```bash
cd backend
npm run dev
```

No frontend, teste a recuperação de senha.

### 6. Deploy no Vercel (produção)

No Vercel, você precisa adicionar as credenciais como **variáveis de ambiente**:

1. Abra o arquivo `recaptcha-key.json`
2. Copie TODO o conteúdo JSON
3. No painel do Vercel:
   - Vá em **Settings** → **Environment Variables**
   - Adicione:
     - **Key**: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
     - **Value**: Cole o JSON completo
4. No código de produção, adicione:

```typescript
// No início do server.ts ou app.ts
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
  // Salvar temporariamente em /tmp
  const fs = require('fs');
  const path = '/tmp/recaptcha-key.json';
  fs.writeFileSync(path, JSON.stringify(credentials));
  process.env.GOOGLE_APPLICATION_CREDENTIALS = path;
}
```

## 📊 Ajuste do threshold (score mínimo)

No arquivo `authService.ts`, linha com `isScoreAcceptable`:

```typescript
if (!isScoreAcceptable(score, 0.3)) {  // ← Ajuste aqui
```

- **0.9 ou superior**: Muito restritivo (só humanos muito confiáveis)
- **0.5**: Balanceado (recomendado)
- **0.3**: Permissivo (atual - bom para testes)
- **0.0**: Aceita qualquer coisa (não recomendado)

## 🔍 Logs e debugging

O código atual já imprime logs detalhados:
- Score retornado pela API
- Motivos da análise de risco
- Validação de action (`forgot_password`)
- Token válido/inválido

## ⚠️ Importante

- Remova `BYPASS_CAPTCHA=true` do `.env` quando colocar a chave
- Mantenha `recaptcha-key.json` seguro e NUNCA commite no Git
- Em produção, use variáveis de ambiente do Vercel

## 📚 Documentação oficial

- reCAPTCHA Enterprise: https://cloud.google.com/recaptcha-enterprise/docs
- Interpretar scores: https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
- Node.js SDK: https://cloud.google.com/nodejs/docs/reference/recaptcha-enterprise/latest
