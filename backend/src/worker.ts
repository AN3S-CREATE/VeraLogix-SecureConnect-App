import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import { eq } from 'drizzle-orm';
import { loadEnv } from './config/env.js';
import { createLogger } from './config/logger.js';
import { createDb } from './db/client.js';
import {
  QUEUE_NAMES,
  redisConnection,
} from './jobs/queues.js';
import {
  users,
  consents,
  accessLogs,
  bookings,
  invoices,
  tickets,
  evSessions,
  files,
  userSiteRoles,
  dataDeletionRequests,
} from './db/schema.js';
import { planUserDeletion } from './modules/popia/routes.js';

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });

async function main() {
  const env = loadEnv();
  const log = createLogger(env);
  const { db } = createDb(env);
  const connection = redisConnection(env);

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
  });

  new Worker(
    QUEUE_NAMES.email,
    async (job) => {
      const data = job.data as { to: string; subject: string; text: string; html?: string };
      await transporter.sendMail({
        from: env.SMTP_FROM,
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.html,
      });
      log.info({ jobId: job.id, to: data.to }, 'Email sent');
    },
    {
      connection,
      settings: {
        backoffStrategy: (attemptsMade) => Math.min(60_000, 1000 * 2 ** attemptsMade),
      },
    },
  );

  new Worker(
    QUEUE_NAMES.deletion,
    async (job) => {
      const { requestId, userId } = job.data as { requestId: string; userId: string };
      const plan = planUserDeletion(userId);
      log.info({ requestId, plan }, 'Processing POPIA deletion');

      try {
        await db.transaction(async (tx) => {
          await tx
            .update(dataDeletionRequests)
            .set({ status: 'processing' })
            .where(eq(dataDeletionRequests.id, requestId));

          await tx
            .update(accessLogs)
            .set({ userId: null, name: 'anonymized', updatedAt: new Date() })
            .where(eq(accessLogs.userId, userId));

          const now = new Date();
          await tx.update(bookings).set({ deletedAt: now, updatedAt: now }).where(eq(bookings.userId, userId));
          await tx.update(invoices).set({ deletedAt: now, updatedAt: now }).where(eq(invoices.userId, userId));
          await tx.update(tickets).set({ deletedAt: now, updatedAt: now }).where(eq(tickets.assignee, userId));
          await tx.update(evSessions).set({ deletedAt: now, updatedAt: now }).where(eq(evSessions.userId, userId));
          await tx.update(files).set({ deletedAt: now, updatedAt: now }).where(eq(files.ownerId, userId));
          await tx
            .update(consents)
            .set({ withdrawnAt: now })
            .where(eq(consents.userId, userId));
          await tx.delete(userSiteRoles).where(eq(userSiteRoles.userId, userId));
          await tx
            .update(users)
            .set({
              deletedAt: now,
              updatedAt: now,
              email: `deleted-${userId}@anonymized.local`,
              name: 'Deleted User',
            })
            .where(eq(users.id, userId));

          await tx
            .update(dataDeletionRequests)
            .set({ status: 'completed', processedAt: now, notes: plan.steps.join(',') })
            .where(eq(dataDeletionRequests.id, requestId));
        });

        log.info({ requestId, userId }, 'POPIA deletion completed');
      } catch (err) {
        // Transaction rolls back partial anonymization; BullMQ can retry.
        log.error({ err, requestId, userId }, 'POPIA deletion failed — transaction rolled back');
        throw err;
      }
    },
    { connection },
  );

  new Worker(
    QUEUE_NAMES.exports,
    async (job) => {
      log.info({ jobId: job.id, data: job.data }, 'Export job acknowledged');
    },
    { connection },
  );

  new Worker(
    QUEUE_NAMES.imageProcess,
    async (job) => {
      log.info({ jobId: job.id, data: job.data }, 'Image process stub');
    },
    { connection },
  );

  new Worker(
    QUEUE_NAMES.slaCheck,
    async (job) => {
      log.info({ jobId: job.id, data: job.data }, 'SLA check stub');
    },
    { connection },
  );

  log.info('Workers started');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
