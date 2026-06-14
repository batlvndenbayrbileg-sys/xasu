/** Deposit charged to confirm a reservation (MNT, integer). */
export const DEPOSIT_MNT = 20000;

export function formatMnt(amount: number): string {
  return "₮" + amount.toLocaleString("en-US");
}

/** Display price for a dish — base price is normalised to thousands of MNT
 *  so a `price: 22` reads as `₮22,000` (typical Ulaanbaatar dish price). */
export function formatDishPrice(price: number): string {
  return formatMnt(Math.round(price * 1000));
}
