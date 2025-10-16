# DespaFacil

Sistema completo para despachantes gerenciarem motoristas e documentos, com painel administrativo para aprovação/negação de documentos.

## 🚀 Stack Tecnológico

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL (Railway produção / Local desenvolvimento)
- **ORM**: Prisma
- **Autenticação**: JWT
- **Upload**: Multer (local) / S3 (opcional)
- **E-mail**: Nodemailer (SMTP Gmail)

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **Estilo**: TailwindCSS + Shadcn/UI
- **Formulários**: React Hook Form + Zod
- **Máscaras**: react-input-mask

### Deploy
- **Backend**: Railway
- **Frontend**: Vercel

## 📁 Estrutura do Projeto

```
DespaFacil/
├── backend/              # API REST (Express + Prisma)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── utils/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── README.md         # Documentação do backend
├── frontend/             # Interface web (Next.js) - EM DESENVOLVIMENTO
└── README.md             # Este arquivo
```

## 🎯 Funcionalidades

### Para Despachantes
- ✅ Cadastro e login (email ou CNPJ)
- ✅ Gerenciar motoristas (CRUD completo)
- ✅ Upload de documentos por motorista (CNH, Comprovante, Documento1, Documento2)
- ✅ Visualizar status de documentos (Pendente, Aprovado, Negado)
- ✅ Receber notificações por email

### Para Administradores
- ✅ Login com credenciais de admin
- ✅ Visualizar todos os documentos com filtros
- ✅ Aprovar ou negar documentos individualmente
- ✅ Adicionar motivo ao negar
- ✅ Exportar relatórios (CSV/XLSX)
- ✅ Enviar certificados para motoristas
- ✅ Visualizar logs de ações

## 🔐 Credenciais Padrão (Seed)

Após rodar o seed (`npm run seed` no backend):

**Admins:**
- `theostracke11@gmail.com` / `SenhaForte123!`
- `pleuskick@gmail.com` / `SenhaForte123!`

**Despachante de teste:**
- `despachante@test.local` / `SenhaForte123!`

## ⚙️ Setup Local

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- Conta Gmail com App Password

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env com suas credenciais
npx prisma migrate dev --name init
npm run seed
npm run dev
```

O backend estará rodando em `http://localhost:4000`

**📖 Documentação e Testes:**
- [Início Rápido](backend/INICIO_RAPIDO.md) - Setup em 5 passos
- [Guia de Testes](TESTES_BACKEND.md) - Todos os comandos curl
- [README Backend](backend/README.md) - Documentação completa
- [Scripts de Teste](backend/test-backend.ps1) - Testes automatizados

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Editar .env.local apontando para o backend
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

*(Frontend em desenvolvimento)*

## 📡 API Endpoints

Documentação completa dos endpoints disponível em [backend/README.md](backend/README.md#-endpoints-da-api)

## 🚢 Deploy

### Backend (Railway)

1. Criar projeto no Railway
2. Adicionar PostgreSQL
3. Conectar repositório GitHub
4. Configurar variáveis de ambiente
5. Deploy automático

### Frontend (Vercel)

1. Conectar repositório no Vercel
2. Configurar `NEXT_PUBLIC_API_URL`
3. Deploy automático

## 📧 Notificações por E-mail

O sistema envia emails automaticamente:
- **Novo documento** → notifica `despafacilrepo@gmail.com` (CC: `theostracke11@gmail.com`)
- **Aprovação/Negação** → notifica despachante
- **Certificado** → notifica despachante

## 📄 Tipos de Documentos

Cada motorista pode enviar **um arquivo por tipo**:
- CNH
- Comprovante de Pagamento
- Documento 1
- Documento 2

**Tipos permitidos**: PDF, PNG, JPG  
**Tamanho máximo**: 10 MB

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📝 Logs e Auditoria

O sistema mantém logs de todas as ações:
- Quem enviou o documento
- Quem aprovou/negou
- Data e hora
- Motivos de negação
- Substituições de arquivos

## 🔒 Segurança

- ✅ Senhas criptografadas (bcrypt)
- ✅ Tokens JWT com expiração
- ✅ Validação de tipos de arquivo
- ✅ Sanitização de nomes
- ✅ CORS configurado
- ✅ Rate limiting recomendado

## 🐛 Troubleshooting

Ver [backend/README.md#-troubleshooting](backend/README.md#-troubleshooting)

## 📞 Contato

- theostracke11@gmail.com
- pleuskick@gmail.com

---

**Status do Projeto**:  
✅ Etapa 1 (Backend) - **CONCLUÍDA**  
🔄 Etapa 2 (Frontend) - EM DESENVOLVIMENTO  
⏳ Etapa 3 (Deploy) - PENDENTE

