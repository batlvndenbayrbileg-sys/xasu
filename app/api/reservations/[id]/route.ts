import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Cancel a reservation owned by the current user. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const result = await prisma.reservation.updateMany({
    where: { id: params.id, userId: user.id, status: "CONFIRMED" },
    data: { status: "CANCELLED" },
  });

  if (result.count === 0)
    return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
