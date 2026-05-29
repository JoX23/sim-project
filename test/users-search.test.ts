import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/server';

const SECRET = 'dev-only-not-for-prod';
const AUTH = { Authorization: `Bearer ${jwt.sign({ sub: 'ada', email: 'ada@example.com' }, SECRET)}` };

describe('GET /users/search', () => {
  it('AC-1: ?name=Ada returns matching users', async () => {
    const res = await request(app).get('/users/search?name=Ada').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.users.some((u: any) => u.name === 'Ada')).toBe(true);
  });

  it('AC-2: case-insensitive — ?name=ada matches Ada', async () => {
    const res = await request(app).get('/users/search?name=ada').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeGreaterThan(0);
  });

  it('AC-3: empty query ?name= returns 400 (spec change: empty name is invalid)', async () => {
    const res = await request(app).get('/users/search?name=').set(AUTH);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('AC-4: missing name param → 400', async () => {
    const res = await request(app).get('/users/search').set(AUTH);
    expect(res.status).toBe(400);
  });

  it('no match → empty array', async () => {
    const res = await request(app).get('/users/search?name=ZZZNOMATCH').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(0);
  });
});
