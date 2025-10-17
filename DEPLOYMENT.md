# Deploy do DespaFacil

Guia passo a passo para publicar o backend e o frontend com baixo custo. Duas opções recomendadas:
- Backend no Railway + Frontend no Vercel (gratuito/baixo custo)
- Alternativa all-in-one barata: Render (grátis para web services com cold start) ou Fly.io (pago por uso < $10/mês na maioria dos casos)

Observação: O Railway tem plano grátis limitado e planos pagos baratos. O Vercel possui plano gratuito com ótima entrega de frontends.

## 1) Preparar variáveis de ambiente

### Backend (.env)
Obrigatórias:
- DATABASE_URL=postgresql://user:pass@host:5432/dbname?schema=public
- JWT_SECRET=uma_senha_bem_forte
- SMTP_HOST=smtp.gmail.com
- SMTP_PORT=465
- SMTP_USER=seu_email@gmail.com
- SMTP_PASS=app_password_do_gmail
- HCAPTCHA_SECRET=seu_secret_key_do_hcaptcha

Opcionais:
- FRONTEND_URL=https://seu-dominio-frontend.vercel.app
- BIND_HOST=0.0.0.0 (produção)

### Frontend (.env.local)
- NEXT_PUBLIC_API_URL=https://seu-backend.onrailway.app

## 2) Banco de Dados

- Use o PostgreSQL do Railway (Add Plugin > PostgreSQL) ou outro provedor
- Copie a DATABASE_URL para o .env do backend
- Após o primeiro deploy do backend, rode as migrações do Prisma

## 3) Backend no Railway

1. Crie conta e projeto no Railway
2. Adicione um serviço "GitHub Repo" apontando para este repositório
3. Configure Build & Start (Railway detecta Node automaticamente):
   - Build: npm ci && npm run build && npx prisma generate
   - Start: npm run start
4. Variáveis de ambiente (Environment):
   - PORT=4000 (Railway define dinamicamente; mas expor 4000 é OK)
   - BIND_HOST=0.0.0.0
   - As de SMTP, JWT, HCAPTCHA e DATABASE_URL
5. Deploy
6. Após subir, abra um shell no Railway e execute:
   - npx prisma migrate deploy
   - node dist/prisma/seed.js (ou npm run seed se disponível no ambiente)

Anote a URL pública gerada, exemplo: https://despafacil.up.railway.app

## 4) Frontend no Vercel

1. Crie projeto no Vercel e conecte ao repo
2. Framework: Next.js
3. Variáveis de ambiente:
   - NEXT_PUBLIC_API_URL=https://despafacil.up.railway.app
4. Deploy. O Vercel criará um domínio, ex.: https://despafacil.vercel.app

## 5) Domínios personalizados (opcional)

- Configure DNS do seu domínio apontando para Vercel (frontend) e Railway (backend) se desejar
- Atualize FRONTEND_URL no backend (.env) para refletir o domínio público real

## 6) Alternativas abaixo de $10

- Render.com: backend Node + PostgreSQL (tem free tier com cold start). Configure:
  - Build: npm ci && npm run build && npx prisma generate
  - Start: npm run start
  - Define PORT nos envs (Render injeta automaticamente)
- Fly.io: fácil para containers, custo baixo por uso. Crie um Dockerfile para backend e suba via flyctl.

## 7) Checklist de produção

- [ ] BACKEND: BIND_HOST=0.0.0.0
- [ ] BACKEND: JWT_SECRET forte
- [ ] BACKEND: SMTP configurado e testado
- [ ] BACKEND: HCAPTCHA_SECRET configurado
- [ ] BACKEND: DATABASE_URL válida
- [ ] BACKEND: npx prisma migrate deploy aplicado
- [ ] FRONTEND: NEXT_PUBLIC_API_URL apontando para o backend público
- [ ] FRONTEND: URLs no app não usam IP local
- [ ] HTTPS ativo (Railway/Vercel cuidam disso)

## 8) Teste pós-deploy

- Acessar frontend público
- Criar/login de usuário
- Fluxo de upload de documentos
- Admin: aprovar/negar
- Esqueci minha senha: validar hCaptcha e envio de e-mail
- Tour de primeiro acesso: aparecer apenas para Despachante novo
- Botão WhatsApp visível

## 9) Dicas

- Logs: use dashboards do Railway e Vercel
- Monitoramento: ative alertas de erro (Sentry opcional no frontend/backend)
- Backups do banco: configure com o provedor

---

Em caso de dúvidas, veja também README.md (setup local) e backend/README.md (endpoints).