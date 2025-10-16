# 📊 VERIFICAR DOCUMENTOS NO BANCO

Write-Host "`n=== VERIFICAÇÃO DE DOCUMENTOS ===" -ForegroundColor Cyan

# Login
$loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"emailOrCnpj":"theostracke11@gmail.com","password":"SenhaForte123!"}'

$token = $loginResponse.accessToken
Write-Host "✅ Login ADMIN realizado" -ForegroundColor Green

# Listar todos os documentos (endpoint admin)
Write-Host "`n📋 Listando todos os documentos..." -ForegroundColor Yellow

$headers = @{ Authorization = "Bearer $token" }
$documentos = Invoke-RestMethod -Uri "http://localhost:4000/api/admin/documentos" -Headers $headers

Write-Host "`n📊 Total de documentos: $($documentos.documentos.Count)" -ForegroundColor Cyan

if ($documentos.documentos.Count -gt 0) {
    Write-Host "`n📄 DOCUMENTOS ENCONTRADOS:" -ForegroundColor Green
    
    foreach ($doc in $documentos.documentos) {
        Write-Host "`n-----------------------------------" -ForegroundColor Gray
        Write-Host "ID: $($doc.id)" -ForegroundColor White
        Write-Host "Tipo: $($doc.tipo)" -ForegroundColor Cyan
        Write-Host "Status: $($doc.status)" -ForegroundColor $(if ($doc.status -eq "PENDENTE") { "Yellow" } else { "Green" })
        Write-Host "Motorista: $($doc.motorista.nome)" -ForegroundColor White
        Write-Host "CPF: $($doc.motorista.cpf)" -ForegroundColor Gray
        Write-Host "Arquivo: $($doc.nomeArquivo)" -ForegroundColor Gray
        Write-Host "Data: $($doc.createdAt)" -ForegroundColor Gray
    }
    
    Write-Host "`n-----------------------------------" -ForegroundColor Gray
    
    # Estatísticas
    $pendentes = ($documentos.documentos | Where-Object { $_.status -eq "PENDENTE" }).Count
    $aprovados = ($documentos.documentos | Where-Object { $_.status -eq "APROVADO" }).Count
    $rejeitados = ($documentos.documentos | Where-Object { $_.status -eq "REJEITADO" }).Count
    
    Write-Host "`n📊 ESTATÍSTICAS:" -ForegroundColor Cyan
    Write-Host "⏳ Pendentes: $pendentes" -ForegroundColor Yellow
    Write-Host "✅ Aprovados: $aprovados" -ForegroundColor Green
    Write-Host "❌ Rejeitados: $rejeitados" -ForegroundColor Red
    
} else {
    Write-Host "`n⚠️ Nenhum documento encontrado no banco!" -ForegroundColor Yellow
}

Write-Host "`nVerificacao concluida!" -ForegroundColor Green
