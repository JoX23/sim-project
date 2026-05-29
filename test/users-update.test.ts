import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/server';

const SECRET = 'dev-only-not-for-prod';
const AUTH = { Authorization: `Bearer ${jwt.sign({ sub: 'ada', email: 'ada@example.com' }, SECRET)}` };
const AUTH_BOB = { Authorization: `Bearer ${jwt.sign({ sub: 'bob', email: 'bob@example.com' }, SECRET)}` };

describe('PATCH /users/:email', () => {
  it('AC-1: owner updates name → 200 with updated user', async () => {
    // seed bob first
    await request(app).post('/users').set(AUTH_BOB)
      .send({ email: 'bob@example.com', name: 'Bob' });
    const res = await request(app)
      .patch('/users/bob@example.com')
      .set(AUTH_BOB)
      .send({ name: 'Robert' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Robert');
    expect(res.body.email).toBe('bob@example.com');
    expect(res.body.createdAt).toBeDefined();
    expect(res.body.updatedAt).toBeDefined();
  });

  it('AC-2: non-owner JWT → 403', async () => {
    const res = await request(app)
      .patch('/users/ada@example.com')
      .set(AUTH_BOB)
      .send({ name: 'Hacker' });
    expect(res.status).toBe(403);
  });

  it('AC-3: email not found → 404', async () => {
    const res = await request(app)
      .patch('/users/ghost@example.com')
      .set({ Authorization: `Bearer ${jwt.sign({ sub: 'ghost', email: 'ghost@example.com' }, SECRET)}` })
      .send({ name: 'Ghost' });
    expect(res.status).toBe(404);
  });

  it('AC-4: invalid email format → 400', async () => {
    const res = await request(app)
      .patch('/users/not-an-email')
      .set(AUTH)
      .send({ name: 'X' });
    expect(res.status).toBe(400);
  });
});
