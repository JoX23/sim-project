import { requestLogger } from '../src/middleware/logger';

describe('requestLogger middleware', () => {
  it('is defined and callable', () => {
    expect(requestLogger).toBeDefined();
    expect(typeof requestLogger).toBe('function');
  });
  it('calls next() after logging', () => {
    const next = jest.fn();
    const req = { method: 'GET', path: '/health' } as any;
    const res = {} as any;
    requestLogger(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
