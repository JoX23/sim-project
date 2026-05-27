import { findUserByEmail } from '../src/db/users';

describe('users db', () => {
  it('finds existing user', async () => {
    const u = await findUserByEmail('ada@example.com');
    expect(u).not.toBeNull();
  });
  it('returns null for unknown', async () => {
    const u = await findUserByEmail('nobody@x.com');
    expect(u).toBeNull();
  });
});
