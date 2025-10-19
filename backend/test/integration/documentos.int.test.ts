import request from 'supertest';
import app from '../../src/app';
import { describe, it, expect } from 'vitest';

describe('Documentos API', () => {
  it('POST /api/documentos/upload sem auth -> 401', async () => {
    const res = await request(app)
      .post('/api/documentos/upload')
      .attach('file', Buffer.from('data'), 'file.pdf');
    expect(res.status).toBe(401);
  });
});
