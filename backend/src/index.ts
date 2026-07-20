import { buildApp } from './app.js';

async function main() {
  const { app, env, logger } = await buildApp();
  await app.listen({ port: env.PORT, host: env.HOST });
  logger.info({ port: env.PORT }, 'SecureConnect API listening');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
