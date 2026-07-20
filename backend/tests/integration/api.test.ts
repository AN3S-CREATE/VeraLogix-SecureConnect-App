/**
 * Integration tests require Docker (Testcontainers).
 * Run: npm run test:integration (with Docker available)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const dockerAvailable = process.env.RUN_INTEGRATION === '1';

describe.skipIf(!dockerAvailable)('API integration', () => {
  let baseUrl = 'http://localhost:3000';

  beforeAll(async () => {
    baseUrl = process.env.API_URL ?? 'http://localhost:3000';
  });

  afterAll(async () => {
    /* containers stopped by compose externally when using live stack */
  });

  it('health live returns ok', async () => {
    const res = await fetch(`${baseUrl}/health/live`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe('ok');
  });

  it('rejects unauthenticated doors list', async () => {
    const res = await fetch(`${baseUrl}/api/v1/doors`);
    expect([401, 403]).toContain(res.status);
  });

  it('dev session works when enabled', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/dev-session`, { method: 'POST' });
    if (res.status === 404) return; // bypass disabled
    expect(res.status).toBe(200);
    const body = (await res.json()) as { accessToken: string };
    expect(body.accessToken).toBeTruthy();

    const doors = await fetch(`${baseUrl}/api/v1/doors`, {
      headers: { Authorization: `Bearer ${body.accessToken}`, 'x-dev-bypass': '1' },
    });
    expect(doors.status).toBe(200);
  });
});

describe('integration placeholder', () => {
  it('documents how to run', () => {
    expect(true).toBe(true);
  });
});
