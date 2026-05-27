// Sim project — minimal Express stub for harness validation.
import express from 'express';
import { usersRouter } from './routes/users';
import { requireAuth } from './middleware/auth';
import { requestLogger } from './middleware/logger';

export const app = express();
app.use(requestLogger);
app.use(express.json());
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/users', requireAuth, usersRouter);

if (require.main === module) {
  app.listen(3000, () => console.log('sim-project on :3000'));
}
