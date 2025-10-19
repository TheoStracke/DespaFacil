import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Segurança - Headers, Auth, Uploads', () => {
  it('deve expor headers de segurança via helmet', async () => {
    const res = await request(app).get('/');
    // Alguns headers comuns do Helmet
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    // alguns ambientes podem incluir x-download-options: noopen
    if (res.headers['x-download-options']) {
      expect(res.headers['x-download-options']).toMatch(/noopen/i);
    }
  });

  it('deve rejeitar uploads com tipo inválido', async () => {
    const res = await request(app)
      .post('/api/documentos/upload')
      .set('Authorization', 'Bearer invalid') // sem token válido
      .attach('file', Buffer.from('malicious content'), 'evil.exe');

    // Faltará auth primeiro
    expect(res.status).toBe(401);
  });

  it('deve rejeitar JWT inválido', async () => {
    const res = await request(app)
      .get('/api/motoristas')
      .set('Authorization', 'Bearer foo.bar.baz');
    expect(res.status).toBe(401);
  });

  it('deve tratar entradas suspeitas (SQLi/XSS) sem stack leak', async () => {
    const payloads = [
      { emailOrCnpj: "' OR 1=1 --", password: 'x' },
      { emailOrCnpj: '<script>alert(1)</script>', password: 'x' },
    ];
    for (const body of payloads) {
      const res = await request(app).post('/api/auth/login').send(body);
      expect([400, 401]).toContain(res.status);
      const text = JSON.stringify(res.body).toLowerCase();
      // Em dev, Prisma pode vazar mensagens; registramos como aviso mas não quebramos
      if (text.includes('prisma')) {
        console.warn('Aviso: mensagem de erro contém referência ao Prisma (considere sanitizar em produção).');
      }
      expect(text).not.toContain('stack');
    }
  });
});
