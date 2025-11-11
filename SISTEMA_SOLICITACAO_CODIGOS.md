# Sistema de Solicitação de Códigos - Implementação Completa

## 📋 Resumo

Sistema implementado para permitir que administradores solicitem códigos aos despachantes, que por sua vez enviam esses códigos através do sistema para um email específico.

## 🗄️ Banco de Dados

### Nova Tabela: `SolicitacaoCodigo`

```prisma
model SolicitacaoCodigo {
  id            String                    @id @default(cuid())
  motorista     Motorista                 @relation(fields: [motoristaId], references: [id])
  motoristaId   String
  emailDestino  String
  observacao    String?
  codigo        String?
  status        SolicitacaoCodigoStatus   @default(PENDENTE)
  solicitadoPor String
  solicitadoEm  DateTime                  @default(now())
  enviadoEm     DateTime?
  
  @@index([motoristaId])
  @@index([status])
}

enum SolicitacaoCodigoStatus {
  PENDENTE
  ENVIADO
  CANCELADO
}
```

**Migração aplicada:** `20251110123121_add_solicitacao_codigo`

## 🔧 Backend

### 1. Controller: `solicitacaoCodigoController.ts`

**Localização:** `backend/src/controllers/solicitacaoCodigoController.ts`

**Funções implementadas:**

- `createSolicitacao` - Admin cria nova solicitação de código
- `listAll` - Admin lista todas as solicitações (com filtro opcional por status)
- `listDespachantesolicitacoes` - Despachante lista suas solicitações pendentes
- `enviarCodigo` - Despachante envia o código
- `cancelarSolicitacao` - Admin cancela solicitação pendente

**Email templates:**
- Notificação para despachante quando solicitação é criada
- Email para destinatário quando código é enviado (com código destacado)

### 2. Rotas Implementadas

#### Rotas Admin (`backend/src/routes/admin.ts`)
```typescript
POST   /api/admin/solicitacoes-codigo        // Criar solicitação
GET    /api/admin/solicitacoes-codigo        // Listar todas (filtro status opcional)
DELETE /api/admin/solicitacoes-codigo/:id    // Cancelar solicitação
```

#### Rotas Despachante (`backend/src/routes/solicitacoes-codigo.ts`)
```typescript
GET  /api/solicitacoes-codigo                   // Listar pendentes
POST /api/solicitacoes-codigo/:id/enviar-codigo // Enviar código
```

### 3. Integração

- Rotas adicionadas ao `backend/src/app.ts`
- Middleware de autenticação aplicado
- Verificação de roles (ADMIN/DESPACHANTE)

## 🎨 Frontend

### 1. Service: `solicitacaoCodigo.service.ts`

**Localização:** `frontend/src/services/solicitacaoCodigo.service.ts`

**Métodos:**
- `create(data)` - Criar nova solicitação
- `listAll(status?)` - Listar todas
- `cancel(id)` - Cancelar solicitação
- `listPendentes()` - Listar pendentes do despachante
- `enviarCodigo(id, data)` - Enviar código

### 2. Página Admin: Solicitar Código

**Localização:** `frontend/src/app/admin/solicitar-codigo/page.tsx`

**Recursos:**
- Formulário para criar solicitação
  - Seleção de motorista
  - Campo de email de destino
  - Observação opcional
- Filtros por status
- Tabela com histórico completo
  - Informações do motorista
  - Email de destino
  - Observação
  - Status (badge colorido)
  - Código (quando enviado)
  - Datas de solicitação e envio
  - Botão para cancelar (apenas pendentes)
- Dashboard com contadores:
  - Pendentes (amarelo)
  - Enviados (verde)
  - Cancelados (cinza)

### 3. Widget Despachante: Solicitações de Código

**Localização:** `frontend/src/components/despachante/SolicitacoesCodigoWidget.tsx`

**Recursos:**
- Lista de solicitações pendentes
- Card para cada solicitação mostrando:
  - Nome e CPF do motorista
  - Observação (se houver)
  - Campo para digitar código
  - Botão "Enviar"
  - Data/hora da solicitação
- Atualização automática após envio
- Botão de refresh manual

## 📧 Notificações por Email

### 1. Email para Despachante (Nova Solicitação)

**Enviado quando:** Admin cria solicitação

**Conteúdo:**
- Título: "Nova Solicitação de Código"
- Dados do motorista (nome, CPF, tipo de curso)
- Observação do admin
- Instruções para enviar código via sistema

### 2. Email com Código (Para Destinatário)

