import { NextResponse } from 'next/server';
import {
  apiBaseUrl,
  clearAuthCookies,
  readAccessToken,
  readRefreshToken,
} from '@/lib/auth-cookies';

export async function POST() {
  const accessToken = await readAccessToken();
  const refreshToken = await readRefreshToken();

  if (accessToken) {
    await fetch(`${apiBaseUrl()}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...(accessToken === 'dev-bypass' ? { 'x-dev-bypass': '1' } : {}),
      },
      body: JSON.stringify({ refreshToken: refreshToken ?? undefined }),
    }).catch(() => undefined);
  }

  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
