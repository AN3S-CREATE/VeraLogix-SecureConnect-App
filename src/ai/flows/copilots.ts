import { z } from 'genkit';
import { ai } from '../genkit';
import {
  heuristicIncidentSummary,
  heuristicMaintenanceTriage,
  redactPii,
} from '../lib/popia';

/**
 * Genkit flows for local `npm run genkit:dev`.
 * Production portals should call authenticated backend `/api/v1/ai/*`.
 */

export const incidentSummaryFlow = ai.defineFlow(
  {
    name: 'incidentSummary',
    inputSchema: z.object({
      severity: z.string(),
      status: z.string(),
      evidence: z.array(z.string()).default([]),
      slaDeadline: z.string().optional(),
    }),
    outputSchema: z.object({
      summary: z.string(),
      urgency: z.enum(['immediate', 'high', 'normal', 'low']),
      recommendedActions: z.array(z.string()),
      redactions: z.array(z.string()),
      model: z.enum(['heuristic', 'gemini']),
    }),
  },
  async (input) => {
    const fallback = heuristicIncidentSummary(input);
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      return fallback;
    }
    try {
      const safeEvidence = input.evidence.map((e) => redactPii(e).redacted);
      const { text } = await ai.generate({
        prompt: `POPIA-safe incident brief. Never echo emails/phones/IDs/tokens.
Return JSON with summary, urgency, recommendedActions, redactions, model=gemini.
severity=${input.severity} status=${input.status} evidence=${JSON.stringify(safeEvidence)} sla=${input.slaDeadline ?? ''}`,
      });
      const parsed = JSON.parse(text) as typeof fallback;
      return { ...fallback, ...parsed, model: 'gemini' as const };
    } catch {
      return fallback;
    }
  },
);

export const maintenanceTriageFlow = ai.defineFlow(
  {
    name: 'maintenanceTriage',
    inputSchema: z.object({
      category: z.string(),
      description: z.string(),
      severity: z.string().optional(),
    }),
    outputSchema: z.object({
      priority: z.enum(['P1', 'P2', 'P3', 'P4']),
      suggestedAssigneeRole: z.enum(['agent', 'vendor', 'estate_manager']),
      tags: z.array(z.string()),
      rationale: z.string(),
      redactions: z.array(z.string()),
      model: z.enum(['heuristic', 'gemini']),
    }),
  },
  async (input) => {
    const fallback = heuristicMaintenanceTriage(input);
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) return fallback;
    try {
      const { redacted } = redactPii(input.description);
      const { text } = await ai.generate({
        prompt: `POPIA-safe maintenance triage. JSON: priority, suggestedAssigneeRole, tags, rationale, redactions, model=gemini.
category=${input.category} severity=${input.severity ?? ''} description=${redacted}`,
      });
      const parsed = JSON.parse(text) as typeof fallback;
      return { ...fallback, ...parsed, model: 'gemini' as const };
    } catch {
      return fallback;
    }
  },
);
