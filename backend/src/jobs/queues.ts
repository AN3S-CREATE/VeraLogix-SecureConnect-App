import { Queue, type ConnectionOptions } from 'bullmq';
import type { Env } from '../config/env.js';

function connection(env: Env): ConnectionOptions {
  const url = new URL(env.REDIS_URL);
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    password: url.password || undefined,
    maxRetriesPerRequest: null,
  };
}

export const QUEUE_NAMES = {
  email: 'email',
  exports: 'exports',
  deletion: 'deletion',
  imageProcess: 'image-process',
  slaCheck: 'sla-check',
} as const;

export function emailQueue(env: Env) {
  return new Queue(QUEUE_NAMES.email, { connection: connection(env) });
}

export function exportsQueue(env: Env) {
  return new Queue(QUEUE_NAMES.exports, { connection: connection(env) });
}

export function deletionQueue(env: Env) {
  return new Queue(QUEUE_NAMES.deletion, { connection: connection(env) });
}

export function imageProcessQueue(env: Env) {
  return new Queue(QUEUE_NAMES.imageProcess, { connection: connection(env) });
}

export function slaCheckQueue(env: Env) {
  return new Queue(QUEUE_NAMES.slaCheck, { connection: connection(env) });
}

export function redisConnection(env: Env): ConnectionOptions {
  return connection(env);
}
