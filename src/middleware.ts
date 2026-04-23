import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin/* except /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const valid = token ? verifyToken(token) : false;
    if (!valid) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Also protect admin API routes (except auth itself)
  if (
    pathname.startsWith('/api/admin') &&
    !pathname.startsWith('/api/admin/auth')
  ) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const valid = token ? verifyToken(token) : false;
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
