# DespaFacil Backend

API REST completa para o sistema DespaFacil - gerenciamento de motoristas e documentos por despachantes com painel administrativo.

## 🚀 Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT (jsonwebtoken)
- **Hash de Senhas**: bcryptjs
- **Upload de Arquivos**: multer
- **E-mail**: Nodemailer (SMTP Gmail)
- **Export**: xlsx

## 📁 Estrutura de Pastas

```
backend/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   └── seed.ts            # Script de seed (admins + dados teste)
├── src/
│   ├── controllers/       # Controllers (auth, motorista, documento)
│   ├── services/          # Lógica de negócio
│   ├── routes/            # Definição de rotas
│   ├── middlewares/       # Auth, error handler
│   ├── utils/             # Mailer, multer, validators
│   ├── prisma/            # Cliente Prisma
│   ├── app.ts             # Configuração Express
│   └── server.ts          # Inicialização do servidor
├── uploads/               # Arquivos enviados (gitignored)
├── .env.example           # Exemplo de variáveis de ambiente
├── package.json
└── tsconfig.json
```

## ⚙️ Setup Local

### 1. Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL rodando localmente (ou use Docker)
- Conta Gmail com App Password configurada

### 2. Instalação

```bash
cd backend
npm install
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/despafacil
PORT=4000
JWT_SECRET=your_strong_jwt_secret_here
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=12

# SMTP Gmail (use App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=app-password-aqui

# Notificações
NOTIFICATION_EMAIL=despafacilrepo@gmail.com
NOTIFICATION_CC=theostracke11@gmail.com

# Upload
MAX_UPLOAD_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf,image/png,image/jpeg
STORAGE_PROVIDER=local

# Seed
SEED_ADMIN_PASSWORD=SenhaForte123!
```

#### 🔐 Como gerar App Password do Gmail

1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Vá em **Segurança**
3. Ative **Verificação em duas etapas** (se ainda não estiver ativo)
4. Procure por **Senhas de app**
5. Gere uma senha para "Mail" ou "Other"
6. Copie a senha gerada e cole em `SMTP_PASS`

### 4. Configurar Banco de Dados

Rode as migrations do Prisma:

```bash
npx prisma migrate dev --name init
```

Ou para ambiente de produção:

```bash
npx prisma migrate deploy
```

### 5. Seed (Dados Iniciais)

Execute o seed para criar os admins e dados de teste:

```bash
npm run seed
```

**Credenciais criadas:**
- Admin 1: `theostracke11@gmail.com` / `SenhaForte123!`
- Admin 2: `pleuskick@gmail.com` / `SenhaForte123!`
- Despachante teste: `despachante@test.local` / `SenhaForte123!`

### 6. Iniciar Servidor

Modo desenvolvimento (hot reload):

```bash
npm run dev
```

Build para produção:

```bash
npm run build
npm start
```

O servidor estará rodando em `http://localhost:4000`

## 📡 Endpoints da API

### Auth

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Cadastro de despachante | Não |
| POST | `/api/auth/login` | Login (email ou CNPJ) | Não |
| POST | `/api/auth/forgot-password` | Solicita redefinição de senha | Não |
| POST | `/api/auth/reset-password` | Redefine senha com token | Não |

### Motoristas

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/motoristas` | Criar motorista | DESPACHANTE/ADMIN |
| GET | `/api/motoristas` | Listar motoristas (filtros: search, page, limit) | DESPACHANTE/ADMIN |
| GET | `/api/motoristas/:id` | Detalhes do motorista + documentos | DESPACHANTE/ADMIN |
| PUT | `/api/motoristas/:id` | Atualizar motorista | DESPACHANTE/ADMIN |
| DELETE | `/api/motoristas/:id` | Excluir motorista | DESPACHANTE/ADMIN |

### Documentos

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/documentos/upload` | Upload de documento (multipart, campos: file, motoristaId, tipo) | DESPACHANTE/ADMIN |
| GET | `/api/documentos/:id/download` | Download de documento | DESPACHANTE/ADMIN |
| PUT | `/api/documentos/:id/status` | Aprovar/Negar documento (campos: status, motivo) | ADMIN |

