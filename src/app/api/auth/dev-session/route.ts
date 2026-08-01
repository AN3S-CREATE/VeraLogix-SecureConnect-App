import { NextResponse } from 'next/server';
import { apiBaseUrl, setAuthCookies, type CookieSessionUser } from '@/lib/auth-cookies';

type SessionResponse = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
  user: CookieSessionUser;
};

export async function POST() {
  const upstream = await fetch(`${apiBaseUrl()}/api/v1/auth/dev-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-dev-bypass': '1',
    },
  });

  const text = await upstream.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!upstream.ok) {
    return NextResponse.json(
      payload ?? { error: { code: 'DEV_SESSION_UNAVAILABLE', message: 'Dev session unavailable' } },
      { status: upstream.status },
    );
  }

  const session = payload as SessionResponse;
  await setAuthCookies({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user: session.user,
    expiresIn: session.expiresIn,
  });

  return NextResponse.json({
    user: session.user,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    tokenType: session.tokenType ?? 'Bearer',
  });
}
