import { getCurrentUser } from "./auth";
import { prisma } from "./prisma";

/** Returns the current user if they hold the ADMIN role, otherwise null. */
export async function getCurrentAdmin() {
  const u = await getCurrentUser();
  if (!u) return null;
  const full = await prisma.user.findUnique({ where: { id: u.id } });
  if (!full || full.role !== "ADMIN") return null;
  return u;
}
