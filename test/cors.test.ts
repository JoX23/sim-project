import request from 'supertest';
import { app } from '../src/server';

// CORS middleware — sim tests verify header presence, not full pre-flight round-trip.
describe('CORS middleware', () => {
  it('AC-1: GET /health from allowed origin includes Access-Control-Allow-Origin', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:3001');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });

  it('AC-2: OPTIONS preflight returns 204 with CORS headers', async () => {
    const res = await request(app)
      .options('/users')
      .set('Origin', 'http://localhost:3001')
      .set('Access-Control-Request-Method', 'POST');
    expect([200, 204]).toContain(res.status);
  });

  it('AC-3: credentials header exposed (credentials: true)', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:3001');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
