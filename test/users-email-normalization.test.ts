// Regression test — triage D12.2: email case normalization
// Bug: POST /users con "Ada@Example.COM" creaba clave literal, luego GET /ada@example.com → 404
import express from 'express';
import request from 'supertest';
import { usersRouter } from '../src/routes/users';

const app = express();
app.use(express.json());
app.use('/users', usersRouter);

describe('email normalization', () => {
  it('POST stores email in lowercase', async () => {
    const res = await request(app)
      .post('/users')
      .send({ email: 'Norm@EXAMPLE.COM', name: 'Norm' });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('norm@example.com');
  });

  it('GET /:email finds user by lowercased variant', async () => {
    await request(app).post('/users').send({ email: 'Bob@Example.COM', name: 'Bob' });
    const res = await request(app).get('/users/bob@example.com');
    expect(res.status).toBe(200);
  });

  it('POST rejects duplicate regardless of email casing', async () => {
    await request(app).post('/users').send({ email: 'carol@example.com', name: 'Carol' });
    const res = await request(app)
      .post('/users')
      .send({ email: 'Carol@Example.com', name: 'Carol 2' });
    expect(res.status).toBe(409);
  });
});
