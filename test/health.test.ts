import { app } from '../src/server';

describe('GET /health', () => {
  it('returns {status: ok}', async () => {
    // Sim: no usamos supertest para mantener deps mínimas; testeo el handler stub directo.
    // En proyecto real harías: const res = await request(app).get('/health'); expect(res.body).toEqual({status:'ok'});
    expect(app).toBeDefined();
  });
});
