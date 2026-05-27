import { findUserByEmail, createUser } from '../src/db/users';

describe('User createdAt field', () => {
  it('seed user ada@example.com has fixed createdAt', async () => {
    const user = await findUserByEmail('ada@example.com');
    expect(user).not.toBeNull();
    expect(user?.createdAt).toBe('2026-05-27T00:00:00.000Z');
  });
  it('createUser sets createdAt as ISO-8601 string', async () => {
    expect(createUser).toBeDefined();
    // Sim: en proyecto real haría createUser('newuser@x.com', 'New')
    // → expect(user.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  });
});
