# 🔐 Sistema de Logs de Auditoria - DespaFacil

## Visão Geral

O sistema de logs de auditoria rastreia todas as ações críticas realizadas na plataforma, garantindo **compliance**, **segurança** e **rastreabilidade completa** de todas as operações.

## 🎯 Características

### Acesso Restrito
- **Senha fixa**: `$up0rt32025` (não pode ser alterada)
- **Apenas administradores** podem acessar
- **Modal de autenticação** antes de visualizar os logs
- **Log de tentativas de acesso** (aprovadas e negadas)

### Ações Rastreadas

#### Autenticação
- `LOGIN` - Login bem-sucedido
- `LOGOUT` - Logout
- `LOGIN_FAILED` - Tentativa de login falhou
- `PASSWORD_RESET_REQUEST` - Solicitação de reset de senha
- `PASSWORD_RESET_COMPLETE` - Reset de senha completo
- `PASSWORD_CHANGE` - Alteração de senha

#### Motoristas
- `MOTORISTA_CREATE` - Motorista criado
- `MOTORISTA_UPDATE` - Motorista atualizado
- `MOTORISTA_DELETE` - Motorista excluído

#### Documentos
- `DOCUMENTO_UPLOAD` - Documento enviado
- `DOCUMENTO_APROVAR` - Documento aprovado
- `DOCUMENTO_NEGAR` - Documento negado
- `DOCUMENTO_DOWNLOAD` - Documento baixado
- `DOCUMENTO_DELETE` - Documento excluído

#### Certificados
- `CERTIFICADO_ENVIAR` - Certificado enviado
- `CERTIFICADO_DOWNLOAD` - Certificado baixado

#### Usuários
- `USER_CREATE` - Usuário criado
- `USER_UPDATE` - Usuário atualizado
- `USER_DELETE` - Usuário excluído

#### Solicitações
- `SOLICITACAO_APROVAR` - Solicitação aprovada
- `SOLICITACAO_NEGAR` - Solicitação negada

#### Códigos
- `CODIGO_SOLICITAR` - Código solicitado
- `CODIGO_ENVIAR` - Código enviado

#### Auditoria
- `AUDIT_ACCESS` - Acesso aos logs de auditoria
- `AUDIT_EXPORT` - Exportação de logs
- `AUDIT_ACCESS_DENIED` - Tentativa de acesso negada

## 📊 Informações Rastreadas

Cada log contém:

```typescript
{
  id: string              // ID único do log
  userId: string          // ID do usuário que executou a ação
  user: {                 // Dados do usuário
    id: string
    name: string
    email: string
    role: string
  }
  action: string          // Tipo de ação (veja lista acima)
  entityType?: string     // Tipo de entidade (Motorista, Documento, etc)
  entityId?: string       // ID da entidade relacionada
  entityName?: string     // Nome/identificação da entidade
  metadata?: any          // Dados adicionais em JSON
  ipAddress?: string      // IP do usuário
  userAgent?: string      // Navegador/sistema do usuário
  createdAt: DateTime     // Data/hora da ação
}
```

## 🔍 Funcionalidades da Interface

### Filtros Avançados
- **Usuário**: Buscar por ID ou email
- **Ação**: Filtrar por tipo de ação específica
- **Tipo de Entidade**: Motorista, Documento, Certificado, User
- **Data Início/Fim**: Período personalizado
- **Paginação**: 50 registros por página

### Exportação
- **Formato CSV**: Exportação completa com todos os campos
- **Máximo**: 10.000 registros por exportação
- **Log da exportação**: A própria exportação é registrada

### Visualização
- **Tabela responsiva** com informações principais
- **Badges coloridas** por tipo de ação:
  - 🟢 Verde: Criação, Aprovação, Login
  - 🔴 Vermelho: Exclusão, Negação, Falhas
  - 🔵 Azul: Atualização, Envio
  - 🟣 Roxo: Download, Exportação
  - ⚪ Cinza: Outros

## 🚀 Como Usar

### Backend

1. **Migration do Prisma**:
```bash
cd backend
npx prisma migrate dev --name add_audit_logs
```

2. **Criar log de auditoria** (em qualquer controller):
```typescript
import { createAuditLog, AUDIT_ACTIONS } from '../services/auditLogService';

// Exemplo: Ao aprovar um documento
await createAuditLog({
  userId: req.user.id,
  action: AUDIT_ACTIONS.DOCUMENTO_APROVAR,
  entityType: 'Documento',
  entityId: documento.id,
  entityName: `${documento.motorista.nome} - ${documento.tipo}`,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  metadata: {
    motoristaId: documento.motoristaId,
    tipo: documento.tipo,
  },
});
```

### Frontend

1. **Acessar**: `/admin/auditoria`
2. **Senha**: `$up0rt32025`
3. **Filtrar e visualizar** logs
4. **Exportar** se necessário

## 🔐 Segurança

- ✅ Acesso **apenas para admins**
- ✅ **Senha fixa** não pode ser alterada via interface
- ✅ **Tentativas de acesso são logadas**
- ✅ Logs são **imutáveis** (não podem ser editados/excluídos)
- ✅ **IP e User Agent** são capturados automaticamente
- ✅ Falhas ao criar log **não quebram** a operação principal

## 📝 Boas Práticas

### Quando Criar Logs

✅ **SIM** - Criar logs para:
- Operações de criação, edição, exclusão
- Aprovações e negações
- Downloads de arquivos sensíveis
- Mudanças de permissões/senhas
- Acessos a áreas restritas

❌ **NÃO** - Criar logs para:
- Listagens simples (GET sem efeitos colaterais)
- Atualizações de UI/preferências
- Buscas/filtros
- Operações muito frequentes sem impacto

### Metadata

Use `metadata` para armazenar contexto adicional:

```typescript
metadata: {
  motivoNegacao: 'Documento ilegível',
  statusAnterior: 'PENDENTE',
  statusNovo: 'NEGADO',
  valorAnterior: oldValue,
  valorNovo: newValue,
}
```

## 🛠️ Manutenção

### Limpeza de Logs Antigos (Futuro)

Para manter performance, considere criar um job que:
- Arquive logs com mais de 1 ano
- Mantenha apenas últimos 6 meses em tabela principal
- Export automático para S3/storage externo

### Índices Importantes

O schema já inclui índices em:
- `userId` - Busca por usuário
- `action` - Filtro por ação
- `entityType` - Filtro por tipo
- `createdAt` - Ordenação e filtro por data

## 📈 Estatísticas (Futuro)

A função `getAuditStats()` já está preparada para dashboards:
- Total de logs por período
- Top 10 ações mais realizadas
- Top 10 usuários mais ativos

## 🔄 Próximos Passos

1. ✅ Sistema básico implementado
2. ⏳ Adicionar logs em **todos** os controllers críticos
3. ⏳ Dashboard de estatísticas na interface
4. ⏳ Alertas para ações suspeitas
5. ⏳ Retenção e arquivamento automático
6. ⏳ Compliance reports (PDF)

---

**Desenvolvido para garantir segurança e compliance do DespaFacil** 🔒
