#!/bin/bash

echo "🚀 Configurando NexusTracker V2 - Base de Datos PostgreSQL"

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

echo "✅ Docker y Docker Compose están instalados"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << EOF
# Database (Docker PostgreSQL)
DATABASE_URL="postgresql://nexustracker_user:nexustracker_password@localhost:5432/nexustracker"

# NextAuth
NEXTAUTH_SECRET="tu-super-secreto-muy-seguro-aqui-cambialo-en-produccion"
NEXTAUTH_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
EOF
    echo "✅ Archivo .env creado"
else
    echo "ℹ️  El archivo .env ya existe"
fi

# Detener contenedores si están ejecutándose
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down

# Construir y ejecutar los contenedores
echo "🐳 Iniciando PostgreSQL y pgAdmin..."
docker-compose up -d

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Verificar que PostgreSQL esté funcionando
if docker-compose exec postgres pg_isready -U nexustracker_user -d nexustracker; then
    echo "✅ PostgreSQL está funcionando correctamente"
else
    echo "❌ Error: PostgreSQL no está respondiendo"
    exit 1
fi

echo ""
echo "🎉 ¡Base de datos configurada exitosamente!"
echo ""
echo "📊 Información de conexión:"
echo "   - Base de datos: nexustracker"
echo "   - Usuario: nexustracker_user"
echo "   - Contraseña: nexustracker_password"
echo "   - Puerto: 5432"
echo "   - URL: postgresql://nexustracker_user:nexustracker_password@localhost:5432/nexustracker"
echo ""
echo "🌐 pgAdmin (Interfaz web):"
echo "   - URL: http://localhost:8080"
echo "   - Email: admin@nexustracker.com"
echo "   - Contraseña: admin123"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Ejecutar: npx prisma generate"
echo "   2. Ejecutar: npx prisma migrate dev --name init"
echo "   3. Ejecutar: npm run dev"
echo ""
echo "🛠️  Comandos útiles:"
echo "   - Ver logs: docker-compose logs -f"
echo "   - Detener: docker-compose down"
echo "   - Reiniciar: docker-compose restart" 