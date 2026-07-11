import { describe, expect, it } from 'vitest';
import { hasAnyRole, isAdmin, portalForRole, RoleSchema } from '../../src/lib/roles.js';
import { planUserDeletion } from '../../src/modules/popia/routes.js';
import { AppError, UnauthorizedError, QuotaExceededError, isAppError } from '../../src/lib/errors.js';
import { hashPayload, withBackoff } from '../../src/lib/utils.js';
import { CursorPaginationQuery, decodeCursor, encodeCursor } from '../../src/lib/pagination.js';

describe('roles', () => {
  it('parses valid roles', () => {
    expect(RoleSchema.parse('admin')).toBe('admin');
    expect(RoleSchema.safeParse('nope').success).toBe(false);
  });

  it('checks role membership', () => {
    expect(hasAnyRole(['resident'], ['admin', 'resident'])).toBe(true);
    expect(hasAnyRole(['vendor'], ['admin'])).toBe(false);
    expect(isAdmin(['admin'])).toBe(true);
    expect(isAdmin(['agent'])).toBe(false);
  });

  it('maps portals', () => {
    expect(portalForRole('resident')).toBe('/ten');
    expect(portalForRole('trustee')).toBe('/tru');
    expect(portalForRole('vendor')).toBe('/ven');
    expect(portalForRole('agent')).toBe('/cmd');
  });
});

describe('POPIA deletion planner', () => {
  it('returns ordered steps', () => {
    const plan = planUserDeletion('user-1');
    expect(plan.userId).toBe('user-1');
    expect(plan.steps).toContain('soft_delete_user');
    expect(plan.steps[0]).toBe('anonymize_access_logs');
  });
});

describe('errors', () => {
  it('identifies AppError hierarchy', () => {
    const err = new UnauthorizedError();
    expect(isAppError(err)).toBe(true);
    expect(err.statusCode).toBe(401);
    expect(new QuotaExceededError().statusCode).toBe(413);
    expect(isAppError(new Error('x'))).toBe(false);
    expect(new AppError('X', 'msg', 418).code).toBe('X');
  });
});

describe('utils', () => {
  it('hashes payloads stably', () => {
    expect(hashPayload({ a: 1 })).toBe(hashPayload({ a: 1 }));
    expect(hashPayload({ a: 1 })).not.toBe(hashPayload({ a: 2 }));
  });

  it('retries with backoff', async () => {
    let n = 0;
    const result = await withBackoff(
      async () => {
        n += 1;
        if (n < 3) throw new Error('fail');
        return 'ok';
      },
      { retries: 3, baseMs: 1, maxMs: 5 },
    );
    expect(result).toBe('ok');
    expect(n).toBe(3);
  });
});

describe('pagination', () => {
  it('parses query defaults', () => {
    const q = CursorPaginationQuery.parse({});
    expect(q.limit).toBe(25);
    expect(encodeCursor('abc')).toBe('abc');
    expect(decodeCursor('abc')).toBe('abc');
  });
});
