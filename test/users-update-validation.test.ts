import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/server';

const SECRET = 'dev-only-not-for-prod';
const AUTH_ADA = { Authorization: `Bearer ${jwt.sign({ sub: 'ada', email: 'ada@example.com' }, SECRET)}` };

describe('PATCH /users/:email — name validation', () => {
  it('name with only spaces → 400', async () => {
    const res = await request(app)
      .patch('/users/ada@example.com')
      .set(AUTH_ADA)
      .send({ name: '   ' });
    expect(res.status).toBe(400);
  });

  it('name empty string → 400', async () => {
    const res = await request(app)
      .patch('/users/ada@example.com')
      .set(AUTH_ADA)
      .send({ name: '' });
    expect(res.status).toBe(400);
  });

  it('name missing from body → 400', async () => {
    const res = await request(app)
      .patch('/users/ada@example.com')
      .set(AUTH_ADA)
      .send({});
    expect(res.status).toBe(400);
  });

  it('valid name → 200 (no regression)', async () => {
    const res = await request(app)
      .patch('/users/ada@example.com')
      .set(AUTH_ADA)
      .send({ name: 'Ada Lovelace' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Ada Lovelace');
  });
});
