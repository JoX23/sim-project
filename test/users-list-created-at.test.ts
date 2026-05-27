import request from 'supertest';
import { app } from '../src/server';

const AUTH = { Authorization: 'Bearer sim-token-ada@example.com' };

// Covers untested region from plan 01ksxspk4r2x5v7n3qz8tm6yz1k evidence:
// "no hay test que llame listUsers y verifique el campo createdAt en los objetos"
describe('GET /users — createdAt field', () => {
  it('each user in list has a valid ISO createdAt', async () => {
    const res = await request(app).get('/users').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThan(0);
    for (const user of res.body.users) {
      expect(user.createdAt).toBeDefined();
      expect(() => new Date(user.createdAt).toISOString()).not.toThrow();
    }
  });
});
