import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { audit, DEFAULT_HOURS } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** Return the settings singleton, seeding defaults on first read. */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let s = await prisma.restaurantSettings.findUnique({ where: { id: "default" } });
  if (!s) {
    s = await prisma.restaurantSettings.create({
      data: { id: "default", hours: DEFAULT_HOURS, blackoutDates: [] },
    });
  }
  return NextResponse.json({ data: s });
}

/** Patch settings. Audited. */
export async function PATCH(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const allowed = ["venueName", "venueAddress", "contactPhone", "contactEmail", "hours", "depositMnt", "maxPartySize", "blackoutDates", "bookingWindow"];
  const patch: any = {};
  for (const k of allowed) if (body[k] !== undefined) patch[k] = body[k];
  if (Object.keys(patch).length === 0) return NextResponse.json({ error: "no_changes" }, { status: 400 });

  const before = await prisma.restaurantSettings.findUnique({ where: { id: "default" } });
  const after = await prisma.restaurantSettings.upsert({
    where: { id: "default" },
    create: { id: "default", hours: DEFAULT_HOURS, blackoutDates: [], ...patch },
    update: patch,
  });
  audit(admin, "settings.update", "settings", "default", before, after);
  return NextResponse.json({ data: after });
}
