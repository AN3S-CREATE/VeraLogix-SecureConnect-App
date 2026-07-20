import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { eq } from 'drizzle-orm';
import type { Env } from '../config/env.js';
import { keycloakIssuer, keycloakJwksUrl } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../lib/errors.js';
import { RoleSchema, type Role, hasAnyRole } from '../lib/roles.js';
import type { Db } from '../db/client.js';
import { users, userSiteRoles } from '../db/schema.js';

export type AuthUser = {
  id: string;
  keycloakSub: string;
  email: string;
  name: string;
  roles: Role[];
  siteIds: string[];
};

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: AuthUser;
    correlationId: string;
  }
}

export type AuthPluginOpts = {
  env: Env;
  db: Db;
};

const authPlugin: FastifyPluginAsync<AuthPluginOpts> = async (app, opts) => {
  const { env, db } = opts;
  const jwks = createRemoteJWKSet(new URL(keycloakJwksUrl(env)));

  app.decorateRequest('correlationId', '');
  app.decorateRequest('authUser', undefined);

  app.addHook('onRequest', async (req) => {
    req.correlationId =
      (req.headers['x-correlation-id'] as string | undefined) ??
      crypto.randomUUID();
  });

  async function resolveUserFromToken(token: string): Promise<AuthUser> {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: keycloakIssuer(env),
      clockTolerance: env.JWT_CLOCK_TOLERANCE_SEC,
    });

    const sub = String(payload.sub ?? '');
    const email = String(payload.email ?? payload.preferred_username ?? '');
    const name = String(payload.name ?? email);
    const realmAccess = (payload.realm_access as { roles?: string[] } | undefined)?.roles ?? [];
    const tokenRoles = realmAccess
      .map((r) => RoleSchema.safeParse(r))
      .filter((r) => r.success)
      .map((r) => (r as { success: true; data: Role }).data);

    let [user] = await db.select().from(users).where(eq(users.keycloakSub, sub)).limit(1);
    if (!user) {
      [user] = await db
        .insert(users)
        .values({ keycloakSub: sub, email, name })
        .onConflictDoUpdate({
          target: users.keycloakSub,
          set: { email, name, updatedAt: new Date() },
        })
        .returning();
    }

    const memberships = await db
      .select()
      .from(userSiteRoles)
      .where(eq(userSiteRoles.userId, user.id));

    const dbRoles = memberships.map((m) => m.role as Role);
    const roles = Array.from(new Set([...tokenRoles, ...dbRoles]));
    const siteIds = Array.from(new Set(memberships.map((m) => m.siteId)));

    return {
      id: user.id,
      keycloakSub: sub,
      email: user.email,
      name: user.name,
      roles,
      siteIds,
    };
  }

  async function resolveDevBypass(): Promise<AuthUser | null> {
    if (!env.DEV_AUTH_BYPASS || env.NODE_ENV === 'production') return null;
    const email = env.DEV_BYPASS_EMAIL ?? 'admin@veralogix.com';
    const roles = (env.DEV_BYPASS_ROLES ?? 'admin,agent')
      .split(',')
      .map((r) => r.trim())
      .map((r) => RoleSchema.safeParse(r))
      .filter((r) => r.success)
      .map((r) => (r as { success: true; data: Role }).data);

    let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          keycloakSub: env.DEV_BYPASS_USER_ID ?? `dev-${email}`,
          email,
          name: 'Dev Bypass',
        })
        .returning();
    }
    const memberships = await db
      .select()
      .from(userSiteRoles)
      .where(eq(userSiteRoles.userId, user.id));
    return {
      id: user.id,
      keycloakSub: user.keycloakSub,
      email: user.email,
      name: user.name,
      roles,
      siteIds: memberships.map((m) => m.siteId),
    };
  }

  app.decorate('authenticate', async (req: FastifyRequest) => {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      try {
        req.authUser = await resolveUserFromToken(header.slice(7));
        return;
      } catch {
        throw new UnauthorizedError('Invalid or expired token');
      }
    }

    const bypass = await resolveDevBypass();
    if (bypass && req.headers['x-dev-bypass'] === '1') {
      req.authUser = bypass;
      return;
    }

    throw new UnauthorizedError('Missing bearer token');
  });

  app.decorate('requireRoles', (allowed: Role[]) => {
    return async (req: FastifyRequest) => {
      await app.authenticate(req);
      if (!req.authUser || !hasAnyRole(req.authUser.roles, allowed)) {
        throw new ForbiddenError('Insufficient role');
      }
    };
  });

  app.decorate('requireSiteAccess', async (req: FastifyRequest, siteId: string) => {
    await app.authenticate(req);
    const user = req.authUser!;
    if (hasAnyRole(user.roles, ['admin'])) return;
    if (!user.siteIds.includes(siteId)) {
      throw new ForbiddenError('No access to this site');
    }
  });
};

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest) => Promise<void>;
    requireRoles: (allowed: Role[]) => (req: FastifyRequest) => Promise<void>;
    requireSiteAccess: (req: FastifyRequest, siteId: string) => Promise<void>;
  }
}

export default fp(authPlugin, { name: 'auth-plugin' });
