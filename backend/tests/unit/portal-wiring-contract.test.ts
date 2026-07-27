import { describe, expect, it } from 'vitest';

/** Mirrors display helpers used by agent invoice / maintenance portals. */
function invoiceStatusLabel(status: 'paid' | 'unpaid') {
  return status === 'paid' ? 'Paid' : 'Submitted';
}

function ticketDisplayStatus(status: string) {
  if (status === 'assigned' || status === 'in_progress') return 'Assigned';
  if (status === 'closed' || status === 'resolved') return 'Resolved';
  return 'New';
}

describe('portal display contracts (Phase 1 wiring)', () => {
  it('maps invoice paid/unpaid to UI labels', () => {
    expect(invoiceStatusLabel('paid')).toBe('Paid');
    expect(invoiceStatusLabel('unpaid')).toBe('Submitted');
  });

  it('maps ticket statuses for agent maintenance table', () => {
    expect(ticketDisplayStatus('open')).toBe('New');
    expect(ticketDisplayStatus('assigned')).toBe('Assigned');
    expect(ticketDisplayStatus('closed')).toBe('Resolved');
  });
});
