import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/server';
import { createUser } from '../src/db/users';

const SECRET = 'dev-only-not-for-prod';

function makeToken(email: string) {
  return jwt.sign({ sub: email, email }, SECRET);
}

const ADMIN_EMAIL = 'admin-rbac@example.com';
const TARGET_EMAIL = 'target-rbac@example.com';

describe('Admin role enforcement', () => {
  const adminToken = makeToken(ADMIN_EMAIL);
  const targetToken = makeToken(TARGET_EMAIL);

  beforeAll(async () => {
    try { await createUser(ADMIN_EMAIL, 'Admin RBAC', 'admin'); } catch {}
  });

  beforeEach(async () => {
    try { await createUser(TARGET_EMAIL, 'Target RBAC', 'user'); } catch {}
  });

  it('AC-1: admin DELETE email ajeno → 204', async () => {
    const res = await request(app)
      .delete(`/users/${TARGET_EMAIL}`)
      .set({ Authorization: `Bearer ${adminToken}` });
    expect(res.status).toBe(204);
  });

  it('AC-2: admin PATCH email ajeno → 200', async () => {
    const res = await request(app)
      .patch(`/users/${TARGET_EMAIL}`)
      .set({ Authorization: `Bearer ${adminToken}` })
      .send({ name: 'Updated by Admin' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated by Admin');
  });

  it('AC-3: non-admin DELETE email ajeno → 403', async () => {
    const res = await request(app)
      .delete('/users/ada@example.com')
      .set({ Authorization: `Bearer ${targetToken}` });
    expect(res.status).toBe(403);
  });

  it('AC-4: non-admin PATCH email ajeno → 403', async () => {
    const res = await request(app)
      .patch('/users/ada@example.com')
      .set({ Authorization: `Bearer ${targetToken}` })
      .send({ name: 'Hacker' });
    expect(res.status).toBe(403);
  });

  it('AC-5: sin JWT en DELETE → 401', async () => {
    const res = await request(app).delete(`/users/${TARGET_EMAIL}`);
    expect(res.status).toBe(401);
  });

  it('AC-6: isAdmin false si caller no existe en DB → ownership check activo → 403', async () => {
    const ghostToken = makeToken('ghost-nobody@example.com');
    const res = await request(app)
      .delete(`/users/${TARGET_EMAIL}`)
      .set({ Authorization: `Bearer ${ghostToken}` });
    expect(res.status).toBe(403);
  });
});
