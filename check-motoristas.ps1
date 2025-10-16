# Verificar se motorista pertence ao despachante logado

$loginBody = '{"emailOrCnpj":"despachante@test.local","password":"SenhaForte123!"}'
$loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.accessToken

Write-Host "Token obtido" -ForegroundColor Green

# Listar motoristas
$headers = @{ Authorization = "Bearer $token" }
$motoristas = Invoke-RestMethod -Uri "http://localhost:4000/api/motoristas" -Headers $headers

Write-Host "`nMotoristas do despachante logado:" -ForegroundColor Cyan
foreach ($m in $motoristas.motoristas) {
    Write-Host "  - $($m.nome) (ID: $($m.id))" -ForegroundColor White
}

Write-Host "`nTotal: $($motoristas.motoristas.Count)" -ForegroundColor Green
