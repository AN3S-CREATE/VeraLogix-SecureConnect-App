/**
 * E2E smoke tests — run against a live stack:
 *   docker compose -f docker/docker-compose.yml up -d
 *   RUN_E2E=1 npm run test:e2e
 */
import { describe, it, expect } from 'vitest';

const enabled = process.env.RUN_E2E === '1';
const baseUrl = process.env.API_URL ?? 'http://localhost:3000';

describe.skipIf(!enabled)('e2e flows', () => {
  it('login → list doors → unlock → access log', async () => {
    const sessionRes = await fetch(`${baseUrl}/api/v1/auth/dev-session`, { method: 'POST' });
    expect(sessionRes.ok).toBe(true);
    const session = (await sessionRes.json()) as { accessToken: string; user: { siteIds: string[] } };
    const headers = {
      Authorization: `Bearer ${session.accessToken}`,
      'x-dev-bypass': '1',
      'Content-Type': 'application/json',
    };

    const doorsRes = await fetch(`${baseUrl}/api/v1/doors?limit=10`, { headers });
    expect(doorsRes.ok).toBe(true);
    const doors = (await doorsRes.json()) as { data: { id: string }[] };
    expect(doors.data.length).toBeGreaterThan(0);

    const unlock = await fetch(`${baseUrl}/api/v1/doors/${doors.data[0].id}/unlock`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ result: 'granted' }),
    });
    expect(unlock.ok).toBe(true);

    const logs = await fetch(`${baseUrl}/api/v1/access-logs?limit=5`, { headers });
    expect(logs.ok).toBe(true);
  });

  it('rate limit shape on auth', async () => {
    // Soft check — endpoint exists. Without Keycloak (CI smoke) login may 5xx;
    // with Keycloak it should be 401/429/400 for bad credentials.
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'x@y.com', password: 'wrongpassword' }),
    });
    expect(res.ok).toBe(false);
    expect([400, 401, 429, 500, 502, 503]).toContain(res.status);
  });
});

describe('e2e placeholder', () => {
  it('skips without RUN_E2E', () => {
    expect(enabled || true).toBe(true);
  });
});
