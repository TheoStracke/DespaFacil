# 📋 GUIA: COMO APROVAR/NEGAR DOCUMENTOS

## 🎯 Visão Geral

O painel admin permite que você **revise, aprove ou negue** documentos enviados pelos despachantes.

---

## 🔐 1. Acesso ao Painel Admin

### Login:
```
Email: theostracke11@gmail.com
Senha: SenhaForte123!
```

### URL:
```
http://localhost:3000/admin
```

Após login, você será redirecionado automaticamente para `/admin`

---

## 📊 2. Interface do Painel

### Topo da Página:

```
┌─────────────────────────────────────────────────────────┐
│ 🎛️ Painel Administrativo                               │
│                                         👤 Admin | Sair │
└─────────────────────────────────────────────────────────┘
```

### Cartão de Gestão:

```
┌─────────────────────────────────────────────────────────┐
│ Gestão de Documentos                                    │
│ Gerencie aprovações e envie certificados                │
│                                                          │
│  [🔄 Atualizar]  [⬇️ Exportar]  [📤 Enviar Certificado] │
└─────────────────────────────────────────────────────────┘
```

### Filtros:

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Buscar por motorista ou CPF...                       │
│                                                          │
│ Status: [Todos ▼]   Tipo: [Todos ▼]                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 3. Tabela de Documentos

A tabela mostra todos os documentos com as seguintes colunas:

```
┌──────────┬────────────┬──────────────┬──────────┬─────────────┬──────────┐
│ Motorista│    CPF     │     Tipo     │ Arquivo  │   Status    │  Ações   │
├──────────┼────────────┼──────────────┼──────────┼─────────────┼──────────┤
│ João     │ 123.456... │ CNH          │ cnh.pdf  │ ⏳ Pendente │ ✅ ❌ 👁️ │
│ da Silva │            │              │          │             │          │
├──────────┼────────────┼──────────────┼──────────┼─────────────┼──────────┤
│ Maria    │ 987.654... │ Comprovante  │ comp.jpg │ ✅ Aprovado │    👁️   │
│ Santos   │            │              │          │             │          │
└──────────┴────────────┴──────────────┴──────────┴─────────────┴──────────┘
```

### Status possíveis:
- 🟡 **PENDENTE** - Aguardando análise
- 🟢 **APROVADO** - Documento aprovado
- 🔴 **NEGADO** - Documento negado

### Botões de Ação:
- ✅ **Aprovar** - Aprovar documento (apenas se PENDENTE)
- ❌ **Negar** - Negar documento (apenas se PENDENTE)
- 👁️ **Visualizar** - Ver/baixar o arquivo

---

## ✅ 4. APROVAR um Documento

### Passo a Passo:

1. **Clique no botão verde** ✅ na linha do documento

2. **Modal abre:**
```
┌─────────────────────────────────────────────┐
│ ✅ Aprovar Documento                        │
│                                             │
│ Tem certeza que deseja aprovar este        │
│ documento?                                  │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Tipo: CNH                               │ │
│ │ Arquivo: cnh-joao.pdf                   │ │
│ │ Enviado em 15/10/2025                   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│              [Cancelar]  [Aprovar]          │
└─────────────────────────────────────────────┘
```

3. **Clique em "Aprovar"**

4. **Resultado:**
   - ✅ Toast de sucesso: "Documento aprovado!"
   - Status muda para 🟢 **APROVADO**
   - Despachante recebe email (se configurado)
   - Botões de ação desaparecem (não pode mais alterar)

---

## ❌ 5. NEGAR um Documento

### Passo a Passo:

1. **Clique no botão vermelho** ❌ na linha do documento

2. **Modal abre:**
```
┌─────────────────────────────────────────────┐
│ ❌ Negar Documento                          │
│                                             │
│ Informe o motivo da negação do documento   │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Tipo: CNH                               │ │
│ │ Arquivo: cnh-joao.pdf                   │ │
│ │ Enviado em 15/10/2025                   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Motivo da Negação: *                        │
│ ┌─────────────────────────────────────────┐ │
│ │ Ex: Documento ilegível, data vencida... │ │
│ │                                         │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│              [Cancelar]  [Negar]            │
└─────────────────────────────────────────────┘
```

3. **Digite o motivo** (obrigatório!)
   - Ex: "Documento ilegível"
   - Ex: "CNH vencida"
   - Ex: "Informações não correspondem ao cadastro"

