# 🔐 CREDENCIAIS DE ACESSO - DespaFacil

## 👨‍💼 ADMIN (Administrador)

### Opção 1:
```
Email: theostracke11@gmail.com
Senha: SenhaForte123!
```

### Opção 2:
```
Email: pleuskick@gmail.com
Senha: SenhaForte123!
```

**Acesso:** http://localhost:3000/login

**Permissões:**
- ✅ Ver todos os documentos de todos os despachantes
- ✅ Aprovar/Negar documentos
- ✅ Enviar certificados
- ✅ Exportar relatórios (CSV/XLSX)
- ✅ Acessar painel admin em `/admin`

---

## 📋 DESPACHANTE (Teste)

```
Email: despachante@test.local
Senha: SenhaForte123!
```

**Ou use CNPJ:**
```
CNPJ: 00000000000191
Senha: SenhaForte123!
```

**Acesso:** http://localhost:3000/login

**Permissões:**
- ✅ Criar motoristas
- ✅ Editar seus próprios motoristas
- ✅ Upload de documentos (CNH, Comprovante, Doc1, Doc2)
- ✅ Ver status dos documentos
- ✅ Acessar dashboard em `/dashboard`

---

## 🧪 MOTORISTA EXISTENTE (Para Teste de Upload)

```
Nome: João da Silva
CPF: 12345678901
ID: cmgth8n3m0006rslh9ffsti2q
```

**Pertence ao despachante:** `despachante@test.local`

**Documentos:**
- CNH: Pendente (2 uploads)
- DOCUMENTO1: Pendente (1 upload)

---

## 🎯 FLUXO DE TESTE COMPLETO

### 1. Teste como DESPACHANTE:

```
1. Login: despachante@test.local / SenhaForte123!
2. Acesse: http://localhost:3000/dashboard
3. Crie um novo motorista
4. Faça upload de documentos:
   - CNH
   - Comprovante de Pagamento
   - Documento 1
   - Documento 2
```

### 2. Teste como ADMIN:

```
1. Login: theostracke11@gmail.com / SenhaForte123!
2. Acesse: http://localhost:3000/admin
3. Veja todos os documentos pendentes
4. Aprove ou negue documentos
5. Exporte relatório (CSV/XLSX)
6. Envie certificado para motorista
```

---

## 📝 SENHAS PADRÃO

Todos os usuários criados pelo seed têm a mesma senha:

```
SenhaForte123!
```

**Configurável no .env:**
```env
SEED_ADMIN_PASSWORD=SenhaForte123!
```

---

## 🔄 RESETAR BANCO DE DADOS

Se precisar recomeçar do zero:

```bash
cd backend
npm run db:reset
npm run seed
```

Isso vai:
1. Apagar todos os dados
2. Recriar o schema
3. Popular com dados de teste

---

## 🚀 COMANDOS ÚTEIS

### Ver usuários no banco:
```powershell
# Listar motoristas do despachante
powershell -ExecutionPolicy Bypass -File .\check-motoristas.ps1

# Listar todos os documentos
powershell -ExecutionPolicy Bypass -File .\check-docs.ps1
```

### Teste rápido de upload:
```powershell
powershell -ExecutionPolicy Bypass -File .\test-final.ps1
```

---

## 🌐 URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Prisma Studio:** http://localhost:5555 (se rodando)

---

## 📊 ENDPOINTS DA API

### Auth:
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Fazer login

### Motoristas (Despachante):
- `GET /api/motoristas` - Listar seus motoristas
- `POST /api/motoristas` - Criar motorista
- `PUT /api/motoristas/:id` - Editar motorista
- `DELETE /api/motoristas/:id` - Deletar motorista

### Documentos (Despachante):
- `POST /api/documentos/upload` - Upload de documento
- `GET /api/documentos/:id/download` - Download

### Admin:
- `GET /api/admin/documentos` - Listar todos documentos
- `PUT /api/documentos/:id/status` - Aprovar/Negar
- `POST /api/admin/certificados/send` - Enviar certificado
- `GET /api/admin/export` - Exportar CSV/XLSX

---

## ✅ ESTÁ TUDO PRONTO!

Basta fazer login com qualquer uma das credenciais acima e testar! 🎯
