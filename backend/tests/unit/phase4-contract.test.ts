import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { planUserDeletion } from '../../src/lib/popia-export.js';

describe('Phase 4 contracts', () => {
  it('exports POPIA packages via shared builder + worker putObject', () => {
    const worker = readFileSync(resolve(__dirname, '../../src/worker.ts'), 'utf8');
    expect(worker).toContain('buildPopiaExportPackage');
    expect(worker).toContain('putObject');
    expect(worker).not.toContain('Export job acknowledged');
    expect(planUserDeletion('u1').steps[0]).toBe('anonymize_access_logs');
  });

  it('seeds energy + EV demo rows', () => {
    const seed = readFileSync(resolve(__dirname, '../../src/db/seed.ts'), 'utf8');
    expect(seed).toContain('energyReadings');
    expect(seed).toContain('evSessions');
  });

  it('wires energy, EV, and vendor work-order portals', () => {
    const root = resolve(__dirname, '../../..');
    for (const path of [
      'src/app/cmd/energy/page.tsx',
      'src/app/cmd/ev-charging/page.tsx',
      'src/app/ten/ev/page.tsx',
      'src/app/ven/work-orders/page.tsx',
    ]) {
      expect(existsSync(resolve(root, path))).toBe(true);
      const src = readFileSync(resolve(root, path), 'utf8');
      expect(src).toContain('useCollection');
    }
  });
});
