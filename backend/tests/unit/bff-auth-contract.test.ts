import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('BFF auth cookie contracts', () => {
  const root = resolve(__dirname, '../../..');

  it('exposes auth BFF routes', () => {
    for (const route of ['login', 'dev-session', 'logout', 'session']) {
      expect(existsSync(resolve(root, `src/app/api/auth/${route}/route.ts`))).toBe(true);
    }
  });

  it('uses httpOnly access cookie names', () => {
    const cookies = readFileSync(resolve(root, 'src/lib/auth-cookies.ts'), 'utf8');
    expect(cookies).toContain("ACCESS_COOKIE = 'sc_access'");
    expect(cookies).toContain("REFRESH_COOKIE = 'sc_refresh'");
    expect(cookies).toContain('httpOnly: true');
  });

  it('provider no longer persists tokens in localStorage', () => {
    const provider = readFileSync(resolve(root, 'src/backend/provider.tsx'), 'utf8');
    expect(provider).toContain('/api/auth/login');
    expect(provider).toContain('/api/auth/session');
    expect(provider).toContain('clearLegacyStorage');
    expect(provider).not.toMatch(/localStorage\.setItem\(\s*['"]sc_access_token['"]/);
  });
});
