# Script de teste rápido do backend DespaFacil
# Uso: .\test-backend.ps1

$BASE_URL = "http://localhost:4000"

Write-Host ""
Write-Host "🧪 Testando Backend DespaFacil..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1️⃣ Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BASE_URL/" -Method Get
    if ($health) {
        Write-Host "✅ Servidor rodando!" -ForegroundColor Green
        Write-Host "   Service: $($health.service)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Servidor não está respondendo!" -ForegroundColor Red
    Write-Host "   Certifique-se de que rodou: npm run dev" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# 2. Login Admin
Write-Host "2️⃣ Login como Admin..." -ForegroundColor Yellow
try {
    $loginBody = @{
        emailOrCnpj = "theostracke11@gmail.com"
        password = "SenhaForte123!"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    if ($loginResponse.success) {
        $TOKEN = $loginResponse.accessToken
        Write-Host "✅ Login bem-sucedido!" -ForegroundColor Green
        Write-Host "   Usuário: $($loginResponse.user.name) ($($loginResponse.user.role))" -ForegroundColor Gray
        Write-Host "   Token: $($TOKEN.Substring(0, [Math]::Min(40, $TOKEN.Length)))..." -ForegroundColor DarkGray
    }
} catch {
    Write-Host "❌ Erro no login!" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# 3. Listar Motoristas
Write-Host "3️⃣ Listando motoristas..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $TOKEN"
    }

    $motoristas = Invoke-RestMethod -Uri "$BASE_URL/api/motoristas" `
        -Method Get `
        -Headers $headers

    if ($motoristas.success) {
        Write-Host "✅ Total de motoristas: $($motoristas.pagination.total)" -ForegroundColor Green
        if ($motoristas.motoristas.Count -gt 0) {
            Write-Host "   Primeiro motorista: $($motoristas.motoristas[0].nome)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Erro ao listar motoristas!" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

# 4. Criar Motorista
Write-Host "4️⃣ Criando novo motorista de teste..." -ForegroundColor Yellow
try {
    $cpfAleatorio = -join ((0..9) | Get-Random -Count 11)
    
    $motoristaBody = @{
        nome = "Teste Automatico $(Get-Date -Format 'HHmmss')"
        cpf = $cpfAleatorio
        telefone = "11999887766"
        cursoTipo = "TAC"
        email = "teste.auto@email.com"
    } | ConvertTo-Json

    $novoMotorista = Invoke-RestMethod -Uri "$BASE_URL/api/motoristas" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $motoristaBody

    if ($novoMotorista.success) {
        $MOTORISTA_ID = $novoMotorista.motorista.id
        Write-Host "✅ Motorista criado com sucesso!" -ForegroundColor Green
        Write-Host "   Nome: $($novoMotorista.motorista.nome)" -ForegroundColor Gray
        Write-Host "   ID: $MOTORISTA_ID" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "⚠️ Não foi possível criar motorista" -ForegroundColor Yellow
    Write-Host "   (pode já existir com esse CPF)" -ForegroundColor Gray
}
Write-Host ""

# 5. Upload de Documento
if ($MOTORISTA_ID) {
    Write-Host "5️⃣ Upload de documento de teste..." -ForegroundColor Yellow
    try {
        # Criar arquivo temporário
        $tempFile = "$env:TEMP\cnh-teste-$(Get-Date -Format 'yyyyMMddHHmmss').txt"
        "Documento de teste - CNH - Gerado em $(Get-Date)" | Out-File -FilePath $tempFile -Encoding UTF8

        # Upload usando curl (mais fácil para multipart/form-data)
        $curlCommand = "curl -s -X POST `"$BASE_URL/api/documentos/upload`" -H `"Authorization: Bearer $TOKEN`" -F `"file=@$tempFile`" -F `"motoristaId=$MOTORISTA_ID`" -F `"tipo=CNH`""
        
        $uploadResult = Invoke-Expression $curlCommand | ConvertFrom-Json

        if ($uploadResult.success) {
            $DOCUMENTO_ID = $uploadResult.documento.id
            Write-Host "✅ Documento enviado com sucesso!" -ForegroundColor Green
            Write-Host "   Tipo: $($uploadResult.documento.tipo)" -ForegroundColor Gray
            Write-Host "   Status: $($uploadResult.documento.status)" -ForegroundColor Gray
            Write-Host "   ID: $DOCUMENTO_ID" -ForegroundColor DarkGray
        }

        # Limpar arquivo temp
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    } catch {
        Write-Host "⚠️ Erro no upload (verifique se curl está instalado)" -ForegroundColor Yellow
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
    }
    Write-Host ""
}

# 6. Listar Documentos Admin
Write-Host "6️⃣ Listando todos os documentos (visão admin)..." -ForegroundColor Yellow
try {
    $docs = Invoke-RestMethod -Uri "$BASE_URL/api/admin/documentos" `
        -Method Get `
        -Headers $headers

    if ($docs.success) {
        Write-Host "✅ Total de documentos no sistema: $($docs.pagination.total)" -ForegroundColor Green
        
        # Contagem por status
        $pendentes = ($docs.documentos | Where-Object { $_.status -eq "PENDENTE" }).Count
        $aprovados = ($docs.documentos | Where-Object { $_.status -eq "APROVADO" }).Count
        $negados = ($docs.documentos | Where-Object { $_.status -eq "NEGADO" }).Count
        
        Write-Host "   📋 Pendentes: $pendentes" -ForegroundColor Yellow
        Write-Host "   ✅ Aprovados: $aprovados" -ForegroundColor Green
        Write-Host "   ❌ Negados: $negados" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro ao listar documentos!" -ForegroundColor Red
}
Write-Host ""

# Resumo Final
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Testes básicos concluídos!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Variáveis disponíveis para uso:" -ForegroundColor Cyan
Write-Host "   `$TOKEN = '$($TOKEN.Substring(0, [Math]::Min(40, $TOKEN.Length)))...'" -ForegroundColor Gray
if ($MOTORISTA_ID) {
    Write-Host "   `$MOTORISTA_ID = '$MOTORISTA_ID'" -ForegroundColor Gray
}
if ($DOCUMENTO_ID) {
    Write-Host "   `$DOCUMENTO_ID = '$DOCUMENTO_ID'" -ForegroundColor Gray
}
Write-Host ""
Write-Host "💡 Próximos passos sugeridos:" -ForegroundColor Yellow
Write-Host "   1. Aprovar um documento:" -ForegroundColor White
Write-Host "      Invoke-RestMethod -Uri `"$BASE_URL/api/documentos/<ID>/status`" ``" -ForegroundColor Gray
Write-Host "        -Method Put -Headers @{Authorization=`"Bearer `$TOKEN`"} ``" -ForegroundColor Gray
Write-Host "        -ContentType 'application/json' ``" -ForegroundColor Gray
Write-Host "        -Body '{`"status`":`"APROVADO`"}'" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Exportar relatório:" -ForegroundColor White
Write-Host "      Invoke-WebRequest -Uri `"$BASE_URL/api/admin/export`" ``" -ForegroundColor Gray
Write-Host "        -Headers @{Authorization=`"Bearer `$TOKEN`"} ``" -ForegroundColor Gray
Write-Host "        -OutFile 'relatorio.xlsx'" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Veja TESTES_BACKEND.md para comandos completos" -ForegroundColor Cyan
Write-Host ""
