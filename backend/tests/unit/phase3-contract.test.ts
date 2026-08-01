import { describe, expect, it } from 'vitest';
import {
  heuristicIncidentSummary,
  heuristicMaintenanceTriage,
  redactPii,
} from '../../src/lib/ai-copilot.js';
import { heuristicMalwareScan, sha256Hex, verifySha256 } from '../../src/lib/evidence.js';
import { planSlaBreaches } from '../../src/lib/sla.js';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('POPIA AI redaction', () => {
  it('redacts email phone id token uuid', () => {
    const sample =
      'Call jane@estate.com +27821234567 id 8001015009087 token eyJhbGciOiJIUzI1NiJ9.aaa.bbb uuid 550e8400-e29b-41d4-a716-446655440000';
    const { redacted, redactions } = redactPii(sample);
    expect(redacted).not.toContain('jane@estate.com');
    expect(redacted).toContain('[REDACTED_EMAIL]');
    expect(redacted).toContain('[REDACTED_PHONE]');
    expect(redacted).toContain('[REDACTED_ID]');
    expect(redacted).toContain('[REDACTED_TOKEN]');
    expect(redacted).toContain('[REDACTED_UUID]');
    expect(redactions).toEqual(
      expect.arrayContaining(['email', 'phone', 'national_id', 'token', 'uuid']),
    );
  });

  it('summarizes critical incidents with immediate urgency', () => {
    const result = heuristicIncidentSummary({
      severity: 'critical',
      status: 'open',
      evidence: ['Gate forced open near lobby'],
      slaDeadline: new Date(Date.now() - 60_000).toISOString(),
    });
    expect(result.urgency).toBe('immediate');
    expect(result.summary).toMatch(/CRITICAL/);
    expect(result.summary).toMatch(/breached/i);
    expect(result.model).toBe('heuristic');
  });

  it('triages emergency maintenance as P1 agent', () => {
    const result = heuristicMaintenanceTriage({
      category: 'safety',
      description: 'Possible gas leak in basement',
    });
    expect(result.priority).toBe('P1');
    expect(result.suggestedAssigneeRole).toBe('agent');
  });
});

describe('evidence locker helpers', () => {
  it('hashes and verifies sha256', () => {
    const hex = sha256Hex('proof');
    expect(hex).toHaveLength(64);
    expect(verifySha256(hex, hex)).toBe(true);
    expect(verifySha256(hex, '0'.repeat(64))).toBe(false);
  });

  it('quarantines executables', () => {
    expect(
      heuristicMalwareScan({ filename: 'payload.exe', mime: 'application/octet-stream', sizeBytes: 10 }).status,
    ).toBe('quarantined');
    expect(
      heuristicMalwareScan({ filename: 'clip.jpg', mime: 'image/jpeg', sizeBytes: 1200 }).status,
    ).toBe('clean');
  });
});

describe('SLA planner', () => {
  it('flags open past-deadline entities', () => {
    const now = new Date('2026-07-27T12:00:00Z');
    const plan = planSlaBreaches(
      [
        {
          id: '1',
          siteId: 's',
          status: 'open',
          slaDeadline: '2026-07-27T11:00:00Z',
          kind: 'ticket',
        },
        {
          id: '2',
          siteId: 's',
          status: 'closed',
          slaDeadline: '2026-07-27T11:00:00Z',
          kind: 'incident',
        },
        {
          id: '3',
          siteId: 's',
          status: 'open',
          slaDeadline: '2026-07-27T13:00:00Z',
          kind: 'ticket',
        },
      ],
      now,
    );
    expect(plan.breached.map((b) => b.id)).toEqual(['1']);
    expect(plan.skipped).toHaveLength(2);
  });
});

describe('Phase 3 contracts', () => {
  it('ships migration 0002 and optional mobile scaffold', () => {
    expect(existsSync(resolve(__dirname, '../../src/db/migrations/0002_phase3.sql'))).toBe(true);
    expect(existsSync(resolve(__dirname, '../../../apps/mobile/App.tsx'))).toBe(true);
    expect(existsSync(resolve(__dirname, '../../../docs/phase3/README.md'))).toBe(true);
  });

  it('registers AI and tenants modules in app', () => {
    const app = readFileSync(resolve(__dirname, '../../src/app.ts'), 'utf8');
    expect(app).toContain("aiRoutes");
    expect(app).toContain("tenantsRoutes");
  });

  it('implements SLA and evidence workers (not stubs)', () => {
    const worker = readFileSync(resolve(__dirname, '../../src/worker.ts'), 'utf8');
    expect(worker).toContain('planSlaBreaches');
    expect(worker).toContain('heuristicMalwareScan');
    expect(worker).not.toContain('SLA check stub');
  });
});
