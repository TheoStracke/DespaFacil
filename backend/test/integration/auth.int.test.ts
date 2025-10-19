import request from 'supertest';
import app from '../../src/app';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

describe('Auth API', () => {
  it('login deve falhar com payload vazio', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('register deve validar campos obrigatórios', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('JWT inválido deve ser rejeitado em rota protegida', async () => {
    const res = await request(app)
      .get('/api/auth/tour-status')
      .set('Authorization', 'Bearer invalid.token.here');
    expect([401, 400]).toContain(res.status);
  });

  it('JWT expirado deve ser rejeitado', async () => {
    const token = jwt.sign({ sub: 'user-id', role: 'DESPACHANTE' }, JWT_SECRET, { expiresIn: -1 });
    const res = await request(app)
      .get('/api/auth/tour-status')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });
});
