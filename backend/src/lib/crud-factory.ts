import type { FastifyInstance, FastifyPluginAsync, RouteHandlerMethod } from 'fastify';
import { and, eq, gt, isNull, SQL } from 'drizzle-orm';
import type { PgTable, TableConfig } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import type { Db } from '../db/client.js';
import { CursorPaginationQuery } from '../lib/pagination.js';
import { NotFoundError, ForbiddenError } from '../lib/errors.js';
import { isAdmin, type Role } from '../lib/roles.js';

type AnyTable = PgTable<TableConfig> & {
  id: { name: string };
  siteId?: { name: string };
  deletedAt?: { name: string };
  createdAt?: { name: string };
};

export type CrudFactoryOpts<TCreate extends z.ZodTypeAny, TUpdate extends z.ZodTypeAny> = {
  prefix: string;
  tag: string;
  table: AnyTable;
  createSchema: TCreate;
  updateSchema: TUpdate;
  db: Db;
  readRoles?: Role[];
  writeRoles?: Role[];
  mapRow?: (row: Record<string, unknown>) => Record<string, unknown>;
};

export function registerCrudRoutes<TCreate extends z.ZodTypeAny, TUpdate extends z.ZodTypeAny>(
  app: FastifyInstance,
  opts: CrudFactoryOpts<TCreate, TUpdate>,
): void {
  const {
    prefix,
    tag,
    table,
    createSchema,
    updateSchema,
    db,
    readRoles = ['resident', 'agent', 'trustee', 'vendor', 'estate_manager', 'admin'],
    writeRoles = ['agent', 'estate_manager', 'admin'],
    mapRow = (r) => r,
  } = opts;

  const hasSite = 'siteId' in table;
  const hasSoftDelete = 'deletedAt' in table;
  const hasUpdatedAt = 'updatedAt' in table;

  app.get(prefix, {
    schema: { tags: [tag], querystring: CursorPaginationQuery },
    preHandler: [app.requireRoles(readRoles)],
  }, async (req) => {
    const query = CursorPaginationQuery.parse(req.query);
    const user = req.authUser!;
    const conditions: SQL[] = [];

    if (hasSoftDelete) {
      conditions.push(isNull((table as { deletedAt: typeof table.deletedAt }).deletedAt!));
    }
    if (hasSite) {
      const siteCol = (table as { siteId: typeof table.siteId }).siteId!;
      if (query.siteId) {
        if (!isAdmin(user.roles) && !user.siteIds.includes(query.siteId)) {
          throw new ForbiddenError('No access to this site');
        }
        conditions.push(eq(siteCol, query.siteId));
      } else if (!isAdmin(user.roles)) {
        if (user.siteIds.length === 0) return { data: [], meta: { nextCursor: null, limit: query.limit } };
        // Filter in app layer for simplicity when multiple sites
      }
    }
    if (query.cursor) {
      conditions.push(gt(table.id as never, query.cursor));
    }

    let rows = await db
      .select()
      .from(table as never)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(table.id as never)
      .limit(query.limit + 1);

    if (hasSite && !query.siteId && !isAdmin(user.roles)) {
      rows = rows.filter((r) => user.siteIds.includes((r as { siteId: string }).siteId));
    }

    const hasMore = rows.length > query.limit;
    const page = hasMore ? rows.slice(0, query.limit) : rows;
    const nextCursor = hasMore ? String((page[page.length - 1] as { id: string }).id) : null;
    return {
      data: page.map((r) => mapRow(r as Record<string, unknown>)),
      meta: { nextCursor, limit: query.limit },
    };
  });

  app.get(`${prefix}/:id`, {
    schema: { tags: [tag], params: z.object({ id: z.string().uuid() }) },
    preHandler: [app.requireRoles(readRoles)],
  }, async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const [row] = await db.select().from(table as never).where(eq(table.id as never, id)).limit(1);
    if (!row || (hasSoftDelete && (row as { deletedAt?: Date | null }).deletedAt)) {
      throw new NotFoundError(`${tag} not found`);
    }
    if (hasSite && !isAdmin(req.authUser!.roles)) {
      const siteId = (row as { siteId: string }).siteId;
      if (!req.authUser!.siteIds.includes(siteId)) throw new ForbiddenError('No access');
    }
    return mapRow(row as Record<string, unknown>);
  });

  app.post(prefix, {
    schema: { tags: [tag], body: createSchema },
    preHandler: [app.requireRoles(writeRoles)],
  }, async (req) => {
    const body = createSchema.parse(req.body) as Record<string, unknown>;
    if (hasSite && body.siteId) {
      await app.requireSiteAccess(req, String(body.siteId));
    }
    const [row] = await db.insert(table as never).values(body as never).returning();
    await app.audit({
      actorId: req.authUser!.id,
      action: `${tag}.create`,
      resourceType: tag,
      resourceId: String((row as { id: string }).id),
      siteId: hasSite ? String((row as { siteId: string }).siteId) : undefined,
      correlationId: req.correlationId,
      payload: body,
    });
    return mapRow(row as Record<string, unknown>);
  });

  app.patch(`${prefix}/:id`, {
    schema: { tags: [tag], params: z.object({ id: z.string().uuid() }), body: updateSchema },
    preHandler: [app.requireRoles(writeRoles)],
  }, async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = updateSchema.parse(req.body) as Record<string, unknown>;
    const [existing] = await db.select().from(table as never).where(eq(table.id as never, id)).limit(1);
    if (!existing) throw new NotFoundError(`${tag} not found`);
    if (hasSite) await app.requireSiteAccess(req, (existing as { siteId: string }).siteId);

    const [row] = await db
      .update(table as never)
      .set((hasUpdatedAt ? { ...body, updatedAt: new Date() } : body) as never)
      .where(eq(table.id as never, id))
      .returning();
    await app.audit({
      actorId: req.authUser!.id,
      action: `${tag}.update`,
      resourceType: tag,
      resourceId: id,
      correlationId: req.correlationId,
      payload: body,
    });
    return mapRow(row as Record<string, unknown>);
  });

  app.delete(`${prefix}/:id`, {
    schema: { tags: [tag], params: z.object({ id: z.string().uuid() }) },
    preHandler: [app.requireRoles(writeRoles)],
  }, async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const [existing] = await db.select().from(table as never).where(eq(table.id as never, id)).limit(1);
    if (!existing) throw new NotFoundError(`${tag} not found`);
    if (hasSite) await app.requireSiteAccess(req, (existing as { siteId: string }).siteId);

    if (hasSoftDelete) {
      await db
        .update(table as never)
        .set({ deletedAt: new Date(), updatedAt: new Date() } as never)
        .where(eq(table.id as never, id));
    } else {
      await db.delete(table as never).where(eq(table.id as never, id));
    }
    await app.audit({
      actorId: req.authUser!.id,
      action: `${tag}.delete`,
      resourceType: tag,
      resourceId: id,
      correlationId: req.correlationId,
    });
    return { ok: true };
  });
}

export function crudPlugin<TCreate extends z.ZodTypeAny, TUpdate extends z.ZodTypeAny>(
  opts: CrudFactoryOpts<TCreate, TUpdate>,
): FastifyPluginAsync {
  return async (app) => {
    registerCrudRoutes(app, opts);
  };
}

/** Helper unused export to satisfy type imports in modules. */
export type CrudHandler = RouteHandlerMethod;
