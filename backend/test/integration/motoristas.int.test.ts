import request from 'supertest';
import app from '../../src/app';
import jwt from 'jsonwebtoken';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/services/motoristaService', () => ({
  listMotoristas: vi.fn(async () => ({
    motoristas: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  })),
}));

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

describe('Motoristas API', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/motoristas requer auth (401 sem token)', async () => {
    const res = await request(app).get('/api/motoristas');
    expect(res.status).toBe(401);
  });

  it('GET /api/motoristas retorna lista (mock) com JWT válido', async () => {
    const token = jwt.sign({ sub: 'user-id', role: 'DESPACHANTE' }, JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app)
      .get('/api/motoristas')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.motoristas)).toBe(true);
  });
});
