import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.string().default('info'),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),

  KEYCLOAK_URL: z.string().url(),
  KEYCLOAK_REALM: z.string().min(1),
  KEYCLOAK_CLIENT_ID: z.string().min(1),
  KEYCLOAK_CLIENT_SECRET: z.string().min(1),
  KEYCLOAK_WEB_CLIENT_ID: z.string().default('secureconnect-web'),
  KEYCLOAK_ADMIN_USERNAME: z.string().optional(),
  KEYCLOAK_ADMIN_PASSWORD: z.string().optional(),

  MINIO_ENDPOINT: z.string().min(1),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1),
  MINIO_BUCKET: z.string().default('secureconnect'),
  STORAGE_QUOTA_BYTES: z.coerce.number().default(1_073_741_824),

  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_FROM: z.string().email().default('noreply@secureconnect.local'),

  CORS_ORIGINS: z.string().default('http://localhost:9002'),
  JWT_CLOCK_TOLERANCE_SEC: z.coerce.number().default(30),
  RATE_LIMIT_MAX: z.coerce.number().default(200),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(20),

  DEV_AUTH_BYPASS: z
    .string()
    .transform((v) => v === 'true')
    .default('false'),
  DEV_BYPASS_USER_ID: z.string().optional(),
  DEV_BYPASS_EMAIL: z.string().email().optional(),
  DEV_BYPASS_ROLES: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function loadEnv(raw: NodeJS.ProcessEnv = process.env): Env {
  if (cached && process.env.NODE_ENV !== 'test') return cached;
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  cached = parsed.data;
  return cached;
}

export function resetEnvCache(): void {
  cached = null;
}

export function corsOriginList(env: Env): string[] {
  return env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean);
}

export function keycloakIssuer(env: Env): string {
  return `${env.KEYCLOAK_URL.replace(/\/$/, '')}/realms/${env.KEYCLOAK_REALM}`;
}

export function keycloakJwksUrl(env: Env): string {
  return `${keycloakIssuer(env)}/protocol/openid-connect/certs`;
}

export function keycloakTokenUrl(env: Env): string {
  return `${keycloakIssuer(env)}/protocol/openid-connect/token`;
}

export function keycloakLogoutUrl(env: Env): string {
  return `${keycloakIssuer(env)}/protocol/openid-connect/logout`;
}
