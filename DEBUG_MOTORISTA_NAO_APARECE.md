# 🐛 DEBUG: Motorista não aparece na lista

## 🔍 Passos para Diagnosticar

### 1️⃣ Abra o Console do Navegador (F12)

Vá para a aba **Console**

### 2️⃣ Recarregue o Dashboard

Pressione `Ctrl+R` ou `F5` para recarregar a página `/dashboard`

### 3️⃣ Veja os Logs

Você deve ver os seguintes logs no console:

```
🔄 Carregando motoristas...
📦 Resposta completa: { success: true, motoristas: [...], pagination: {...} }
📋 response.motoristas: [...]
📋 response.data: undefined
✅ Motoristas carregados: X [Array de motoristas]
```

### 4️⃣ Me envie as informações:

**Copie e cole aqui:**

1. O que aparece em `response.motoristas`?
2. Quantos motoristas aparecem no console?
3. Há algum erro em vermelho no console?

---

## 🔧 Verificações Adicionais

### Verifique no Prisma Studio

1. Abra: `http://localhost:5555`
2. Clique em `Motorista` (tabela)
3. Veja se há registros
4. Copie o `despachanteId` de algum motorista
5. Clique em `Despachante` (tabela)
6. Veja se o `id` do despachante bate com o `despachanteId` do motorista

### Verifique no Backend

Teste diretamente a API:

**PowerShell:**
```powershell
# 1. Obtenha o token
$token = (Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method Post -Body '{"emailOrCnpj":"despachante@teste.com","password":"SenhaForte123!"}' -ContentType "application/json").accessToken

# 2. Liste os motoristas
$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:4000/api/motoristas" -Method Get -Headers $headers | ConvertTo-Json -Depth 5
```

---

## 🎯 Possíveis Problemas

### Problema 1: Despachante não foi criado ao registrar
**Sintoma:** Erro "Despachante não encontrado" no console  
**Solução:** Já corrigi no código, mas se você se cadastrou antes da correção, precisa criar o despachante manualmente

### Problema 2: despachanteId diferente
**Sintoma:** Motorista existe, mas com despachanteId diferente do despachante logado  
**Solução:** Verificar no Prisma Studio se os IDs batem

### Problema 3: Resposta do backend está vazia
**Sintoma:** `response.motoristas: []` (array vazio)  
**Solução:** Backend não está retornando os motoristas por algum motivo

### Problema 4: Frontend está pegando o campo errado
**Sintoma:** `response.motoristas: undefined` e `response.data: undefined`  
**Solução:** Verificar estrutura exata da resposta

---

## 📝 Checklist de Verificação

- [ ] Motorista existe no Prisma Studio?
- [ ] Despachante existe no Prisma Studio?
- [ ] despachanteId do motorista = id do despachante?
- [ ] userId do despachante = id do user logado?
- [ ] Backend retorna motoristas quando testa direto na API?
- [ ] Console mostra os logs de debug?
- [ ] Há erros em vermelho no console?

---

## 🚀 Próximo Passo

**Me envie um print ou copie:**
1. Os logs do console (completos)
2. Quantos motoristas tem no Prisma Studio
3. Se o teste direto da API funciona

Com essas informações vou saber exatamente onde está o problema! 🎯
