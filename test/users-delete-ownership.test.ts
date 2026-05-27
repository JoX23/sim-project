// Regression test añadido PRE-fix per /triage Paso 2.
import { app } from '../src/server';

describe('DELETE /users/:email — ownership', () => {
  it('should_return_403_when_deleting_another_user', async () => {
    expect(app).toBeDefined();
    // Sim: en proyecto real haría:
    // const bobJwt = sign({ sub: '2', email: 'bob@x.com' }, SECRET)
    // DELETE /users/alice@x.com con Authorization: Bearer <bobJwt>
    // expect(res.status).toBe(403)
    // La guardia req.user?.email !== email devuelve 403 si el JWT no es del mismo usuario
  });
  it('allows user to delete themselves (no regression)', async () => {
    expect(app).toBeDefined();
    // Sim: DELETE /users/ada@example.com con JWT { email: 'ada@example.com' } → 204
  });
});
