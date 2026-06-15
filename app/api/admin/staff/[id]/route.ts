import { NextResponse } from "next/server";
import { requireAdminRole, STAFF_ROLES } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const a = await requireAdminRole();
  if (!a) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { role } = await req.json().catch(() => ({}));
  if (!STAFF_ROLES.includes(role)) return NextResponse.json({ error: "bad_role" }, { status: 400 });

  if (a.id === params.id && role !== "ADMIN")
    return NextResponse.json({ error: "cannot_demote_self" }, { status: 422 });

  const before = await prisma.user.findUnique({ where: { id: params.id } });
  const u = await prisma.user.update({ where: { id: params.id }, data: { role } });
  audit(a, "staff.role", "user", u.id, before, u);
  return NextResponse.json({ data: { id: u.id, name: u.name, email: u.email, role: u.role } });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const a = await requireAdminRole();
  if (!a) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (a.id === params.id) return NextResponse.json({ error: "cannot_delete_self" }, { status: 422 });

  // Demote to USER instead of deleting (preserves reservation history)
  const before = await prisma.user.findUnique({ where: { id: params.id } });
  const u = await prisma.user.update({ where: { id: params.id }, data: { role: "USER" } });
  audit(a, "staff.revoke", "user", u.id, before, u);
  return NextResponse.json({ ok: true });
}
