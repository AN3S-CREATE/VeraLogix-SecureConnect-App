import { NextResponse } from 'next/server';
import {
  ACCESS_COOKIE,
  apiBaseUrl,
  clearAuthCookies,
  readAccessToken,
  readStoredUser,
  setAuthCookies,
  type CookieSessionUser,
} from '@/lib/auth-cookies';

/**
 * Hydrate the browser client from httpOnly cookies.
 * Returns user + accessToken for in-memory SDK use (tokens are not stored in localStorage).
 */
export async function GET() {
  const accessToken = await readAccessToken();
  const stored = await readStoredUser();

  if (!accessToken) {
    return NextResponse.json({ authenticated: false, user: null, accessToken: null });
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${accessToken}`,
    ...(accessToken === 'dev-bypass' ? { 'x-dev-bypass': '1' } : {}),
  };

  try {
    const meRes = await fetch(`${apiBaseUrl()}/api/v1/auth/me`, { headers });
    if (!meRes.ok) {
      await clearAuthCookies();
      return NextResponse.json({ authenticated: false, user: null, accessToken: null }, { status: 401 });
    }
    const me = (await meRes.json()) as CookieSessionUser & {
      memberships?: { siteId: string; role: string }[];
    };
    const user: CookieSessionUser = {
      id: me.id,
      email: me.email,
      name: me.name,
      roles: me.roles,
      siteIds: me.siteIds,
    };
    await setAuthCookies({ accessToken, user });
    return NextResponse.json({
      authenticated: true,
      user,
      accessToken,
      cookie: ACCESS_COOKIE,
    });
  } catch {
    if (stored) {
      return NextResponse.json({
        authenticated: true,
        user: stored,
        accessToken,
        stale: true,
      });
    }
    return NextResponse.json({ authenticated: false, user: null, accessToken: null }, { status: 503 });
  }
}
