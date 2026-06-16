import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Fetch a single reservation owned by the current user. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const r = await prisma.reservation.findFirst({ where: { id: params.id, userId: user.id } });
  if (!r) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  return NextResponse.json({ data: r });
}

/** Cancel a reservation owned by the current user. Paid reservations cannot
 *  be self-cancelled (admin can refund + cancel from the back-office). */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const r = await prisma.reservation.findFirst({ where: { id: params.id, userId: user.id } });
  if (!r) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  if (r.status !== "CONFIRMED") return NextResponse.json({ error: "Already cancelled or completed" }, { status: 409 });
  if (r.paymentStatus === "paid")
    return NextResponse.json({ error: "Paid reservations cannot be cancelled — contact the restaurant for a refund" }, { status: 409 });

  await prisma.reservation.update({ where: { id: r.id }, data: { status: "CANCELLED" } });
  return NextResponse.json({ ok: true });
}
