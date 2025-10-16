# 🐛 DEBUG: ERRO 400 NO UPLOAD

## Logs Adicionados:

### Frontend (Console do Browser):
Ao clicar em "Enviar Documento", você verá:
```
📤 Upload iniciado:
  - Motorista ID: ...
  - Tipo: ...
  - Arquivo: nome.pdf tipo tamanho bytes

📦 FormData criado: {...}

✅ Upload sucesso: {...}  OU  ❌ Erro no upload: {...}
```

### Backend (Terminal do backend):
Você verá:
```
🔵 Upload controller chamado
  - req.file: arquivo.pdf OU NULL
  - req.body: { motoristaId: '...', tipo: '...' }
  - user: id role

📤 uploadDocumento chamado:
  - motoristaId: ...
  - tipo: ...
  - file: arquivo.pdf OU NULL
  - userId: ...
  - role: ...
```

---

## 🧪 Como Testar:

### 1. Abra o frontend
```
http://localhost:3000/dashboard
```

### 2. Abra o Console do Browser (F12)

### 3. Clique em "Enviar Documento"

### 4. Veja o terminal do backend

---

## 🔍 Possíveis Causas do Erro 400:

### ❌ Arquivo não está chegando
- **Console mostra:** `req.file: NULL`
- **Solução:** Problema no multipart/form-data

### ❌ Campos faltando
- **Console mostra:** `motoristaId` ou `tipo` undefined
- **Solução:** FormData não está sendo montado corretamente

### ❌ Token inválido
- **Console mostra:** Erro de autenticação antes do upload
- **Solução:** Fazer login novamente

### ❌ Motorista não pertence ao despachante
- **Console mostra:** "Acesso negado"
- **Solução:** Usar motorista criado pelo usuário logado

---

## 📊 O que me enviar:

1. **Print do Console do Frontend** (com os logs de upload)
2. **Print do Terminal do Backend** (com os logs do controller)
3. **Qual tipo de documento** você tentou enviar (CNH, Comprovante, etc)?
4. **Qual arquivo** você selecionou (PDF, JPG, PNG)?

Com essas informações vou identificar o problema exato! 🎯
