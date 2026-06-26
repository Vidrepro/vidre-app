import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

// Routes die zonder inlog bereikbaar moeten zijn.
const PUBLIC_PREFIXES = ['/login', '/api/auth'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (secret && token && (await verifySession(token, secret))) {
    return NextResponse.next();
  }

  // Niet (geldig) ingelogd.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ ok: false, error: 'Niet ingelogd' }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('from', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Draai op alles behalve Next-internals en statische PWA-assets.
  matcher: ['/((?!_next/static|_next/image|icons|manifest.json|sw.js|vidre-logo.png|favicon.png).*)'],
};
