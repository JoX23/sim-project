import type { Response } from 'express';

export const badRequest = (res: Response, msg: string) =>
  res.status(400).json({ error: msg });

export const unauthorized = (res: Response, msg = 'unauthorized') =>
  res.status(401).json({ error: msg });

export const forbidden = (res: Response, msg = 'forbidden') =>
  res.status(403).json({ error: msg });

export const notFound = (res: Response, msg = 'not found') =>
  res.status(404).json({ error: msg });

export const conflict = (res: Response, msg: string) =>
  res.status(409).json({ error: msg });

export const internalError = (res: Response, msg = 'internal error') =>
  res.status(500).json({ error: msg });
