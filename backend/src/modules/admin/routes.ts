import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { and, desc, eq, isNull, sql, lt, inArray } from 'drizzle-orm';
import type { Env } from '../../config/env.js';
import type { Db } from '../../db/client.js';
import {
  auditLogs,
  files,
  users,
  dataDeletionRequests,
  tickets,
  incidents,
} from '../../db/schema.js';
import { QUEUE_NAMES, emailQueue, deletionQueue, exportsQueue, slaCheckQueue } from '../../jobs/queues.js';
import { planSlaBreaches } from '../../lib/sla.js';
import { UuidSchema } from '../../lib/pagination.js';

export type AdminOpts = { env: Env; db: Db };

const adminRoutes: FastifyPluginAsync<AdminOpts> = async (app, opts) => {
  const { env, db } = opts;
  const pre = [app.requireRoles(['admin', 'estate_manager'] as const)];

  app.get('/api/v1/admin/users', { schema: { tags: ['admin'] }, preHandler: pre }, async () => {
    const rows = await db.select().from(users).limit(500);
    return { data: rows.filter((u) => !u.deletedAt) };
  });

  app.get('/api/v1/admin/storage/usage', {
    schema: { tags: ['admin'], querystring: z.object({ siteId: UuidSchema.optional() }) },
    preHandler: pre,
  }, async (req) => {
    const query = z.object({ siteId: UuidSchema.optional() }).parse(req.query);
    const conditions = [isNull(files.deletedAt)];
    if (query.siteId) conditions.push(eq(files.siteId, query.siteId));
    const [agg] = await db
      .select({
        totalBytes: sql<number>`coalesce(sum(${files.sizeBytes}), 0)`,
        fileCount: sql<number>`count(*)`,
      })
      .from(files)
      .where(and(...conditions));
    return {
      totalBytes: Number(agg.totalBytes),
      fileCount: Number(agg.fileCount),
      quotaBytes: env.STORAGE_QUOTA_BYTES,
    };
  });

  app.get('/api/v1/admin/audit', {
    schema: {
      tags: ['admin'],
      querystring: z.object({
        limit: z.coerce.number().int().min(1).max(200).default(50),
        actorId: UuidSchema.optional(),
      }),
    },
    preHandler: pre,
  }, async (req) => {
    const query = z
      .object({
        limit: z.coerce.number().int().min(1).max(200).default(50),
        actorId: UuidSchema.optional(),
      })
      .parse(req.query);
    let q = db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(query.limit);
    const rows = query.actorId
      ? await db
          .select()
          .from(auditLogs)
          .where(eq(auditLogs.actorId, query.actorId))
          .orderBy(desc(auditLogs.createdAt))
          .limit(query.limit)
      : await q;
    return { data: rows };
  });

  app.get('/api/v1/admin/jobs', { schema: { tags: ['admin'] }, preHandler: pre }, async () => {
    const queues = [
      emailQueue(env),
      exportsQueue(env),
      deletionQueue(env),
      slaCheckQueue(env),
    ];
    const names = [
      QUEUE_NAMES.email,
      QUEUE_NAMES.exports,
      QUEUE_NAMES.deletion,
      QUEUE_NAMES.slaCheck,
    ];
    const data = [];
    for (let i = 0; i < queues.length; i++) {
      const counts = await queues[i].getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
      data.push({ name: names[i], counts });
      await queues[i].close();
    }
    return { data };
  });

  app.get('/api/v1/admin/deletion-requests', {
    schema: { tags: ['admin'] },
    preHandler: pre,
  }, async () => {
    const rows = await db.select().from(dataDeletionRequests).orderBy(desc(dataDeletionRequests.requestedAt)).limit(100);
    return { data: rows };
  });

  app.post('/api/v1/admin/jobs/sla-check', {
    schema: { tags: ['admin'], body: z.object({ siteId: UuidSchema.optional() }).optional() },
    preHandler: pre,
  }, async (req) => {
    const body = z.object({ siteId: UuidSchema.optional() }).parse(req.body ?? {});
    const job = await slaCheckQueue(env).add(
      'run',
      { siteId: body.siteId, requestedBy: req.authUser!.id },
      { removeOnComplete: 50, removeOnFail: 20 },
    );
    await app.audit({
      actorId: req.authUser!.id,
      action: 'admin.sla_check_enqueue',
      resourceType: 'jobs',
      resourceId: String(job.id),
      correlationId: req.correlationId,
      payload: body,
    });
    return { ok: true, jobId: job.id };
  });

  app.get('/api/v1/admin/sla/breaches', {
    schema: {
      tags: ['admin'],
      querystring: z.object({ siteId: UuidSchema.optional() }),
    },
    preHandler: pre,
  }, async (req) => {
    const query = z.object({ siteId: UuidSchema.optional() }).parse(req.query);
    const openStatuses = ['open', 'assigned', 'in_progress', 'new', 'acknowledged', 'sla_breached'];
    let ticketRows = await db
      .select()
      .from(tickets)
      .where(and(isNull(tickets.deletedAt), inArray(tickets.status, openStatuses), lt(tickets.slaDeadline, new Date())))
      .limit(200);
    let incidentRows = await db
      .select()
      .from(incidents)
      .where(and(isNull(incidents.deletedAt), inArray(incidents.status, openStatuses), lt(incidents.slaDeadline, new Date())))
      .limit(200);
    if (query.siteId) {
      ticketRows = ticketRows.filter((t) => t.siteId === query.siteId);
      incidentRows = incidentRows.filter((i) => i.siteId === query.siteId);
    }
    const plan = planSlaBreaches([
      ...ticketRows.map((t) => ({
        id: t.id,
        siteId: t.siteId,
        status: t.status,
        slaDeadline: t.slaDeadline,
        kind: 'ticket' as const,
      })),
      ...incidentRows.map((i) => ({
        id: i.id,
        siteId: i.siteId,
        status: i.status,
        slaDeadline: i.slaDeadline,
        kind: 'incident' as const,
      })),
    ]);
    return {
      data: plan.breached,
      meta: { ticketCount: ticketRows.length, incidentCount: incidentRows.length },
    };
  });
};

export default adminRoutes;
