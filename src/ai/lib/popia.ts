/** Frontend/Genkit copy of POPIA-safe helpers (kept hermetic from backend NodeNext). */

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?27|0)\d{9}\b/g;
const SA_ID_RE = /\b\d{13}\b/g;
const JWT_RE = /\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g;
const UUID_RE =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;

export function redactPii(text: string): { redacted: string; redactions: string[] } {
  const actions: string[] = [];
  let out = text;
  const replaceAll = (re: RegExp, label: string, token: string) => {
    const next = out.replace(re, token);
    if (next !== out) {
      actions.push(label);
      out = next;
    }
  };
  replaceAll(EMAIL_RE, 'email', '[REDACTED_EMAIL]');
  replaceAll(SA_ID_RE, 'national_id', '[REDACTED_ID]');
  replaceAll(JWT_RE, 'token', '[REDACTED_TOKEN]');
  replaceAll(UUID_RE, 'uuid', '[REDACTED_UUID]');
  replaceAll(PHONE_RE, 'phone', '[REDACTED_PHONE]');
  return { redacted: out, redactions: actions };
}

export function heuristicIncidentSummary(input: {
  severity: string;
  status: string;
  evidence: string[];
  slaDeadline?: string;
}) {
  const joined = input.evidence.join(' | ') || `Incident status=${input.status}`;
  const { redacted, redactions } = redactPii(joined);
  const severity = input.severity.toLowerCase();
  const urgency =
    severity === 'critical'
      ? ('immediate' as const)
      : severity === 'high'
        ? ('high' as const)
        : severity === 'low'
          ? ('low' as const)
          : ('normal' as const);
  const overdue =
    input.slaDeadline && new Date(input.slaDeadline).getTime() < Date.now()
      ? ' SLA is breached.'
      : '';
  return {
    summary: `${severity.toUpperCase()} incident (${input.status}): ${redacted.slice(0, 280)}.${overdue}`,
    urgency,
    recommendedActions: [
      urgency === 'immediate' || urgency === 'high'
        ? 'Dispatch on-site agent'
        : 'Queue for next shift review',
      'Attach evidence to locker and verify hash',
      'Notify estate manager if SLA < 25%',
    ],
    redactions,
    model: 'heuristic' as const,
  };
}

export function heuristicMaintenanceTriage(input: {
  category: string;
  description: string;
  severity?: string;
}) {
  const { redacted, redactions } = redactPii(`${input.category}: ${input.description}`);
  const text = redacted.toLowerCase();
  const emergency =
    /fire|flood|gas|electroc|break[- ]?in|assault|medical/.test(text) ||
    input.severity === 'critical';
  const vendorish = /hvac|plumb|lift|elevator|gate motor|cctv|electric/.test(text);
  if (emergency) {
    return {
      priority: 'P1' as const,
      suggestedAssigneeRole: 'agent' as const,
      tags: ['emergency', input.category.toLowerCase()],
      rationale: `Emergency signals in: ${redacted.slice(0, 160)}`,
      redactions,
      model: 'heuristic' as const,
    };
  }
  if (vendorish) {
    return {
      priority: 'P2' as const,
      suggestedAssigneeRole: 'vendor' as const,
      tags: ['vendor', input.category.toLowerCase()],
      rationale: `Vendor trade keywords detected: ${redacted.slice(0, 160)}`,
      redactions,
      model: 'heuristic' as const,
    };
  }
  return {
    priority: (input.severity === 'high' ? 'P2' : 'P3') as 'P2' | 'P3',
    suggestedAssigneeRole: 'estate_manager' as const,
    tags: [input.category.toLowerCase()],
    rationale: `Standard triage: ${redacted.slice(0, 160)}`,
    redactions,
    model: 'heuristic' as const,
  };
}
