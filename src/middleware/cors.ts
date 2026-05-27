import cors from 'cors';

// CORS policy: allow configured origins, default to localhost in dev.
// See ADR-002 for the policy decision.
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS ?? 'http://localhost:3001')
  .split(',')
  .map(s => s.trim());

export const corsMiddleware = cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
