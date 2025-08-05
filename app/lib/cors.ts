import { NextRequest, NextResponse } from 'next/server';

// Configuración de CORS
const CORS_CONFIG = {
  // Dominios permitidos
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    // Agregar aquí los dominios de producción
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_TRACKER_URL,
  ].filter(Boolean), // Remover valores undefined/null

  // Métodos HTTP permitidos
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  // Headers permitidos
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name',
    'Cache-Control',
  ],

  // Headers expuestos al cliente
  exposedHeaders: [
    'Content-Length',
    'Content-Range',
    'X-Total-Count',
  ],

  // Credenciales permitidas
  allowCredentials: true,

  // Tiempo de cache para preflight requests
  maxAge: 86400, // 24 horas
};

/**
 * Función para manejar CORS en endpoints de API
 */
export function handleCORS(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin');

  // Headers de CORS
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': CORS_CONFIG.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': CORS_CONFIG.allowedHeaders.join(', '),
    'Access-Control-Expose-Headers': CORS_CONFIG.exposedHeaders.join(', '),
    'Access-Control-Max-Age': CORS_CONFIG.maxAge.toString(),
  };

  // Verificar si el origen está permitido
  if (origin && CORS_CONFIG.allowedOrigins.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
  } else if (origin) {
    // Para desarrollo, permitir cualquier origen
    if (process.env.NODE_ENV === 'development') {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
    }
  }

  // Permitir credenciales
  if (CORS_CONFIG.allowCredentials) {
    corsHeaders['Access-Control-Allow-Credentials'] = 'true';
  }

  // Agregar headers de CORS a la respuesta
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Función para manejar preflight OPTIONS requests
 */
export function handlePreflight(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const method = request.headers.get('access-control-request-method');
  const headers = request.headers.get('access-control-request-headers');

  // Verificar si el método está permitido
  if (method && !CORS_CONFIG.allowedMethods.includes(method)) {
    return new NextResponse(null, { status: 405 });
  }

  // Verificar si los headers están permitidos
  if (headers) {
    const requestedHeaders = headers.split(',').map(h => h.trim());
    const invalidHeaders = requestedHeaders.filter(
      header => !CORS_CONFIG.allowedHeaders.includes(header)
    );
    if (invalidHeaders.length > 0) {
      return new NextResponse(null, { status: 400 });
    }
  }

  // Crear respuesta preflight
  const response = new NextResponse(null, { status: 204 });
  
  // Agregar headers de CORS
  if (origin && CORS_CONFIG.allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (origin && process.env.NODE_ENV === 'development') {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set('Access-Control-Allow-Methods', CORS_CONFIG.allowedMethods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', CORS_CONFIG.allowedHeaders.join(', '));
  response.headers.set('Access-Control-Max-Age', CORS_CONFIG.maxAge.toString());

  if (CORS_CONFIG.allowCredentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

/**
 * Función para verificar si una request necesita CORS
 */
export function needsCORS(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  return !!origin;
} 