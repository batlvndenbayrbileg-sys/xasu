import { NextResponse } from "next/server";
import { requireAdminRole, STAFF_ROLES } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { hashPassword, findUserByEmail } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  const a = await requireAdminRole();
  if (!a) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const staff = await prisma.user.findMany({
    where: { role: { in: STAFF_ROLES } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json({ data: staff });
}

/** Create a new staff account (acts as an invite — admin provides initial password). */
export async function POST(req: Request) {
  const a = await requireAdminRole();
  if (!a) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { name, email, role, password } = await req.json().catch(() => ({}));
  if (!name || !email || !role || !password) return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  if (!STAFF_ROLES.includes(role)) return NextResponse.json({ error: "bad_role" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: "password_too_short" }, { status: 422 });
  if (await findUserByEmail(email)) return NextResponse.json({ error: "email_taken" }, { status: 409 });

  const u = await prisma.user.create({
    data: { name: name.trim(), email: email.toLowerCase(), passwordHash: hashPassword(password), role },
  });
  audit(a, "staff.invite", "user", u.id, null, { name: u.name, email: u.email, role: u.role });
  return NextResponse.json({ data: { id: u.id, name: u.name, email: u.email, role: u.role } }, { status: 201 });
}
