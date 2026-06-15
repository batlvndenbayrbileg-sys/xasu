// Create a new admin account in one go. Usage:
//   node scripts/seed-admin.mjs <email> <password> [name]
import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "node:crypto";

const [email, password, name = "Admin"] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: node scripts/seed-admin.mjs <email> <password> [name]");
  process.exit(1);
}

function hashPassword(pw) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const prisma = new PrismaClient();
try {
  const u = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    create: { name, email: email.toLowerCase(), passwordHash: hashPassword(password), role: "ADMIN" },
    update: { passwordHash: hashPassword(password), role: "ADMIN", name },
  });
  console.log(`✓ ${u.email} ready as ADMIN`);
  console.log(`  Login at: /login → then /admin/today`);
} catch (e) {
  console.error("Failed:", e?.message ?? e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
