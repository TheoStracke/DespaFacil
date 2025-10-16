# 📋 Formato de Dados - Cadastro de Motorista

## Backend espera receber (POST /api/motoristas)

```json
{
  "nome": "João Silva",
  "cpf": "12345678900",
  "email": "joao@email.com",
  "dataNascimento": "1990-01-15",
  "sexo": "M",
  "identidade": "123456789",
  "orgaoEmissor": "SSP",
  "ufEmissor": "SP",
  "telefone": "(11) 98765-4321",
  "cursoTipo": "TAC"
}
```

## ✅ Campos Obrigatórios

- ✅ `nome` (string) - Nome completo
- ✅ `cpf` (string) - CPF **SEM máscara** (apenas números)
- ✅ `cursoTipo` (string) - "TAC" ou "RT"

## 📝 Campos Opcionais

- `email` (string) - Email válido
- `dataNascimento` (string) - Formato: YYYY-MM-DD (ex: "1990-01-15")
- `sexo` (string) - "M" ou "F"
- `identidade` (string) - RG
- `orgaoEmissor` (string) - Ex: "SSP"
- `ufEmissor` (string) - Sigla do estado (ex: "SP", "RJ")
- `telefone` (string) - Telefone com ou sem máscara

## 🔍 Validações do Backend

1. **CPF**: 
   - Deve ser válido (validação de dígitos verificadores)
   - Não pode estar cadastrado anteriormente
   - Backend remove automaticamente caracteres não numéricos

2. **Data de Nascimento**:
   - Formato ISO: `YYYY-MM-DD`
   - Backend converte para `Date` object do Prisma

3. **Email**:
   - Opcional, mas se enviado deve ser válido

## 🐛 Exemplo de Payload do Frontend

```javascript
// Antes de enviar (com máscara)
{
  nome: "João Silva",
  cpf: "123.456.789-00",  // ❌ COM máscara
  email: "joao@email.com",
  dataNascimento: "1990-01-15",
  sexo: "M",
  identidade: "12.345.678-9",
  orgaoEmissor: "SSP",
  ufEmissor: "SP",
  telefone: "(11) 98765-4321",
  cursoTipo: "TAC"
}

// Depois de processar (sem máscara no CPF)
{
  nome: "João Silva",
  cpf: "12345678900",  // ✅ SEM máscara
  email: "joao@email.com",
  dataNascimento: "1990-01-15",
  sexo: "M",
  identidade: "12.345.678-9",
  orgaoEmissor: "SSP",
  ufEmissor: "SP",
  telefone: "(11) 98765-4321",
  cursoTipo: "TAC"
}
```

## 🚨 Erros Comuns

### 1. "CPF já cadastrado"
```json
{
  "success": false,
  "error": "CPF já cadastrado"
}
```
**Solução**: Verificar se o CPF já existe no banco

### 2. "CPF inválido"
```json
{
  "success": false,
  "error": "CPF inválido"
}
```
**Solução**: Verificar dígitos verificadores do CPF

### 3. "Campos obrigatórios: nome, cpf, cursoTipo"
```json
{
  "success": false,
  "error": "Campos obrigatórios: nome, cpf, cursoTipo"
}
```
**Solução**: Verificar se todos os campos obrigatórios estão sendo enviados

### 4. "Despachante não encontrado"
```json
{
  "success": false,
  "error": "Despachante não encontrado"
}
```
**Solução**: Verificar se o token JWT está válido e o usuário é um despachante

## 🔐 Headers Necessários

```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

## 📝 Resposta de Sucesso

```json
{
  "success": true,
  "motorista": {
    "id": "cm123abc456",
    "nome": "João Silva",
    "cpf": "12345678900",
    "email": "joao@email.com",
    "dataNascimento": "1990-01-15T00:00:00.000Z",
    "sexo": "M",
    "identidade": "12.345.678-9",
    "orgaoEmissor": "SSP",
    "ufEmissor": "SP",
    "telefone": "(11) 98765-4321",
    "cursoTipo": "TAC",
    "despachanteId": "cm456def789",
    "createdAt": "2025-10-16T10:30:00.000Z",
    "updatedAt": "2025-10-16T10:30:00.000Z"
  }
}
```

## 🧪 Testar com cURL (PowerShell)

```powershell
$token = "SEU_JWT_TOKEN_AQUI"

$body = @{
  nome = "João Silva Teste"
  cpf = "12345678900"
  email = "joao.teste@email.com"
  dataNascimento = "1990-01-15"
  sexo = "M"
  identidade = "123456789"
  orgaoEmissor = "SSP"
  ufEmissor = "SP"
  telefone = "(11) 98765-4321"
  cursoTipo = "TAC"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:4000/api/motoristas" `
  -Method Post `
  -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Body $body
```
