// Creates the partial unique index that makes booking atomic under concurrency.
// Prisma can't express partial unique indexes in schema, so we add it here after
// `prisma db push`. SQLite and PostgreSQL both support partial indexes.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "Reservation_active_slot_key"
     ON "Reservation" ("tableId", "date", "time")
     WHERE "status" = 'CONFIRMED';`
  );
  console.log("✓ partial unique index ready (atomic booking enabled)");
} catch (e) {
  console.error("Failed to create index:", e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
