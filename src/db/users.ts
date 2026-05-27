// Stub DB — in-memory para sim.
export type UserRole = 'user' | 'admin';

interface User {
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

const DB = new Map<string, User>([
  ['ada@example.com', { email: 'ada@example.com', name: 'Ada', role: 'user', createdAt: '2026-05-27T00:00:00.000Z', updatedAt: '2026-05-27T00:00:00.000Z' }],
]);

function normalize(email: string) {
  return email.toLowerCase().trim();
}

export async function findUserByEmail(email: string) {
  return DB.get(normalize(email)) ?? null;
}

export async function createUser(email: string, name: string, role: UserRole = 'user') {
  const key = normalize(email);
  if (DB.has(key)) throw new Error('duplicate');
  const now = new Date().toISOString();
  const user: User = { email: key, name, role, createdAt: now, updatedAt: now };
  DB.set(key, user);
  return user;
}

export async function deleteUser(email: string): Promise<boolean> {
  return DB.delete(normalize(email));
}

export async function listUsers(
  page: number,
  limit: number,
  sort: 'name' | 'createdAt' = 'createdAt',
  order: 'asc' | 'desc' = 'asc',
) {
  const all = Array.from(DB.values());
  all.sort((a, b) => {
    const av = a[sort] as string;
    const bv = b[sort] as string;
    return order === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  const total = all.length;
  const users = all.slice((page - 1) * limit, page * limit);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasNext = page < totalPages;
  return { users, total, page, limit, totalPages, hasNext, sort, order };
}

export async function updateUser(email: string, name: string) {
  const key = normalize(email);
  const user = DB.get(key);
  if (!user) return null;
  const updated = { ...user, name, updatedAt: new Date().toISOString() };
  DB.set(key, updated);
  return updated;
}

export async function searchUsers(nameQuery: string) {
  const q = nameQuery.toLowerCase();
  return Array.from(DB.values()).filter(u => u.name.toLowerCase().includes(q));
}
