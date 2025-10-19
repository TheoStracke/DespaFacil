# 🚀 Guia Completo de Deploy - DespaFacil

Este guia ensina como fazer deploy do **DespaFacil** do zero, mesmo sem experiência com Railway ou Vercel.

---

## 📋 Visão Geral

- **Backend**: Railway (Node.js + PostgreSQL)
- **Frontend**: Vercel (Next.js)
- **Custo**: Ambos têm plano gratuito generoso para começar

---

## 🎯 Parte 1: Deploy do Backend (Railway)

### 1.1 Criar Conta no Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em **"Start a New Project"** ou **"Login"**
3. Faça login com GitHub (recomendado)
4. Autorize o Railway a acessar seus repositórios

### 1.2 Criar Novo Projeto

1. No dashboard do Railway, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório `DespaFacil`
4. Railway vai detectar automaticamente que é um projeto Node.js

### 1.3 Configurar PostgreSQL

1. No projeto criado, clique em **"+ New"**
2. Selecione **"Database"** → **"Add PostgreSQL"**
3. Railway vai criar um banco PostgreSQL automaticamente
4. Aguarde alguns segundos até o banco estar **"Active"**

### 1.4 Configurar Variáveis de Ambiente

1. Clique no serviço do **Backend** (Node.js)
2. Vá em **"Variables"** ou **"Settings"** → **"Environment Variables"**
3. Adicione as seguintes variáveis:

```env
# Database (Railway gera automaticamente, só verificar)
DATABASE_URL=postgresql://postgres:senha@host:port/railway

# JWT
JWT_SECRET=sua-chave-secreta-super-forte-aqui-min-32-caracteres
JWT_EXPIRES_IN=7d

# BCRYPT
BCRYPT_SALT_ROUNDS=12

# CORS (URL do frontend Vercel)
CORS_ORIGIN=https://seu-app.vercel.app

# Email (Opcional - Configure depois)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seuemail@gmail.com
SMTP_PASS=sua-senha-app
EMAIL_FROM=seuemail@gmail.com

# Node
NODE_ENV=production
PORT=4000

# Seed (Opcional)
SEED_ADMIN_PASSWORD=SenhaForte123!
```

