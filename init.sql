-- Crear la base de datos si no existe
-- (PostgreSQL ya crea la base de datos desde las variables de entorno)

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configurar timezone
SET timezone = 'UTC';

-- Crear índices adicionales para mejorar el rendimiento
-- (Prisma creará los índices necesarios automáticamente)

-- Configurar parámetros de rendimiento
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Reiniciar para aplicar cambios
SELECT pg_reload_conf(); 