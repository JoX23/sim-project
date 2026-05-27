// Plan 01ktcf2hb9e1ry6sw796gzcz4n — user roles: default 'user', exposed in all responses
import express from 'express';
import request from 'supertest';
import { usersRouter } from '../src/routes/users';

const app = express();
app.use(express.json());
app.use('/users', usersRouter);

describe('user roles', () => {
  it('POST /users creates user with default role "user"', async () => {
    const res = await request(app)
      .post('/users')
      .send({ email: 'roletest@example.com', name: 'Role Test' });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe('user');
  });

  it('GET /users/:email includes role in response', async () => {
    await request(app).post('/users').send({ email: 'roletest2@example.com', name: 'Role Test 2' });
    const res = await request(app).get('/users/roletest2@example.com');
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('user');
  });

  it('GET /users list includes role on each item', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    for (const u of res.body.users) {
      expect(['user', 'admin']).toContain(u.role);
    }
  });
});
