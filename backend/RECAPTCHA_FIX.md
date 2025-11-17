# ❌ ERRO: "tipo de chave é inválido"

## 🔍 Diagnóstico

Você está vendo esse erro porque a chave `6LcOeQ8sAAAAAP-zmNIuH0r-J3T24be2bm625etr` pode ter sido criada no **reCAPTCHA v3 padrão** em vez do **reCAPTCHA Enterprise**.

## ✅ Solução: Criar chave no reCAPTCHA Enterprise

### 1. Verificar se a API está ativa

1. Acesse: https://console.cloud.google.com/apis/library/recaptchaenterprise.googleapis.com?project=despafacil
2. Se aparecer **ENABLE**, clique para ativar
3. Se aparecer **MANAGE**, a API já está ativa ✅

### 2. Criar chave no reCAPTCHA Enterprise (não no reCAPTCHA Admin Console)

1. Acesse: https://console.cloud.google.com/security/recaptcha?project=despafacil
2. Clique em **CREATE KEY**
3. Preencha:
   - **Display name**: `DespaFacil - Production`
   - **Platform type**: Selecione **Website**
   - **Domains**: Adicione (um por linha):
     ```
     localhost
     despa-facil.vercel.app
     ```
   - **Integration type**: Selecione **Score-based** (invisível)
   - **reCAPTCHA Enterprise**: ✅ Certifique-se que está MARCADO (não pode ser v3 padrão)
4. Clique em **CREATE**
5. **Copie a nova SITE KEY** gerada

### 3. Atualizar as variáveis de ambiente

**Backend (.env local e Railway):**
```env
RECAPTCHA_PROJECT_ID=despafacil
RECAPTCHA_SITE_KEY=<NOVA_SITE_KEY_AQUI>
GOOGLE_APPLICATION_CREDENTIALS_JSON=<conteúdo do recaptcha-key.json>
BYPASS_CAPTCHA=false
```

**Frontend (.env local e Vercel):**
```env
NEXT_PUBLIC_RECAPTCHA_SITEKEY=<NOVA_SITE_KEY_AQUI>
```

### 4. Atualizar código do frontend

Edite `frontend/src/app/forgot-password/page.tsx`:

```typescript
const SITEKEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY || '<NOVA_SITE_KEY_AQUI>';
```

## 🔧 Alternativa: Se a chave já é Enterprise

Se você **TEM CERTEZA** que a chave foi criada no reCAPTCHA Enterprise, o problema pode ser:

1. **Domínios não autorizados**: Adicione `localhost` e `despa-facil.vercel.app`
2. **API não ativada**: Ative em https://console.cloud.google.com/apis/library/recaptchaenterprise.googleapis.com
3. **Service Account sem permissão**: Vá em IAM, verifique se `recaptcha-backend@despafacil.iam.gserviceaccount.com` tem role **reCAPTCHA Enterprise Agent**

## 📝 Como verificar se a chave é Enterprise

1. Acesse: https://console.cloud.google.com/security/recaptcha?project=despafacil
2. Se a chave aparecer na lista → É Enterprise ✅
3. Se não aparecer → Foi criada no v3 padrão (https://www.google.com/recaptcha/admin) ❌

---

## 🚀 Depois de criar/atualizar a chave

1. Atualize `.env` local e variáveis no Railway/Vercel
2. Commit e push:
   ```bash
   git add .
   git commit -m "fix: atualizar chave reCAPTCHA Enterprise"
   git push
   ```
3. Teste localmente com `npm run dev`
4. Teste em produção na página de recuperação de senha
