#!/bin/bash

# Script de teste rápido do backend DespaFacil
# Uso: ./test-backend.sh

BASE_URL="http://localhost:4000"

echo "🧪 Testando Backend DespaFacil..."
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "${YELLOW}1️⃣ Health Check...${NC}"
HEALTH=$(curl -s "$BASE_URL/")
if echo "$HEALTH" | grep -q "DespaFacil"; then
    echo -e "${GREEN}✅ Servidor rodando!${NC}"
else
    echo -e "${RED}❌ Servidor não está respondendo!${NC}"
    exit 1
fi
echo ""

# 2. Login Admin
echo -e "${YELLOW}2️⃣ Login como Admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrCnpj": "theostracke11@gmail.com",
    "password": "SenhaForte123!"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ Login bem-sucedido!${NC}"
    echo -e "${CYAN}Token: ${TOKEN:0:30}...${NC}"
else
    echo -e "${RED}❌ Erro no login!${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
fi
echo ""

# 3. Listar Motoristas
echo -e "${YELLOW}3️⃣ Listando motoristas...${NC}"
MOTORISTAS=$(curl -s -X GET "$BASE_URL/api/motoristas" \
  -H "Authorization: Bearer $TOKEN")

if echo "$MOTORISTAS" | grep -q "success"; then
    TOTAL=$(echo "$MOTORISTAS" | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✅ Total de motoristas: $TOTAL${NC}"
else
    echo -e "${RED}❌ Erro ao listar motoristas!${NC}"
fi
echo ""

# 4. Criar Motorista
echo -e "${YELLOW}4️⃣ Criando novo motorista de teste...${NC}"
NOVO_MOTORISTA=$(curl -s -X POST "$BASE_URL/api/motoristas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nome": "Teste Automatico",
    "cpf": "11122233344",
    "telefone": "11999887766",
    "cursoTipo": "TAC",
    "email": "teste@auto.com"
  }')

if echo "$NOVO_MOTORISTA" | grep -q "success"; then
    MOTORISTA_ID=$(echo "$NOVO_MOTORISTA" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✅ Motorista criado com sucesso!${NC}"
    echo -e "${CYAN}ID: $MOTORISTA_ID${NC}"
else
    echo -e "${YELLOW}⚠️ Motorista pode já existir (CPF duplicado)${NC}"
fi
echo ""

# 5. Upload de Documento (criar arquivo de teste)
echo -e "${YELLOW}5️⃣ Upload de documento de teste...${NC}"
echo "Documento de teste - CNH" > /tmp/cnh-teste.txt

if [ -n "$MOTORISTA_ID" ]; then
    UPLOAD=$(curl -s -X POST "$BASE_URL/api/documentos/upload" \
      -H "Authorization: Bearer $TOKEN" \
      -F "file=@/tmp/cnh-teste.txt" \
      -F "motoristaId=$MOTORISTA_ID" \
      -F "tipo=CNH")
    
    if echo "$UPLOAD" | grep -q "success"; then
        DOCUMENTO_ID=$(echo "$UPLOAD" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        echo -e "${GREEN}✅ Documento enviado com sucesso!${NC}"
        echo -e "${CYAN}Documento ID: $DOCUMENTO_ID${NC}"
    else
        echo -e "${RED}❌ Erro no upload!${NC}"
        echo "$UPLOAD"
    fi
else
    echo -e "${YELLOW}⚠️ Pulando upload (sem motorista criado)${NC}"
fi
echo ""

# 6. Listar Documentos Admin
echo -e "${YELLOW}6️⃣ Listando documentos (admin)...${NC}"
DOCS=$(curl -s -X GET "$BASE_URL/api/admin/documentos" \
  -H "Authorization: Bearer $TOKEN")

if echo "$DOCS" | grep -q "success"; then
    TOTAL_DOCS=$(echo "$DOCS" | grep -o '"total":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✅ Total de documentos: $TOTAL_DOCS${NC}"
else
    echo -e "${RED}❌ Erro ao listar documentos!${NC}"
fi
echo ""

# Resumo
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Testes básicos concluídos!${NC}"
echo ""
echo -e "${CYAN}📋 Variáveis salvas:${NC}"
echo -e "TOKEN: ${TOKEN:0:40}..."
if [ -n "$MOTORISTA_ID" ]; then
    echo -e "MOTORISTA_ID: $MOTORISTA_ID"
fi
if [ -n "$DOCUMENTO_ID" ]; then
    echo -e "DOCUMENTO_ID: $DOCUMENTO_ID"
fi
echo ""
echo -e "${YELLOW}💡 Para usar o token em outros comandos:${NC}"
echo -e "export TOKEN=\"$TOKEN\""
echo ""
