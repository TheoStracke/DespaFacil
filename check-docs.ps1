# Verificar documentos no banco

Write-Host "=== VERIFICACAO DE DOCUMENTOS ===" -ForegroundColor Cyan

# Login admin
$loginBody = '{"emailOrCnpj":"theostracke11@gmail.com","password":"SenhaForte123!"}'
$loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.accessToken

Write-Host "Login ADMIN realizado" -ForegroundColor Green

# Listar documentos
$headers = @{ Authorization = "Bearer $token" }
$documentos = Invoke-RestMethod -Uri "http://localhost:4000/api/admin/documentos" -Headers $headers

Write-Host "`nTotal de documentos: $($documentos.documentos.Count)" -ForegroundColor Cyan

if ($documentos.documentos.Count -gt 0) {
    Write-Host "`nDOCUMENTOS ENCONTRADOS:" -ForegroundColor Green
    
    foreach ($doc in $documentos.documentos) {
        Write-Host "`n---" -ForegroundColor Gray
        Write-Host "ID: $($doc.id)"
        Write-Host "Tipo: $($doc.tipo)"
        Write-Host "Status: $($doc.status)"
        Write-Host "Motorista: $($doc.motorista.nome)"
        Write-Host "Arquivo: $($doc.nomeArquivo)"
    }
    
    $pendentes = ($documentos.documentos | Where-Object { $_.status -eq "PENDENTE" }).Count
    $aprovados = ($documentos.documentos | Where-Object { $_.status -eq "APROVADO" }).Count
    
    Write-Host "`nESTATISTICAS:" -ForegroundColor Cyan
    Write-Host "Pendentes: $pendentes" -ForegroundColor Yellow
    Write-Host "Aprovados: $aprovados" -ForegroundColor Green
} else {
    Write-Host "`nNenhum documento encontrado!" -ForegroundColor Yellow
}

Write-Host "`nConcluido!" -ForegroundColor Green
