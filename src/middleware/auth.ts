import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../db/users';

const SECRET = process.env.JWT_SECRET || 'dev-only-not-for-prod';

export interface AuthedRequest extends Request {
  user?: { sub: string; email?: string };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing bearer token' });
  }
  try {
    const payload = jwt.verify(header.slice(7), SECRET) as { sub: string; email?: string };
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}

export async function isAdmin(req: AuthedRequest): Promise<boolean> {
  if (!req.user?.email) return false;
  const caller = await findUserByEmail(req.user.email);
  return caller?.role === 'admin';
}
