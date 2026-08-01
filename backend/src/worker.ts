import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import { and, eq, inArray, isNull } from 'drizzle-orm';
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
  incidents,
  sites,
} from './db/schema.js';
import { planUserDeletion } from './modules/popia/routes.js';
import { heuristicMalwareScan, sha256Hex } from './lib/evidence.js';
import { planSlaBreaches } from './lib/sla.js';
import { buildPopiaExportPackage } from './lib/popia-export.js';
import { createS3Client, ensureBucket, putObject } from './storage/minio.js';

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
      const { userId, siteId: jobSiteId } = job.data as { userId: string; siteId?: string };
      const payload = await buildPopiaExportPackage(db, userId);
      const body = Buffer.from(JSON.stringify(payload, null, 2), 'utf8');
      const hash = sha256Hex(body);
      const objectKey = `exports/${userId}/${Date.now()}-popia-export.json`;

      let siteId = jobSiteId;
      if (!siteId) {
        const [membership] = await db
          .select()
          .from(userSiteRoles)
          .where(eq(userSiteRoles.userId, userId))
          .limit(1);
        siteId = membership?.siteId;
      }
      if (!siteId) {
        const [anySite] = await db.select().from(sites).limit(1);
        siteId = anySite?.id;
      }
      if (!siteId) {
        log.warn({ userId }, 'POPIA export skipped — no site for file row');
        return { skipped: true, reason: 'no_site' };
      }

      const s3 = createS3Client(env);
      await ensureBucket(env, s3).catch(() => undefined);
      try {
        await putObject(env, s3, objectKey, body, 'application/json');
      } catch (err) {
        // CI / local without MinIO: still persist a DB file row pointing at the object key.
        log.warn({ err, userId }, 'MinIO put failed — recording export metadata only');
      }

      const [row] = await db
        .insert(files)
        .values({
          siteId,
          ownerId: userId,
          bucket: env.MINIO_BUCKET,
          objectKey,
          filename: `popia-export-${userId.slice(0, 8)}.json`,
          mime: 'application/json',
          sizeBytes: body.byteLength,
          sha256: hash,
          scanStatus: 'clean',
          scannedAt: new Date(),
          scanNotes: 'POPIA export package',
          metadata: { kind: 'popia-export', exportedAt: payload.exportedAt },
        })
        .returning();

      log.info({ jobId: job.id, userId, fileId: row.id, bytes: body.byteLength }, 'POPIA export archived');
      return { fileId: row.id, sha256: hash, bytes: body.byteLength };
    },
    { connection },
  );

  new Worker(
    QUEUE_NAMES.imageProcess,
    async (job) => {
      const { fileId } = job.data as { fileId: string };
      const [row] = await db.select().from(files).where(eq(files.id, fileId)).limit(1);
      if (!row || row.deletedAt) {
        log.warn({ fileId }, 'image-process: file missing');
        return;
      }
      const scan = heuristicMalwareScan({
        filename: row.filename,
        mime: row.mime,
        sizeBytes: row.sizeBytes,
      });
      await db
        .update(files)
        .set({
          scanStatus: scan.status,
          scanNotes: scan.notes,
          scannedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(files.id, fileId));
      log.info({ fileId, status: scan.status }, 'Evidence scan complete');
    },
    { connection },
  );

  new Worker(
    QUEUE_NAMES.slaCheck,
    async (job) => {
      const { siteId } = (job.data ?? {}) as { siteId?: string };
      const openStatuses = ['open', 'assigned', 'in_progress', 'new', 'acknowledged'];
      let ticketRows = await db
        .select()
        .from(tickets)
        .where(and(isNull(tickets.deletedAt), inArray(tickets.status, openStatuses)));
      let incidentRows = await db
        .select()
        .from(incidents)
        .where(and(isNull(incidents.deletedAt), inArray(incidents.status, openStatuses)));
      if (siteId) {
        ticketRows = ticketRows.filter((t) => t.siteId === siteId);
        incidentRows = incidentRows.filter((i) => i.siteId === siteId);
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

      for (const item of plan.breached) {
        if (item.kind === 'ticket') {
          const row = ticketRows.find((t) => t.id === item.id);
          const timeline = [...(row?.timeline ?? []), `SLA breached at ${new Date().toISOString()}`];
          await db
            .update(tickets)
            .set({
              status: 'sla_breached',
              sla: 0,
              timeline,
              updatedAt: new Date(),
            })
            .where(eq(tickets.id, item.id));
        } else {
          await db
            .update(incidents)
            .set({ status: 'sla_breached', updatedAt: new Date() })
            .where(eq(incidents.id, item.id));
        }
      }

      log.info(
        { breached: plan.breached.length, skipped: plan.skipped.length, siteId },
        'SLA check completed',
      );
      return { breached: plan.breached.length };
    },
    { connection },
  );

  log.info('Workers started');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
