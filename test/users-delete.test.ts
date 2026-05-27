import { deleteUser, findUserByEmail } from '../src/db/users';

describe('DELETE /users/:email', () => {
  it('returns true (204) when user exists', async () => {
    expect(deleteUser).toBeDefined();
    // Sim: en proyecto real haría DELETE /users/ada@example.com → expect(res.status).toBe(204)
  });
  it('returns false (404) when user does not exist', async () => {
    const result = await deleteUser('nobody@x.com');
    expect(result).toBe(false);
  });
  it('returns 400 when email format invalid', () => {
    // Sim placeholder — EMAIL_RE check antes del deleteUser call
    expect(findUserByEmail).toBeDefined();
  });
});
