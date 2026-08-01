export type SlaEntity = {
  id: string;
  siteId: string;
  status: string;
  slaDeadline: Date | string;
  kind: 'ticket' | 'incident';
};

export type SlaBreachPlan = {
  breached: SlaEntity[];
  skipped: SlaEntity[];
};

const OPENISH = new Set(['open', 'assigned', 'in_progress', 'new', 'acknowledged']);

export function planSlaBreaches(entities: SlaEntity[], now = new Date()): SlaBreachPlan {
  const breached: SlaEntity[] = [];
  const skipped: SlaEntity[] = [];
  for (const e of entities) {
    const deadline = new Date(e.slaDeadline);
    const status = e.status.toLowerCase();
    if (!OPENISH.has(status) || status === 'sla_breached' || status === 'closed' || status === 'resolved') {
      skipped.push(e);
      continue;
    }
    if (deadline.getTime() < now.getTime()) breached.push(e);
    else skipped.push(e);
  }
  return { breached, skipped };
}
