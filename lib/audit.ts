import { prisma } from "./prisma";
import type { PublicUser } from "./auth";

/** Record an admin action — fire-and-forget; never blocks the mutation. */
export async function audit(
  actor: PublicUser,
  action: string,
  entity: string,
  entityId: string | null,
  before: any,
  after: any,
) {
  try {
    await prisma.auditEntry.create({
      data: {
        actorId: actor.id,
        actorName: actor.name,
        action,
        entity,
        entityId,
        diff: { before, after },
      },
    });
  } catch (e) {
    console.error("[audit]", e);
  }
}

/** Default opening hours — Tue–Sun 17:00–23:00, Mon closed. */
export const DEFAULT_HOURS = {
  mon: { open: "17:00", close: "23:00", closed: true },
  tue: { open: "17:00", close: "23:00", closed: false },
  wed: { open: "17:00", close: "23:00", closed: false },
  thu: { open: "17:00", close: "23:00", closed: false },
  fri: { open: "17:00", close: "23:00", closed: false },
  sat: { open: "17:00", close: "23:00", closed: false },
  sun: { open: "17:00", close: "23:00", closed: false },
};

export type HoursMap = typeof DEFAULT_HOURS;
