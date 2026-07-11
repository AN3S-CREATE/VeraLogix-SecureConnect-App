import pino from 'pino';
import type { Env } from './env.js';

export function createLogger(env: Env) {
  return pino({
    level: env.LOG_LEVEL,
    base: { service: 'secureconnect-api' },
    redact: {
      paths: ['req.headers.authorization', 'password', 'refresh_token', 'client_secret'],
      remove: true,
    },
    transport:
      env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
        : undefined,
  });
}

export type Logger = ReturnType<typeof createLogger>;
