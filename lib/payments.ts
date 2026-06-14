/** Deposit charged to confirm a reservation (MNT, integer). */
export const DEPOSIT_MNT = 20000;
/** Default operator to dispatch to (QPay). */
export const DEFAULT_OPERATOR = "qpay";

export function formatMnt(amount: number): string {
  return "₮" + amount.toLocaleString("en-US");
}
