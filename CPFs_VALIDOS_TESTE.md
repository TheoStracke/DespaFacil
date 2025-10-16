# 🔢 CPFs Válidos para Teste

## ✅ CPFs Válidos (use estes para testar)

### Opção 1
- **CPF**: `123.456.789-09`
- **Sem máscara**: `12345678909`

### Opção 2
- **CPF**: `111.444.777-35`
- **Sem máscara**: `11144477735`

### Opção 3
- **CPF**: `987.654.321-00`
- **Sem máscara**: `98765432100`

### Opção 4
- **CPF**: `529.982.247-25`
- **Sem máscara**: `52998224725`

### Opção 5
- **CPF**: `862.141.476-37`
- **Sem máscara**: `86214147637`

## ❌ CPFs Inválidos (NÃO use)

- `000.000.000-00` - Todos zeros
- `111.111.111-11` - Todos iguais
- `123.456.789-00` - Dígitos verificadores incorretos
- `12345678900` - Apenas 11 dígitos sem validação

## 🧪 Como Testar

### 1. No Frontend (Formulário)

1. Abra o formulário de cadastro de motorista
2. Preencha os campos:
   ```
   Nome: João da Silva Teste
   CPF: 123.456.789-09 (ou cole: 12345678909)
   Email: joao.teste@email.com
   Data de Nascimento: 15/01/1990
   Sexo: Masculino
   Identidade: 123456789
   Órgão Emissor: SSP
   UF Emissor: SP
   Telefone: (11) 98765-4321
   Tipo de Curso: TAC
   ```
3. Abra o Console (F12)
4. Clique em "Cadastrar Motorista"
5. Veja os logs:
   - `📤 Dados sendo enviados:`
   - `📋 CPF sem máscara:`
   - `✅ CPF válido?`

### 2. Verificar se está removendo a máscara

No console, você deve ver:
```javascript
📤 Dados sendo enviados: {
  nome: "João da Silva Teste",
  cpf: "12345678909",  // ✅ SEM pontos e hífen
  email: "joao.teste@email.com",
  // ... outros campos
}
```

Se aparecer `cpf: "123.456.789-09"` (com máscara), então há um bug.

### 3. Se der erro

Veja a mensagem de erro no console:
```javascript
❌ Erro ao cadastrar motorista: Error
📋 Resposta do servidor: { success: false, error: "MENSAGEM DO ERRO" }
📊 Status HTTP: 400
```

## 🔧 Possíveis Erros e Soluções

### Erro: "CPF já cadastrado"
**Solução**: Use outro CPF da lista acima

### Erro: "CPF inválido"
**Solução**: Certifique-se de usar um CPF válido da lista acima

### Erro: "Campos obrigatórios: nome, cpf, cursoTipo"
**Solução**: Preencha todos os campos obrigatórios

### Erro: "Despachante não encontrado"
**Solução**: 
1. Faça logout
2. Faça login novamente com: `theostracke11@gmail.com` / `SenhaForte123!`
3. Tente cadastrar novamente

### Erro: "Network Error" ou "Failed to fetch"
**Solução**: Verifique se o backend está rodando em `http://localhost:4000`

## 🎯 Teste Manual do Backend

Cole no PowerShell (substitua o TOKEN pelo seu JWT):

```powershell
$token = "SEU_TOKEN_JWT_AQUI"

$body = @{
  nome = "João da Silva Teste"
  cpf = "12345678909"
  email = "joao.teste@email.com"
  dataNascimento = "1990-01-15"
  sexo = "M"
  identidade = "123456789"
  orgaoEmissor = "SSP"
  ufEmissor = "SP"
  telefone = "(11) 98765-4321"
  cursoTipo = "TAC"
} | ConvertTo-Json

$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:4000/api/motoristas" -Method Post -Headers $headers -Body $body
```

## 📝 Obter seu Token JWT

1. Abra o Console do navegador (F12)
2. Digite: `localStorage.getItem('token')`
3. Copie o token (sem as aspas)
4. Use no comando acima

## ✅ Resposta de Sucesso

Se tudo funcionar, você verá:

```json
{
  "success": true,
  "motorista": {
    "id": "cm123abc...",
    "nome": "João da Silva Teste",
    "cpf": "12345678909",
    "email": "joao.teste@email.com",
    // ... outros campos
  }
}
```

E no toast (notificação) aparecerá:
**"Motorista cadastrado!"**
