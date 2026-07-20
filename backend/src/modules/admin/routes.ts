import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import type { Env } from '../../config/env.js';
import type { Db } from '../../db/client.js';
import { auditLogs, files, users, dataDeletionRequests } from '../../db/schema.js';
import { QUEUE_NAMES, emailQueue, deletionQueue, exportsQueue, slaCheckQueue } from '../../jobs/queues.js';
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
};

export default adminRoutes;
