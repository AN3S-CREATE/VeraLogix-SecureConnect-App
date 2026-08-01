/**
 * POPIA-oriented redaction helpers for AI copilots.
 * Strip emails, phones (ZA-ish), SA ID-like numbers, and bearer tokens before LLM calls.
 */

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

  // Order: structured identifiers before phone patterns.
  replaceAll(EMAIL_RE, 'email', '[REDACTED_EMAIL]');
  replaceAll(SA_ID_RE, 'national_id', '[REDACTED_ID]');
  replaceAll(JWT_RE, 'token', '[REDACTED_TOKEN]');
  replaceAll(UUID_RE, 'uuid', '[REDACTED_UUID]');
  replaceAll(PHONE_RE, 'phone', '[REDACTED_PHONE]');

  return { redacted: out, redactions: actions };
}

export type IncidentSummaryInput = {
  severity: string;
  status: string;
  evidence: string[];
  slaDeadline?: string;
};

export type IncidentSummaryResult = {
  summary: string;
  urgency: 'immediate' | 'high' | 'normal' | 'low';
  recommendedActions: string[];
  redactions: string[];
  model: 'heuristic' | 'gemini';
};

export function heuristicIncidentSummary(input: IncidentSummaryInput): IncidentSummaryResult {
  const joined = input.evidence.join(' | ') || `Incident status=${input.status}`;
  const { redacted, redactions } = redactPii(joined);
  const severity = input.severity.toLowerCase();
  const urgency =
    severity === 'critical'
      ? 'immediate'
      : severity === 'high'
        ? 'high'
        : severity === 'low'
          ? 'low'
          : 'normal';

  const overdue =
    input.slaDeadline && new Date(input.slaDeadline).getTime() < Date.now()
      ? ' SLA is breached.'
      : '';

  return {
    summary: `${severity.toUpperCase()} incident (${input.status}): ${redacted.slice(0, 280)}.${overdue}`,
    urgency,
    recommendedActions: [
      urgency === 'immediate' || urgency === 'high' ? 'Dispatch on-site agent' : 'Queue for next shift review',
      'Attach evidence to locker and verify hash',
      'Notify estate manager if SLA < 25%',
    ],
    redactions,
    model: 'heuristic',
  };
}

export type TriageInput = {
  category: string;
  description: string;
  severity?: string;
};

export type TriageResult = {
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  suggestedAssigneeRole: 'agent' | 'vendor' | 'estate_manager';
  tags: string[];
  rationale: string;
  redactions: string[];
  model: 'heuristic' | 'gemini';
};

export function heuristicMaintenanceTriage(input: TriageInput): TriageResult {
  const { redacted, redactions } = redactPii(`${input.category}: ${input.description}`);
  const text = redacted.toLowerCase();
  const emergency =
    /fire|flood|gas|electroc|break[- ]?in|assault|medical/.test(text) ||
    input.severity === 'critical';
  const vendorish = /hvac|plumb|lift|elevator|gate motor|cctv|electric/.test(text);

  if (emergency) {
    return {
      priority: 'P1',
      suggestedAssigneeRole: 'agent',
      tags: ['emergency', input.category.toLowerCase()],
      rationale: `Emergency signals in: ${redacted.slice(0, 160)}`,
      redactions,
      model: 'heuristic',
    };
  }
  if (vendorish) {
    return {
      priority: 'P2',
      suggestedAssigneeRole: 'vendor',
      tags: ['vendor', input.category.toLowerCase()],
      rationale: `Vendor trade keywords detected: ${redacted.slice(0, 160)}`,
      redactions,
      model: 'heuristic',
    };
  }
  return {
    priority: input.severity === 'high' ? 'P2' : 'P3',
    suggestedAssigneeRole: 'estate_manager',
    tags: [input.category.toLowerCase()],
    rationale: `Standard triage: ${redacted.slice(0, 160)}`,
    redactions,
    model: 'heuristic',
  };
}
