# Troubleshooting: Erro 400 em /forgot-password

## Problema
O endpoint `/api/auth/forgot-password` está retornando 400 Bad Request em produção.

## Causas possíveis

### 1. HCAPTCHA_SECRET não configurado no Railway
- Verifique se a variável `HCAPTCHA_SECRET` está configurada no Railway
- Valor esperado: `ES_6612a...` (o secret key fornecido)

### 2. Site key do hCaptcha incorreto
- Frontend está usando: `2a34c8f0-3768-4e80-93da-68cc6592b8e6`
- Verifique se essa site key é válida e corresponde ao secret

### 3. Domínio não autorizado no hCaptcha
- O hCaptcha pode estar configurado para aceitar apenas domínios específicos
- Adicione `despa-facil.vercel.app` na lista de domínios permitidos no dashboard do hCaptcha

## Como verificar

### 1. Logs do Railway
Após adicionar os logs (commit atual), verifique os logs do Railway:
- Procure por `[HCAPTCHA] Resposta:`
- Procure por `[HCAPTCHA] Falha na validação:` ou `[HCAPTCHA] Erro na chamada:`

### 2. Testar localmente
```bash
cd backend
# Certifique-se de que .env tem HCAPTCHA_SECRET=ES_6612a...
npm run dev
```

No frontend:
```bash
cd frontend
# Certifique-se de que .env.local tem NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev
```

Teste o fluxo de esqueci senha local e observe os logs.

### 3. Validar manualmente o hCaptcha
```bash
# Substitua SEU_SECRET e SEU_TOKEN_DE_TESTE
curl -X POST https://hcaptcha.com/siteverify \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "secret=ES_6612a...&response=SEU_TOKEN_DE_TESTE"
```

## Solução passo a passo

1. **Railway > Variáveis de ambiente:**
   - Adicione `HCAPTCHA_SECRET=ES_6612a...` (use o secret completo)
   - Redeploy

2. **Dashboard hCaptcha (https://dashboard.hcaptcha.com/):**
   - Vá em "Settings" do site key `2a34c8f0-3768-4e80-93da-68cc6592b8e6`
   - Em "Domains", adicione:
     - `despa-facil.vercel.app`
     - `localhost` (para testes locais)

3. **Verificar logs após redeploy:**
   - Railway > Deployments > Logs
   - Teste novamente o fluxo de esqueci senha
   - Procure por mensagens `[HCAPTCHA]` e `[FORGOT-PASSWORD]`

## Alternativa: criar novo site key no hCaptcha

Se não tiver acesso ao dashboard do site key atual:

1. Acesse https://dashboard.hcaptcha.com/
2. Crie um novo site
3. Anote o **site key** (para frontend) e **secret key** (para backend)
4. Configure domínios permitidos
5. Atualize:
   - Frontend: `frontend/src/app/forgot-password/page.tsx` linha da sitekey
   - Backend Railway: variável `HCAPTCHA_SECRET`

## Mensagem de erro esperada

Se o secret estiver errado ou o domínio não autorizado, o hCaptcha retorna:
```json
{
  "success": false,
  "error-codes": ["invalid-input-secret"] // ou ["invalid-input-response"]
}
```

Esses códigos aparecerão nos logs do Railway após o commit atual.
