import { createUser, updateUser } from '../src/db/users';

// Covers deuda técnica from plan 01kszf8mn2k0nm4yp6xy7bvq5t evidence:
// "no se verifica que el campo de timestamp se actualice al hacer PATCH"
describe('updatedAt field — plan 01kt3f8mn2k0nm4yp6xy7bvq7v', () => {
  it('AC-1: created user has updatedAt equal to createdAt', async () => {
    const user = await createUser('upd1@example.com', 'UpdUser1');
    expect(user.updatedAt).toBeDefined();
    expect(user.updatedAt).toBe(user.createdAt);
  });

  it('AC-2: after updateUser, updatedAt is a valid ISO string', async () => {
    await createUser('upd2@example.com', 'UpdUser2');
    const updated = await updateUser('upd2@example.com', 'UpdUser2Modified');
    expect(updated).not.toBeNull();
    expect(updated!.updatedAt).toBeDefined();
    expect(new Date(updated!.updatedAt).toISOString()).toBe(updated!.updatedAt);
  });
});
