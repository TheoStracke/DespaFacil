# DespaFacil

Plataforma para despachantes gerenciarem motoristas e documentos, com painel administrativo para aprovação/negação de documentos, emissão de certificados e onboarding guiado para primeiro acesso.

## 🚀 Stack Tecnológico

### Backend
- Runtime: Node.js 18+
- Framework: Express.js (TypeScript)
- Banco: PostgreSQL (Railway em produção / local em dev)
- ORM: Prisma
- Autenticação: JWT
- Upload: Multer (local) / S3 (opcional)
- E-mail: Nodemailer (SMTP Gmail)
- Segurança: Helmet, CORS, rate limiting, hCaptcha no reset de senha

### Frontend
- Framework: Next.js 14+ (App Router, TypeScript)
- Estilo: TailwindCSS + Shadcn/UI
- Formulários: React Hook Form + Zod
- UI extra: framer-motion, lucide-react
- Onboarding: react-joyride (tour guiado)

### Deploy
- Backend: Railway (ou outro container host com Node 18+)
- Frontend: Vercel

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
├── frontend/             # Interface web (Next.js)
└── README.md             # Este arquivo
```

## 🎯 Funcionalidades

### Para Despachantes
- Cadastro e login
- Gerenciar motoristas (CRUD)
- Upload de documentos (CNH, Comprovante, Documento 1, Documento 2)
- Visualizar status (Pendente, Aprovado, Negado)
- Receber notificações por e-mail
- Tour guiado de primeiro acesso (uma vez por usuário)

### Para Administradores
- Login de admin
- Dashboard com filtros
- Aprovar/Negar documentos (com motivo)
- Exportar relatórios (CSV/XLSX)
- Enviar certificados
- Logs de auditoria
- Seção de certificados oculta para admins (exibida somente para Despachante)

### Globais
- Esquecí minha senha com hCaptcha e e-mail de redefinição
- Botão flutuante de suporte via WhatsApp em todas as páginas
- Logo no cabeçalho do dashboard

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
- Conta Gmail com App Password (ou SMTP equivalente)

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

Variáveis importantes do backend (.env):
- DATABASE_URL
- JWT_SECRET
- SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS
- HCAPTCHA_SECRET (obrigatória para reset de senha)
- FRONTEND_URL (opcional; fallback para http://localhost:3000)

Notas:
- Em dev, a API liga em http://localhost:4000
- Em produção, defina BIND_HOST=0.0.0.0 para aceitar conexões externas

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Editar .env.local apontando para o backend
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

Variáveis importantes do frontend (.env.local):
- NEXT_PUBLIC_API_URL (ex.: http://localhost:4000)

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

- Senhas criptografadas (bcrypt)
- Tokens JWT com expiração
- hCaptcha em fluxo sensível (esqueci minha senha)
- Validação de tipos de arquivo e tamanho
- Sanitização e normalização de nomes
- CORS configurado e Helmet
- Rate limiting em endpoints sensíveis

## 🐛 Troubleshooting

Ver [backend/README.md#-troubleshooting](backend/README.md#-troubleshooting)

## 📞 Contato

- theostracke11@gmail.com
- pleuskick@gmail.com

---

---

Para um guia de deploy detalhado (Railway + Vercel) e alternativa barata, confira o arquivo DEPLOYMENT.md neste repositório.

