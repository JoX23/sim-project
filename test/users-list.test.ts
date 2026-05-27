import { listUsers } from '../src/db/users';

describe('GET /users — list with pagination', () => {
  it('returns users array and total count', async () => {
    const result = await listUsers(1, 20);
    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('total');
    expect(Array.isArray(result.users)).toBe(true);
    expect(typeof result.total).toBe('number');
  });
  it('respects limit param', async () => {
    const result = await listUsers(1, 1);
    expect(result.users.length).toBeLessThanOrEqual(1);
    expect(result.total).toBeGreaterThanOrEqual(result.users.length);
  });
});
