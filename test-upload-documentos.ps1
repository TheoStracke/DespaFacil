# ========================================
# TESTE DE UPLOAD DE DOCUMENTOS - DespaFacil
# ========================================

Write-Host "`n🔐 PASSO 1: Login para obter token..." -ForegroundColor Cyan

# Fazer login
$loginBody = @{
    emailOrCnpj = "despachante@teste.com"
    password = "SenhaForte123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.accessToken
    Write-Host "✅ Login realizado com sucesso!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Erro no login: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 PASSO 2: Listando motoristas..." -ForegroundColor Cyan

# Headers com token
$headers = @{
    Authorization = "Bearer $token"
}

try {
    $motoristasResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/motoristas" -Headers $headers
    $motoristas = $motoristasResponse.motoristas
    
    if ($motoristas.Count -eq 0) {
        Write-Host "⚠️ Nenhum motorista encontrado! Crie um motorista primeiro." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "✅ $($motoristas.Count) motorista(s) encontrado(s)!" -ForegroundColor Green
    
    # Pegar o primeiro motorista
    $motoristaId = $motoristas[0].id
    $motoristaNome = $motoristas[0].nome
    
    Write-Host "📝 Usando motorista: $motoristaNome (ID: $motoristaId)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Erro ao listar motoristas: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n📄 PASSO 3: Criando arquivo de teste..." -ForegroundColor Cyan

# Criar arquivo de teste
$testFile = "test-documento.txt"
"Este é um documento de teste para upload.`nData: $(Get-Date)" | Out-File -FilePath $testFile -Encoding UTF8

if (Test-Path $testFile) {
    Write-Host "✅ Arquivo criado: $testFile" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao criar arquivo de teste" -ForegroundColor Red
    exit 1
}

Write-Host "`n📤 PASSO 4: Testando upload de CNH..." -ForegroundColor Cyan

# Upload de CNH
try {
    $uploadUrl = "http://localhost:4000/api/motoristas/$motoristaId/documentos"
    
    # PowerShell não tem curl nativo como no Linux, vamos usar Invoke-RestMethod com multipart
    $filePath = Resolve-Path $testFile
    
    # Preparar multipart form data
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"tipo`"$LF",
        "CNH",
        "--$boundary",
        "Content-Disposition: form-data; name=`"documento`"; filename=`"cnh-teste.txt`"",
        "Content-Type: text/plain$LF",
        [System.IO.File]::ReadAllText($filePath),
        "--$boundary--$LF"
    ) -join $LF
    
    $uploadHeaders = @{
        Authorization = "Bearer $token"
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    $uploadResponse = Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $uploadHeaders -Body $bodyLines
    
    Write-Host "✅ CNH enviada com sucesso!" -ForegroundColor Green
    Write-Host "Documento ID: $($uploadResponse.documento.id)" -ForegroundColor Gray
    Write-Host "Status: $($uploadResponse.documento.status)" -ForegroundColor Gray
    Write-Host "Arquivo: $($uploadResponse.documento.nomeArquivo)" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Erro no upload: $_" -ForegroundColor Red
    Write-Host "Detalhes: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🧹 PASSO 5: Limpeza..." -ForegroundColor Cyan

# Limpar arquivo de teste
if (Test-Path $testFile) {
    Remove-Item $testFile
    Write-Host "✅ Arquivo de teste removido" -ForegroundColor Green
}

Write-Host "`n✅ TESTE CONCLUÍDO!" -ForegroundColor Green
Write-Host "`n💡 DICA: Para testar com curl (se instalado):" -ForegroundColor Yellow
Write-Host "curl -X POST http://localhost:4000/api/motoristas/$motoristaId/documentos \"
Write-Host "  -H 'Authorization: Bearer $token' \"
Write-Host "  -F 'tipo=CNH' \"
Write-Host "  -F 'documento=@arquivo.pdf'" -ForegroundColor Gray