**⚠️ IMPORTANTE:**
- `DATABASE_URL`: Railway já configura automaticamente quando você adiciona PostgreSQL
- `JWT_SECRET`: Gere uma chave forte (pode usar: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `CORS_ORIGIN`: Coloque a URL do seu app na Vercel (você vai obter isso depois)

### 1.5 Configurar Build e Deploy

1. No serviço do Backend, vá em **"Settings"**
2. Em **"Build Command"**, configure:
   ```bash
   npm install && npm run build && npx prisma generate && npx prisma migrate deploy
   ```

3. Em **"Start Command"**, configure:
   ```bash
   npm start
   ```

4. Em **"Root Directory"**, configure:
   ```
   backend
   ```

5. Clique em **"Deploy"** ou aguarde o deploy automático

### 1.6 Executar Seed (Criar Admins)

Após o primeiro deploy:

1. Vá em **"Settings"** → **"Deployments"**
2. Localize o último deployment bem-sucedido
3. Clique nos **3 pontinhos** → **"View Logs"**
4. Verifique se as migrations rodaram com sucesso
5. Para executar o seed, você pode:
   - **Opção A (Recomendada)**: Adicionar ao build command:
     ```bash
     npm install && npm run build && npx prisma generate && npx prisma migrate deploy && npm run seed
     ```
   - **Opção B**: Usar o Railway CLI (veja seção 1.8)

### 1.7 Obter URL do Backend

1. No dashboard do projeto, clique no serviço do **Backend**
2. Vá em **"Settings"** → **"Networking"**
3. Clique em **"Generate Domain"**
4. Railway vai gerar uma URL tipo: `https://seu-app.up.railway.app`
5. **Copie essa URL** - você vai precisar para o frontend!

### 1.8 (Opcional) Railway CLI - Para Executar Comandos

Se precisar rodar comandos manualmente (seed, migrations, etc):

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Selecionar projeto
railway link

# Executar seed
railway run npm run seed

# Ver logs
railway logs

# Abrir shell no container
railway shell
```

---

## 🎯 Parte 2: Deploy do Frontend (Vercel)

### 2.1 Criar Conta na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Sign Up"**
3. Faça login com GitHub (recomendado)
4. Autorize a Vercel a acessar seus repositórios

### 2.2 Importar Projeto

1. No dashboard da Vercel, clique em **"Add New..."** → **"Project"**
2. Selecione o repositório `DespaFacil`
3. Clique em **"Import"**

### 2.3 Configurar Projeto

1. **Framework Preset**: Vercel detecta automaticamente como **Next.js** ✅
2. **Root Directory**: Configure como `frontend`
3. Clique em **"Edit"** ao lado de "Root Directory" e selecione a pasta `frontend`

### 2.4 Configurar Variáveis de Ambiente

Ainda na tela de configuração, clique em **"Environment Variables"** e adicione:

```env
# URL do Backend (Railway)
NEXT_PUBLIC_API_URL=https://seu-app.up.railway.app/api

# (Opcional) HCaptcha
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=sua-chave-hcaptcha
```

**⚠️ IMPORTANTE:**
- `NEXT_PUBLIC_API_URL`: Use a URL do Railway que você copiou anteriormente + `/api`
- Variáveis com `NEXT_PUBLIC_` ficam visíveis no navegador (são públicas)

### 2.5 Deploy

1. Clique em **"Deploy"**
2. Aguarde 2-5 minutos (Vercel vai instalar dependências, buildar e fazer deploy)
3. Quando terminar, você verá uma tela de sucesso com confetes 🎉

### 2.6 Obter URL do Frontend

1. A Vercel gera automaticamente uma URL tipo: `https://seu-app.vercel.app`
2. **Copie essa URL**
3. Você também pode configurar um domínio personalizado depois

### 2.7 Atualizar CORS no Backend

**IMPORTANTE**: Agora que você tem a URL do frontend, precisa atualizar o backend:

1. Volte no **Railway**
2. Vá no serviço do **Backend** → **"Variables"**
3. Atualize `CORS_ORIGIN` com a URL da Vercel:
   ```env
   CORS_ORIGIN=https://seu-app.vercel.app
   ```
4. O Railway vai fazer redeploy automaticamente

---

## 🎯 Parte 3: Configurações Adicionais

### 3.1 Domínio Personalizado (Opcional)

#### Vercel (Frontend):
1. No projeto na Vercel, vá em **"Settings"** → **"Domains"**
2. Clique em **"Add"**
3. Digite seu domínio (ex: `despafacil.com`)
4. Siga as instruções para configurar DNS no seu provedor de domínio
5. Adicione os registros DNS que a Vercel mostrar

#### Railway (Backend):
1. No serviço do Backend, vá em **"Settings"** → **"Networking"**
2. Em **"Custom Domain"**, clique em **"Add Domain"**
3. Digite seu domínio (ex: `api.despafacil.com`)
4. Configure o registro CNAME no seu provedor de domínio apontando para o Railway

### 3.2 Configurar Email (SMTP)

Para envio de emails (reset de senha, etc), você precisa de um serviço SMTP:

#### Opção 1: Gmail (Mais fácil para testar)
1. Ative a verificação em 2 etapas na sua conta Google
2. Gere uma "Senha de App": [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use essa senha nas variáveis de ambiente do Railway:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=seuemail@gmail.com
   SMTP_PASS=senha-de-app-gerada
   EMAIL_FROM=seuemail@gmail.com
   ```

#### Opção 2: SendGrid (Recomendado para produção)
1. Crie conta em [sendgrid.com](https://sendgrid.com)
2. Crie uma API Key
3. Configure:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=sua-api-key-sendgrid
   EMAIL_FROM=noreply@seudominio.com
   ```

### 3.3 Upload de Arquivos (Storage)

**⚠️ IMPORTANTE**: Railway usa armazenamento efêmero. Arquivos enviados são perdidos a cada deploy.

Para produção, você tem 3 opções:

#### Opção 1: Railway Volumes (Recomendado para começar)
1. No Railway, vá no serviço do Backend
2. Clique em **"+ New"** → **"Volume"**
3. Configure:
   - **Mount Path**: `/app/uploads`
   - **Size**: 1GB (ou mais, conforme necessário)
4. Adicione variável de ambiente:
   ```env
   UPLOADS_DIR=/app/uploads
   ```

#### Opção 2: AWS S3 (Recomendado para escala)
1. Crie bucket no S3
2. Configure credenciais IAM
3. Adicione variáveis no Railway:
   ```env
   STORAGE_PROVIDER=s3
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=sua-key
   AWS_SECRET_ACCESS_KEY=sua-secret
   AWS_S3_BUCKET=seu-bucket
   ```

#### Opção 3: Cloudflare R2 (Mais barato que S3)
Similar ao S3, mas mais em conta para arquivos estáticos.

### 3.4 Monitoramento e Logs

#### Railway:
1. Vá no serviço → **"Deployments"** → **"View Logs"**
2. Você pode ver logs em tempo real
3. Configure **"Metrics"** para ver uso de CPU/RAM

#### Vercel:
1. Vá no projeto → **"Deployments"** → Clique em um deploy
2. Vá em **"Functions"** para ver logs de API Routes
3. Use **"Analytics"** (pago) para métricas detalhadas

---

## 🎯 Parte 4: Checklist Pós-Deploy

### ✅ Verificar Backend (Railway)

```bash
# Testar se API está no ar
curl https://seu-app.up.railway.app/api

# Deve retornar: {"message": "API DespaFacil - Documentação disponível em /api"}
```

Ou abra no navegador: `https://seu-app.up.railway.app/api`

### ✅ Verificar Frontend (Vercel)

1. Abra: `https://seu-app.vercel.app`
2. Você deve ver a página de login
3. Tente fazer login com um admin:
   - CNPJ: `43.403.910/0001-28`
   - Senha: `Vellum@25`

### ✅ Testar Fluxo Completo

1. **Login** ✅
2. **Cadastrar Motorista** ✅
3. **Upload de Documento** ✅
4. **Aprovar/Reprovar Documento** (admin) ✅
5. **Enviar Certificado** (admin) ✅

---

## 🎯 Parte 5: Troubleshooting

### Problema: "CORS Error" no Frontend

**Solução:**
1. Verifique se `CORS_ORIGIN` no Railway está correto
2. Deve ser a URL EXATA da Vercel (sem barra no final)
3. Redeploy do backend após mudança

### Problema: "Cannot connect to database"

**Solução:**
1. Verifique se o PostgreSQL está **Active** no Railway
2. Verifique se `DATABASE_URL` está configurada
3. Veja os logs: Railway → Backend → View Logs
4. Tente fazer redeploy

### Problema: "Migration failed"

**Solução:**
1. Verifique se o build command inclui `npx prisma migrate deploy`
2. Veja os logs de build
3. Se necessário, rode manualmente:
   ```bash
   railway run npx prisma migrate deploy
   ```

### Problema: "Admins não foram criados"

**Solução:**
1. Execute o seed manualmente:
   ```bash
   railway run npm run seed
   ```
2. Ou adicione `npm run seed` no build command

### Problema: "Upload de arquivos não funciona"

**Solução:**
1. Configure um **Volume** no Railway (ver seção 3.3)
2. Ou configure S3/R2 para storage persistente
3. Verifique se `UPLOADS_DIR` está configurado

### Problema: "Email não está sendo enviado"

**Solução:**
1. Verifique credenciais SMTP
2. Se usar Gmail, gere uma "Senha de App"
3. Veja logs do backend para erros de SMTP
4. Teste com serviço como Mailtrap.io primeiro

---

## 🎯 Parte 6: Deploy Automático (CI/CD)

### GitHub Actions (Já configurado!)

O projeto já tem workflows configurados. A cada push:

1. **Backend**: Testa, builda e faz lint
2. **Frontend**: Testa e builda

Railway e Vercel fazem deploy automático a cada push na branch `main`.

### Configurar Deploy em Branches

#### Railway:
1. Vá em **"Settings"** → **"Service Settings"**
2. Em **"Deploy Triggers"**, configure:
   - **Branch**: `main` (produção)
   - Crie outro serviço para `staging` se quiser

#### Vercel:
1. Vá em **"Settings"** → **"Git"**
2. Configure:
   - **Production Branch**: `main`
   - **Preview Deployments**: Todas as outras branches

---

## 🎯 Parte 7: Custos e Limites

### Railway (Plano Gratuito)

- ✅ $5 de crédito grátis por mês
- ✅ Até 500 horas de execução/mês
- ✅ 1GB de RAM
- ✅ 1GB de armazenamento (PostgreSQL)
- ⚠️ Serviço hiberna após inatividade (pode demorar 1-2min para "acordar")

**Upgrade**: $20/mês para serviço sempre ativo e mais recursos.

### Vercel (Plano Gratuito - Hobby)

- ✅ 100GB de bandwidth/mês
- ✅ Builds ilimitados
- ✅ Domínios personalizados ilimitados
- ✅ SSL automático
- ✅ Preview deployments ilimitados
- ⚠️ Máximo 100 deployments/dia

**Upgrade**: $20/mês (Pro) para analytics, mais builds paralelos, etc.

---

## 🎯 Resumo dos URLs

Anote aqui seus URLs após o deploy:

| Serviço | URL | Onde Usar |
|---------|-----|-----------|
| **Backend (Railway)** | `https://seu-app.up.railway.app` | `CORS_ORIGIN` (Railway)<br>`NEXT_PUBLIC_API_URL` (Vercel) |
| **Frontend (Vercel)** | `https://seu-app.vercel.app` | Compartilhar com usuários |
| **PostgreSQL (Railway)** | `postgresql://...` | Já configurado automaticamente |

---

## 🎯 Próximos Passos

1. ✅ Configure um domínio personalizado
2. ✅ Configure email SMTP (SendGrid)
3. ✅ Configure storage persistente (S3/R2)
4. ✅ Configure monitoramento (Sentry, LogRocket)
5. ✅ Configure backup do banco (Railway Backups)
6. ✅ Configure alertas (Railway Notifications)

---

## 📚 Links Úteis

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

## 🆘 Precisa de Ajuda?

Se tiver problemas:

1. Verifique os **logs** no Railway e Vercel
2. Veja a seção **Troubleshooting** acima
3. Verifique se todas as **variáveis de ambiente** estão corretas
4. Teste localmente primeiro (`npm run dev`)

---

**Feito com ❤️ para o DespaFacil**

