import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { and, eq, isNull, sql } from 'drizzle-orm';
import type { Env } from '../../config/env.js';
import type { Db } from '../../db/client.js';
import { files } from '../../db/schema.js';
import { createS3Client, ensureBucket, presignDownload, presignUpload, deleteObject } from '../../storage/minio.js';
import { UuidSchema, NonEmptyString } from '../../lib/pagination.js';
import { NotFoundError, QuotaExceededError, ForbiddenError } from '../../lib/errors.js';
import { isAdmin } from '../../lib/roles.js';

export type FilesOpts = { env: Env; db: Db };

const filesRoutes: FastifyPluginAsync<FilesOpts> = async (app, opts) => {
  const { env, db } = opts;
  const s3 = createS3Client(env);
  await ensureBucket(env, s3).catch(() => undefined);

  app.post('/api/v1/files/presign-upload', {
    schema: {
      tags: ['files'],
      body: z.object({
        siteId: UuidSchema,
        filename: NonEmptyString,
        mime: z.string().min(1).max(150),
        sizeBytes: z.number().int().positive().max(100_000_000),
      }),
    },
    preHandler: [app.authenticate],
  }, async (req) => {
    const body = z
      .object({
        siteId: UuidSchema,
        filename: NonEmptyString,
        mime: z.string().min(1).max(150),
        sizeBytes: z.number().int().positive().max(100_000_000),
      })
      .parse(req.body);

    await app.requireSiteAccess(req, body.siteId);

    const [{ total }] = await db
      .select({ total: sql<number>`coalesce(sum(${files.sizeBytes}), 0)` })
      .from(files)
      .where(and(eq(files.ownerId, req.authUser!.id), isNull(files.deletedAt)));

    if (Number(total) + body.sizeBytes > env.STORAGE_QUOTA_BYTES) {
      throw new QuotaExceededError('Storage quota exceeded', {
        used: Number(total),
        quota: env.STORAGE_QUOTA_BYTES,
      });
    }

    const objectKey = `${body.siteId}/${req.authUser!.id}/${crypto.randomUUID()}-${body.filename}`;
    const [row] = await db
      .insert(files)
      .values({
        siteId: body.siteId,
        ownerId: req.authUser!.id,
        bucket: env.MINIO_BUCKET,
        objectKey,
        filename: body.filename,
        mime: body.mime,
        sizeBytes: body.sizeBytes,
      })
      .returning();

    const uploadUrl = await presignUpload(env, s3, objectKey, body.mime);
    await app.audit({
      actorId: req.authUser!.id,
      action: 'files.presign_upload',
      resourceType: 'files',
      resourceId: row.id,
      siteId: body.siteId,
      correlationId: req.correlationId,
    });

    return { file: row, uploadUrl, expiresIn: 900 };
  });

  app.get('/api/v1/files/:id/presign-download', {
    schema: { tags: ['files'], params: z.object({ id: UuidSchema }) },
    preHandler: [app.authenticate],
  }, async (req) => {
    const { id } = z.object({ id: UuidSchema }).parse(req.params);
    const [row] = await db.select().from(files).where(eq(files.id, id)).limit(1);
    if (!row || row.deletedAt) throw new NotFoundError('File not found');
    if (!isAdmin(req.authUser!.roles) && row.ownerId !== req.authUser!.id) {
      await app.requireSiteAccess(req, row.siteId);
    }
    const downloadUrl = await presignDownload(env, s3, row.objectKey);
    return { file: row, downloadUrl, expiresIn: 900 };
  });

  app.get('/api/v1/files', {
    schema: { tags: ['files'], querystring: z.object({ siteId: UuidSchema.optional() }) },
    preHandler: [app.authenticate],
  }, async (req) => {
    const query = z.object({ siteId: UuidSchema.optional() }).parse(req.query);
    let rows = await db.select().from(files).where(isNull(files.deletedAt)).limit(100);
    if (query.siteId) {
      await app.requireSiteAccess(req, query.siteId);
      rows = rows.filter((r) => r.siteId === query.siteId);
    } else if (!isAdmin(req.authUser!.roles)) {
      rows = rows.filter(
        (r) => r.ownerId === req.authUser!.id || req.authUser!.siteIds.includes(r.siteId),
      );
    }
    return { data: rows };
  });

  app.delete('/api/v1/files/:id', {
    schema: { tags: ['files'], params: z.object({ id: UuidSchema }) },
    preHandler: [app.authenticate],
  }, async (req) => {
    const { id } = z.object({ id: UuidSchema }).parse(req.params);
    const [row] = await db.select().from(files).where(eq(files.id, id)).limit(1);
    if (!row || row.deletedAt) throw new NotFoundError('File not found');
    if (!isAdmin(req.authUser!.roles) && row.ownerId !== req.authUser!.id) {
      throw new ForbiddenError('Not file owner');
    }
    await deleteObject(env, s3, row.objectKey).catch(() => undefined);
    await db.update(files).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(files.id, id));
    return { ok: true };
  });
};

export default filesRoutes;
