/** Deposit charged to confirm a reservation (MNT, integer). */
export const DEPOSIT_MNT = 20000;

export function formatMnt(amount: number): string {
  return "₮" + amount.toLocaleString("en-US");
}
