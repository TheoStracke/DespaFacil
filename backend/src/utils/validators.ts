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
  const calcDigit = (length: number) => {
    const numbers = clean.substring(0, length);
    const weights = length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = numbers
      .split('')
      .reduce((acc, num, idx) => acc + parseInt(num, 10) * weights[idx], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const digit1 = calcDigit(12);
  const digit2 = calcDigit(13);

  return (
    digit1 === parseInt(clean.charAt(12), 10) &&
    digit2 === parseInt(clean.charAt(13), 10)
  );
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}
