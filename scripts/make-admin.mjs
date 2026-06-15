// Promote a user to ADMIN. Usage:
//   node scripts/make-admin.mjs user@example.com
import { PrismaClient } from "@prisma/client";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/make-admin.mjs <email>");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const u = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { role: "ADMIN" },
  });
  console.log(`✓ ${u.email} is now ADMIN`);
} catch (e) {
  console.error("Failed:", e?.message ?? e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
