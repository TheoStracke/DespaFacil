# Teste rapido de upload apos correcao

$loginBody = '{"emailOrCnpj":"despachante@test.local","password":"SenhaForte123!"}'
$loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.accessToken

Write-Host "Login OK" -ForegroundColor Green

# Listar motoristas
$headers = @{ Authorization = "Bearer $token" }
$motoristas = Invoke-RestMethod -Uri "http://localhost:4000/api/motoristas" -Headers $headers
$motoristaId = $motoristas.motoristas[0].id

Write-Host "Motorista: $($motoristas.motoristas[0].nome)" -ForegroundColor Cyan

# Criar PDF
$pdfContent = "%PDF-1.4`nSimple PDF"
$testFile = "test-upload-final.pdf"
$pdfContent | Out-File -FilePath $testFile -Encoding ASCII -NoNewline

Write-Host "PDF criado" -ForegroundColor Green

# Upload
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
    "DOCUMENTO1",
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"teste.pdf`"",
    "Content-Type: application/pdf$LF",
    $fileEnc,
    "--$boundary--$LF"
) -join $LF

try {
    $response = Invoke-RestMethod `
        -Uri "http://localhost:4000/api/documentos/upload" `
        -Method Post `
        -Headers @{
            Authorization = "Bearer $token"
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        } `
        -Body $bodyLines
    
    Write-Host "`nSUCESSO!" -ForegroundColor Green
    Write-Host "Documento ID: $($response.documento.id)" -ForegroundColor Cyan
    Write-Host "Status: $($response.documento.status)" -ForegroundColor Yellow
} catch {
    Write-Host "`nERRO!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Remove-Item $testFile -ErrorAction SilentlyContinue
Write-Host "`nArquivo removido" -ForegroundColor Gray
