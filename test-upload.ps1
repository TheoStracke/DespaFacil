# TESTE DE UPLOAD DE DOCUMENTOS

Write-Host "`n=== TESTE DE UPLOAD - DespaFacil ===" -ForegroundColor Cyan

# PASSO 1: Login
Write-Host "`n[1/5] Fazendo login..." -ForegroundColor Yellow

$loginBody = '{"emailOrCnpj":"despachante@test.local","password":"SenhaForte123!"}'

$loginResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.accessToken

Write-Host "Token obtido: $($token.Substring(0,20))..." -ForegroundColor Green

# PASSO 2: Listar motoristas
Write-Host "`n[2/5] Listando motoristas..." -ForegroundColor Yellow

$headers = @{
    Authorization = "Bearer $token"
}

$motoristasResponse = Invoke-RestMethod -Uri "http://localhost:4000/api/motoristas" -Headers $headers
$motoristas = $motoristasResponse.motoristas

if ($motoristas.Count -eq 0) {
    Write-Host "ERRO: Nenhum motorista encontrado!" -ForegroundColor Red
    exit 1
}

$motoristaId = $motoristas[0].id
$motoristaNome = $motoristas[0].nome

Write-Host "Motorista encontrado: $motoristaNome (ID: $motoristaId)" -ForegroundColor Green

# PASSO 3: Criar arquivo de teste (PDF simples)
Write-Host "`n[3/5] Criando arquivo PDF de teste..." -ForegroundColor Yellow

$testFile = "test-cnh.pdf"

# Criar um PDF simples (conteúdo mínimo válido)
$pdfHeader = "%PDF-1.4`n"
$pdfContent = @"
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 55 >>
stream
BT
/F1 24 Tf
50 750 Td
(Documento CNH - Teste) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
422
%%EOF
"@

($pdfHeader + $pdfContent) | Out-File -FilePath $testFile -Encoding ASCII -NoNewline

Write-Host "Arquivo PDF criado: $testFile" -ForegroundColor Green

# PASSO 4: Upload usando WebClient
Write-Host "`n[4/5] Enviando documento (CNH)..." -ForegroundColor Yellow

$uploadUrl = "http://localhost:4000/api/documentos/upload"

# Usar Add-Type para multipart/form-data
Add-Type -AssemblyName System.Net.Http

$httpClient = New-Object System.Net.Http.HttpClient
$httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer $token")

$multipart = New-Object System.Net.Http.MultipartFormDataContent

# Adicionar campo 'motoristaId'
$motoristaIdContent = New-Object System.Net.Http.StringContent($motoristaId)
$multipart.Add($motoristaIdContent, "motoristaId")

# Adicionar campo 'tipo'
$tipoContent = New-Object System.Net.Http.StringContent("CNH")
$multipart.Add($tipoContent, "tipo")

# Adicionar arquivo (campo deve ser 'file')
$fileStream = [System.IO.File]::OpenRead((Resolve-Path $testFile))
$fileContent = New-Object System.Net.Http.StreamContent($fileStream)
$fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("application/pdf")
$multipart.Add($fileContent, "file", "cnh-teste.pdf")

try {
    $response = $httpClient.PostAsync($uploadUrl, $multipart).Result
    $responseContent = $response.Content.ReadAsStringAsync().Result
    
    if ($response.IsSuccessStatusCode) {
        Write-Host "Upload realizado com sucesso!" -ForegroundColor Green
        Write-Host "Resposta: $responseContent" -ForegroundColor Gray
    } else {
        Write-Host "Erro no upload: $($response.StatusCode)" -ForegroundColor Red
        Write-Host "Resposta: $responseContent" -ForegroundColor Red
    }
} finally {
    $fileStream.Close()
    $httpClient.Dispose()
}

# PASSO 5: Limpeza
Write-Host "`n[5/5] Limpando arquivos..." -ForegroundColor Yellow

Remove-Item $testFile -ErrorAction SilentlyContinue
Write-Host "Arquivo removido" -ForegroundColor Green

Write-Host "`n=== TESTE CONCLUIDO ===" -ForegroundColor Cyan
