import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import type { Env } from '../../config/env.js';
import type { Db } from '../../db/client.js';
import { dataDeletionRequests } from '../../db/schema.js';
import { deletionQueue, exportsQueue } from '../../jobs/queues.js';
import { buildPopiaExportPackage, planUserDeletion } from '../../lib/popia-export.js';

export type PopiaOpts = { env: Env; db: Db };

/** Re-export for existing unit tests / worker imports. */
export { planUserDeletion } from '../../lib/popia-export.js';

const popiaRoutes: FastifyPluginAsync<PopiaOpts> = async (app, opts) => {
  const { env, db } = opts;

  app.get('/api/v1/popia/export', {
    schema: { tags: ['popia'] },
    preHandler: [app.authenticate],
  }, async (req) => {
    const userId = req.authUser!.id;
    const payload = await buildPopiaExportPackage(db, userId);

    await exportsQueue(env).add(
      'user-export',
      { userId, siteId: req.authUser!.siteIds[0] },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );

    await app.audit({
      actorId: userId,
      action: 'popia.export',
      resourceType: 'user',
      resourceId: userId,
      correlationId: req.correlationId,
    });

    return payload;
  });

  app.post('/api/v1/popia/deletion-request', {
    schema: {
      tags: ['popia'],
      body: z.object({ reason: z.string().max(2000).optional() }),
    },
    preHandler: [app.authenticate],
  }, async (req) => {
    const body = z.object({ reason: z.string().max(2000).optional() }).parse(req.body ?? {});
    const plan = planUserDeletion(req.authUser!.id);
    const [row] = await db
      .insert(dataDeletionRequests)
      .values({
        userId: req.authUser!.id,
        reason: body.reason,
        status: 'pending',
      })
      .returning();

    await deletionQueue(env).add(
      'forget-user',
      { requestId: row.id, userId: req.authUser!.id, plan },
      { attempts: 5, backoff: { type: 'exponential', delay: 2000 } },
    );

    await app.audit({
      actorId: req.authUser!.id,
      action: 'popia.deletion_request',
      resourceType: 'data_deletion_requests',
      resourceId: row.id,
      correlationId: req.correlationId,
      payload: { reason: body.reason },
    });

    return { request: row, plan };
  });
};

export default popiaRoutes;
