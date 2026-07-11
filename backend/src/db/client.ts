import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import type { Env } from '../config/env.js';
import * as schema from './schema.js';

const { Pool } = pg;

export type Db = ReturnType<typeof createDb>['db'];
export type PoolClient = pg.Pool;

export function createDb(env: Env) {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  const db = drizzle(pool, { schema });
  return { db, pool };
}

export async function checkDb(pool: pg.Pool): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release();
  }
}
