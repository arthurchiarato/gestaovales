
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'vale_simplificado_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  const isAuthenticated = !!sessionCookie?.value;

  // Static assets and Next.js internals are typically excluded by the matcher,
  // but this check remains as a safeguard.
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.endsWith('.ico') || pathname.endsWith('.png') || pathname.endsWith('.jpg')) {
    return NextResponse.next();
  }
  
  if (isAuthenticated) {
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else {
    if (pathname !== '/login' && pathname !== '/') {
      // Allow access to root page for initial redirect logic in page.tsx
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Public files are automatically excluded by Next.js
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
