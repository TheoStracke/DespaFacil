// 🧪 TESTE DE MÁSCARAS - Cole no Console do Navegador (F12)

// Teste 1: Máscara de CPF
console.log('=== TESTE 1: Máscara de CPF ===')
const cpfTeste = '12345678900'
const cpfMascarado = cpfTeste.replace(/\D/g, '')
  .replace(/(\d{3})(\d)/, '$1.$2')
  .replace(/(\d{3})(\d)/, '$1.$2')
  .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  .substring(0, 14)
console.log('CPF sem máscara:', cpfTeste)
console.log('CPF com máscara:', cpfMascarado)

// Teste 2: Remover máscara do CPF
console.log('\n=== TESTE 2: Remover Máscara ===')
const cpfComMascara = '123.456.789-00'
const cpfSemMascara = cpfComMascara.replace(/\D/g, '')
console.log('CPF com máscara:', cpfComMascara)
console.log('CPF sem máscara:', cpfSemMascara)
console.log('Tem 11 dígitos?', cpfSemMascara.length === 11)

// Teste 3: Validar CPF
console.log('\n=== TESTE 3: Validar CPF ===')

function validateCPFTest(cpf) {
  cpf = cpf.replace(/\D/g, '')
  
  if (cpf.length !== 11) {
    console.log('❌ CPF inválido: não tem 11 dígitos')
    return false
  }
  
  if (/^(\d)\1{10}$/.test(cpf)) {
    console.log('❌ CPF inválido: todos os dígitos são iguais')
    return false
  }
  
  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let firstDigit = 11 - (sum % 11)
  if (firstDigit >= 10) firstDigit = 0
  if (firstDigit !== parseInt(cpf.charAt(9))) {
    console.log('❌ CPF inválido: primeiro dígito verificador incorreto')
    return false
  }
  
  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  let secondDigit = 11 - (sum % 11)
  if (secondDigit >= 10) secondDigit = 0
  if (secondDigit !== parseInt(cpf.charAt(10))) {
    console.log('❌ CPF inválido: segundo dígito verificador incorreto')
    return false
  }
  
  console.log('✅ CPF válido!')
  return true
}

// CPFs para teste
const cpfsParaTeste = [
  '12345678900',       // Inválido
  '000.000.000-00',    // Inválido (todos zeros)
  '111.111.111-11',    // Inválido (todos iguais)
  '123.456.789-09',    // Válido (exemplo)
]

cpfsParaTeste.forEach(cpf => {
  console.log(`\nTestando: ${cpf}`)
  validateCPFTest(cpf)
})

// Teste 4: Gerar CPF válido para teste
console.log('\n=== TESTE 4: CPF Válido para Teste ===')
console.log('Use este CPF para testar (válido):')
console.log('CPF: 123.456.789-09')
console.log('Ou')
console.log('CPF: 111.444.777-35')

// Teste 5: Dados completos de teste
console.log('\n=== TESTE 5: Payload Completo ===')
const payloadTeste = {
  nome: "João da Silva Teste",
  cpf: "12345678909",
  email: "joao.teste@email.com",
  dataNascimento: "1990-01-15",
  sexo: "M",
  identidade: "123456789",
  orgaoEmissor: "SSP",
  ufEmissor: "SP",
  telefone: "(11) 98765-4321",
  cursoTipo: "TAC"
}
console.log('Dados de teste completos:')
console.log(JSON.stringify(payloadTeste, null, 2))
