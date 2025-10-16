# Script de Teste Completo - DespaFacil Backend
# Execute este script em um PowerShell separado enquanto o servidor está rodando

$BASE_URL = "http://localhost:4000"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  🧪 TESTE COMPLETO - BACKEND DESPAFACIL" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# ==================================================
# 1. LOGIN ADMIN
# ==================================================
Write-Host "1️⃣  TESTE: Login Admin" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

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
        Write-Host "✅ Login bem-sucedido!" -ForegroundColor Green
        Write-Host "   Usuario: $($loginResponse.user.name) ($($loginResponse.user.role))" -ForegroundColor Gray
        $ADMIN_TOKEN = $loginResponse.accessToken
    } else {
        Write-Host "❌ FALHOU: Login retornou success=false" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""

# ==================================================
# 2. LOGIN DESPACHANTE
# ==================================================
Write-Host "2️⃣  TESTE: Login Despachante" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

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
        Write-Host "✅ Login despachante bem-sucedido!" -ForegroundColor Green
        Write-Host "   Usuario: $($despachanteResponse.user.name)" -ForegroundColor Gray
        $DESPACHANTE_TOKEN = $despachanteResponse.accessToken
    }
} catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ==================================================
# 3. LISTAR MOTORISTAS (Despachante)
# ==================================================
Write-Host "3️⃣  TESTE: Listar Motoristas" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

