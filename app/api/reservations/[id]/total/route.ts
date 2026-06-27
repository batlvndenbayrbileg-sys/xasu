import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEPOSIT_MNT } from "@/lib/payments";
import { priceCart } from "@/lib/orders";

export const dynamic = "force-dynamic";

/** User updates the reservation total to include pre-ordered food. The food
 *  total is RE-PRICED server-side from the item ids (never trust a client
 *  amount). Item names are stored in `notes` so kitchen prep is visible. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { items } = await req.json().catch(() => ({}));

  const r = await prisma.reservation.findFirst({ where: { id: params.id, userId: user.id } });
  if (!r) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (r.paymentStatus === "paid") return NextResponse.json({ error: "already_paid" }, { status: 409 });

  // Re-price from the catalog — the client cannot dictate the amount.
  const { lines, subtotal } = await priceCart(Array.isArray(items) ? items : []);
  const newAmount = DEPOSIT_MNT + subtotal;
  const noteLines = lines.length > 0
    ? `Урьдчилсан захиалга (${lines.length}): ` + lines.map((l) => `${l.qty}× ${l.name}`).join(", ")
    : null;

  await prisma.reservation.update({
    where: { id: r.id },
    data: { amount: newAmount, notes: noteLines },
  });
  return NextResponse.json({ data: { amount: newAmount, foodTotal: subtotal } });
}
