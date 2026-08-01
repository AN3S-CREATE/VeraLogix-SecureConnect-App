import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { eq, isNull } from 'drizzle-orm';
import type { Env } from '../../config/env.js';
import type { Db } from '../../db/client.js';
import { tenants, tenantSubscriptions, sites } from '../../db/schema.js';
import { NonEmptyString, UuidSchema } from '../../lib/pagination.js';
import { NotFoundError } from '../../lib/errors.js';

export type TenantsOpts = { env: Env; db: Db };

const tenantsRoutes: FastifyPluginAsync<TenantsOpts> = async (app, opts) => {
  const { db } = opts;
  const adminOnly = [app.requireRoles(['admin'] as const)];

  app.get('/api/v1/tenants', {
    schema: { tags: ['tenants'] },
    preHandler: adminOnly,
  }, async () => {
    const rows = await db.select().from(tenants).where(isNull(tenants.deletedAt)).limit(200);
    return { data: rows };
  });

  app.post('/api/v1/tenants', {
    schema: {
      tags: ['tenants'],
      body: z.object({
        name: NonEmptyString,
        slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
        billingEmail: z.string().email().optional(),
        planCode: z.string().min(1).max(50).default('starter'),
        seats: z.number().int().min(1).max(10_000).default(5),
      }),
    },
    preHandler: adminOnly,
  }, async (req) => {
    const body = z
      .object({
        name: NonEmptyString,
        slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
        billingEmail: z.string().email().optional(),
        planCode: z.string().min(1).max(50).default('starter'),
        seats: z.number().int().min(1).max(10_000).default(5),
      })
      .parse(req.body);

    const [tenant] = await db
      .insert(tenants)
      .values({
        name: body.name,
        slug: body.slug,
        billingEmail: body.billingEmail,
        planCode: body.planCode,
      })
      .returning();

    const renews = new Date();
    renews.setDate(renews.getDate() + 30);
    const [subscription] = await db
      .insert(tenantSubscriptions)
      .values({
        tenantId: tenant.id,
        planCode: body.planCode,
        status: 'trialing',
        seats: body.seats,
        renewsAt: renews,
      })
      .returning();

    await app.audit({
      actorId: req.authUser!.id,
      action: 'tenants.create',
      resourceType: 'tenants',
      resourceId: tenant.id,
      correlationId: req.correlationId,
    });

    return { tenant, subscription };
  });

  app.patch('/api/v1/tenants/:id', {
    schema: {
      tags: ['tenants'],
      params: z.object({ id: UuidSchema }),
      body: z.object({
        name: NonEmptyString.optional(),
        billingEmail: z.string().email().optional(),
        planCode: z.string().min(1).max(50).optional(),
      }),
    },
    preHandler: adminOnly,
  }, async (req) => {
    const { id } = z.object({ id: UuidSchema }).parse(req.params);
    const body = z
      .object({
        name: NonEmptyString.optional(),
        billingEmail: z.string().email().optional(),
        planCode: z.string().min(1).max(50).optional(),
      })
      .parse(req.body);
    const [existing] = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
    if (!existing || existing.deletedAt) throw new NotFoundError('Tenant not found');
    const [updated] = await db
      .update(tenants)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(tenants.id, id))
      .returning();
    return updated;
  });

  app.post('/api/v1/tenants/:id/attach-site', {
    schema: {
      tags: ['tenants'],
      params: z.object({ id: UuidSchema }),
      body: z.object({ siteId: UuidSchema }),
    },
    preHandler: adminOnly,
  }, async (req) => {
    const { id } = z.object({ id: UuidSchema }).parse(req.params);
    const { siteId } = z.object({ siteId: UuidSchema }).parse(req.body);
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
    if (!tenant || tenant.deletedAt) throw new NotFoundError('Tenant not found');
    const [site] = await db.select().from(sites).where(eq(sites.id, siteId)).limit(1);
    if (!site || site.deletedAt) throw new NotFoundError('Site not found');
    const [updated] = await db
      .update(sites)
      .set({ tenantId: id, updatedAt: new Date() })
      .where(eq(sites.id, siteId))
      .returning();
    return updated;
  });

  app.get('/api/v1/tenants/:id/subscriptions', {
    schema: { tags: ['tenants'], params: z.object({ id: UuidSchema }) },
    preHandler: adminOnly,
  }, async (req) => {
    const { id } = z.object({ id: UuidSchema }).parse(req.params);
    const rows = await db
      .select()
      .from(tenantSubscriptions)
      .where(eq(tenantSubscriptions.tenantId, id));
    return { data: rows };
  });
};

export default tenantsRoutes;
