import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { and, eq, gt, isNull, type SQL } from 'drizzle-orm';
import type { PgTable, TableConfig } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import type { Db } from '../db/client.js';
import { CursorPaginationQuery } from '../lib/pagination.js';
import { NotFoundError, ForbiddenError } from '../lib/errors.js';
import { isAdmin, type Role } from '../lib/roles.js';

type AnyTable = PgTable<TableConfig> & {
  // Generic factory accepts any Drizzle PG table; column typing is intentionally loose.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  siteId?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deletedAt?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatedAt?: any;
};

type Row = Record<string, unknown>;

export type CrudFactoryOpts<TCreate extends z.ZodTypeAny, TUpdate extends z.ZodTypeAny> = {
  prefix: string;
  tag: string;
  table: AnyTable;
  createSchema: TCreate;
  updateSchema: TUpdate;
  db: Db;
  readRoles?: Role[];
  writeRoles?: Role[];
  mapRow?: (row: Row) => Row;
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
      conditions.push(isNull(table.deletedAt!));
    }
    if (hasSite) {
      const siteCol = table.siteId!;
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
      conditions.push(gt(table.id, query.cursor));
    }

    let rows = (await db
      .select()
      .from(table)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(table.id)
      .limit(query.limit + 1)) as Row[];

    if (hasSite && !query.siteId && !isAdmin(user.roles)) {
      rows = rows.filter((r) => user.siteIds.includes(String(r.siteId)));
    }

    const hasMore = rows.length > query.limit;
    const page = hasMore ? rows.slice(0, query.limit) : rows;
    const nextCursor = hasMore ? String(page[page.length - 1]?.id) : null;
    return {
      data: page.map((r) => mapRow(r)),
      meta: { nextCursor, limit: query.limit },
    };
  });

  app.get(`${prefix}/:id`, {
    schema: { tags: [tag], params: z.object({ id: z.string().uuid() }) },
    preHandler: [app.requireRoles(readRoles)],
  }, async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const found = (await db.select().from(table).where(eq(table.id, id)).limit(1)) as Row[];
    const row = found[0];
    if (!row || (hasSoftDelete && row.deletedAt)) {
      throw new NotFoundError(`${tag} not found`);
    }
    if (hasSite && !isAdmin(req.authUser!.roles)) {
      const siteId = String(row.siteId);
      if (!req.authUser!.siteIds.includes(siteId)) throw new ForbiddenError('No access');
    }
    return mapRow(row);
  });

  app.post(prefix, {
    schema: { tags: [tag], body: createSchema },
    preHandler: [app.requireRoles(writeRoles)],
  }, async (req) => {
    const body = createSchema.parse(req.body) as Row;
    if (hasSite && body.siteId) {
      await app.requireSiteAccess(req, String(body.siteId));
    }
    const inserted = (await db.insert(table).values(body as never).returning()) as Row[];
    const row = inserted[0];
    if (!row) throw new NotFoundError(`${tag} create failed`);
    await app.audit({
      actorId: req.authUser!.id,
      action: `${tag}.create`,
      resourceType: tag,
      resourceId: String(row.id),
      siteId: hasSite ? String(row.siteId) : undefined,
      correlationId: req.correlationId,
      payload: body,
    });
    return mapRow(row);
  });

  app.patch(`${prefix}/:id`, {
    schema: { tags: [tag], params: z.object({ id: z.string().uuid() }), body: updateSchema },
    preHandler: [app.requireRoles(writeRoles)],
  }, async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const body = updateSchema.parse(req.body) as Row;
    const existingRows = (await db.select().from(table).where(eq(table.id, id)).limit(1)) as Row[];
    const existing = existingRows[0];
    if (!existing) throw new NotFoundError(`${tag} not found`);
    if (hasSite) await app.requireSiteAccess(req, String(existing.siteId));

    const updated = (await db
      .update(table)
      .set((hasUpdatedAt ? { ...body, updatedAt: new Date() } : body) as never)
      .where(eq(table.id, id))
      .returning()) as Row[];
    const row = updated[0];
    if (!row) throw new NotFoundError(`${tag} not found`);
    await app.audit({
      actorId: req.authUser!.id,
      action: `${tag}.update`,
      resourceType: tag,
      resourceId: id,
      correlationId: req.correlationId,
      payload: body,
    });
    return mapRow(row);
  });

  app.delete(`${prefix}/:id`, {
    schema: { tags: [tag], params: z.object({ id: z.string().uuid() }) },
    preHandler: [app.requireRoles(writeRoles)],
  }, async (req) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
    const existingRows = (await db.select().from(table).where(eq(table.id, id)).limit(1)) as Row[];
    const existing = existingRows[0];
    if (!existing) throw new NotFoundError(`${tag} not found`);
    if (hasSite) await app.requireSiteAccess(req, String(existing.siteId));

    if (hasSoftDelete) {
      await db
        .update(table)
        .set({ deletedAt: new Date(), updatedAt: new Date() } as never)
        .where(eq(table.id, id));
    } else {
      await db.delete(table).where(eq(table.id, id));
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
