import { describe, it, expect } from 'vitest';
import { validateCPF, validateCNPJ } from '../src/utils/validators';

describe('Validators', () => {
  describe('validateCPF', () => {
    it('deve validar CPF correto', () => {
      expect(validateCPF('123.456.789-09')).toBe(true);
      expect(validateCPF('12345678909')).toBe(true);
    });

    it('deve rejeitar CPF inválido', () => {
      expect(validateCPF('000.000.000-00')).toBe(false);
      expect(validateCPF('111.111.111-11')).toBe(false);
      expect(validateCPF('123.456.789-00')).toBe(false);
      expect(validateCPF('123')).toBe(false);
      expect(validateCPF('')).toBe(false);
    });
  });

  describe('validateCNPJ', () => {
    it('deve validar CNPJ correto', () => {
      // Usa um CNPJ conhecido como válido para testes
      expect(validateCNPJ('11.444.777/0001-61')).toBe(true);
      expect(validateCNPJ('11444777000161')).toBe(true);
    });

    it('deve rejeitar CNPJ inválido', () => {
      expect(validateCNPJ('00.000.000/0001-00')).toBe(false);
      expect(validateCNPJ('11.111.111/1111-11')).toBe(false);
      expect(validateCNPJ('123')).toBe(false);
      expect(validateCNPJ('')).toBe(false);
    });
  });
});
