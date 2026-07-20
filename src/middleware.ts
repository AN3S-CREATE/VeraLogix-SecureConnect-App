import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PORTAL_ROLES: Record<string, string[]> = {
  '/cmd': ['agent', 'estate_manager', 'admin'],
  '/ten': ['resident', 'admin'],
  '/tru': ['trustee', 'admin', 'estate_manager'],
  '/ven': ['vendor', 'admin', 'estate_manager'],
};

/**
 * Soft RBAC: if a session role cookie is present, enforce portal membership.
 * Unauthenticated browsing remains allowed for UI demos; API enforces auth on data.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const portal = Object.keys(PORTAL_ROLES).find((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!portal) return NextResponse.next();

  const role = req.cookies.get('sc_role')?.value;
  if (!role) return NextResponse.next();

  const allowed = PORTAL_ROLES[portal];
  if (!allowed.includes(role) && role !== 'admin') {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('error', 'forbidden');
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/cmd/:path*', '/ten/:path*', '/tru/:path*', '/ven/:path*'],
};
