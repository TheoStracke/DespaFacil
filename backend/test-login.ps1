# Script de teste - Login Admin

Write-Host "🧪 Testando login do admin..." -ForegroundColor Cyan
Write-Host ""

$body = @{
    emailOrCnpj = "theostracke11@gmail.com"
    password = "SenhaForte123!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
        -Method Post `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "✅ LOGIN BEM-SUCEDIDO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Dados do usuário:" -ForegroundColor Yellow
    Write-Host "  Nome: $($response.user.name)"
    Write-Host "  Email: $($response.user.email)"
    Write-Host "  Role: $($response.user.role)"
    Write-Host ""
    Write-Host "🔑 Token (primeiros 50 caracteres):" -ForegroundColor Yellow
    Write-Host "  $($response.accessToken.Substring(0, [Math]::Min(50, $response.accessToken.Length)))..."
    Write-Host ""
    Write-Host "💾 Salve este token para usar nos próximos testes:" -ForegroundColor Cyan
    Write-Host "  `$TOKEN = '$($response.accessToken)'"
    
} catch {
    Write-Host "❌ ERRO NO LOGIN!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Detalhes do erro:" -ForegroundColor Yellow
    Write-Host $_.Exception.Message
    Write-Host ""
    if ($_.ErrorDetails.Message) {
        Write-Host "Resposta do servidor:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message
    }
}
