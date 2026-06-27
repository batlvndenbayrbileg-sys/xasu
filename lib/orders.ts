import { DISHES, TABLES } from "@/lib/data";
import { prisma } from "@/lib/prisma";

const VALID_TABLE_IDS = new Set(TABLES.map((t) => t.id));

/** True if the id refers to a real restaurant table (from the seed catalog). */
export function isValidTable(id: unknown): id is string {
  return typeof id === "string" && VALID_TABLE_IDS.has(id);
}

export interface PricedLine { id: string; name: string; qty: number; unit: number; lineTotal: number; }

/**
 * Resolve cart items to SERVER-priced lines. The client only sends `{ id, qty }`
 * — never trust a client-sent price. Prices come from the static catalog
 * (lib/data.ts) or the CustomDish table. Unknown / unavailable ids are dropped.
 * `unit` follows the catalog "thousands" convention (price 22 → ₮22,000).
 */
export async function priceCart(
  items: { id: string; qty: number }[],
): Promise<{ lines: PricedLine[]; subtotal: number; serviceFee: number; total: number }> {
  const wanted = (Array.isArray(items) ? items : []).filter((i) => i && typeof i.id === "string");
  const staticById = new Map(DISHES.map((d) => [d.id, d]));
  const missingIds = Array.from(new Set(wanted.map((i) => i.id).filter((id) => !staticById.has(id))));
  const customs = missingIds.length
    ? await prisma.customDish.findMany({ where: { id: { in: missingIds }, available: true } })
    : [];
  const customById = new Map(customs.map((c) => [c.id, c]));

  const lines: PricedLine[] = [];
  for (const it of wanted) {
    const qty = Math.min(50, Math.max(1, Math.floor(Number(it.qty) || 0)));
    const d = staticById.get(it.id) ?? customById.get(it.id);
    if (!d) continue;
    const unit = Math.round(d.price * 1000);
    lines.push({ id: it.id, name: d.name, qty, unit, lineTotal: unit * qty });
  }
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const serviceFee = Math.round(subtotal * 0.1);
  return { lines, subtotal, serviceFee, total: subtotal + serviceFee };
}
