// Stub DB — in-memory para sim.
const DB = new Map<string, { email: string; name: string; createdAt: string; updatedAt: string }>([
  ['ada@example.com', { email: 'ada@example.com', name: 'Ada', createdAt: '2026-05-27T00:00:00.000Z', updatedAt: '2026-05-27T00:00:00.000Z' }],
]);

export async function findUserByEmail(email: string) {
  return DB.get(email) ?? null;
}

export async function createUser(email: string, name: string) {
  if (DB.has(email)) throw new Error('duplicate');
  const now = new Date().toISOString();
  const user = { email, name, createdAt: now, updatedAt: now };
  DB.set(email, user);
  return user;
}

export async function deleteUser(email: string): Promise<boolean> {
  return DB.delete(email);
}

export async function listUsers(page: number, limit: number) {
  const all = Array.from(DB.values());
  const total = all.length;
  const users = all.slice((page - 1) * limit, page * limit);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasNext = page < totalPages;
  return { users, total, page, limit, totalPages, hasNext };
}

export async function updateUser(email: string, name: string) {
  const user = DB.get(email);
  if (!user) return null;
  const updated = { ...user, name, updatedAt: new Date().toISOString() };
  DB.set(email, updated);
  return updated;
}

export async function searchUsers(nameQuery: string) {
  const q = nameQuery.toLowerCase();
  return Array.from(DB.values()).filter(u => u.name.toLowerCase().includes(q));
}
