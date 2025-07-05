import { PrismaClient } from "@prisma/client"

/**
 * Global Prisma client instance
 * 
 * This creates a single Prisma client instance that can be reused across
 * the application. In development, this prevents creating multiple
 * connections to the database during hot reloads.
 * 
 * The client is configured to:
 * - Connect to the database using the DATABASE_URL environment variable
 * - Log queries in development mode for debugging
 * - Handle connection pooling efficiently
 * - Provide type-safe database access
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Prisma client instance
 * 
 * Creates a new Prisma client if one doesn't exist globally,
 * otherwise reuses the existing instance. This pattern ensures:
 * - Single connection pool across the application
 * - Proper cleanup in development environments
 * - Type safety for all database operations
 * - Efficient resource usage
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
})

// In development, store the client globally to prevent multiple instances
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma 