import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handlePreflight } from '@/app/lib/cors';

// Rutas públicas que están bloqueadas ya que el tracker es siempre privado
const PUBLIC_ROUTES = [
  '/torrents/public',
  '/api/torrent/public',
  '/search',
];

// Rutas que necesitan CORS especial
const CORS_ROUTES = [
  '/api/announce',
  '/announce',
  '/api/auth',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Manejar preflight OPTIONS requests para rutas que necesitan CORS
  if (request.method === 'OPTIONS' && CORS_ROUTES.some(route => pathname.startsWith(route))) {
    return handlePreflight(request);
  }

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
    '/api/announce',
    '/announce',
    '/api/auth/:path*',
  ],
}; 