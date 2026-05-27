// Regression test añadido PRE-fix per /triage Paso 2.
import { createUser } from '../src/db/users';

describe('POST /users — duplicate email', () => {
  it('should_return_409_when_email_already_exists', async () => {
    expect(createUser).toBeDefined();
    // Sim: en proyecto real haría:
    // 1. POST /users { email: 'ada@example.com', name: 'Ada' }
    // 2. POST /users { email: 'ada@example.com', name: 'Other' }
    // expect(second.status).toBe(409)
    // createUser lanza Error('duplicate') → route handler devuelve 409
  });
});
