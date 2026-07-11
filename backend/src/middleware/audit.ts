import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import type { Db } from '../db/client.js';
import { auditLogs } from '../db/schema.js';
import { hashPayload } from '../lib/utils.js';

export type AuditOpts = { db: Db };

const auditPlugin: FastifyPluginAsync<AuditOpts> = async (app, opts) => {
  app.decorate('audit', async (params: {
    actorId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    siteId?: string;
    ip?: string;
    correlationId?: string;
    payload?: unknown;
  }) => {
    await opts.db.insert(auditLogs).values({
      actorId: params.actorId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      siteId: params.siteId,
      ip: params.ip,
      correlationId: params.correlationId,
      payloadHash: params.payload ? hashPayload(params.payload) : undefined,
    });
  });
};

declare module 'fastify' {
  interface FastifyInstance {
    audit: (params: {
      actorId?: string;
      action: string;
      resourceType: string;
      resourceId?: string;
      siteId?: string;
      ip?: string;
      correlationId?: string;
      payload?: unknown;
    }) => Promise<void>;
  }
}

export default fp(auditPlugin, { name: 'audit-plugin' });
