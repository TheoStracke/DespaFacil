import request from 'supertest';
import app from '../../src/app';
import jwt from 'jsonwebtoken';
import { describe, it, expect } from 'vitest';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function token(role: 'DESPACHANTE' | 'ADMIN') {
  return jwt.sign({ sub: 'test-user', role }, JWT_SECRET, { expiresIn: '1h' });
}

function expectNot500(status: number) {
  expect([200, 201, 204, 400, 401, 403, 404, 422]).toContain(status);
}

describe('Smoke - Todos os endpoints principais', () => {
  it('GET / health', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  describe('Auth', () => {
    it('POST /api/auth/login (payload vazio) -> 400', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
    });
    it('POST /api/auth/register (payload vazio) -> 400', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.status).toBe(400);
    });
    it('POST /api/auth/forgot-password (sem captcha) -> 400', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({ email: 'a@a.com' });
      expect(res.status).toBe(400);
    });
    it('POST /api/auth/reset-password (token inválido) -> 400', async () => {
      const res = await request(app).post('/api/auth/reset-password').send({ token: 'x', newPassword: '12345678' });
      expect([400, 401]).toContain(res.status);
    });
    it('POST /api/auth/mark-tour-visto (sem token) -> 401', async () => {
      const res = await request(app).post('/api/auth/mark-tour-visto');
      expect(res.status).toBe(401);
    });
    it('GET /api/auth/tour-status (sem token) -> 401', async () => {
      const res = await request(app).get('/api/auth/tour-status');
      expect(res.status).toBe(401);
    });
  });

  describe('Motoristas', () => {
    it('GET /api/motoristas (sem token) -> 401', async () => {
      const res = await request(app).get('/api/motoristas');
      expect(res.status).toBe(401);
    });
    it('GET /api/motoristas (com token DESPACHANTE) -> not 500', async () => {
      const res = await request(app).get('/api/motoristas').set('Authorization', `Bearer ${token('DESPACHANTE')}`);
      expectNot500(res.status);
    });
  });

  describe('Documentos', () => {
    it('POST /api/documentos/upload (sem token) -> 401', async () => {
      const res = await request(app)
        .post('/api/documentos/upload')
        .attach('file', Buffer.from('PDFDATA'), 'file.pdf');
      expect(res.status).toBe(401);
    });
    it('PUT /api/documentos/:id/status (ADMIN) -> not 500', async () => {
      const res = await request(app)
        .put('/api/documentos/any-id/status')
        .set('Authorization', `Bearer ${token('ADMIN')}`)
        .send({ status: 'APROVADO' });
      expectNot500(res.status);
    });
  });

  describe('Certificados', () => {
    it('GET /api/certificados (sem token) -> 401', async () => {
      const res = await request(app).get('/api/certificados');
      expect(res.status).toBe(401);
    });
    it('GET /api/certificados (DESPACHANTE) -> not 500', async () => {
      const res = await request(app).get('/api/certificados').set('Authorization', `Bearer ${token('DESPACHANTE')}`);
      expectNot500(res.status);
    });
  });

  describe('Admin', () => {
    it('GET /api/admin/documentos (ADMIN) -> not 500', async () => {
      const res = await request(app)
        .get('/api/admin/documentos')
        .set('Authorization', `Bearer ${token('ADMIN')}`);
      expectNot500(res.status);
    });
    it('GET /api/admin/export (ADMIN) -> not 500', async () => {
      const res = await request(app)
        .get('/api/admin/export')
        .set('Authorization', `Bearer ${token('ADMIN')}`);
      expectNot500(res.status);
    });
    it('POST /api/admin/certificados/send (ADMIN, sem arquivo) -> 400/422', async () => {
      const res = await request(app)
        .post('/api/admin/certificados/send')
        .set('Authorization', `Bearer ${token('ADMIN')}`)
        .field('motoristaSearch', 'foo');
      expect([400, 422]).toContain(res.status);
    });
  });
});
