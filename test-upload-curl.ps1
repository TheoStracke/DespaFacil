# TESTE UPLOAD COM CURL - Windows PowerShell

# Nota: Este script usa Invoke-WebRequest que funciona similar ao curl

Write-Host "`n=== TESTE UPLOAD - CURL Style ===" -ForegroundColor Cyan

# 1. LOGIN
Write-Host "`n[1] Login..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"emailOrCnpj":"despachante@test.local","password":"SenhaForte123!"}'

$token = $loginResponse.accessToken
Write-Host "Token: $($token.Substring(0,30))..." -ForegroundColor Green

# 2. LISTAR MOTORISTAS
Write-Host "`n[2] Listar motoristas..." -ForegroundColor Yellow
$headers = @{ Authorization = "Bearer $token" }
$motoristas = Invoke-RestMethod -Uri "http://localhost:4000/api/motoristas" -Headers $headers

$motoristaId = $motoristas.motoristas[0].id
$motoristaNome = $motoristas.motoristas[0].nome
Write-Host "Motorista: $motoristaNome" -ForegroundColor Green
Write-Host "ID: $motoristaId" -ForegroundColor Gray

# 3. CRIAR PDF DE TESTE
Write-Host "`n[3] Criando PDF..." -ForegroundColor Yellow
$pdfContent = "%PDF-1.4`n1 0 obj`n<< /Type /Catalog /Pages 2 0 R >>`nendobj`nxref`n0 1`ntrailer`n<< /Root 1 0 R >>`nstartxref`n9`n%%EOF"
$testFile = "test-doc.pdf"
$pdfContent | Out-File -FilePath $testFile -Encoding ASCII -NoNewline
Write-Host "PDF criado: $testFile" -ForegroundColor Green

# 4. UPLOAD
Write-Host "`n[4] Upload CNH..." -ForegroundColor Yellow

$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$fileBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $testFile))
$fileEnc = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileBytes)

$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"motoristaId`"$LF",
    $motoristaId,
    "--$boundary",
    "Content-Disposition: form-data; name=`"tipo`"$LF",
    "CNH",
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"cnh.pdf`"",
    "Content-Type: application/pdf$LF",
    $fileEnc,
    "--$boundary--$LF"
) -join $LF

try {
    $uploadResponse = Invoke-RestMethod `
        -Uri "http://localhost:4000/api/documentos/upload" `
        -Method Post `
        -Headers @{
            Authorization = "Bearer $token"
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        } `
        -Body $bodyLines
    
    Write-Host "✅ Upload realizado!" -ForegroundColor Green
    Write-Host "Documento ID: $($uploadResponse.documento.id)" -ForegroundColor Gray
    Write-Host "Status: $($uploadResponse.documento.status)" -ForegroundColor Gray
} catch {
    $errorDetails = $_.Exception.Response
    if ($errorDetails) {
        $reader = New-Object System.IO.StreamReader($errorDetails.GetResponseStream())
        $responseText = $reader.ReadToEnd()
        Write-Host "Resposta: $responseText" -ForegroundColor Yellow
    }
    Write-Host "Nota: Se o erro for de email, o upload funcionou!" -ForegroundColor Cyan
}

# 5. LIMPAR
Write-Host "`n[5] Limpando..." -ForegroundColor Yellow
Remove-Item $testFile -ErrorAction SilentlyContinue
Write-Host "Arquivo removido" -ForegroundColor Green

Write-Host "`n=== COMANDOS CURL EQUIVALENTES ===" -ForegroundColor Cyan
Write-Host "`nSe você tiver curl instalado, pode usar:" -ForegroundColor Yellow
Write-Host @"

# 1. Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{\"emailOrCnpj\":\"despachante@test.local\",\"password\":\"SenhaForte123!\"}'

# 2. Upload (substitua TOKEN e MOTORISTA_ID)
curl -X POST http://localhost:4000/api/documentos/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "motoristaId=MOTORISTA_ID" \
  -F "tipo=CNH" \
  -F "file=@documento.pdf"

"@ -ForegroundColor Gray
