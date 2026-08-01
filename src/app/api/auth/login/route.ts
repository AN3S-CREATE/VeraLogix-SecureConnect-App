import { NextResponse } from 'next/server';
import { apiBaseUrl, setAuthCookies, type CookieSessionUser } from '@/lib/auth-cookies';

type SessionResponse = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
  user: CookieSessionUser;
};

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body' } },
      { status: 400 },
    );
  }

  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'email and password required' } },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${apiBaseUrl()}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  const text = await upstream.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!upstream.ok) {
    return NextResponse.json(payload ?? { error: { code: 'LOGIN_FAILED', message: 'Login failed' } }, {
      status: upstream.status,
    });
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
