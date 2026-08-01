import { cookies } from 'next/headers';

export const ACCESS_COOKIE = 'sc_access';
export const REFRESH_COOKIE = 'sc_refresh';
export const ROLE_COOKIE = 'sc_role';
export const USER_COOKIE = 'sc_user';

const isProd = process.env.NODE_ENV === 'production';

export type CookieSessionUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  siteIds: string[];
};

function baseCookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true as const,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSec,
  };
}

export function apiBaseUrl(): string {
  return (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
}

export async function setAuthCookies(input: {
  accessToken: string;
  refreshToken?: string;
  user: CookieSessionUser;
  expiresIn?: number;
}) {
  const jar = await cookies();
  const accessMaxAge = input.expiresIn && input.expiresIn > 0 ? input.expiresIn : 60 * 60 * 8;
  jar.set(ACCESS_COOKIE, input.accessToken, baseCookieOptions(accessMaxAge));
  if (input.refreshToken) {
    jar.set(REFRESH_COOKIE, input.refreshToken, baseCookieOptions(60 * 60 * 24 * 30));
  }
  // Soft portal RBAC — readable by middleware (not httpOnly)
  jar.set(ROLE_COOKIE, input.user.roles[0] ?? 'resident', {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: accessMaxAge,
  });
  jar.set(USER_COOKIE, JSON.stringify(input.user), baseCookieOptions(accessMaxAge));
}

export async function clearAuthCookies() {
  const jar = await cookies();
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE, USER_COOKIE]) {
    jar.set(name, '', { path: '/', maxAge: 0 });
  }
}

export async function readAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ACCESS_COOKIE)?.value ?? null;
}

export async function readRefreshToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(REFRESH_COOKIE)?.value ?? null;
}

export async function readStoredUser(): Promise<CookieSessionUser | null> {
  const jar = await cookies();
  const raw = jar.get(USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CookieSessionUser;
  } catch {
    return null;
  }
}
