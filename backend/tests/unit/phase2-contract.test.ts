import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Phase 2 contracts', () => {
  it('ships Backend Integration workflow with service containers', () => {
    const path = resolve(__dirname, '../../../.github/workflows/backend-integration.yml');
    expect(existsSync(path)).toBe(true);
    const yml = readFileSync(path, 'utf8');
    expect(yml).toContain('RUN_INTEGRATION=1');
    expect(yml).toContain('RUN_E2E=1');
    expect(yml).toContain('postgres:16-alpine');
    expect(yml).toContain('redis:7-alpine');
    expect(yml).toContain('DEV_AUTH_BYPASS');
  });

  it('documents transactional POPIA deletion in worker', () => {
    const worker = readFileSync(resolve(__dirname, '../../src/worker.ts'), 'utf8');
    expect(worker).toContain('db.transaction');
    expect(worker).toContain('POPIA deletion');
  });

  it('uses Redis channel for realtime fanout', () => {
    const gateway = readFileSync(resolve(__dirname, '../../src/realtime/gateway.ts'), 'utf8');
    expect(gateway).toContain('secureconnect:realtime');
    expect(gateway).toMatch(/publisher[\s\S]*\.publish\(/);
  });

  it('treats Bearer dev-bypass as sentinel (not JWKS)', () => {
    const auth = readFileSync(resolve(__dirname, '../../src/middleware/auth.ts'), 'utf8');
    expect(auth).toContain("token === 'dev-bypass'");
  });
});
