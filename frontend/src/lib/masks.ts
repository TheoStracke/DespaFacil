/**
 * Máscara para CPF
 * Formata: 123.456.789-00
 */
export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, '') // Remove tudo que não é dígito
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os 3 primeiros dígitos
    .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os 6 primeiros dígitos
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2') // Coloca hífen após os 9 primeiros dígitos
    .substring(0, 14) // Limita em 14 caracteres (xxx.xxx.xxx-xx)
}

/**
 * Remove máscara do CPF
 * Retorna apenas números
 */
export function unmaskCPF(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Valida CPF (algoritmo oficial)
 */
export function validateCPF(cpf: string): boolean {
  cpf = unmaskCPF(cpf)

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false

  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpf)) return false

  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let firstDigit = 11 - (sum % 11)
  if (firstDigit >= 10) firstDigit = 0
  if (firstDigit !== parseInt(cpf.charAt(9))) return false

  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  let secondDigit = 11 - (sum % 11)
  if (secondDigit >= 10) secondDigit = 0
  if (secondDigit !== parseInt(cpf.charAt(10))) return false

  return true
}

/**
 * Máscara para CNPJ
 * Formata: 12.345.678/0001-00
 */
export function maskCNPJ(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18)
}

/**
 * Remove máscara do CNPJ
 */
export function unmaskCNPJ(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Valida CNPJ (algoritmo oficial)
 */
export function validateCNPJ(cnpj: string): boolean {
  cnpj = unmaskCNPJ(cnpj)

  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  // Validação do primeiro dígito verificador
  let size = cnpj.length - 2
  let numbers = cnpj.substring(0, size)
  let digits = cnpj.substring(size)
  let sum = 0
  let pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false

  // Validação do segundo dígito verificador
  size = size + 1
  numbers = cnpj.substring(0, size)
  sum = 0
  pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false

  return true
}

/**
 * Detecta automaticamente se é CPF ou CNPJ e aplica a máscara
 */
export function maskCPFOrCNPJ(value: string): string {
  const clean = value.replace(/\D/g, '')
  
  if (clean.length <= 11) {
    return maskCPF(value)
  } else {
    return maskCNPJ(value)
  }
}

/**
 * Valida CPF ou CNPJ automaticamente
 */
export function validateCPFOrCNPJ(value: string): boolean {
  const clean = value.replace(/\D/g, '')
  
  if (clean.length === 11) {
    return validateCPF(value)
  } else if (clean.length === 14) {
    return validateCNPJ(value)
  }
  
  return false
}
