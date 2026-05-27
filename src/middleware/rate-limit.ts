import type { Request, Response, NextFunction } from 'express';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;

const counters = new Map<string, { count: number; resetAt: number }>();

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip ?? '127.0.0.1';
  const now = Date.now();
  const entry = counters.get(ip);
  if (!entry || now > entry.resetAt) {
    counters.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }
  entry.count += 1;
  if (entry.count > MAX_REQUESTS) {
    res.status(429).json({ error: 'too many requests' });
    return;
  }
  next();
}
