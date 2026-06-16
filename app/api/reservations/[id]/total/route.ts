import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEPOSIT_MNT } from "@/lib/payments";

export const dynamic = "force-dynamic";

/** User updates the reservation total to include pre-ordered food. The cart
 *  contents are stored in `notes` so kitchen prep is visible to admin. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { foodTotal, items } = await req.json().catch(() => ({}));
  if (!Number.isFinite(foodTotal) || foodTotal < 0) return NextResponse.json({ error: "bad_amount" }, { status: 400 });

  const r = await prisma.reservation.findFirst({ where: { id: params.id, userId: user.id } });
  if (!r) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (r.paymentStatus === "paid") return NextResponse.json({ error: "already_paid" }, { status: 409 });

  const newAmount = DEPOSIT_MNT + Math.round(foodTotal);
  const noteLines = Array.isArray(items) && items.length > 0
    ? `Pre-ordered (${items.length}): ` + items.map((i: any) => `${i.id}×${i.qty}`).join(", ")
    : null;

  await prisma.reservation.update({
    where: { id: r.id },
    data: { amount: newAmount, notes: noteLines },
  });
  return NextResponse.json({ data: { amount: newAmount } });
}
