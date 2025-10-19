import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../src/prisma/client';
import bcrypt from 'bcryptjs';

let despId: string;

describe.skipIf(process.env.TEST_DB !== '1')('DB - Integridade e Concorrência', () => {
  beforeAll(async () => {
    const password = await bcrypt.hash('SenhaForte123!', 10);
    const user = await prisma.user.create({
      data: { name: 'Teste', email: `desp-${Date.now()}@test.local`, password, role: 'DESPACHANTE' },
    });
    const desp = await prisma.despachante.create({ data: { userId: user.id, nome: 'Desp T', cnpj: null } });
    despId = desp.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('não deve permitir duplicar CPF com concorrência', async () => {
    const cpf = '98765432100';
    const createOne = () =>
      prisma.motorista.create({
        data: { despachanteId: despId, nome: 'A', cpf, cursoTipo: 'TAC' },
      });
    const createTwo = () =>
      prisma.motorista.create({
        data: { despachanteId: despId, nome: 'B', cpf, cursoTipo: 'TAC' },
      });

    const results = await Promise.allSettled([createOne(), createTwo()]);
    const rejected = results.filter((r) => r.status === 'rejected');
    expect(rejected.length).toBeGreaterThanOrEqual(1);
  });

  it('transação deve fazer rollback em erro', async () => {
    const initial = await prisma.motorista.count();
    try {
      await prisma.$transaction([
        prisma.motorista.create({ data: { despachanteId: despId, nome: 'C', cpf: '00000000001', cursoTipo: 'TAC' } }),
        prisma.motorista.create({ data: { despachanteId: despId, nome: 'D', cpf: '00000000001', cursoTipo: 'TAC' } }), // duplica CPF
      ]);
    } catch (e) {
      // expected
    }
    const after = await prisma.motorista.count();
    expect(after).toBe(initial); // rollback
  });
});
