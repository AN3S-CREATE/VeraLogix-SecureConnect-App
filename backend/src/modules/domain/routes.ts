import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import { sites, units, doors, accessLogs, passes, amenities, bookings, invoices, tickets, incidents, energyReadings, evSessions, users, userSiteRoles } from '../../db/schema.js';
import { registerCrudRoutes } from '../../lib/crud-factory.js';
import { NonEmptyString, UuidSchema } from '../../lib/pagination.js';
import { RoleSchema } from '../../lib/roles.js';
import { NotFoundError } from '../../lib/errors.js';
import { cacheSet, cacheDel } from '../../lib/cache.js';
import type { Env } from '../../config/env.js';

export type DomainOpts = { db: Db; env?: Env };

const domainRoutes: FastifyPluginAsync<DomainOpts> = async (app, opts) => {
  const { db } = opts;

  registerCrudRoutes(app, {
    prefix: '/api/v1/sites',
    tag: 'sites',
    table: sites as never,
    db,
    createSchema: z.object({ name: NonEmptyString, slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/) }),
    updateSchema: z.object({ name: NonEmptyString.optional(), slug: z.string().min(1).max(100).optional() }),
    writeRoles: ['admin', 'estate_manager'],
    readRoles: ['resident', 'agent', 'trustee', 'vendor', 'estate_manager', 'admin'],
  });

  registerCrudRoutes(app, {
    prefix: '/api/v1/units',
    tag: 'units',
    table: units as never,
    db,
    createSchema: z.object({ siteId: UuidSchema, label: NonEmptyString }),
    updateSchema: z.object({ label: NonEmptyString.optional() }),
  });

  registerCrudRoutes(app, {
    prefix: '/api/v1/doors',
    tag: 'doors',
    table: doors as never,
    db,
    createSchema: z.object({
      siteId: UuidSchema,
      name: NonEmptyString,
      state: z.enum(['locked', 'unlocked']).default('locked'),
      proximityReady: z.boolean().default(false),
      health: z.string().default('ok'),
    }),
    updateSchema: z.object({
      name: NonEmptyString.optional(),
      state: z.enum(['locked', 'unlocked']).optional(),
      proximityReady: z.boolean().optional(),
      health: z.string().optional(),
    }),
    writeRoles: ['agent', 'estate_manager', 'admin'],
    readRoles: ['resident', 'agent', 'trustee', 'estate_manager', 'admin'],
  });

  app.post('/api/v1/doors/:id/unlock', {
    schema: {
      tags: ['doors'],
      params: z.object({ id: UuidSchema }),
      body: z.object({ result: z.enum(['granted', 'denied']).default('granted') }).optional(),
    },
    preHandler: [app.requireRoles(['resident', 'agent', 'estate_manager', 'admin'])],
  }, async (req) => {
    const { id } = z.object({ id: UuidSchema }).parse(req.params);
    const body = z.object({ result: z.enum(['granted', 'denied']).default('granted') }).parse(req.body ?? {});
    const [door] = await db.select().from(doors).where(eq(doors.id, id)).limit(1);
    if (!door || door.deletedAt) throw new NotFoundError('Door not found');
    await app.requireSiteAccess(req, door.siteId);

    const [updated] = await db
      .update(doors)
      .set({ state: body.result === 'granted' ? 'unlocked' : door.state, updatedAt: new Date() })
      .where(eq(doors.id, id))
      .returning();

    const [log] = await db
      .insert(accessLogs)
      .values({
        siteId: door.siteId,
        doorId: door.id,
        userId: req.authUser!.id,
        result: body.result,
        name: req.authUser!.name,
        location: door.name,
      })
      .returning();

    if (opts.env) {
      await cacheDel(opts.env, `doors:site:${door.siteId}`);
      await cacheSet(opts.env, `door:${door.id}`, updated, 30);
    }

    await app.audit({
      actorId: req.authUser!.id,
      action: 'doors.unlock',
      resourceType: 'doors',
      resourceId: id,
      siteId: door.siteId,
      correlationId: req.correlationId,
      payload: { result: body.result },
    });

    return { door: updated, accessLog: log };
  });

  registerCrudRoutes(app, {
    prefix: '/api/v1/access-logs',
    tag: 'access-logs',
    table: accessLogs as never,
    db,
    createSchema: z.object({
      siteId: UuidSchema,
      doorId: UuidSchema,
      result: z.enum(['granted', 'denied']),
      name: z.string().optional(),
      location: z.string().optional(),
      userId: UuidSchema.optional(),
    }),
    updateSchema: z.object({
      result: z.enum(['granted', 'denied']).optional(),
      name: z.string().optional(),
      location: z.string().optional(),
    }),
    writeRoles: ['resident', 'agent', 'estate_manager', 'admin'],
    readRoles: ['resident', 'agent', 'trustee', 'estate_manager', 'admin'],
  });

  registerCrudRoutes(app, {
    prefix: '/api/v1/passes',
    tag: 'passes',
    table: passes as never,
    db,
    createSchema: z.object({
      siteId: UuidSchema,
      unitId: UuidSchema,
      code: NonEmptyString,
      areas: z.array(z.string()).default([]),
      start: z.coerce.date(),
      end: z.coerce.date(),
      status: z.enum(['active', 'expired']).default('active'),
    }),
    updateSchema: z.object({
      areas: z.array(z.string()).optional(),
      start: z.coerce.date().optional(),
      end: z.coerce.date().optional(),
      status: z.enum(['active', 'expired']).optional(),
    }),
  });

  registerCrudRoutes(app, {
    prefix: '/api/v1/amenities',
    tag: 'amenities',
    table: amenities as never,
    db,
    createSchema: z.object({
      siteId: UuidSchema,
      name: NonEmptyString,
      rules: z.string().default(''),
      priceRuleId: z.string().default('default'),
      photos: z.array(z.string()).default([]),
    }),
    updateSchema: z.object({
      name: NonEmptyString.optional(),
      rules: z.string().optional(),
      priceRuleId: z.string().optional(),
      photos: z.array(z.string()).optional(),
    }),
  });

  registerCrudRoutes(app, {
    prefix: '/api/v1/bookings',
    tag: 'bookings',
    table: bookings as never,
    db,
    createSchema: z.object({
      siteId: UuidSchema,
      amenityId: UuidSchema,
      userId: UuidSchema,
      slotStart: z.coerce.date(),
      slotEnd: z.coerce.date(),
      price: z.union([z.string(), z.number()]).default(0),
      status: z.enum(['confirmed', 'cancelled']).default('confirmed'),
    }),
    updateSchema: z.object({
      slotStart: z.coerce.date().optional(),
      slotEnd: z.coerce.date().optional(),
      price: z.union([z.string(), z.number()]).optional(),
      status: z.enum(['confirmed', 'cancelled']).optional(),
    }),
    writeRoles: ['resident', 'agent', 'estate_manager', 'admin'],
  });

  registerCrudRoutes(app, {
    prefix: '/api/v1/invoices',
    tag: 'invoices',
    table: invoices as never,
    db,
    createSchema: z.object({
      siteId: UuidSchema,
      userId: UuidSchema,
      amount: z.union([z.string(), z.number()]),
      due: z.coerce.date(),
      status: z.enum(['paid', 'unpaid']).default('unpaid'),
      ledger: z.array(z.string()).default([]),
    }),
    updateSchema: z.object({
      amount: z.union([z.string(), z.number()]).optional(),
      due: z.coerce.date().optional(),
      status: z.enum(['paid', 'unpaid']).optional(),
      ledger: z.array(z.string()).optional(),
    }),
    writeRoles: ['vendor', 'trustee', 'estate_manager', 'admin'],
  });

  registerCrudRoutes(app, {
    prefix: '/api/v1/tickets',
    tag: 'tickets',
    table: tickets as never,
    db,
    createSchema: z.object({
      siteId: UuidSchema,
      unitId: UuidSchema,
      category: NonEmptyString,
      description: NonEmptyString,
      media: z.array(z.string()).optional(),
      status: z.string().default('open'),
      slaDeadline: z.coerce.date(),
      timeline: z.array(z.string()).default([]),
      severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
      assignee: UuidSchema.optional(),
      sla: z.number().int().optional(),
    }),
    updateSchema: z.object({
      category: NonEmptyString.optional(),
      description: NonEmptyString.optional(),
      media: z.array(z.string()).optional(),
      status: z.string().optional(),
      slaDeadline: z.coerce.date().optional(),
      timeline: z.array(z.string()).optional(),
      severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
      assignee: UuidSchema.optional(),
      sla: z.number().int().optional(),
    }),
    writeRoles: ['resident', 'agent', 'vendor', 'estate_manager', 'admin'],
  });

  registerCrudRoutes(app, {
    prefix: '/api/v1/incidents',
    tag: 'incidents',
    table: incidents as never,
    db,
    createSchema: z.object({
      siteId: UuidSchema,
      severity: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
      status: z.string().default('open'),
      slaDeadline: z.coerce.date(),
      evidence: z.array(z.string()).default([]),
      relatedIds: z.array(z.string()).optional(),
    }),
    updateSchema: z.object({
      severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
      status: z.string().optional(),
      slaDeadline: z.coerce.date().optional(),
      evidence: z.array(z.string()).optional(),
      relatedIds: z.array(z.string()).optional(),
    }),
  });

  registerCrudRoutes(app, {
    prefix: '/api/v1/energy',
    tag: 'energy',
    table: energyReadings as never,
    db,
    createSchema: z.object({
      siteId: UuidSchema,
      ts: z.coerce.date().optional(),
      kwh: z.union([z.string(), z.number()]),
      waterL: z.union([z.string(), z.number()]),
      iaqIndex: z.number().int(),
      zone: NonEmptyString,
    }),
    updateSchema: z.object({
      kwh: z.union([z.string(), z.number()]).optional(),
      waterL: z.union([z.string(), z.number()]).optional(),
      iaqIndex: z.number().int().optional(),
      zone: NonEmptyString.optional(),
    }),
    writeRoles: ['agent', 'estate_manager', 'admin'],
  });

  registerCrudRoutes(app, {
    prefix: '/api/v1/ev-sessions',
    tag: 'ev-sessions',
    table: evSessions as never,
    db,
    createSchema: z.object({
      siteId: UuidSchema,
      bayId: NonEmptyString,
      userId: UuidSchema,
      kwh: z.union([z.string(), z.number()]).default(0),
      cost: z.union([z.string(), z.number()]).default(0),
      status: z.enum(['charging', 'completed']).default('charging'),
      startedAt: z.coerce.date().optional(),
      endedAt: z.coerce.date().optional(),
    }),
    updateSchema: z.object({
      kwh: z.union([z.string(), z.number()]).optional(),
      cost: z.union([z.string(), z.number()]).optional(),
      status: z.enum(['charging', 'completed']).optional(),
      endedAt: z.coerce.date().optional(),
    }),
    writeRoles: ['resident', 'agent', 'estate_manager', 'admin'],
  });

  // Users list (admin)
  app.get('/api/v1/users', {
    schema: { tags: ['users'] },
    preHandler: [app.requireRoles(['admin', 'estate_manager'])],
  }, async () => {
    const rows = await db.select().from(users).where(eq(users.deletedAt, null as never)).limit(200).catch(async () => {
      return db.select().from(users).limit(200);
    });
    return { data: rows.filter((u) => !u.deletedAt) };
  });

  app.post('/api/v1/users/:id/roles', {
    schema: {
      tags: ['users'],
      params: z.object({ id: UuidSchema }),
      body: z.object({ siteId: UuidSchema, role: RoleSchema }),
    },
    preHandler: [app.requireRoles(['admin', 'estate_manager'])],
  }, async (req) => {
    const { id } = z.object({ id: UuidSchema }).parse(req.params);
    const body = z.object({ siteId: UuidSchema, role: RoleSchema }).parse(req.body);
    const [row] = await db
      .insert(userSiteRoles)
      .values({ userId: id, siteId: body.siteId, role: body.role })
      .onConflictDoNothing()
      .returning();
    await app.audit({
      actorId: req.authUser!.id,
      action: 'users.assign_role',
      resourceType: 'users',
      resourceId: id,
      siteId: body.siteId,
      correlationId: req.correlationId,
      payload: body,
    });
    return row ?? { ok: true };
  });
};

export default domainRoutes;
