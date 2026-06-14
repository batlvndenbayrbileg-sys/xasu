import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient.
 * Next.js (and hot-reload in dev) can instantiate modules many times; without a
 * global singleton you exhaust Postgres connections under load. One client +
 * the driver's built-in pool is what lets us serve many concurrent users.
 *
 * For 1000+ concurrent users put a connection pooler in front (Neon pooled URL,
 * Supabase :6543, or PgBouncer) and set `?connection_limit=` accordingly.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
