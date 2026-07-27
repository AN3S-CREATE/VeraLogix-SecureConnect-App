import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import websocket from '@fastify/websocket';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { loadEnv, corsOriginList } from './config/env.js';
import { createLogger } from './config/logger.js';
import { createDb } from './db/client.js';
import { isAppError } from './lib/errors.js';
import authPlugin from './middleware/auth.js';
import auditPlugin from './middleware/audit.js';
import healthRoutes from './modules/health/routes.js';
import authRoutes from './modules/auth/routes.js';
import domainRoutes from './modules/domain/routes.js';
import filesRoutes from './modules/files/routes.js';
import adminRoutes from './modules/admin/routes.js';
import popiaRoutes from './modules/popia/routes.js';
import realtimePlugin from './realtime/gateway.js';
import { recordHttpRequest } from './observability/metrics.js';

export async function buildApp() {
  const env = loadEnv();
  const logger = createLogger(env);
  const { db, pool } = createDb(env);

  const app = Fastify({
    logger: false,
    genReqId: (req) => (req.headers['x-correlation-id'] as string) || crypto.randomUUID(),
    trustProxy: true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(helmet, { global: true, contentSecurityPolicy: false });
  await app.register(cors, {
    origin: corsOriginList(env),
    credentials: true,
  });
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
  });
  await app.register(websocket);

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'VeraLogix SecureConnect API',
        description: 'Self-hosted Firebase replacement — Auth, CRUD, Realtime, Storage, Jobs',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${env.PORT}` }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  await app.register(authPlugin, { env, db });
  await app.register(auditPlugin, { db });

  await app.register(healthRoutes, { env, db, pool });
  await app.register(authRoutes, { env, db });
  await app.register(domainRoutes, { db, env });
  await app.register(filesRoutes, { env, db });
  await app.register(adminRoutes, { env, db });
  await app.register(popiaRoutes, { env, db });
  await app.register(realtimePlugin, { env, pool });

  app.setErrorHandler((err, req, reply) => {
    const correlationId = req.correlationId ?? req.id;
    if (isAppError(err)) {
      logger.warn({ err, correlationId }, err.message);
      return reply.code(err.statusCode).send({
        error: {
          code: err.code,
          message: err.message,
          correlationId,
          details: env.NODE_ENV === 'production' ? undefined : err.details,
        },
      });
    }

    if ((err as { validation?: unknown }).validation) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          correlationId,
          details: env.NODE_ENV === 'production' ? undefined : (err as { validation: unknown }).validation,
        },
      });
    }

    logger.error({ err, correlationId }, 'Unhandled error');
    return reply.code(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        correlationId,
      },
    });
  });

  app.addHook('onResponse', async (req, reply) => {
    recordHttpRequest(reply.statusCode, reply.elapsedTime);
    logger.info({
      correlationId: req.correlationId,
      method: req.method,
      url: req.url,
      statusCode: reply.statusCode,
      responseTime: reply.elapsedTime,
    });
  });

  return { app, env, db, pool, logger };
}
