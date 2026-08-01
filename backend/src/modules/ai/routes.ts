import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { Env } from '../../config/env.js';
import type { Db } from '../../db/client.js';
import { incidents, tickets } from '../../db/schema.js';
import { UuidSchema } from '../../lib/pagination.js';
import { NotFoundError } from '../../lib/errors.js';
import {
  heuristicIncidentSummary,
  heuristicMaintenanceTriage,
  type IncidentSummaryResult,
  type TriageResult,
} from '../../lib/ai-copilot.js';

export type AiOpts = { env: Env; db: Db };

async function maybeGeminiJson<T>(
  _env: Env,
  system: string,
  user: string,
): Promise<T | null> {
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!key) return null;
  try {
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${system}\n\n${user}` }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

const aiRoutes: FastifyPluginAsync<AiOpts> = async (app, opts) => {
  const { env, db } = opts;

  app.post('/api/v1/ai/incident-summary', {
    schema: {
      tags: ['ai'],
      body: z.object({
        incidentId: UuidSchema.optional(),
        severity: z.string().optional(),
        status: z.string().optional(),
        evidence: z.array(z.string()).optional(),
        slaDeadline: z.string().optional(),
      }),
    },
    preHandler: [app.requireRoles(['agent', 'estate_manager', 'admin', 'trustee'])],
  }, async (req) => {
    const body = z
      .object({
        incidentId: UuidSchema.optional(),
        severity: z.string().optional(),
        status: z.string().optional(),
        evidence: z.array(z.string()).optional(),
        slaDeadline: z.string().optional(),
      })
      .parse(req.body);

    let severity = body.severity ?? 'medium';
    let status = body.status ?? 'open';
    let evidence = body.evidence ?? [];
    let slaDeadline = body.slaDeadline;

    if (body.incidentId) {
      const [row] = await db.select().from(incidents).where(eq(incidents.id, body.incidentId)).limit(1);
      if (!row || row.deletedAt) throw new NotFoundError('Incident not found');
      await app.requireSiteAccess(req, row.siteId);
      severity = row.severity;
      status = row.status;
      evidence = row.evidence ?? [];
      slaDeadline = row.slaDeadline.toISOString();
    }

    const fallback = heuristicIncidentSummary({ severity, status, evidence, slaDeadline });
    const gemini = await maybeGeminiJson<IncidentSummaryResult>(
      env,
      'You are a POPIA-safe security operations copilot. Never echo emails, phones, IDs, or tokens. Reply JSON: summary, urgency (immediate|high|normal|low), recommendedActions string[], redactions string[], model="gemini".',
      JSON.stringify({ severity, status, evidence, slaDeadline }),
    );

    const result = gemini
      ? { ...fallback, ...gemini, model: 'gemini' as const, redactions: gemini.redactions ?? fallback.redactions }
      : fallback;

    await app.audit({
      actorId: req.authUser!.id,
      action: 'ai.incident_summary',
      resourceType: 'incidents',
      resourceId: body.incidentId,
      correlationId: req.correlationId,
      payload: { model: result.model, urgency: result.urgency },
    });

    return result;
  });

  app.post('/api/v1/ai/maintenance-triage', {
    schema: {
      tags: ['ai'],
      body: z.object({
        ticketId: UuidSchema.optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        severity: z.string().optional(),
      }),
    },
    preHandler: [app.requireRoles(['agent', 'estate_manager', 'admin', 'vendor'])],
  }, async (req) => {
    const body = z
      .object({
        ticketId: UuidSchema.optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        severity: z.string().optional(),
      })
      .parse(req.body);

    let category = body.category ?? 'general';
    let description = body.description ?? '';
    let severity = body.severity;

    if (body.ticketId) {
      const [row] = await db.select().from(tickets).where(eq(tickets.id, body.ticketId)).limit(1);
      if (!row || row.deletedAt) throw new NotFoundError('Ticket not found');
      await app.requireSiteAccess(req, row.siteId);
      category = row.category;
      description = row.description;
      severity = row.severity ?? undefined;
    }

    const fallback = heuristicMaintenanceTriage({ category, description, severity });
    const gemini = await maybeGeminiJson<TriageResult>(
      env,
      'You are a POPIA-safe maintenance triage copilot. Never echo PII. Reply JSON: priority (P1-P4), suggestedAssigneeRole (agent|vendor|estate_manager), tags string[], rationale string, redactions string[], model="gemini".',
      JSON.stringify({ category, description, severity }),
    );

    const result = gemini
      ? { ...fallback, ...gemini, model: 'gemini' as const, redactions: gemini.redactions ?? fallback.redactions }
      : fallback;

    await app.audit({
      actorId: req.authUser!.id,
      action: 'ai.maintenance_triage',
      resourceType: 'tickets',
      resourceId: body.ticketId,
      correlationId: req.correlationId,
      payload: { model: result.model, priority: result.priority },
    });

    return result;
  });
};

export default aiRoutes;
