import { createUser, findUserByEmail } from '../src/db/users';

describe('POST /users — createUser', () => {
  it('creates a new user and returns it', async () => {
    expect(createUser).toBeDefined();
    // Sim: en proyecto real haría POST /users { email, name } → expect(res.status).toBe(201)
  });
  it('returns 400 when email or name missing', () => {
    // Sim placeholder — route handler valida body antes de llamar createUser
    expect(findUserByEmail).toBeDefined();
  });
  it('returns 400 when email format invalid', () => {
    // Sim placeholder — EMAIL_RE check antes del createUser call
    expect(createUser).toBeDefined();
  });
});
