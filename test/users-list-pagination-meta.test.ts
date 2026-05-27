import { listUsers } from '../src/db/users';

// Covers plan 01kt5f8mn2k0nm4yp6xy7bvq8w: pagination metadata in GET /users response
describe('GET /users — pagination metadata', () => {
  it('AC-1: response includes page, limit, totalPages, hasNext', async () => {
    const result = await listUsers(1, 20);
    expect(result).toHaveProperty('page', 1);
    expect(result).toHaveProperty('limit', 20);
    expect(result).toHaveProperty('totalPages');
    expect(typeof result.hasNext).toBe('boolean');
  });

  it('AC-2: totalPages = Math.max(1, ceil(total / limit))', async () => {
    const result = await listUsers(1, 1);
    const expected = Math.max(1, Math.ceil(result.total / 1));
    expect(result.totalPages).toBe(expected);
  });

  it('AC-3: hasNext false when limit >= total (last page)', async () => {
    const result = await listUsers(1, 100);
    expect(result.hasNext).toBe(false);
  });
});
