# ⚠️ TROUBLESHOOTING: Score NULL no Railway

## Problema
`Erro ao validar captcha: Validação de segurança falhou (score: null)`

Isso significa que a API do reCAPTCHA Enterprise **não está conseguindo validar** o token.

## ✅ Checklist de Configuração Railway

### 1. Verificar variáveis de ambiente no Railway

Acesse: https://railway.app → Seu projeto backend → **Variables**

**OBRIGATÓRIAS:**
```
RECAPTCHA_PROJECT_ID = despafacil
RECAPTCHA_SITE_KEY = 6Leorw8sAAAAADDBLlVQzG0s1vsPwxORDAFtLrLv
GOOGLE_APPLICATION_CREDENTIALS_JSON = {cole o JSON completo aqui}
BYPASS_CAPTCHA = false
```

**Como copiar o JSON novamente (PowerShell):**
```powershell
cd "C:\Users\AR Theo Stracke\Documents\GitHub\DespaFacil\backend"
Get-Content .\recaptcha-key.json -Raw | Set-Clipboard
Write-Host "JSON copiado!" -ForegroundColor Green
```

### 2. Formato do JSON no Railway

O JSON deve ser colado **exatamente como está no arquivo**, começando com `{` e terminando com `}`:

```json
{
  "type": "service_account",
  "project_id": "despafacil",
  "private_key_id": "5ea439ef2c6944c295068f6bbc4b7eaff97ea884",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  ...
}
```

**⚠️ IMPORTANTE:**
- Não adicione aspas extras ao redor do JSON
- Não quebre em múltiplas linhas (cole tudo de uma vez)
- As `\n` dentro da `private_key` devem estar presentes

### 3. Verificar API habilitada no Google Cloud

1. Acesse: https://console.cloud.google.com/apis/library/recaptchaenterprise.googleapis.com?project=despafacil
2. Se aparecer **ENABLE**, clique para ativar
3. Se aparecer **MANAGE**, já está ativa ✅

### 4. Verificar permissões da Service Account

1. Acesse: https://console.cloud.google.com/iam-admin/iam?project=despafacil
2. Procure por: `recaptcha-backend@despafacil.iam.gserviceaccount.com`
3. Verifique se tem a role: **reCAPTCHA Enterprise Agent**
4. Se não tiver, clique em **EDIT** → **ADD ANOTHER ROLE** → selecione **reCAPTCHA Enterprise Agent** → **SAVE**

### 5. Verificar logs do Railway

Após configurar as variáveis, vá em **Deployments** → clique no deploy mais recente → **View Logs**

Procure por:
```
🔐 GOOGLE_APPLICATION_CREDENTIALS configured from JSON env at /tmp/recaptcha-key.json
```

Se **NÃO aparecer** essa linha:
- A variável `GOOGLE_APPLICATION_CREDENTIALS_JSON` não foi configurada corretamente
- Verifique se o nome da variável está exato (sem espaços extras)

### 6. Procurar erros específicos nos logs

Ao tentar recuperar senha, procure nos logs por:

**Erro de autenticação:**
```
[reCAPTCHA Enterprise] Erro ao validar: Unable to authenticate
```
→ JSON inválido ou Service Account sem permissão

**Erro de API não habilitada:**
```
[reCAPTCHA Enterprise] Erro ao validar: reCAPTCHA Enterprise API has not been used
```
→ Ative a API no link acima (passo 3)

**Erro de projeto:**
```
[reCAPTCHA Enterprise] Erro ao validar: Project not found
```
→ Verifique `RECAPTCHA_PROJECT_ID=despafacil`

**Token inválido:**
```
[reCAPTCHA Enterprise] Token inválido: INVALID_REASON
```
→ Problema no frontend ou site key errada

## 🔧 Solução rápida: Usar BYPASS temporariamente

Se quiser testar o fluxo sem captcha enquanto resolve:

No Railway, mude:
```
BYPASS_CAPTCHA = true
```

Depois de confirmar que o resto funciona (email sendo enviado), volte para `false` e resolva o reCAPTCHA.

## 📞 Próximos passos

1. Configure as variáveis no Railway conforme checklist acima
2. Aguarde o redeploy automático (ou force um redeploy manual)
3. Tente novamente recuperar senha
4. Me envie os logs do Railway (copie a mensagem de erro completa)
