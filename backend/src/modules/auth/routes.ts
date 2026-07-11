import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import type { Env } from '../../config/env.js';
import { keycloakTokenUrl, keycloakLogoutUrl } from '../../config/env.js';
import type { Db } from '../../db/client.js';
import { users, userSiteRoles, consents } from '../../db/schema.js';
import { EmailSchema, NonEmptyString } from '../../lib/pagination.js';
import { UnauthorizedError, ValidationError } from '../../lib/errors.js';
import { RoleSchema } from '../../lib/roles.js';
import { withBackoff } from '../../lib/utils.js';

export type AuthOpts = { env: Env; db: Db };

const PasswordLoginBody = z.object({
  email: EmailSchema,
  password: z.string().min(8).max(200),
});

const RefreshBody = z.object({
  refreshToken: z.string().min(10),
});

const MagicLinkBody = z.object({
  email: EmailSchema,
});

const ConsentBody = z.object({
  purpose: NonEmptyString,
  version: z.string().min(1).max(50),
});

const SessionResponse = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().optional(),
  tokenType: z.string().default('Bearer'),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
    roles: z.array(RoleSchema),
    siteIds: z.array(z.string().uuid()),
  }),
});

const authRoutes: FastifyPluginAsync<AuthOpts> = async (app, opts) => {
  const { env, db } = opts;

  async function tokenRequest(body: URLSearchParams) {
    return withBackoff(async () => {
      const res = await fetch(keycloakTokenUrl(env), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      const json = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        throw new UnauthorizedError(String(json.error_description ?? json.error ?? 'Auth failed'));
      }
      return json;
    });
  }

  app.post('/api/v1/auth/login', {
    config: { rateLimit: { max: env.AUTH_RATE_LIMIT_MAX, timeWindow: env.RATE_LIMIT_WINDOW_MS } },
    schema: {
      tags: ['auth'],
      body: PasswordLoginBody,
      response: { 200: SessionResponse },
    },
  }, async (req) => {
    const body = PasswordLoginBody.parse(req.body);
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: env.KEYCLOAK_WEB_CLIENT_ID,
      username: body.email,
      password: body.password,
      scope: 'openid profile email offline_access',
    });
    const tokens = await tokenRequest(params);

    // Ensure local user exists via authenticate path
    req.headers.authorization = `Bearer ${tokens.access_token}`;
    await app.authenticate(req);
    const user = req.authUser!;

    await app.audit({
      actorId: user.id,
      action: 'auth.login',
      resourceType: 'user',
      resourceId: user.id,
      ip: req.ip,
      correlationId: req.correlationId,
    });

    return {
      accessToken: String(tokens.access_token),
      refreshToken: tokens.refresh_token ? String(tokens.refresh_token) : undefined,
      expiresIn: typeof tokens.expires_in === 'number' ? tokens.expires_in : undefined,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        siteIds: user.siteIds,
      },
    };
  });

  app.post('/api/v1/auth/refresh', {
    config: { rateLimit: { max: env.AUTH_RATE_LIMIT_MAX, timeWindow: env.RATE_LIMIT_WINDOW_MS } },
    schema: { tags: ['auth'], body: RefreshBody },
  }, async (req) => {
    const body = RefreshBody.parse(req.body);
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: env.KEYCLOAK_WEB_CLIENT_ID,
      refresh_token: body.refreshToken,
    });
    const tokens = await tokenRequest(params);
    return {
      accessToken: String(tokens.access_token),
      refreshToken: tokens.refresh_token ? String(tokens.refresh_token) : undefined,
      expiresIn: typeof tokens.expires_in === 'number' ? tokens.expires_in : undefined,
      tokenType: 'Bearer',
    };
  });

  app.post('/api/v1/auth/logout', {
    schema: { tags: ['auth'], body: RefreshBody.partial() },
  }, async (req) => {
    const body = RefreshBody.partial().parse(req.body ?? {});
    if (body.refreshToken) {
      const params = new URLSearchParams({
        client_id: env.KEYCLOAK_WEB_CLIENT_ID,
        refresh_token: body.refreshToken,
      });
      await fetch(keycloakLogoutUrl(env), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      }).catch(() => undefined);
    }
    return { ok: true };
  });

  app.get('/api/v1/auth/me', {
    schema: { tags: ['auth'] },
    preHandler: [app.authenticate],
  }, async (req) => {
    const user = req.authUser!;
    const memberships = await db
      .select()
      .from(userSiteRoles)
      .where(eq(userSiteRoles.userId, user.id));
    return {
      ...user,
      memberships: memberships.map((m) => ({ siteId: m.siteId, role: m.role })),
    };
  });

  app.post('/api/v1/auth/magic-link', {
    config: { rateLimit: { max: env.AUTH_RATE_LIMIT_MAX, timeWindow: env.RATE_LIMIT_WINDOW_MS } },
    schema: { tags: ['auth'], body: MagicLinkBody },
  }, async (req) => {
    const body = MagicLinkBody.parse(req.body);
    // Keycloak magic link typically requires custom authenticator; enqueue email job as placeholder.
    const { emailQueue } = await import('../../jobs/queues.js');
    await emailQueue(env).add('magic-link', {
      to: body.email,
      subject: 'SecureConnect sign-in link',
      text: `Request a magic link via Keycloak email OTP / magic-link authenticator for ${body.email}. Configure KEYCLOAK magic-link SPI for production.`,
    });
    return { ok: true, message: 'If the account exists, a sign-in email will be sent.' };
  });

  app.post('/api/v1/auth/register', {
    config: { rateLimit: { max: env.AUTH_RATE_LIMIT_MAX, timeWindow: env.RATE_LIMIT_WINDOW_MS } },
    schema: {
      tags: ['auth'],
      body: z.object({
        email: EmailSchema,
        password: z.string().min(8).max(200),
        name: NonEmptyString,
        consentPurpose: NonEmptyString.default('account'),
        consentVersion: z.string().default('1.0'),
      }),
    },
  }, async (req, reply) => {
    // Registration is delegated to Keycloak; document that public registration is enabled on realm.
    // For API-driven register we use password grant after Keycloak admin create — simplified: instruct client to use KC.
    throw new ValidationError(
      'Use Keycloak registration or POST /auth/login after admin creates the user. Public self-register is enabled on the Keycloak realm UI.',
    );
  });

  app.post('/api/v1/auth/consent', {
    preHandler: [app.authenticate],
    schema: { tags: ['auth'], body: ConsentBody },
  }, async (req) => {
    const body = ConsentBody.parse(req.body);
    const [row] = await db
      .insert(consents)
      .values({
        userId: req.authUser!.id,
        purpose: body.purpose,
        version: body.version,
      })
      .returning();
    await app.audit({
      actorId: req.authUser!.id,
      action: 'consent.grant',
      resourceType: 'consent',
      resourceId: row.id,
      correlationId: req.correlationId,
      payload: { purpose: body.purpose, version: body.version },
    });
    return row;
  });

  // Dev bypass session for local UI without Keycloak
  app.post('/api/v1/auth/dev-session', {
    schema: { tags: ['auth'] },
  }, async (req, reply) => {
    if (!env.DEV_AUTH_BYPASS || env.NODE_ENV === 'production') {
      return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Not found' } });
    }
    req.headers['x-dev-bypass'] = '1';
    await app.authenticate(req);
    const user = req.authUser!;
    return {
      accessToken: 'dev-bypass',
      tokenType: 'Bearer',
      user,
    };
  });
};

export default authRoutes;
