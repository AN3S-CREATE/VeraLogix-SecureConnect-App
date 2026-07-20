import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { Env } from '../../config/env.js';
import type { Db } from '../../db/client.js';
import {
  users,
  consents,
  accessLogs,
  bookings,
  invoices,
  tickets,
  evSessions,
  files,
  dataDeletionRequests,
  userSiteRoles,
} from '../../db/schema.js';
import { deletionQueue, exportsQueue } from '../../jobs/queues.js';
import { NotFoundError } from '../../lib/errors.js';

export type PopiaOpts = { env: Env; db: Db };

/**
 * POPIA helpers: consent already under auth; export + right-to-be-forgotten here.
 */
export function planUserDeletion(userId: string) {
  return {
    userId,
    steps: [
      'anonymize_access_logs',
      'soft_delete_bookings',
      'soft_delete_invoices',
      'soft_delete_tickets',
      'soft_delete_ev_sessions',
      'soft_delete_files',
      'withdraw_consents',
      'remove_site_roles',
      'soft_delete_user',
    ],
  };
}

const popiaRoutes: FastifyPluginAsync<PopiaOpts> = async (app, opts) => {
  const { env, db } = opts;

  app.get('/api/v1/popia/export', {
    schema: { tags: ['popia'] },
    preHandler: [app.authenticate],
  }, async (req) => {
    const userId = req.authUser!.id;
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new NotFoundError('User not found');

    const [userConsents, logs, userBookings, userInvoices, userTickets, userEv, userFiles, roles] =
      await Promise.all([
        db.select().from(consents).where(eq(consents.userId, userId)),
        db.select().from(accessLogs).where(eq(accessLogs.userId, userId)).limit(1000),
        db.select().from(bookings).where(eq(bookings.userId, userId)),
        db.select().from(invoices).where(eq(invoices.userId, userId)),
        db.select().from(tickets).where(eq(tickets.assignee, userId)),
        db.select().from(evSessions).where(eq(evSessions.userId, userId)),
        db.select().from(files).where(eq(files.ownerId, userId)),
        db.select().from(userSiteRoles).where(eq(userSiteRoles.userId, userId)),
      ]);

    await exportsQueue(env).add('user-export', { userId });

    await app.audit({
      actorId: userId,
      action: 'popia.export',
      resourceType: 'user',
      resourceId: userId,
      correlationId: req.correlationId,
    });

    return {
      exportedAt: new Date().toISOString(),
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      consents: userConsents,
      roles,
      accessLogs: logs,
      bookings: userBookings,
      invoices: userInvoices,
      tickets: userTickets,
      evSessions: userEv,
      files: userFiles.map((f) => ({
        id: f.id,
        filename: f.filename,
        mime: f.mime,
        sizeBytes: f.sizeBytes,
        createdAt: f.createdAt,
      })),
    };
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
