import type { Env } from '../config/env.js';
import { withBackoff } from '../lib/utils.js';
import { AppError, ConflictError } from '../lib/errors.js';

type TokenResponse = { access_token: string };

async function adminToken(env: Env): Promise<string> {
  const username = env.KEYCLOAK_ADMIN_USERNAME ?? 'admin';
  const password = env.KEYCLOAK_ADMIN_PASSWORD ?? 'admin';
  const url = `${env.KEYCLOAK_URL.replace(/\/$/, '')}/realms/master/protocol/openid-connect/token`;
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: 'admin-cli',
    username,
    password,
  });
  const res = await withBackoff(async () => {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!r.ok) throw new AppError('KEYCLOAK_ADMIN_AUTH', 'Failed to obtain Keycloak admin token', 502);
    return r;
  });
  const json = (await res.json()) as TokenResponse;
  return json.access_token;
}

export async function createKeycloakUser(
  env: Env,
  input: { email: string; password: string; name: string },
): Promise<{ id: string }> {
  const token = await adminToken(env);
  const base = `${env.KEYCLOAK_URL.replace(/\/$/, '')}/admin/realms/${env.KEYCLOAK_REALM}/users`;
  const [firstName, ...rest] = input.name.split(' ');
  const lastName = rest.join(' ') || firstName;

  const createRes = await fetch(base, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: input.email,
      email: input.email,
      enabled: true,
      emailVerified: false,
      firstName,
      lastName,
      credentials: [{ type: 'password', value: input.password, temporary: false }],
      requiredActions: ['VERIFY_EMAIL'],
    }),
  });

  if (createRes.status === 409) {
    throw new ConflictError('User already exists');
  }
  if (!createRes.ok) {
    const text = await createRes.text();
    throw new AppError('KEYCLOAK_CREATE_USER', 'Failed to create user in Keycloak', 502, text);
  }

  const location = createRes.headers.get('location') ?? '';
  const id = location.split('/').pop() ?? '';

  // Trigger verify-email action email when SMTP is configured in Keycloak
  if (id) {
    await fetch(`${base}/${id}/execute-actions-email`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['VERIFY_EMAIL']),
    }).catch(() => undefined);
  }

  return { id };
}

export async function sendKeycloakPasswordReset(env: Env, email: string): Promise<void> {
  const token = await adminToken(env);
  const base = `${env.KEYCLOAK_URL.replace(/\/$/, '')}/admin/realms/${env.KEYCLOAK_REALM}/users`;
  const find = await fetch(`${base}?email=${encodeURIComponent(email)}&exact=true`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!find.ok) return;
  const users = (await find.json()) as { id: string }[];
  if (!users[0]?.id) return;
  await fetch(`${base}/${users[0].id}/execute-actions-email`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['UPDATE_PASSWORD']),
  }).catch(() => undefined);
}
