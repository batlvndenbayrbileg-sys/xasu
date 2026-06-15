import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Customer detail — full reservation history + aggregates.
 *  Accepts user id, OR `walkin:<phone>` for walk-in guests. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  if (params.id.startsWith("walkin:")) {
    const phone = params.id.slice("walkin:".length);
    const reservations = await prisma.reservation.findMany({
      where: { guestPhone: phone, userId: null },
      orderBy: [{ date: "desc" }, { time: "desc" }],
    });
    if (reservations.length === 0) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const first = reservations[0];
    return NextResponse.json({
      data: {
        kind: "walkin",
        id: params.id,
        name: first.guestName ?? "Guest",
        email: "",
        phone,
        createdAt: reservations[reservations.length - 1].createdAt.toISOString(),
        reservations,
      },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { reservations: { orderBy: [{ date: "desc" }, { time: "desc" }] } },
  });
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({
    data: {
      kind: "user",
      id: user.id,
      name: user.name,
      email: user.email,
      phone: null,
      createdAt: user.createdAt.toISOString(),
      reservations: user.reservations,
    },
  });
}
