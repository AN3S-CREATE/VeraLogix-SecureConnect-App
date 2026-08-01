import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApp } from './app.js';

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });

async function main() {
  const { app, env, logger } = await buildApp();
  await app.listen({ port: env.PORT, host: env.HOST });
  logger.info({ port: env.PORT }, 'SecureConnect API listening');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
