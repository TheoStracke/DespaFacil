# 🚚 DespaFacil

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Licença](https://img.shields.io/badge/licença-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![Next.js](https://img.shields.io/badge/Next.js-14%2B-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue)

> **Plataforma digital que revoluciona a gestão de motoristas e documentação para despachantes, eliminando processos manuais e acelerando aprovações com dashboards inteligentes e rastreamento em tempo real.**

DespaFacil é uma solução completa com painel administrativo para aprovação/negação de documentos, emissão de certificados, onboarding guiado e sistema de auditoria robusta.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitetura do Projeto](#-arquitetura-do-projeto)
- [Como Rodar o Projeto](#-como-rodar-o-projeto)
- [Endpoints da API](#-endpoints-da-api)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Credenciais Padrão](#-credenciais-padrão)
- [Testes e Qualidade](#-testes-e-qualidade)
- [Deploy](#-deploy)
- [Status do Projeto](#-status-do-projeto)
- [Contribuição](#-contribuição)

---

## 🎯 Visão Geral

O **DespaFacil** é uma plataforma SaaS (Software as a Service) desenvolvida para despachantes e sua equipe gerenciarem motoristas, documentação legal e processos administrativos com eficiência máxima.

### 🔑 Problemas Resolvidos

✅ **Eliminação de processos manuais**: Automatização de upload, validação e aprovação de documentos  
✅ **Rastreamento em tempo real**: Despachantes visualizam status de documentos em segundos  
✅ **Redução de erros**: Sistema de validação inteligente com regras de negócio  
✅ **Transparência total**: Logs de auditoria completos de todas as ações na plataforma  
✅ **Onboarding otimizado**: Tour guiado para novos usuários (apenas na primeira sessão)  

---

## 📱 Funcionalidades Principais

### 👔 **Para Despachantes**

| Funcionalidade | Descrição |
|---|---|
| 📝 Cadastro & Login | Autenticação segura com JWT e recuperação de senha com hCaptcha |
| 🚗 Gerenciar Motoristas | CRUD completo (adicionar, editar, visualizar, remover) |
| 📤 Upload de Documentos | Suporte para CNH, Comprovante de Pagamento, Documentos 1 e 2 |
| 📊 Dashboard Analytics | Visualizar status de documentos em tempo real |
| 🔔 Notificações | Receber alertas por e-mail sobre mudanças de status |
| 📥 Certificados | Visualizar e fazer download de certificados emitidos |
| 🎯 Tour Interativo | Joyride onboarding na primeira visita |
| 💬 Suporte WhatsApp | Botão flutuante com link de contato |

### 👨‍💼 **Para Administradores**

| Funcionalidade | Descrição |
|---|---|
| 🛡️ Painel de Controle | Dashboard com filtros avançados e busca |
| ✅ Aprovar/Negar Documentos | Decisão com justificativa obrigatória |
| 📊 Exportar Relatórios | CSV/XLSX com dados de motoristas e documentos |
| 📜 Emitir Certificados | Upload em massa ou individual com rastreamento |
| 📋 Logs de Auditoria | Histórico completo de todas as ações do sistema |
| 🔐 Gestão de Solicitações | Processar solicitações de certificação de código |
| 👥 Gerenciar Usuários | Criar, editar e gerenciar despachantes |

### 🌐 **Funcionalidades Globais**

- 🔑 **Recuperação de Senha** com CAPTCHA e validação por e-mail
- 🎨 **Design Responsivo** (Desktop, Tablet, Mobile)
- ⚡ **Performance Otimizada** com React Server Components e ISR
- 🔒 **Segurança Multi-Camadas** (CORS, Rate Limiting, Helmet)
- 📱 **Progressive Web App Ready**

---

## 🛠️ Stack Tecnológico

### **Frontend**

| **Tecnologia** | **Versão** | **Propósito** |
|---|---|---|
| Next.js | 14.2+ | Framework React com SSR/ISR |
| TypeScript | 5.5 | Type Safety |
| TailwindCSS | 3.4 | Styling utilitário |
| Shadcn/UI | Latest | Componentes reutilizáveis |
| React Hook Form | 7.5 | Gerenciamento de formulários |
| Zod | 3.23 | Validação de schemas |
| Axios | 1.6 | HTTP Client com interceptores |
| Framer Motion | 12.23 | Animações e transições |
| Recharts | 3.4 | Gráficos e análises |
| React Joyride | 2.9 | Tour guiado (onboarding) |
| Playwright | 1.49 | Testes E2E automatizados |

### **Backend**

| **Tecnologia** | **Versão** | **Propósito** |
|---|---|---|
| Express.js | 4.21 | Framework Web |
| Prisma | 5.22 | ORM para PostgreSQL |
| PostgreSQL | 13+ | Banco de dados relacional |
| JWT | 9.0 | Autenticação stateless |
| bcryptjs | 2.4 | Hash de senhas |
| Nodemailer | 6.10 | Envio de e-mails (SMTP) |
| Multer | 1.4 | Upload de arquivos |
| Vitest | 2.0 | Testes unitários |
| Artillery | 2.0 | Testes de carga |
| Google reCAPTCHA | 6.3 | Validação de segurança |

### **DevOps & Deployment**

| **Serviço** | **Propósito** |
|---|---|
| Railway | Backend deployment (Node.js + PostgreSQL) |
| Vercel | Frontend deployment (Next.js) |
| GitHub Actions | CI/CD (opcional) |
| Docker | Containerização local/Railway |

---

## 🏗️ Arquitetura do Projeto

### **Padrão Arquitetural: MVC com Domain-Driven Design**

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Pages (App Router) & Components                │  │
│  │  ├─ /dashboard, /motoristas, /documentos/...    │  │
│  │  ├─ Componentes reutilizáveis (Shadcn/UI)      │  │
│  │  └─ Hooks customizados & Contexts              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Services (Axios Interceptors)                  │  │
│  │  └─ API calls com retry logic                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓ HTTP API
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Routes (/api/...)                              │  │
│  │  ├─ /auth, /motoristas, /documentos/...         │  │
│  │  └─ Middleware: Auth, CORS, Rate Limit          │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Controllers                                    │  │
│  │  ├─ Validação de input (Zod)                    │  │
│  │  ├─ Orquestração de serviços                    │  │
│  │  └─ Tratamento de erros                         │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Services (Lógica de Negócio)                   │  │
│  │  ├─ AuthService: Login, JWT, Reset Password    │  │
│  │  ├─ MotoristaService: CRUD com validações      │  │
│  │  ├─ DocumentoService: Upload, Status, Audit    │  │
│  │  ├─ CertificadoService: Emissão e rastreamento │  │
│  │  ├─ NotificationService: E-mail notifications  │  │
│  │  └─ AuditService: Logs de ações                │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Prisma Client                                  │  │
│  │  └─ ORM com migrations versionadas              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↓ SQL
┌─────────────────────────────────────────────────────────┐
│             PostgreSQL DATABASE                         │
│  ├─ Users, Despachantes, Motoristas                    │
│  ├─ Documentos, Certificados, Logs                     │
│  ├─ Notifications, AuditLogs, SolicitacoesCodigo       │
│  └─ Cascata de índices para performance               │
└─────────────────────────────────────────────────────────┘
```

### **Camadas e Responsabilidades**

| **Camada** | **Responsabilidade** | **Exemplo** |
|---|---|---|
| 🎨 **Presentation** | Renderizar UI, formulários, validação client | Next.js Pages, Componentes, Forms |
| 📡 **API Gateway** | Roteamento, autenticação, rate limiting | Express Routes, Middlewares |
| 🎮 **Controller** | Validar entrada, chamar services, retornar resposta | authController.login() |
| 🔧 **Service** | Lógica de negócio, validações, orquestração | AuthService.validateCredentials() |
| 💾 **Repository** | Acesso a dados via ORM | Prisma queries |
| 🗄️ **Database** | Persistência e integridade dos dados | PostgreSQL |

### **Padrões Utilizados**

- ✅ **MVC** (Model-View-Controller)
- ✅ **Repository Pattern** (via Prisma)
- ✅ **Service Layer** (Lógica centralizada)
- ✅ **Middleware Chain** (CORS, Auth, Logging)
- ✅ **Hooks Custom** (Frontend state management)
- ✅ **Context API** (Global state)
- ✅ **Atomic Design** (Componentes reutilizáveis)
- ✅ **Domain-Driven Design** (Separação de domínios: Auth, Motorista, Documento)

---

## 🚀 Como Rodar o Projeto

### **Pré-requisitos**

- **Node.js** 18+ ([Download](https://nodejs.org))
- **npm** 9+ ou **yarn** 1.22+
- **PostgreSQL** 13+ (local ou via [Docker](https://docs.docker.com/get-docker/))
- **Git** 2.0+
- Conta **Gmail** com [App Password](https://support.google.com/accounts/answer/185833) (ou SMTP equivalente)

### **1️⃣ Clonar o Repositório**

```bash
git clone https://github.com/theostracke/DespaFacil.git
cd DespaFacil
```

### **2️⃣ Configurar Backend**

```bash
cd backend

# Instalar dependências
npm install

# Copiar arquivo de variáveis de ambiente
cp .env.example .env

# Editar .env com suas credenciais
nano .env  # Linux/Mac
# ou
notepad .env  # Windows
```

**Conteúdo do `.env` para Development:**

```env
# ========== DATABASE ==========
DATABASE_URL=postgresql://usuario:senha@localhost:5432/despafacil

# ========== SERVER ==========
PORT=4000
NODE_ENV=development

# ========== JWT ==========
JWT_SECRET=sua-chave-super-secreta-min-32-caracteres
JWT_EXPIRES_IN=7d

# ========== BCRYPT ==========
BCRYPT_SALT_ROUNDS=12

# ========== SMTP (Gmail) ==========
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=app-password-gerado-no-google
SMTP_FROM=seu-email@gmail.com

# ========== NOTIFICATION ==========
NOTIFICATION_EMAIL=seu-email@gmail.com

# ========== UPLOAD ==========
MAX_UPLOAD_SIZE=10485760
ALLOWED_FILE_TYPES=application/pdf,image/png,image/jpeg
STORAGE_PROVIDER=local

# ========== FRONTEND URL ==========
FRONTEND_URL=http://localhost:3000

# ========== SEED ==========
SEED_ADMIN_PASSWORD=SenhaForte123!
```

**Criar banco de dados:**

```bash
# Linux/Mac com PostgreSQL instalado
createdb despafacil

# Ou usando Docker
docker run --name despafacil-db \
  -e POSTGRES_PASSWORD=senha \
  -e POSTGRES_DB=despafacil \
  -p 5432:5432 \
  -d postgres:15
```

**Executar migrações e seed:**

```bash
# Gerar Prisma Client
npm run prisma:generate

# Rodar migrações
npm run migrate:dev

# Popular banco com dados de teste
npm run seed
```

**Iniciar backend:**

```bash
npm run dev
```

Backend estará rodando em **http://localhost:4000** ✅

### **3️⃣ Configurar Frontend**

```bash
cd ../frontend

# Instalar dependências
npm install

# Copiar arquivo de variáveis de ambiente
cp .env.example .env.local

# Editar .env.local (ajustar URL da API se necessário)
nano .env.local
```

**Conteúdo básico do `.env.local`:**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=DespaFacil
```

**Instalar dependências dos testes E2E (opcional):**

```bash
npm run playwright:install
```

**Iniciar frontend:**

```bash
npm run dev
```

Frontend estará rodando em **http://localhost:3000** ✅

### **4️⃣ Acessar a Plataforma**

Abra no navegador: **http://localhost:3000**

---

## 📊 Endpoints da API

### **Autenticação**

| Verbo | Rota | Descrição | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registrar novo despachante | ❌ |
| `POST` | `/api/auth/login` | Login (retorna JWT) | ❌ |
| `POST` | `/api/auth/forgot-password` | Solicitar reset de senha (hCaptcha) | ❌ |
| `POST` | `/api/auth/reset-password` | Confirmar reset com token | ❌ |
| `POST` | `/api/auth/mark-tour-visto` | Marcar tour como visualizado | ✅ |
| `GET` | `/api/auth/tour-status` | Verificar se tour já foi visto | ✅ |

### **Usuários**

| Verbo | Rota | Descrição | Auth | Role |
|---|---|---|---|---|
| `GET` | `/api/users/me` | Dados do usuário logado | ✅ | - |
| `PATCH` | `/api/users/me` | Atualizar dados do usuário | ✅ | - |

### **Motoristas**

| Verbo | Rota | Descrição | Auth | Role |
|---|---|---|---|---|
| `POST` | `/api/motoristas` | Criar novo motorista | ✅ | DESPACHANTE, ADMIN |
| `GET` | `/api/motoristas` | Listar motoristas (com filtros) | ✅ | DESPACHANTE, ADMIN |
| `GET` | `/api/motoristas/:id` | Obter detalhes do motorista | ✅ | DESPACHANTE, ADMIN |
| `PUT` | `/api/motoristas/:id` | Atualizar motorista | ✅ | DESPACHANTE, ADMIN |
| `DELETE` | `/api/motoristas/:id` | Remover motorista | ✅ | DESPACHANTE, ADMIN |

### **Documentos**

| Verbo | Rota | Descrição | Auth | Role |
|---|---|---|---|---|
| `POST` | `/api/documentos/upload` | Upload de documento | ✅ | DESPACHANTE, ADMIN |
| `GET` | `/api/documentos/:id/download` | Download de documento | ✅ | - |
| `GET` | `/api/documentos/:id/view` | Visualizar documento (inline) | ✅ | - |
| `PUT` | `/api/documentos/:id/status` | Aprovar/Negar documento (com motivo) | ✅ | ADMIN |

### **Admin - Documentos & Relatórios**

| Verbo | Rota | Descrição | Auth | Role |
|---|---|---|---|---|
| `GET` | `/api/admin/documentos` | Listar documentos com filtros | ✅ | ADMIN, DESPACHANTE |
| `GET` | `/api/admin/export` | Exportar documentos (CSV/XLSX) | ✅ | ADMIN |
| `GET` | `/api/admin/motoristas/:id/documentos/zip` | Download ZIP com todos docs do motorista | ✅ | ADMIN |

### **Certificados**

| Verbo | Rota | Descrição | Auth | Role |
|---|---|---|---|---|
| `POST` | `/api/certificados/send` | Upload e envio de certificado | ✅ | ADMIN |
| `GET` | `/api/certificados` | Listar certificados histórico | ✅ | ADMIN, DESPACHANTE |

### **Solicitações de Código**

| Verbo | Rota | Descrição | Auth | Role |
|---|---|---|---|---|
| `POST` | `/api/admin/solicitacoes-codigo` | Criar solicitação de código | ✅ | ADMIN |
| `GET` | `/api/admin/solicitacoes-codigo` | Listar solicitações | ✅ | ADMIN |
| `DELETE` | `/api/admin/solicitacoes-codigo/:id` | Cancelar solicitação | ✅ | ADMIN |

### **Notificações**

| Verbo | Rota | Descrição | Auth | Role |
|---|---|---|---|---|
| `GET` | `/api/notifications` | Listar notificações do usuário | ✅ | - |
| `PATCH` | `/api/notifications/:id` | Marcar notificação como lida | ✅ | - |
| `DELETE` | `/api/notifications/:id` | Remover notificação | ✅ | - |

### **Logs de Auditoria**

| Verbo | Rota | Descrição | Auth | Role |
|---|---|---|---|---|
| `GET` | `/api/audit/logs` | Histórico de ações (Paginado) | ✅ | ADMIN |
| `GET` | `/api/audit/logs/:id` | Detalhes de um log | ✅ | ADMIN |

**Legenda:**
- ✅ = Requer autenticação JWT
- ❌ = Sem autenticação
- **Role** = Papéis que podem acessar (vazio = todos autenticados)

---

## 📁 Estrutura de Pastas

### **Backend (`/backend`)**

```
backend/
├── 📂 prisma/
│   ├── schema.prisma          # Definição do banco (Models, Enums, Migrations)
│   ├── seed.ts                # Script de seed (criar admins, dados de teste)
│   ├── tsconfig.json          # Configuração TypeScript para Prisma
│   └── migrations/            # Arquivos de migração (versionados)
│
├── 📂 src/
│   ├── app.ts                 # Configuração Express (middleware global)
│   ├── server.ts              # Inicialização do servidor
│   ├── 📂 controllers/        # Handlers de requisições HTTP
│   ├── 📂 services/           # Lógica de negócio
│   ├── 📂 routes/             # Definição de rotas
│   ├── 📂 middlewares/        # Middleware customizado
│   ├── 📂 utils/              # Utilitários
│   ├── 📂 types/              # Tipos TypeScript
│   ├── 📂 templates/          # Templates de e-mail
│   └── 📂 prisma/             # Cliente Prisma (gerado)
│
├── 📂 scripts/                # Utilitários para desenvolvimento
├── 📂 tests/                  # Testes (unit, integration, load)
├── 📂 uploads/                # Arquivos enviados (gitignored)
├── .env.example               # Template de variáveis de ambiente
├── package.json
├── tsconfig.json
├── vitest.config.ts           # Configuração de testes
├── Procfile                   # Configuração para Railway
└── README.md                  # Documentação backend
```

### **Frontend (`/frontend`)**

```
frontend/
├── 📂 src/
│   ├── 📂 app/                # App Router (Next.js 14)
│   │   ├── layout.tsx         # Layout root
│   │   ├── page.tsx           # Página inicial
│   │   ├── 📂 (auth)/         # Grouped routes
│   │   ├── 📂 dashboard/      # Páginas autenticadas
│   │   └── api/               # Route handlers
│   │
│   ├── 📂 components/         # Componentes reutilizáveis
│   │   ├── 📂 ui/             # Componentes base (Shadcn/UI)
│   │   ├── 📂 layout/         # Navbar, Sidebar, Footer
│   │   ├── 📂 forms/          # Formulários
│   │   ├── 📂 dashboard/      # Componentes específicos
│   │   ├── 📂 admin/          # Componentes admin
│   │   └── TourGuide.tsx      # React Joyride Config
│   │
│   ├── 📂 contexts/           # Context API (State Global)
│   ├── 📂 hooks/              # Custom Hooks
│   ├── 📂 lib/                # Utilitários & Config
│   ├── 📂 services/           # Camada de serviço
│   ├── 📂 types/              # Tipos TypeScript
│   ├── 📂 styles/             # Estilos globais
│   ├── 📂 ModelosDoc/         # Templates de documentos
│   └── 📂 public/             # Assets estáticos
│
├── 📂 tests/                  # Testes E2E (Playwright)
├── .env.example               # Template
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
├── playwright.config.ts       # Config E2E tests
└── package.json
```

---

## 🔐 Variáveis de Ambiente

### **Backend - `.env.example`**

```env
# ========== DATABASE ==========
DATABASE_URL=postgresql://user:password@localhost:5432/despafacil

# ========== SERVER ==========
PORT=4000
NODE_ENV=development

# ========== JWT ==========
JWT_SECRET=sua-chave-super-secreta-min-32-caracteres
JWT_EXPIRES_IN=7d

# ========== SMTP ==========
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=app-password-gerado
SMTP_FROM=seu-email@gmail.com

# ========== FRONTEND ==========
FRONTEND_URL=http://localhost:3000

# ========== SEED ==========
SEED_ADMIN_PASSWORD=SenhaForte123!
```

### **Frontend - `.env.example`**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=DespaFacil
```


**⚠️ Altere essas senhas após o primeiro login em produção!**

---

## 🧪 Testes e Qualidade

### **Backend - Testes**

```bash
cd backend

# Testes unitários
npm run test

# Teste específico
npm run test src/services/AuthService.test.ts

# Com coverage
npm run test:unit

# Testes de carga
npm run test:load

# Linting
npm run lint
```

### **Frontend - Testes E2E**

```bash
cd frontend

# Instalar Playwright
npm run playwright:install

# Rodar testes
npm run test:e2e

# Com navegador visível
npm run test:e2e:headed
```

---

## 🌐 Deploy

### **Frontend - Vercel**

1. Conectar repositório no [Vercel](https://vercel.com)
2. Configurar `NEXT_PUBLIC_API_URL` (variável de ambiente)
3. Deploy automático em cada push

### **Backend - Railway**

1. Criar projeto no [Railway](https://railway.app)
2. Adicionar serviço PostgreSQL
3. Conectar repositório GitHub
4. Configurar variáveis de ambiente
5. Deploy automático

---

## 📈 Status do Projeto

### **Versão Atual: 1.0.0**

| Componente | Status |
|---|---|
| 🏗️ Arquitetura Base | ✅ Completo |
| 🔐 Autenticação | ✅ Completo |
| 👤 Gestão de Usuários | ✅ Completo |
| 🚗 CRUD Motoristas | ✅ Completo |
| 📃 Upload de Documentos | ✅ Completo |
| ✅ Aprovação/Negação | ✅ Completo |
| 📜 Certificados | ✅ Completo |
| 📊 Dashboard Admin | ✅ Completo |
| 📱 Dashboard Despachante | ✅ Completo |
| 🔔 Notificações | ✅ Completo |
| 📋 Logs de Auditoria | ✅ Completo |
| 🧪 Testes Unit | ✅ Completo |
| 📈 Testes de Carga | ✅ Completo |
| 📚 Documentação API | ⏱️ Em Progresso |
| 🐳 Docker | ⏱️ Em Progresso |

---

## 🤝 Contribuição

Contribuições são bem-vindas! Siga o padrão de commits semânticos:

```bash
git checkout -b feature/MinhaFeature
git commit -m 'feat: adicionar nova funcionalidade'
git push origin feature/MinhaFeature
```

---

## 📞 Suporte

- Email: contato@despafacil.com
- Issues: [GitHub Issues](https://github.com/seu-usuario/DespaFacil/issues)

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---

<div align="center">

**[⬆ Voltar ao topo](#-despafacil)**

Desenvolvido com ❤️ para despachantes e motoristas

</div>

