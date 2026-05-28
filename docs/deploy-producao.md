# Plano de Deploy de Produção — DespaFacil

## Visão Geral da Arquitetura

```
Vercel         → Frontend  (Next.js 14)
Railway / Azure App Service → Backend   (Node.js + Express)
Azure Blob Storage          → Arquivos  (documentos e certificados)
PostgreSQL (URL própria)    → Banco de dados
```

---

## 1. Banco de Dados

O banco PostgreSQL já está publicado em URL própria.  
Nenhuma configuração adicional de hospedagem necessária — apenas garantir que a `DATABASE_URL` esteja correta nas variáveis do backend.

---

## 2. Azure Blob Storage (Arquivos)

### Por que Azure?
O Vercel tem filesystem somente leitura. O backend precisa de um storage externo para uploads de documentos e certificados. O Azure Blob Storage foi escolhido por já estar no ecossistema do cliente.

### Criar o container
1. Acesse o **Portal Azure** → sua Storage Account
2. Vá em **Containers** → **+ Container**
3. Nome sugerido: `despafacil-uploads`
4. Nível de acesso: **Privado** (sem acesso público anônimo)

### Obter a Connection String
> **Portal Azure** → Storage Account → **Security + networking** → **Access keys** → copie a `Connection string` da `key1`

### Variáveis de ambiente necessárias (escolha uma forma)

**Opção A — Connection String (mais simples):**
```env
STORAGE_PROVIDER=azure
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=despafacil-uploads
```

**Opção B — Chave separada:**
```env
STORAGE_PROVIDER=azure
AZURE_STORAGE_ACCOUNT_NAME=suaconta
AZURE_STORAGE_ACCOUNT_KEY=suachave==
AZURE_STORAGE_CONTAINER_NAME=despafacil-uploads
```

---

## 3. Backend

### Plataforma recomendada: Railway (já configurado)
O projeto já possui `Procfile` e scripts prontos para Railway.  
Alternativa: **Azure App Service** (consistência com o restante da infra).

### Configurações do serviço

| Campo | Valor |
|---|---|
| **Root Directory** | `backend` |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `npx prisma migrate deploy && npm start` |

> O `migrate deploy` aplica as migrations versionadas em produção (nunca usar `migrate dev` em prod).  
> O `npm start` executa `node dist/server.js`.

### Variáveis de ambiente completas

```env
# Banco
DATABASE_URL=postgresql://user:password@host:5432/despafacil

# Aplicação
NODE_ENV=production
PORT=4000
BIND_HOST=0.0.0.0

# Autenticação
JWT_SECRET=<string longa e aleatória — nunca reutilize a do dev>
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=12

# CORS
FRONTEND_URL=https://seu-dominio.vercel.app

# E-mail
SMTP_HOST=smtp.postmarkapp.com
SMTP_PORT=587
SMTP_USER=<postmark-token>
SMTP_PASS=<postmark-token>
NOTIFICATION_EMAIL=contato@despafacil.com.br
NOTIFICATION_CC=

# Storage — Azure
STORAGE_PROVIDER=azure
AZURE_STORAGE_CONNECTION_STRING=<connection string>
AZURE_STORAGE_CONTAINER_NAME=despafacil-uploads

# Uploads
MAX_UPLOAD_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf,image/png,image/jpeg

# reCAPTCHA (recuperação de senha)
GOOGLE_APPLICATION_CREDENTIALS_JSON=<base64 do JSON da service account>

# Seed
SEED_ADMIN_PASSWORD=<senha forte do admin inicial>
```

### Primeiro deploy — seed do admin
Após o primeiro deploy, crie o usuário admin inicial:
```bash
# No terminal do Railway (ou via one-off task)
cd backend
npx ts-node prisma/seed.ts
```

### Dependência Azure (instalar antes do build)
```bash
cd backend
npm install
# @azure/storage-blob já está em package.json
```

---

## 4. Frontend

### Plataforma: Vercel (ideal para Next.js)

| Campo | Valor |
|---|---|
| **Root Directory** | `frontend` |
| **Build Command** | `npm ci && next build` |
| **Output Directory** | `.next` |

### Variável de ambiente

```env
NEXT_PUBLIC_API_URL=https://<url-do-backend>/api
```

---

## 5. Scripts de manutenção (backend/scripts/)

| Script | Uso |
|---|---|
| `full-reset-railway.js` | Reset completo do banco no Railway ⚠️ destrói dados |
| `create-admin.js` | Criar usuário admin manualmente |
| `reset-database.js` | Resetar banco em ambiente de testes |
| `cleanup-negados.js` | Limpar documentos com status NEGADO antigos |

---

## 6. Checklist de Segurança

- [ ] `JWT_SECRET` trocado para valor único e forte (mín. 64 chars)
- [ ] `SEED_ADMIN_PASSWORD` com senha forte
- [ ] `NODE_ENV=production` definido
- [ ] `FRONTEND_URL` configurado com o domínio real (restringe CORS)
- [ ] Container Azure com acesso **privado** (sem acesso público)
- [ ] Variáveis sensíveis configuradas apenas no painel da plataforma (nunca no repositório)
- [ ] Migrations aplicadas via `prisma migrate deploy` (não `migrate dev`)

---

## 7. Fluxo resumido de arquivos com Azure Blob Storage

```
Upload:
  Frontend → POST /api/documentos/upload
           → multer (memoryStorage) → buffer em RAM
           → azureUploadMiddleware  → upload para Azure Blob Storage
           → salva blob name em Documento.path no PostgreSQL

Download / Visualização:
  Frontend → GET /api/documentos/:id/view (ou /download)
           → busca Documento.path no PostgreSQL (blob name)
           → stream do Azure Blob Storage → response
```

---

## 8. Arquivos alterados para suporte Azure

| Arquivo | Descrição |
|---|---|
| `backend/src/utils/azureStorage.ts` | Cliente Azure: upload, stream, delete |
| `backend/src/utils/multer.ts` | Provider `azure` + middleware `azureUploadMiddleware` |
| `backend/src/routes/documentos.ts` | Middleware Azure na rota de upload |
| `backend/src/routes/admin.ts` | Middleware Azure na rota de certificados |
| `backend/src/controllers/documentoController.ts` | view, download e zip com Azure |
| `backend/src/controllers/certificadoController.ts` | Download de certificado com Azure |
| `backend/src/services/documentoService.ts` | Delete de blob ao substituir documento |
| `backend/package.json` | Dependência `@azure/storage-blob ^12.27.0` |
| `backend/.env.example` | Variáveis Azure documentadas |
