# 🚀 Início Rápido - Testes do Backend

## ⚡ Setup em 5 Passos

### 1️⃣ Instalar Dependências

```powershell
cd backend
npm install
```

### 2️⃣ Configurar Ambiente

```powershell
# Copiar .env.example
cp .env.example .env

# Editar .env (mínimo necessário)
# DATABASE_URL=postgresql://user:password@localhost:5432/despafacil
# JWT_SECRET=qualquer-string-secreta-aqui
# SMTP_USER=seu-email@gmail.com
# SMTP_PASS=sua-app-password-do-gmail
```

**⚠️ IMPORTANTE**: Se não configurar SMTP, os emails não serão enviados, mas o resto funcionará normalmente.

### 3️⃣ Preparar Banco de Dados

```powershell
# Criar tabelas
npx prisma migrate dev --name init

# Criar admins e dados de teste
npm run seed
```

**Saída esperada:**
```
✅ Admin criado: theostracke11@gmail.com
✅ Admin criado: pleuskick@gmail.com
✅ Despachante criado: despachante@test.local
✅ Motorista de teste criado
```

### 4️⃣ Iniciar Servidor

```powershell
npm run dev
```

**Aguarde ver:**
```
✅ Server running on http://localhost:4000
```

### 5️⃣ Rodar Testes Automáticos

**PowerShell (Windows):**
```powershell
.\test-backend.ps1
```

**Bash (Linux/Mac):**
```bash
chmod +x test-backend.sh
./test-backend.sh
```

---

## 🧪 Teste Manual Rápido (curl)

### Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrCnpj":"theostracke11@gmail.com","password":"SenhaForte123!"}'
```

**Copie o `accessToken` da resposta!**

### Listar Motoristas

```bash
# Substitua <TOKEN> pelo token copiado
curl -X GET http://localhost:4000/api/motoristas \
  -H "Authorization: Bearer <TOKEN>"
```

---

## ✅ Checklist Rápido

Após rodar os passos acima, verifique:

- [ ] Servidor rodando em http://localhost:4000
- [ ] Login retorna token
- [ ] Listar motoristas funciona
- [ ] Seed criou 2 admins + 1 despachante

---

## 📚 Documentação Completa

- **Todos os testes**: [TESTES_BACKEND.md](../TESTES_BACKEND.md)
- **Configuração detalhada**: [README.md](README.md)
- **Resumo do backend**: [../ETAPA_1_BACKEND_COMPLETA.md](../ETAPA_1_BACKEND_COMPLETA.md)

---

## 🐛 Problemas Comuns

### "Cannot connect to PostgreSQL"

```bash
# Verifique se o PostgreSQL está rodando
# Windows:
net start postgresql-x64-14

# Linux/Mac:
sudo service postgresql start
```

### "Prisma Client not generated"

```bash
npx prisma generate
```

### "SMTP error"

Não é crítico para testes iniciais. Configure depois se precisar de notificações.

---

## 🎯 Próximo Passo

Após confirmar que tudo funciona, podemos:

1. **Continuar para o Frontend** (Next.js)
2. **Deploy no Railway** (backend em produção)
3. **Testes adicionais** (mais cenários)

**Me avise o resultado dos testes!** 🚀
