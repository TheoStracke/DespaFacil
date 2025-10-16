export function validateCPF(cpf: string): boolean {
  if (!cpf) return false;
  
  const clean = cpf.replace(/\D/g, '');
  
  if (clean.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(clean)) return false;
  
  // Validação dos dígitos verificadores
  const calcDigit = (base: number): number => {
    let sum = 0;
    for (let i = 0; i < base - 1; i++) {
      sum += parseInt(clean.charAt(i)) * (base - i);
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  
  const digit1 = calcDigit(10);
  const digit2 = calcDigit(11);
  
  return digit1 === parseInt(clean.charAt(9)) && digit2 === parseInt(clean.charAt(10));
}

export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) return false;
  
  const clean = cnpj.replace(/\D/g, '');
  
  if (clean.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(clean)) return false;
  
  // Validação dos dígitos verificadores
  const calcDigit = (base: number): number => {
    let sum = 0;
    let pos = base - 7;
    
    for (let i = base - 1; i >= 1; i--) {
      sum += parseInt(clean.charAt(base - 1 - i)) * pos;
      pos--;
      if (pos < 2) pos = 9;
    }
    
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  
  const digit1 = calcDigit(13);
  const digit2 = calcDigit(14);
  
  return digit1 === parseInt(clean.charAt(12)) && digit2 === parseInt(clean.charAt(13));
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}