### Admin

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/admin/documentos` | Listar documentos (filtros: status, from, to, despachanteId, motoristaId) | ADMIN |
| GET | `/api/admin/export` | Exportar CSV/XLSX (filtros: status, from, to) | ADMIN |
| POST | `/api/admin/certificados/send` | Enviar certificado (multipart, campos: file, motoristaSearch) | ADMIN |

## 🔐 Autenticação

Todas as rotas protegidas requerem o header:

```
Authorization: Bearer <token>
```

O token é retornado no endpoint `/api/auth/login`.

## 📧 Notificações por E-mail

O sistema envia e-mails automaticamente em:

1. **Upload de documento**: notifica `despafacilrepo@gmail.com` (CC: `theostracke11@gmail.com`)
2. **Aprovação/Negação**: notifica o despachante responsável
3. **Envio de certificado**: notifica o despachante

## 📤 Upload de Arquivos

- **Tipos permitidos**: PDF, PNG, JPG
- **Tamanho máximo**: 10 MB
- **Armazenamento**: pasta `uploads/` (local) ou S3 (configurável)
- **Validação**: server-side (multer + validação de MIME type)

Cada motorista pode ter **um arquivo por tipo**:
- CNH
- COMPROVANTE_PAGAMENTO
- DOCUMENTO1
- DOCUMENTO2

Se enviar novo arquivo do mesmo tipo, o anterior é substituído (com log).

## 🧪 Testes

Execute os testes:

```bash
npm test
```

## 🚢 Deploy (Railway)

### 1. Criar conta no Railway

Acesse [railway.app](https://railway.app) e crie um projeto.

### 2. Adicionar PostgreSQL

No dashboard do Railway:
- Clique em **New** → **Database** → **PostgreSQL**
- Copie a `DATABASE_URL` gerada

### 3. Configurar Variáveis de Ambiente

No Railway, vá em **Variables** e adicione todas as variáveis do `.env.example`.

### 4. Deploy via GitHub

- Conecte seu repositório GitHub no Railway
- O Railway detectará automaticamente o `package.json`
- Configure o **Start Command**: `npm run migrate && npm run seed && npm start`

### 5. Acesso

O Railway gerará uma URL pública (ex: `https://despafacil-backend-production.up.railway.app`)

## 🛠️ Scripts Disponíveis

```bash
npm run dev              # Inicia servidor em modo desenvolvimento
npm run build            # Compila TypeScript para JavaScript
npm start                # Inicia servidor em produção
npm run migrate          # Roda migrations (produção)
npm run migrate:dev      # Roda migrations (dev com prompt)
npm run seed             # Executa seed
npm run prisma:studio    # Abre Prisma Studio (GUI do banco)
npm run prisma:generate  # Gera Prisma Client
npm run lint             # Roda ESLint
npm test                 # Roda testes
```

## 🔒 Segurança

- ✅ Senhas criptografadas com bcrypt (12 rounds)
- ✅ JWT com expiração configurável
- ✅ Rate limiting recomendado (implementar com express-rate-limit)
- ✅ Validação de tipos de arquivo (MIME type)
- ✅ Sanitização de nomes de arquivo
- ✅ CORS configurado
- ✅ Helmet para headers de segurança
- ✅ Validação de CPF/CNPJ

## 📚 Modelos do Prisma

- **User**: usuário (ADMIN ou DESPACHANTE)
- **Despachante**: dados do despachante
- **Motorista**: dados do motorista
- **Documento**: arquivo enviado + status
- **LogDocumento**: histórico de ações no documento

## 🐛 Troubleshooting

### Erro: "Cannot connect to PostgreSQL"

Verifique se o PostgreSQL está rodando e se a `DATABASE_URL` está correta.

### Erro: "Invalid credentials" no SMTP

Certifique-se de usar um **App Password** do Gmail, não a senha normal.

### Erro: "Token inválido"

O token JWT pode ter expirado. Faça login novamente.

### Uploads não funcionam

Verifique se a pasta `uploads/` existe e tem permissões de escrita.

## 📞 Suporte

Para dúvidas ou problemas, entre em contato:
- theostracke11@gmail.com
- pleuskick@gmail.com

---

**Desenvolvido por**: Theo Stracke & Pleu Kick  
**Versão**: 1.0.0
