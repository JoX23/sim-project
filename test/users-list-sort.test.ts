import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/server';

const SECRET = 'dev-only-not-for-prod';
const AUTH = { Authorization: `Bearer ${jwt.sign({ sub: 'ada', email: 'ada@example.com' }, SECRET)}` };

describe('GET /users — sort/order params', () => {
  it('AC-1: ?sort=name&order=asc returns users sorted by name ascending', async () => {
    const res = await request(app).get('/users?sort=name&order=asc').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sort', 'name');
    expect(res.body).toHaveProperty('order', 'asc');
    const names: string[] = res.body.users.map((u: any) => u.name);
    expect(names).toEqual([...names].sort());
  });

  it('AC-2: ?sort=name&order=desc returns users sorted by name descending', async () => {
    const res = await request(app).get('/users?sort=name&order=desc').set(AUTH);
    expect(res.status).toBe(200);
    const names: string[] = res.body.users.map((u: any) => u.name);
    expect(names).toEqual([...names].sort().reverse());
  });

  it('AC-3: ?sort=createdAt&order=desc returns most recently created first', async () => {
    const res = await request(app).get('/users?sort=createdAt&order=desc').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sort', 'createdAt');
    expect(res.body).toHaveProperty('order', 'desc');
  });

  it('AC-4: invalid sort value falls back to createdAt (no 400)', async () => {
    const res = await request(app).get('/users?sort=bogus').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.sort).toBe('createdAt');
  });

  it('AC-5: invalid order value falls back to asc (no 400)', async () => {
    const res = await request(app).get('/users?order=bogus').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.order).toBe('asc');
  });
});
