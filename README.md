# DespaFacil

## 1. Titulo do projeto
DespaFacil

## 2. Descricao do projeto
DespaFacil e uma aplicacao full-stack para operacao de despachantes, com foco em cadastro de motoristas, envio e analise de documentos, emissao de certificados e acompanhamento de fluxos administrativos.

O sistema centraliza processos que normalmente ficam dispersos (planilhas, e-mail e controles manuais), oferecendo um fluxo unico com autenticacao, rastreabilidade e controle por perfil de acesso.

## 3. Funcionalidades principais
- Autenticacao com JWT para perfis `ADMIN` e `DESPACHANTE`.
- Cadastro de usuarios, login, recuperacao e redefinicao de senha.
- Controle de onboarding com status de tour por usuario.
- CRUD de motoristas.
- Upload e gerenciamento de documentos por tipo (CNH, comprovante e documentos adicionais).
- Visualizacao, download e atualizacao de status de documentos (pendente, aprovado, negado).
- Exportacao administrativa de documentos em planilha.
- Envio de certificados (admin) e download de certificados (despachante/admin).
- Solicitacoes de parceria (publico) com aprovacao/rejeicao por admin.
- Fluxo de solicitacao de codigo entre admin e despachante.
- Notificacoes internas (listagem, contagem de nao lidas, marcar como lida/todas lidas).
- Auditoria administrativa com listagem, estatisticas e exportacao de logs.
- Atualizacao de dados de perfil do usuario autenticado.

## 4. Tecnologias utilizadas
### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Axios
- React Hook Form + Zod
- Recharts
- React Joyride
- Playwright (E2E)

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (`jsonwebtoken`) e `bcryptjs`
- Multer (upload de arquivos)
- Nodemailer e provedores de e-mail (Postmark/Resend)
- `helmet`, `cors`, `express-rate-limit`, `morgan`
- Google reCAPTCHA Enterprise (fluxo de recuperacao de senha)
- Vitest + Supertest
- Artillery/Autocannon (carga/stress)

### Banco de dados
- PostgreSQL com migracoes versionadas via Prisma (`backend/prisma/migrations`)

## 5. Arquitetura (resumo)
Arquitetura em camadas com separacao entre frontend e backend:

- Frontend (`frontend/`): interface em Next.js, paginas por dominio e servicos HTTP para consumo da API.
- Backend (`backend/`): API REST em Express com organizacao por rotas, controllers, services e middlewares.
- Persistencia: Prisma Client sobre PostgreSQL.

Fluxo simplificado:
`Frontend (Next.js) -> API REST (Express) -> Prisma -> PostgreSQL`

## 6. Como rodar o projeto
### Pre-requisitos
- Node.js 18+
- npm
- PostgreSQL

### 5.1 Backend
```bash
cd backend
npm install
```

Crie o arquivo de ambiente a partir do exemplo:

Windows (PowerShell):
```powershell
Copy-Item .env.example .env
```

Linux/macOS:
```bash
cp .env.example .env
```

Variaveis importantes no `.env`:
- `DATABASE_URL`
- `JWT_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `SEED_ADMIN_PASSWORD`
- variaveis de reCAPTCHA/Google Credentials (quando aplicavel)

Execute migracoes e seed:
```bash
npm run prisma:generate
npm run migrate:dev
npm run seed
```

Suba o backend em desenvolvimento:
```bash
npm run dev
```

API padrao: `http://localhost:4000`

### 5.2 Frontend
Em outro terminal:
```bash
cd frontend
npm install
```

Configure `frontend/.env.local` com:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Suba o frontend:
```bash
npm run dev
```

Frontend padrao: `http://localhost:3000`

### 5.3 Testes (opcional)
Backend:
```bash
cd backend
npm test
```

Frontend (E2E):
```bash
cd frontend
npm run test:e2e
```

## 7. Estrutura de pastas (resumo)
```text
DespaFacil/
|- backend/
|  |- prisma/
|  |- src/
|  |  |- controllers/
|  |  |- services/
|  |  |- routes/
|  |  |- middlewares/
|  |  |- utils/
|  |- tests/
|- frontend/
|  |- src/
|  |  |- app/
|  |  |- components/
|  |  |- services/
|  |  |- contexts/
|  |  |- lib/
|  |  |- types/
```

## 8. Possiveis melhorias futuras
- Ampliar cobertura de testes automatizados por dominio e fluxos criticos.
- Fortalecer padronizacao de logs e observabilidade (metricas/tracing).
- Evoluir documentacao de API (contratos e exemplos por endpoint).
- Consolidar scripts de setup para reduzir configuracao manual de ambiente.