4. **Clique em "Negar"**

5. **Resultado:**
   - ✅ Toast: "Documento negado"
   - Status muda para 🔴 **NEGADO**
   - Despachante recebe email com o motivo
   - Despachante pode enviar novo documento

---

## 👁️ 6. VISUALIZAR Documento

1. **Clique no botão do olho** 👁️

2. **Ações possíveis:**
   - Ver preview do documento (se suportado)
   - Baixar o arquivo
   - Ver detalhes completos

---

## 🔍 7. FILTROS

### Buscar por Motorista ou CPF:
```
🔍 [João da Silva________]
```
- Digite nome ou CPF
- Atualiza em tempo real

### Filtrar por Status:
```
Status: [Pendente ▼]
```
Opções:
- Todos
- Pendente
- Aprovado
- Negado

### Filtrar por Tipo:
```
Tipo: [CNH ▼]
```
Opções:
- Todos
- CNH
- Comprovante de Pagamento
- Documento 1
- Documento 2

---

## 📤 8. ENVIAR CERTIFICADO

1. **Clique em "Enviar Certificado"** (botão azul no topo)

2. **Modal abre:**
```
┌─────────────────────────────────────────────┐
│ 📤 Enviar Certificado                       │
│                                             │
│ Buscar Motorista:                           │
│ ┌─────────────────────────────────────────┐ │
│ │ Nome ou CPF do motorista...             │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Arquivo do Certificado: *                   │
│ [Escolher arquivo...]  certificado.pdf      │
│                                             │
│              [Cancelar]  [Enviar]           │
└─────────────────────────────────────────────┘
```

3. **Preencha:**
   - Nome ou CPF do motorista
   - Selecione arquivo PDF do certificado

4. **Clique em "Enviar"**

5. **Resultado:**
   - Despachante recebe notificação
   - Certificado é vinculado ao motorista

---

## ⬇️ 9. EXPORTAR RELATÓRIO

1. **Clique em "Exportar"** (botão no topo)

2. **Download automático** de arquivo XLSX com:
   - Todos os documentos
   - Motorista, CPF, Despachante
   - Tipo, Status, Datas
   - Motivos de negação (se houver)

---

## 🔄 10. ATUALIZAR LISTA

**Clique em "Atualizar"** para recarregar os documentos do servidor.

---

## 📊 11. ESTATÍSTICAS

No topo da tabela você vê:

```
Mostrando X de Y documentos
```

Exemplo:
- "Mostrando 3 de 10 documentos" (com filtro)
- "Mostrando 10 de 10 documentos" (sem filtro)

---

## ⚠️ 12. VALIDAÇÕES

### Ao aprovar:
- ✅ Não precisa de motivo
- ✅ Confirmação rápida

### Ao negar:
- ❌ **Motivo é obrigatório**
- Se não preencher, aparece erro: "Motivo é obrigatório para negar um documento"

### Documentos já processados:
- Não aparecem botões de ação
- Apenas botão de visualizar
- Não pode mudar status depois de aprovado/negado

---

## 🎯 FLUXO COMPLETO DE TESTE

1. ✅ Login como admin
2. 📋 Ver lista de documentos pendentes
3. 🔍 Filtrar por status "Pendente"
4. 👁️ Visualizar documento
5. ✅ Aprovar alguns documentos
6. ❌ Negar um documento com motivo
7. 🔄 Atualizar lista
8. 📤 Enviar certificado para motorista aprovado
9. ⬇️ Exportar relatório
10. 🚪 Sair

---

## 🐛 TROUBLESHOOTING

### Botões de ação não aparecem?
- Documento já foi processado (aprovado ou negado)
- Recarregue a página

### Erro ao aprovar/negar?
- Verifique se está logado como admin
- Token pode ter expirado (faça login novamente)

### Email não é enviado?
- Normal em desenvolvimento
- Emails são não-bloqueantes (não afetam a operação)
- Configure SMTP no .env para produção

---

## ✅ RESUMO RÁPIDO

| Ação | Botão | Motivo? | Email? |
|------|-------|---------|--------|
| Aprovar | ✅ Verde | Não | Sim* |
| Negar | ❌ Vermelho | **Sim** | Sim* |
| Ver | 👁️ Azul | - | Não |

*Emails só funcionam com SMTP configurado

---

**Agora você está pronto para gerenciar documentos!** 🚀
