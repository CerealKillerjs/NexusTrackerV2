import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que están bloqueadas ya que el tracker es siempre privado
const PUBLIC_ROUTES = [
  '/torrents/public',
  '/api/torrent/public',
  '/search',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si la ruta actual es una ruta pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    console.log(`Blocking public route ${pathname} - tracker is private-only`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/torrents/public/:path*',
    '/api/torrent/public/:path*',
    '/search',
  ],
}; 