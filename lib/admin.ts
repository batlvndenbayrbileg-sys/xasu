import { getCurrentUser } from "./auth";
import { prisma } from "./prisma";

export type StaffRole = "ADMIN" | "MANAGER" | "SERVER" | "HOST";
export const STAFF_ROLES: StaffRole[] = ["ADMIN", "MANAGER", "SERVER", "HOST"];

/** Allow any staff role into the admin panel. */
export async function getCurrentAdmin() {
  const u = await getCurrentUser();
  if (!u) return null;
  const full = await prisma.user.findUnique({ where: { id: u.id } });
  if (!full || !STAFF_ROLES.includes(full.role as StaffRole)) return null;
  return { ...u, role: full.role as StaffRole };
}

/** Only ADMIN can edit settings, manage staff, view audit log. */
export async function requireAdminRole() {
  const a = await getCurrentAdmin();
  return a?.role === "ADMIN" ? a : null;
}

/** ADMIN + MANAGER can edit menu, tables, payments. */
export async function requireManagerRole() {
  const a = await getCurrentAdmin();
  if (!a) return null;
  return a.role === "ADMIN" || a.role === "MANAGER" ? a : null;
}
