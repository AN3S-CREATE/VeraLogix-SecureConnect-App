import { describe, expect, it, vi } from 'vitest';
import { cacheGet, cacheSet, cacheDel, closeRedis } from '../../src/lib/cache.js';
import type { Env } from '../../src/config/env.js';

const env = {
  REDIS_URL: 'redis://127.0.0.1:6399',
} as Env;

describe('cache (graceful degrade)', () => {
  it('returns null when redis is unavailable', async () => {
    const value = await cacheGet(env, 'missing-key');
    expect(value).toBeNull();
  });

  it('swallows set/del failures', async () => {
    await expect(cacheSet(env, 'k', { a: 1 }, 1)).resolves.toBeUndefined();
    await expect(cacheDel(env, 'k')).resolves.toBeUndefined();
    await closeRedis();
  });
});

describe('keycloak admin helpers', () => {
  it('maps conflict on duplicate user', async () => {
    const { createKeycloakUser } = await import('../../src/lib/keycloak-admin.js');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'admin-token' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        text: async () => 'exists',
      });
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      createKeycloakUser(
        {
          KEYCLOAK_URL: 'http://localhost:8080',
          KEYCLOAK_REALM: 'secureconnect',
          KEYCLOAK_ADMIN_USERNAME: 'admin',
          KEYCLOAK_ADMIN_PASSWORD: 'admin',
        } as Env,
        { email: 'a@b.com', password: 'password123', name: 'A B' },
      ),
    ).rejects.toMatchObject({ code: 'CONFLICT', statusCode: 409 });

    vi.unstubAllGlobals();
  });
});
