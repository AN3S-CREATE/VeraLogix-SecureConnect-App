import Redis from 'ioredis';
import type { Env } from '../config/env.js';

let client: Redis | null = null;

export function getRedis(env: Env): Redis {
  if (!client) {
    client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
  }
  return client;
}

export async function cacheGet<T>(env: Env, key: string): Promise<T | null> {
  try {
    const redis = getRedis(env);
    if (redis.status !== 'ready') await redis.connect().catch(() => undefined);
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(env: Env, key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  try {
    const redis = getRedis(env);
    if (redis.status !== 'ready') await redis.connect().catch(() => undefined);
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    /* cache is best-effort */
  }
}

export async function cacheDel(env: Env, key: string): Promise<void> {
  try {
    const redis = getRedis(env);
    if (redis.status !== 'ready') await redis.connect().catch(() => undefined);
    await redis.del(key);
  } catch {
    /* ignore */
  }
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit().catch(() => undefined);
    client = null;
  }
}
