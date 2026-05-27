import { Router } from 'express';
import { findUserByEmail, createUser, deleteUser, listUsers, updateUser, searchUsers } from '../db/users';
import type { AuthedRequest } from '../middleware/auth';
import { EMAIL_RE } from '../utils/validation';

export const usersRouter = Router();

usersRouter.get('/me', async (req: AuthedRequest, res) => {
  const email = req.user?.email;
  if (!email) return res.status(400).json({ error: 'token missing email claim' });
  const user = await findUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'not found' });
  res.json(user);
});

usersRouter.get('/', async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const result = await listUsers(page, limit);
  res.json(result);
});

usersRouter.get('/search', async (req, res) => {
  if (!('name' in req.query)) {
    return res.status(400).json({ error: 'name query param required' });
  }
  const nameQuery = String(req.query.name ?? '');
  const users = await searchUsers(nameQuery);
  res.json({ users });
});

usersRouter.get('/:email', async (req, res) => {
  const email = req.params.email;
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'invalid email format' });
  }
  const user = await findUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'not found' });
  res.json(user);
});

usersRouter.post('/', async (req, res) => {
  const { email, name } = req.body as { email?: string; name?: string };
  if (!email || !name) return res.status(400).json({ error: 'email and name required' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'invalid email format' });
  try {
    const user = await createUser(email, name);
    res.status(201).json(user);
  } catch (err: any) {
    if (err.message === 'duplicate') return res.status(409).json({ error: 'email already exists' });
    res.status(500).json({ error: 'internal error' });
  }
});

usersRouter.patch('/:email', async (req: AuthedRequest, res) => {
  const email = req.params.email;
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'invalid email format' });
  }
  if (req.user?.email !== email) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const { name } = req.body as { name?: string };
  if (!name?.trim()) return res.status(400).json({ error: 'name required' });
  const updated = await updateUser(email, name.trim());
  if (!updated) return res.status(404).json({ error: 'not found' });
  res.json(updated);
});

usersRouter.delete('/:email', async (req: AuthedRequest, res) => {
  const email = req.params.email;
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'invalid email format' });
  }
  if (req.user?.email !== email) {
    return res.status(403).json({ error: 'forbidden' });
  }
  const deleted = await deleteUser(email);
  if (!deleted) return res.status(404).json({ error: 'not found' });
  res.status(204).send();
});