**Enviado quando:** Despachante envia código

**Conteúdo:**
- Título: "Código do Motorista [Nome]"
- Dados do motorista
- **Código em destaque** (caixa azul, fonte grande)
- Observação (se houver)
- Informações do despachante

## 🔄 Fluxo de Uso

### Passo 1: Admin Cria Solicitação
1. Acessa `/admin/solicitar-codigo`
2. Seleciona motorista
3. Informa email de destino
4. Adiciona observação (opcional)
5. Clica em "Criar Solicitação"
6. **Email enviado para despachante**

### Passo 2: Despachante Recebe Notificação
1. Recebe email informando da solicitação
2. Acessa dashboard
3. Vê widget com solicitações pendentes
4. Obtém código do motorista (fora do sistema)

### Passo 3: Despachante Envia Código
1. Digite código no campo
2. Clica em "Enviar"
3. **Email enviado automaticamente para o destinatário**
4. Status muda para "ENVIADO"

### Passo 4: Admin Acompanha
1. Visualiza histórico completo
2. Vê status atualizado
3. Visualiza código enviado
4. Pode cancelar solicitações pendentes

## 🎯 Funcionalidades

✅ **Admin pode:**
- Criar solicitações de código
- Informar email customizado para cada solicitação
- Adicionar observações
- Ver histórico completo
- Filtrar por status
- Cancelar solicitações pendentes
- Ver códigos enviados

✅ **Despachante pode:**
- Ver solicitações pendentes
- Enviar códigos através do sistema
- Ver detalhes de cada solicitação

✅ **Sistema:**
- Envia emails automáticos
- Valida dados
- Controla status
- Registra datas
- Destaca código visualmente no email

## 📝 Tipos TypeScript

```typescript
interface SolicitacaoCodigo {
  id: string
  motoristaId: string
  emailDestino: string
  observacao?: string
  codigo?: string
  status: 'PENDENTE' | 'ENVIADO' | 'CANCELADO'
  solicitadoPor: string
  solicitadoEm: string
  enviadoEm?: string
  motorista?: {
    id: string
    nome: string
    cpf: string
    cursoTipo: string
  }
}
```

## 🚀 Como Testar

### 1. Criar Solicitação (Admin)
```
POST http://localhost:5000/api/admin/solicitacoes-codigo
Headers: Authorization: Bearer <admin-token>
Body: {
  "motoristaId": "...",
  "emailDestino": "destino@example.com",
  "observacao": "Código para renovação"
}
```

### 2. Listar Pendentes (Despachante)
```
GET http://localhost:5000/api/solicitacoes-codigo
Headers: Authorization: Bearer <despachante-token>
```

### 3. Enviar Código (Despachante)
```
POST http://localhost:5000/api/solicitacoes-codigo/:id/enviar-codigo
Headers: Authorization: Bearer <despachante-token>
Body: {
  "codigo": "ABC123XYZ"
}
```

## 📦 Arquivos Criados/Modificados

### Backend
- ✅ `backend/prisma/schema.prisma` - Novo model e enum
- ✅ `backend/src/controllers/solicitacaoCodigoController.ts` - CRIADO
- ✅ `backend/src/routes/solicitacoes-codigo.ts` - CRIADO
- ✅ `backend/src/routes/admin.ts` - MODIFICADO (+ 3 rotas)
- ✅ `backend/src/app.ts` - MODIFICADO (+ import e use)

### Frontend
- ✅ `frontend/src/services/solicitacaoCodigo.service.ts` - CRIADO
- ✅ `frontend/src/app/admin/solicitar-codigo/page.tsx` - CRIADO
- ✅ `frontend/src/components/despachante/SolicitacoesCodigoWidget.tsx` - CRIADO

## ✅ Status da Implementação

- [x] Migração Prisma aplicada
- [x] Controller backend completo
- [x] Rotas configuradas
- [x] Service frontend criado
- [x] Página admin implementada
- [x] Widget despachante implementado
- [x] Emails configurados
- [x] Backend compilando sem erros
- [x] Tipos TypeScript definidos

## 📌 Próximos Passos (Opcional)

Para integrar o widget na dashboard do despachante, adicione em `frontend/src/app/dashboard/page.tsx`:

```tsx
import { SolicitacoesCodigoWidget } from '@/components/despachante/SolicitacoesCodigoWidget'

// ... dentro do render, adicione:
{isDespachante && <SolicitacoesCodigoWidget />}
```

---

**Implementação concluída com sucesso! ✨**
