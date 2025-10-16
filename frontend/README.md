# 🎨 Frontend DespaFacil - Next.js

## ✅ Estrutura Criada

### 📦 Configurações Base
- ✅ `package.json` - Dependências (Next.js 14, React 18, TypeScript, TailwindCSS)
- ✅ `tsconfig.json` - Configuração TypeScript
- ✅ `next.config.js` - Configuração Next.js
- ✅ `tailwind.config.js` - TailwindCSS com tema customizado
- ✅ `postcss.config.js` - PostCSS
- ✅ `.env.local` - Variáveis de ambiente

### 🎨 Estilização
- ✅ `src/app/globals.css` - Estilos globais com TailwindCSS
- ✅ Tema claro/escuro configurado
- ✅ Variáveis CSS customizadas

### 🔧 Utilitários e Serviços
- ✅ `src/lib/api.ts` - Cliente Axios com interceptors JWT
- ✅ `src/lib/utils.ts` - Funções utilitárias (cn para classes CSS)
- ✅ `src/types/index.ts` - Tipos TypeScript completos
- ✅ `src/services/auth.service.ts` - Serviço de autenticação
- ✅ `src/services/motorista.service.ts` - Serviço de motoristas
- ✅ `src/services/documento.service.ts` - Serviço de documentos

### 📄 Páginas Base
- ✅ `src/app/layout.tsx` - Layout principal
- ✅ `src/app/page.tsx` - Página inicial (redireciona para /login)

---

## 🚧 Próximos Passos

### 1. Componentes UI (Shadcn/UI)
Criar componentes reutilizáveis:
- [ ] Button
- [ ] Input
- [ ] Card
- [ ] Table
- [ ] Dialog
- [ ] Toast/Alert
- [ ] Badge
- [ ] Tabs
- [ ] Form components

### 2. Páginas de Autenticação
- [ ] `/login` - Página de login
- [ ] `/register` - Página de cadastro
- [ ] Validação com React Hook Form + Zod

### 3. Dashboard Despachante
- [ ] `/dashboard` - Layout do dashboard
- [ ] `/dashboard/motoristas` - Lista de motoristas
- [ ] `/dashboard/motoristas/novo` - Criar motorista
- [ ] `/dashboard/motoristas/[id]` - Editar/Ver motorista
- [ ] `/dashboard/motoristas/[id]/documentos` - Upload de documentos

### 4. Painel Admin
- [ ] `/admin` - Dashboard admin
- [ ] `/admin/documentos` - Lista de todos os documentos
- [ ] Filtros (status, data, despachante)
- [ ] Ações: Aprovar, Negar, Exportar CSV
- [ ] Upload e envio de certificados

### 5. Componentes Específicos
- [ ] Navbar/Sidebar com navegação
- [ ] Formulário de motorista
- [ ] Upload de arquivo com preview
- [ ] Tabela de documentos com paginação
- [ ] Filtros e busca
- [ ] Modais de confirmação

---

## 🎯 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **TailwindCSS** - Estilização utilitária
- **Shadcn/UI** - Componentes acessíveis
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

---

## 🚀 Como Rodar

```bash
cd frontend
npm install  # Já executado ✅
npm run dev  # Inicia em http://localhost:3000
```

---

## 📝 Estrutura de Pastas

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   └── admin/
│   ├── components/
│   │   ├── ui/           # Componentes Shadcn
│   │   ├── forms/        # Formulários
│   │   ├── layouts/      # Layouts
│   │   └── shared/       # Componentes compartilhados
│   ├── lib/
│   │   ├── api.ts        # ✅
│   │   └── utils.ts      # ✅
│   ├── services/
│   │   ├── auth.service.ts       # ✅
│   │   ├── motorista.service.ts  # ✅
│   │   └── documento.service.ts  # ✅
│   └── types/
│       └── index.ts      # ✅
├── public/
├── package.json          # ✅
├── tsconfig.json         # ✅
├── next.config.js        # ✅
├── tailwind.config.js    # ✅
└── .env.local            # ✅
```

---

## 🔗 Integração com Backend

- **API Base URL**: `http://localhost:4000`
- **Endpoints**: Todos já mapeados nos serviços
- **Autenticação**: JWT armazenado em localStorage
- **Interceptors**: Renovação automática de token

---

## 📊 Status Atual

✅ **Configuração inicial completa**
✅ **Dependências instaladas**
✅ **Serviços de API prontos**
✅ **Tipos TypeScript definidos**

⏳ **Aguardando**: Criação de componentes e páginas

---

**Próximo comando**: Criar os componentes UI básicos com Shadcn/UI!
