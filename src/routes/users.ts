import { Router } from 'express';
import { findUserByEmail, createUser, deleteUser, listUsers, updateUser, searchUsers } from '../db/users';
import type { AuthedRequest } from '../middleware/auth';
import { EMAIL_RE } from '../utils/validation';
import { badRequest, forbidden, notFound, conflict, internalError } from '../utils/errors';

export const usersRouter = Router();

usersRouter.get('/me', async (req: AuthedRequest, res) => {
  const email = req.user?.email;
  if (!email) return badRequest(res, 'token missing email claim');
  const user = await findUserByEmail(email);
  if (!user) return notFound(res);
  res.json(user);
});

usersRouter.get('/', async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const sortRaw = String(req.query.sort ?? '');
  const orderRaw = String(req.query.order ?? '');
  const sort = (sortRaw === 'name' || sortRaw === 'createdAt') ? sortRaw : 'createdAt';
  const order = (orderRaw === 'asc' || orderRaw === 'desc') ? orderRaw : 'asc';
  const result = await listUsers(page, limit, sort, order);
  res.json(result);
});

usersRouter.get('/search', async (req, res) => {
  if (!('name' in req.query)) return badRequest(res, 'name query param required');
  const nameQuery = String(req.query.name ?? '');
  if (!nameQuery.trim()) return badRequest(res, 'name must not be empty');
  const users = await searchUsers(nameQuery);
  res.json({ users });
});

usersRouter.get('/:email', async (req, res) => {
  const email = req.params.email;
  if (!EMAIL_RE.test(email)) return badRequest(res, 'invalid email format');
  const user = await findUserByEmail(email);
  if (!user) return notFound(res);
  res.json(user);
});

usersRouter.post('/', async (req, res) => {
  const { email, name } = req.body as { email?: string; name?: string };
  if (!email || !name) return badRequest(res, 'email and name required');
  if (!EMAIL_RE.test(email)) return badRequest(res, 'invalid email format');
  try {
    const user = await createUser(email, name);
    res.status(201).json(user);
  } catch (err: any) {
    if (err.message === 'duplicate') return conflict(res, 'email already exists');
    internalError(res);
  }
});

usersRouter.patch('/:email', async (req: AuthedRequest, res) => {
  const email = req.params.email;
  if (!EMAIL_RE.test(email)) return badRequest(res, 'invalid email format');
  if (req.user?.email !== email) return forbidden(res);
  const { name } = req.body as { name?: string };
  if (!name?.trim()) return badRequest(res, 'name required');
  const updated = await updateUser(email, name.trim());
  if (!updated) return notFound(res);
  res.json(updated);
});

usersRouter.delete('/:email', async (req: AuthedRequest, res) => {
  const email = req.params.email;
  if (!EMAIL_RE.test(email)) return badRequest(res, 'invalid email format');
  if (req.user?.email !== email) return forbidden(res);
  const deleted = await deleteUser(email);
  if (!deleted) return notFound(res);
  res.status(204).send();
});