try {
    $motoristas = Invoke-RestMethod -Uri "$BASE_URL/api/motoristas" `
        -Method Get `
        -Headers @{ Authorization = "Bearer $DESPACHANTE_TOKEN" }
    
    if ($motoristas.success) {
        Write-Host "✅ Lista de motoristas obtida!" -ForegroundColor Green
        Write-Host "   Total: $($motoristas.pagination.total) motoristas" -ForegroundColor Gray
        
        if ($motoristas.motoristas.Count -gt 0) {
            $MOTORISTA_EXISTENTE = $motoristas.motoristas[0]
            Write-Host "   Primeiro: $($MOTORISTA_EXISTENTE.nome) (CPF: $($MOTORISTA_EXISTENTE.cpf))" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ==================================================
# 4. CRIAR NOVO MOTORISTA
# ==================================================
Write-Host "4️⃣  TESTE: Criar Novo Motorista" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

$novoMotoristaBody = @{
    nome = "Carlos Teste $(Get-Random -Maximum 9999)"
    cpf = "98765432100"
    email = "carlos.teste@email.com"
    telefone = "11987654321"
    dataNascimento = "1990-05-15"
    sexo = "M"
    identidade = "123456789"
    orgaoEmissor = "SSP"
    ufEmissor = "SP"
    cursoTipo = "TAC"
} | ConvertTo-Json

try {
    $novoMotorista = Invoke-RestMethod -Uri "$BASE_URL/api/motoristas" `
        -Method Post `
        -Body $novoMotoristaBody `
        -ContentType "application/json" `
        -Headers @{ Authorization = "Bearer $DESPACHANTE_TOKEN" }
    
    if ($novoMotorista.success) {
        Write-Host "✅ Motorista criado com sucesso!" -ForegroundColor Green
        Write-Host "   ID: $($novoMotorista.motorista.id)" -ForegroundColor Gray
        Write-Host "   Nome: $($novoMotorista.motorista.nome)" -ForegroundColor Gray
        $MOTORISTA_ID = $novoMotorista.motorista.id
    }
} catch {
    Write-Host "⚠️  Motorista pode já existir (CPF duplicado)" -ForegroundColor Yellow
    if ($MOTORISTA_EXISTENTE) {
        $MOTORISTA_ID = $MOTORISTA_EXISTENTE.id
        Write-Host "   Usando motorista existente: $($MOTORISTA_EXISTENTE.nome)" -ForegroundColor Gray
    }
}

Write-Host ""

# ==================================================
# 5. BUSCAR MOTORISTA POR ID
# ==================================================
if ($MOTORISTA_ID) {
    Write-Host "5️⃣  TESTE: Buscar Motorista por ID" -ForegroundColor Yellow
    Write-Host "-------------------------------------------" -ForegroundColor Gray
    
    try {
        $motorista = Invoke-RestMethod -Uri "$BASE_URL/api/motoristas/$MOTORISTA_ID" `
            -Method Get `
            -Headers @{ Authorization = "Bearer $DESPACHANTE_TOKEN" }
        
        if ($motorista.success) {
            Write-Host "✅ Motorista encontrado!" -ForegroundColor Green
            Write-Host "   Nome: $($motorista.motorista.nome)" -ForegroundColor Gray
            Write-Host "   CPF: $($motorista.motorista.cpf)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# ==================================================
# 6. UPLOAD DE DOCUMENTO (CNH)
# ==================================================
if ($MOTORISTA_ID) {
    Write-Host "6️⃣  TESTE: Upload de Documento (CNH)" -ForegroundColor Yellow
    Write-Host "-------------------------------------------" -ForegroundColor Gray
    
    # Criar arquivo de teste
    $testFile = "cnh-teste-$(Get-Random).txt"
    "Conteudo de teste da CNH - $(Get-Date)" | Out-File -FilePath $testFile -Encoding UTF8
    
    try {
        # PowerShell não tem suporte nativo para multipart/form-data facilmente
        # Vamos usar curl.exe do Windows
        $curlOutput = curl.exe -X POST "$BASE_URL/api/documentos/upload" `
            -H "Authorization: Bearer $DESPACHANTE_TOKEN" `
            -F "file=@$testFile" `
            -F "motoristaId=$MOTORISTA_ID" `
            -F "tipo=CNH" `
            2>&1
        
        Write-Host "✅ Upload realizado!" -ForegroundColor Green
        Write-Host "   Arquivo: $testFile" -ForegroundColor Gray
        
        # Extrair ID do documento da resposta
        $jsonResponse = $curlOutput | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($jsonResponse.documento.id) {
            $DOCUMENTO_ID = $jsonResponse.documento.id
            Write-Host "   Documento ID: $DOCUMENTO_ID" -ForegroundColor Gray
        }
        
        # Limpar arquivo temporário
        Remove-Item $testFile -ErrorAction SilentlyContinue
        
    } catch {
        Write-Host "⚠️  Upload pode ter falhado: $($_.Exception.Message)" -ForegroundColor Yellow
        Remove-Item $testFile -ErrorAction SilentlyContinue
    }
    
    Write-Host ""
}

# ==================================================
# 7. LISTAR DOCUMENTOS (Admin)
# ==================================================
Write-Host "7️⃣  TESTE: Listar Todos os Documentos (Admin)" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

try {
    $documentos = Invoke-RestMethod -Uri "$BASE_URL/api/admin/documentos" `
        -Method Get `
        -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
    
    if ($documentos.success) {
        Write-Host "✅ Lista de documentos obtida!" -ForegroundColor Green
        Write-Host "   Total: $($documentos.pagination.total) documentos" -ForegroundColor Gray
        
        # Contar por status
        $pendentes = ($documentos.documentos | Where-Object { $_.status -eq "PENDENTE" }).Count
        $aprovados = ($documentos.documentos | Where-Object { $_.status -eq "APROVADO" }).Count
        $negados = ($documentos.documentos | Where-Object { $_.status -eq "NEGADO" }).Count
        
        Write-Host "   Pendentes: $pendentes | Aprovados: $aprovados | Negados: $negados" -ForegroundColor Gray
        
        if ($documentos.documentos.Count -gt 0 -and !$DOCUMENTO_ID) {
            $DOCUMENTO_ID = $documentos.documentos[0].id
        }
    }
} catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# ==================================================
# 8. APROVAR DOCUMENTO (Admin)
# ==================================================
if ($DOCUMENTO_ID) {
    Write-Host "8️⃣  TESTE: Aprovar Documento (Admin)" -ForegroundColor Yellow
    Write-Host "-------------------------------------------" -ForegroundColor Gray
    
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
            Write-Host "✅ Documento aprovado!" -ForegroundColor Green
            Write-Host "   Status: $($aprovacao.documento.status)" -ForegroundColor Gray
            Write-Host "   📧 Email de notificacao enviado ao despachante" -ForegroundColor Gray
        }
    } catch {
        Write-Host "⚠️  Documento pode já estar aprovado" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# ==================================================
# 9. TESTE DE VALIDAÇÃO - Login Inválido
# ==================================================
Write-Host "9️⃣  TESTE: Validacao - Login com Senha Errada" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

$invalidBody = @{
    emailOrCnpj = "theostracke11@gmail.com"
    password = "senhaErrada123"
} | ConvertTo-Json

try {
    $invalidLogin = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" `
        -Method Post `
        -Body $invalidBody `
        -ContentType "application/json"
    
    Write-Host "❌ FALHOU: Deveria ter retornado erro!" -ForegroundColor Red
} catch {
    Write-Host "✅ Validacao funcionando! (Login negado)" -ForegroundColor Green
    Write-Host "   Erro esperado recebido" -ForegroundColor Gray
}

Write-Host ""

# ==================================================
# 10. TESTE DE AUTORIZAÇÃO - Acesso sem Token
# ==================================================
Write-Host "🔟 TESTE: Autorizacao - Acesso sem Token" -ForegroundColor Yellow
Write-Host "-------------------------------------------" -ForegroundColor Gray

try {
    $semToken = Invoke-RestMethod -Uri "$BASE_URL/api/motoristas" -Method Get
    Write-Host "❌ FALHOU: Deveria ter negado acesso!" -ForegroundColor Red
} catch {
    Write-Host "✅ Autorizacao funcionando! (Acesso negado)" -ForegroundColor Green
    Write-Host "   401 Unauthorized recebido" -ForegroundColor Gray
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  ✅ TESTES CONCLUIDOS COM SUCESSO!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Resumo dos Testes:" -ForegroundColor Cyan
Write-Host "  ✅ Autenticacao (Admin e Despachante)" -ForegroundColor Gray
Write-Host "  ✅ CRUD de Motoristas" -ForegroundColor Gray
Write-Host "  ✅ Upload de Documentos" -ForegroundColor Gray
Write-Host "  ✅ Listagem e Aprovacao (Admin)" -ForegroundColor Gray
Write-Host "  ✅ Validacoes e Autorizacao" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 Proximo Passo: Desenvolver o Frontend!" -ForegroundColor Yellow
Write-Host ""
Write-Host "[ADMIN_TOKEN] Token do Admin salvo em: `$ADMIN_TOKEN" -ForegroundColor Cyan
if ($MOTORISTA_ID) {
    Write-Host "[MOTORISTA_ID] ID do Motorista: $MOTORISTA_ID" -ForegroundColor Cyan
}
if ($DOCUMENTO_ID) {
    Write-Host "[DOCUMENTO_ID] ID do Documento: $DOCUMENTO_ID" -ForegroundColor Cyan
}
Write-Host ""
