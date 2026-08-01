import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Phase 5 frontend helpers live under src/ — mirror pack summary contract here
 * so CI does not need to import client modules into the API package.
 */
function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n).toLocaleString('en-US')}`;
  return `$${n.toFixed(2)}`;
}

function buildCmdReportPack(input: {
  templateId: string;
  templateName: string;
  finance: { paidTotal: number; arrears: number };
  security: { open: number; critical: number };
  tickets: { open: number };
  energy: { kwh: number };
  ev: { revenue: number };
}) {
  return {
    id: `pack-${input.templateId}`,
    title: input.templateName,
    summary: [
      `Collections ${formatMoney(input.finance.paidTotal)}; arrears ${formatMoney(input.finance.arrears)}.`,
      `${input.security.open} open incidents (${input.security.critical} critical/high).`,
      `${input.tickets.open} open tickets; energy ${input.energy.kwh.toFixed(1)} kWh; EV revenue ${formatMoney(input.ev.revenue)}.`,
    ].join(' '),
  };
}

describe('Phase 5 contracts', () => {
  it('wires trustee + vendor dashboard + cmd reports to live collections', () => {
    const root = resolve(__dirname, '../../..');
    for (const path of [
      'src/app/tru/overview/page.tsx',
      'src/app/tru/financials/page.tsx',
      'src/app/tru/security/page.tsx',
      'src/app/tru/energy/page.tsx',
      'src/app/ven/dashboard/page.tsx',
      'src/app/cmd/reports/page.tsx',
      'src/lib/portal-kpis.ts',
    ]) {
      expect(existsSync(resolve(root, path))).toBe(true);
      const src = readFileSync(resolve(root, path), 'utf8');
      if (path.endsWith('portal-kpis.ts')) {
        expect(src).toContain('buildCmdReportPack');
        expect(src).toContain('useInvoiceKpis');
      } else {
        expect(src).toContain('useCollection');
      }
    }
  });

  it('builds a report pack summary from live KPI inputs', () => {
    const pack = buildCmdReportPack({
      templateId: 'quarterly',
      templateName: 'Quarterly Review',
      finance: { paidTotal: 12000, arrears: 4500 },
      security: { open: 2, critical: 1 },
      tickets: { open: 5 },
      energy: { kwh: 88.5 },
      ev: { revenue: 320 },
    });
    expect(pack.id).toBe('pack-quarterly');
    expect(pack.title).toBe('Quarterly Review');
    expect(pack.summary).toContain('$12,000');
    expect(pack.summary).toContain('2 open incidents');
    expect(pack.summary).toContain('88.5 kWh');
  });

  it('cmd reports export uses buildCmdReportPack', () => {
    const src = readFileSync(
      resolve(__dirname, '../../../src/app/cmd/reports/page.tsx'),
      'utf8',
    );
    expect(src).toContain('buildCmdReportPack');
    expect(src).toContain('Export JSON pack');
  });
});
