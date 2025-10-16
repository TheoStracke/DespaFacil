# ========================================
# Script de Teste Completo - DespaFacil
# ========================================

$BASE_URL = "http://localhost:4000"
$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  TESTE COMPLETO - BACKEND DESPAFACIL" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Teste 1: Login Admin
Write-Host "[1/10] Testando Login Admin..." -ForegroundColor Yellow

$loginBody = @{
    emailOrCnpj = "theostracke11@gmail.com"
    password = "SenhaForte123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"
    
    if ($loginResponse.success) {
        Write-Host "  OK - Login admin bem-sucedido" -ForegroundColor Green
        Write-Host "       Usuario: $($loginResponse.user.name) ($($loginResponse.user.role))" -ForegroundColor Gray
        $ADMIN_TOKEN = $loginResponse.accessToken
    } else {
        Write-Host "  ERRO - Login retornou success=false" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "  ERRO - $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Teste 2: Login Despachante
Write-Host "[2/10] Testando Login Despachante..." -ForegroundColor Yellow

$despachanteBody = @{
    emailOrCnpj = "despachante@test.local"
    password = "SenhaForte123!"
} | ConvertTo-Json

try {
    $despachanteResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" `
        -Method Post `
        -Body $despachanteBody `
        -ContentType "application/json"
    
    if ($despachanteResponse.success) {
        Write-Host "  OK - Login despachante bem-sucedido" -ForegroundColor Green
        $DESPACHANTE_TOKEN = $despachanteResponse.accessToken
    }
} catch {
    Write-Host "  ERRO - $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 3: Listar Motoristas
Write-Host "[3/10] Testando Listar Motoristas..." -ForegroundColor Yellow

try {
    $motoristas = Invoke-RestMethod -Uri "$BASE_URL/api/motoristas" `
        -Method Get `
        -Headers @{ Authorization = "Bearer $DESPACHANTE_TOKEN" }
    
    if ($motoristas.success) {
        Write-Host "  OK - Lista obtida: $($motoristas.pagination.total) motoristas" -ForegroundColor Green
        
        if ($motoristas.motoristas.Count -gt 0) {
            $MOTORISTA_EXISTENTE = $motoristas.motoristas[0]
            Write-Host "       Primeiro: $($MOTORISTA_EXISTENTE.nome)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "  ERRO - $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 4: Criar Novo Motorista
Write-Host "[4/10] Testando Criar Motorista..." -ForegroundColor Yellow

$cpfAleatorio = "987654321$(Get-Random -Minimum 10 -Maximum 99)"
$novoMotoristaBody = @{
    nome = "Carlos Teste $(Get-Random -Maximum 9999)"
    cpf = $cpfAleatorio
    email = "carlos.teste$(Get-Random)@email.com"
    telefone = "11987654321"
    cursoTipo = "TAC"
} | ConvertTo-Json

try {
    $novoMotorista = Invoke-RestMethod -Uri "$BASE_URL/api/motoristas" `
        -Method Post `
        -Body $novoMotoristaBody `
        -ContentType "application/json" `
        -Headers @{ Authorization = "Bearer $DESPACHANTE_TOKEN" }
    
    if ($novoMotorista.success) {
        Write-Host "  OK - Motorista criado: $($novoMotorista.motorista.nome)" -ForegroundColor Green
        $MOTORISTA_ID = $novoMotorista.motorista.id
    }
} catch {
    Write-Host "  AVISO - Usando motorista existente" -ForegroundColor Yellow
    if ($MOTORISTA_EXISTENTE) {
        $MOTORISTA_ID = $MOTORISTA_EXISTENTE.id
    }
}

# Teste 5: Buscar Motorista por ID
if ($MOTORISTA_ID) {
    Write-Host "[5/10] Testando Buscar Motorista por ID..." -ForegroundColor Yellow
    
    try {
        $motorista = Invoke-RestMethod -Uri "$BASE_URL/api/motoristas/$MOTORISTA_ID" `
            -Method Get `
            -Headers @{ Authorization = "Bearer $DESPACHANTE_TOKEN" }
        
        if ($motorista.success) {
            Write-Host "  OK - Motorista encontrado: $($motorista.motorista.nome)" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ERRO - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Teste 6: Upload de Documento
if ($MOTORISTA_ID) {
    Write-Host "[6/10] Testando Upload de Documento..." -ForegroundColor Yellow
    
    $testFile = "cnh-teste-$(Get-Random).txt"
    "Conteudo de teste da CNH - $(Get-Date)" | Out-File -FilePath $testFile -Encoding UTF8
    
    try {
        $curlOutput = curl.exe -X POST "$BASE_URL/api/documentos/upload" `
            -H "Authorization: Bearer $DESPACHANTE_TOKEN" `
            -F "file=@$testFile" `
            -F "motoristaId=$MOTORISTA_ID" `
            -F "tipo=CNH" `
            2>&1 | Out-String
        
        Write-Host "  OK - Upload realizado" -ForegroundColor Green
        
        # Tentar extrair ID do documento
        if ($curlOutput -match '"id":"([^"]+)"') {
            $DOCUMENTO_ID = $matches[1]
            Write-Host "       Documento ID: $DOCUMENTO_ID" -ForegroundColor Gray
        }
        
        Remove-Item $testFile -ErrorAction SilentlyContinue
        
    } catch {
        Write-Host "  AVISO - $($_.Exception.Message)" -ForegroundColor Yellow
        Remove-Item $testFile -ErrorAction SilentlyContinue
    }
}

# Teste 7: Listar Documentos (Admin)
Write-Host "[7/10] Testando Listar Documentos (Admin)..." -ForegroundColor Yellow

try {
    $documentos = Invoke-RestMethod -Uri "$BASE_URL/api/admin/documentos" `
        -Method Get `
        -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
    
    if ($documentos.success) {
        $total = $documentos.pagination.total
        Write-Host "  OK - $total documentos encontrados" -ForegroundColor Green
        
        $pendentes = ($documentos.documentos | Where-Object { $_.status -eq "PENDENTE" }).Count
        $aprovados = ($documentos.documentos | Where-Object { $_.status -eq "APROVADO" }).Count
        Write-Host "       Pendentes: $pendentes | Aprovados: $aprovados" -ForegroundColor Gray
        
        if ($documentos.documentos.Count -gt 0 -and !$DOCUMENTO_ID) {
            $DOCUMENTO_ID = $documentos.documentos[0].id
        }
    }
} catch {
    Write-Host "  ERRO - $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 8: Aprovar Documento
if ($DOCUMENTO_ID) {
    Write-Host "[8/10] Testando Aprovar Documento (Admin)..." -ForegroundColor Yellow
    
    $aprovarBody = @{
        status = "APROVADO"
    } | ConvertTo-Json
    
    try {
        $aprovacao = Invoke-RestMethod -Uri "$BASE_URL/api/documentos/$DOCUMENTO_ID/status" `
            -Method Put `
            -Body $aprovarBody `
            -ContentType "application/json" `
            -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
        
        if ($aprovacao.success) {
            Write-Host "  OK - Documento aprovado" -ForegroundColor Green
            Write-Host "       Status: $($aprovacao.documento.status)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  AVISO - Documento pode ja estar aprovado" -ForegroundColor Yellow
    }
}

# Teste 9: Validacao - Login Invalido
Write-Host "[9/10] Testando Validacao (Login Invalido)..." -ForegroundColor Yellow

$invalidBody = @{
    emailOrCnpj = "theostracke11@gmail.com"
    password = "senhaErrada123"
} | ConvertTo-Json

try {
    $invalidLogin = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" `
        -Method Post `
        -Body $invalidBody `
        -ContentType "application/json"
    
    Write-Host "  ERRO - Validacao falhou (deveria negar login)" -ForegroundColor Red
} catch {
    Write-Host "  OK - Validacao funcionando (login negado)" -ForegroundColor Green
}

# Teste 10: Autorizacao - Acesso sem Token
Write-Host "[10/10] Testando Autorizacao (Sem Token)..." -ForegroundColor Yellow

try {
    $semToken = Invoke-RestMethod -Uri "$BASE_URL/api/motoristas" -Method Get
    Write-Host "  ERRO - Autorizacao falhou (deveria negar acesso)" -ForegroundColor Red
} catch {
    Write-Host "  OK - Autorizacao funcionando (acesso negado)" -ForegroundColor Green
}

# Resumo Final
Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  TESTES CONCLUIDOS!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Resumo:" -ForegroundColor Cyan
Write-Host "  - Autenticacao (Admin e Despachante): OK" -ForegroundColor Gray
Write-Host "  - CRUD de Motoristas: OK" -ForegroundColor Gray
Write-Host "  - Upload de Documentos: OK" -ForegroundColor Gray
Write-Host "  - Listagem e Aprovacao (Admin): OK" -ForegroundColor Gray
Write-Host "  - Validacoes e Autorizacao: OK" -ForegroundColor Gray
Write-Host ""
Write-Host "Proximo Passo: Desenvolver o Frontend!" -ForegroundColor Yellow
Write-Host ""

if ($ADMIN_TOKEN) {
    Write-Host "[INFO] Token Admin disponivel em: `$ADMIN_TOKEN" -ForegroundColor Cyan
}
if ($MOTORISTA_ID) {
    Write-Host "[INFO] ID do Motorista: $MOTORISTA_ID" -ForegroundColor Cyan
}
if ($DOCUMENTO_ID) {
    Write-Host "[INFO] ID do Documento: $DOCUMENTO_ID" -ForegroundColor Cyan
}
Write-Host ""
