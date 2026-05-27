import { rateLimitMiddleware } from '../src/middleware/rate-limit';

function makeCtx(ip = '10.0.0.1') {
  const req = { ip } as any;
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
  const next = jest.fn();
  return { req, res, next };
}

describe('rate limiting', () => {
  it('allows first request from an IP', () => {
    const { req, res, next } = makeCtx('10.1.1.1');
    rateLimitMiddleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('blocks the 101st request within window', () => {
    const { req, res, next } = makeCtx('10.2.2.2');
    for (let i = 0; i < 101; i++) rateLimitMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ error: 'too many requests' });
  });

  it('allows a new IP independently', () => {
    const ctx1 = makeCtx('10.3.3.3');
    const ctx2 = makeCtx('10.4.4.4');
    rateLimitMiddleware(ctx1.req, ctx1.res, ctx1.next);
    rateLimitMiddleware(ctx2.req, ctx2.res, ctx2.next);
    expect(ctx1.next).toHaveBeenCalledTimes(1);
    expect(ctx2.next).toHaveBeenCalledTimes(1);
  });
});
