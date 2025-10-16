# ✅ DIAGNÓSTICO E SOLUÇÃO - ERRO 400 UPLOAD

## 🔍 Status Atual:

### ✅ O que está funcionando:
- Backend recebe uploads via curl/PowerShell
- Motorista existe e pertence ao despachante
- Token JWT está válido
- Endpoint `/api/documentos/upload` existe

### ❌ O que não está funcionando:
- Upload pelo frontend retorna 400 Bad Request

---

## 🐛 Logs Adicionados:

Adicionei logs em **3 pontos**:

### 1. Frontend - Componente (DocumentoUpload.tsx)
```
🚀 handleUpload chamado: { tipo, motoristaId }
📁 Arquivo selecionado: nome.pdf
⏳ Enviando para documentoService.upload...
```

### 2. Frontend - Service (documento.service.ts)
```
📤 Upload iniciado:
  - Motorista ID: ...
  - Tipo: ...
  - Arquivo: nome.pdf tipo tamanho bytes

📦 FormData criado: { file, motoristaId, tipo }

✅ Upload sucesso OU ❌ Erro: { status, data, message }
```

### 3. Backend - Controller (documentoController.ts)
```
🔵 Upload controller chamado
  - req.file: arquivo.pdf (ou NULL se não chegou)
  - req.body: { motoristaId, tipo }
  - user: id role
```

### 4. Backend - Service (documentoService.ts)
```
📤 uploadDocumento chamado:
  - motoristaId: ...
  - tipo: ...
  - file: arquivo.pdf
  - userId: ...
  - role: ...
```

---

## 🧪 Como Testar Agora:

### 1. Certifique-se que o backend está rodando
```powershell
# Terminal 1 - Backend
cd backend
npm run dev
```

### 2. Certifique-se que o frontend está rodando
```powershell
# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 3. Abra o navegador
```
http://localhost:3000/dashboard
```

### 4. Abra o Console do Browser (F12)
- Vá na aba "Console"

### 5. Teste o Upload
- Clique no botão de upload do motorista "João da Silva"
- Selecione a tab "CNH"
- Escolha um arquivo PDF
- Clique em "Enviar Documento"

### 6. Observe os Logs

**No Console do Browser (F12):**
- Deve aparecer os logs do componente e do service
- Veja se `motoristaId`, `tipo` e `file` estão corretos

**No Terminal do Backend:**
- Deve aparecer os logs do controller
- Veja se `req.file`, `req.body` chegaram corretamente

---

## 🎯 O que me enviar:

Tire **4 prints/copie o texto**:

1. **Console do Browser** - Todos os logs que aparecerem (📤, 📦, ✅ ou ❌)
2. **Terminal do Backend** - Logs do controller (🔵, 📤)
3. **Network do Browser** (F12 > Network):
   - Clique na requisição `upload`
   - Aba "Headers" - veja o `Content-Type`
   - Aba "Payload" - veja o `Form Data`
4. **Resposta do erro** - O JSON de erro que o backend retorna

---

## 🔧 Possíveis Causas (vamos descobrir com os logs):

### Causa 1: Arquivo não chegando ao backend
- **Log mostra:** `req.file: NULL`
- **Motivo:** Problema no multipart/form-data ou nome do campo errado

### Causa 2: Campos vazios
- **Log mostra:** `req.body: { motoristaId: undefined }`
- **Motivo:** FormData não está sendo montado corretamente

### Causa 3: Tipo de documento inválido
- **Log mostra:** `tipo: "CNH"` mas backend rejeita
- **Motivo:** Incompatibilidade entre enums

### Causa 4: Motorista não encontrado
- **Log mostra:** "Motorista não encontrado"
- **Motivo:** ID errado ou motorista foi deletado

### Causa 5: Permissão negada
- **Log mostra:** "Acesso negado"
- **Motivo:** Motorista não pertence ao despachante

---

## 🚀 Próximos Passos:

Depois que você me enviar os logs, vou:
1. Identificar onde exatamente está o problema
2. Corrigir o código
3. Testar novamente

**Com os logs, vou resolver em 5 minutos!** 🎯
