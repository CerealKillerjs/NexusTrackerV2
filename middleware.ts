import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que deben ser bloqueadas en modo PRIVATE
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
    try {
      // Verificar el modo de navegación pública haciendo una petición al endpoint
      // Usar una URL absoluta para evitar problemas de routing
      const baseUrl = request.nextUrl.protocol + '//' + request.nextUrl.host;
      const configResponse = await fetch(`${baseUrl}/api/config/public-browsing`, {
        headers: {
          'User-Agent': request.headers.get('user-agent') || '',
        }
      });
      
      if (configResponse.ok) {
        const config = await configResponse.json();
        
        // Si está en modo PRIVATE, bloquear acceso
        if (config.mode === 'PRIVATE') {
          console.log(`Blocking public route ${pathname} - mode is PRIVATE`);
          return NextResponse.redirect(new URL('/', request.url));
        }
      } else {
        console.log(`Error fetching config, blocking ${pathname} for security`);
        // En caso de error, bloquear por seguridad
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      console.error('Error checking public browsing mode:', error);
      // En caso de error, bloquear por seguridad
      return NextResponse.redirect(new URL('/', request.url));
    }
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