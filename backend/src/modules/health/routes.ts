import type { FastifyPluginAsync } from 'fastify';
import type { Env } from '../../config/env.js';
import type { Db } from '../../db/client.js';
import { checkDb } from '../../db/client.js';
import type pg from 'pg';
import { Redis } from 'ioredis';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { renderPrometheusMetrics } from '../../observability/metrics.js';

export type HealthOpts = {
  env: Env;
  db: Db;
  pool: pg.Pool;
};

const healthRoutes: FastifyPluginAsync<HealthOpts> = async (app, opts) => {
  app.get('/health/live', async () => ({ status: 'ok' }));

  app.get('/health/ready', async (_req, reply) => {
    const checks: Record<string, 'up' | 'down'> = {
      postgres: 'down',
      redis: 'down',
      minio: 'down',
      keycloak: 'down',
    };

    try {
      checks.postgres = (await checkDb(opts.pool)) ? 'up' : 'down';
    } catch {
      checks.postgres = 'down';
    }

    try {
      const redis = new Redis(opts.env.REDIS_URL, { maxRetriesPerRequest: 1, lazyConnect: true });
      await redis.connect();
      const pong = await redis.ping();
      checks.redis = pong === 'PONG' ? 'up' : 'down';
      await redis.quit();
    } catch {
      checks.redis = 'down';
    }

    try {
      const s3 = new S3Client({
        endpoint: `http${opts.env.MINIO_USE_SSL ? 's' : ''}://${opts.env.MINIO_ENDPOINT}:${opts.env.MINIO_PORT}`,
        region: 'us-east-1',
        forcePathStyle: true,
        credentials: {
          accessKeyId: opts.env.MINIO_ACCESS_KEY,
          secretAccessKey: opts.env.MINIO_SECRET_KEY,
        },
      });
      await s3.send(new HeadBucketCommand({ Bucket: opts.env.MINIO_BUCKET }));
      checks.minio = 'up';
    } catch {
      checks.minio = 'down';
    }

    try {
      const res = await fetch(
        `${opts.env.KEYCLOAK_URL.replace(/\/$/, '')}/realms/${opts.env.KEYCLOAK_REALM}`,
        { signal: AbortSignal.timeout(3000) },
      );
      checks.keycloak = res.ok ? 'up' : 'down';
    } catch {
      checks.keycloak = 'down';
    }

    const ready = Object.values(checks).every((v) => v === 'up');
    return reply.code(ready ? 200 : 503).send({ status: ready ? 'ready' : 'degraded', checks });
  });

  app.get('/metrics', async (_req, reply) => {
    reply.type('text/plain; version=0.0.4; charset=utf-8').send(renderPrometheusMetrics());
  });
};

export default healthRoutes;
