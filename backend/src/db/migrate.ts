import { config } from 'dotenv';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { loadEnv } from '../config/env.js';
import { createLogger } from '../config/logger.js';
import { REALTIME_NOTIFY_SQL } from './schema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../.env') });

async function migrate() {
  const env = loadEnv();
  const log = createLogger(env);
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    const candidates = [
      join(__dirname, 'migrations'),
      join(__dirname, '../../src/db/migrations'),
      join(process.cwd(), 'src/db/migrations'),
      join(process.cwd(), 'dist/db/migrations'),
    ];
    let migrationsDir = candidates[0];
    let files: string[] = [];
    for (const dir of candidates) {
      try {
        const found = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
        if (found.length) {
          migrationsDir = dir;
          files = found;
          break;
        }
      } catch {
        /* try next */
      }
    }

    if (!files.length) {
      log.warn({ candidates }, 'No migrations found');
    }

    for (const file of files) {
      const id = file;
      const existing = await pool.query('SELECT 1 FROM _migrations WHERE id = $1', [id]);
      if (existing.rowCount) continue;
      const sql = readFileSync(join(migrationsDir, file), 'utf8');
      log.info({ file, migrationsDir }, 'Applying migration');
      await pool.query('BEGIN');
      try {
        await pool.query(sql);
        await pool.query('INSERT INTO _migrations (id) VALUES ($1)', [id]);
        await pool.query('COMMIT');
      } catch (err) {
        await pool.query('ROLLBACK');
        throw err;
      }
    }

    await pool.query(REALTIME_NOTIFY_SQL);
    log.info('Migrations complete');
  } finally {
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
