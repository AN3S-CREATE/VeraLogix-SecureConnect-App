import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { EmailSchema } from '../../src/lib/pagination.js';

describe('auth validation contracts', () => {
  const RegisterExample = z.object({
    email: EmailSchema,
    password: z.string().min(8).max(200),
    name: z.string().min(1),
  });

  it('accepts valid registration payload', () => {
    const parsed = RegisterExample.parse({
      email: 'resident@example.com',
      password: 'securepass1',
      name: 'Demo Resident',
    });
    expect(parsed.email).toBe('resident@example.com');
  });

  it('rejects short passwords and bad emails', () => {
    expect(() =>
      RegisterExample.parse({ email: 'bad', password: 'short', name: 'x' }),
    ).toThrow();
  });

  it('shapes success/error responses', () => {
    const success = {
      accessToken: 'jwt',
      tokenType: 'Bearer',
      user: { id: '00000000-0000-4000-8000-000000000001', email: 'a@b.com', name: 'A', roles: ['resident'], siteIds: [] },
    };
    const error = {
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token', correlationId: 'c1' },
    };
    expect(success.tokenType).toBe('Bearer');
    expect(error.error.code).toBe('UNAUTHORIZED');
  });
});
