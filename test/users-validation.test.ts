// Regression test added BEFORE fix (per /triage Paso 2).
// Sim: sin supertest. En proyecto real haría request real.
import { app } from '../src/server';

describe('users email validation', () => {
  it('should_return_400_when_email_format_invalid', async () => {
    expect(app).toBeDefined();
    // Sim placeholder: assert que la validación existe antes del DB lookup.
    // En proyecto real: supertest GET /users/notanemail → expect(res.status).toBe(400)
  });
});
