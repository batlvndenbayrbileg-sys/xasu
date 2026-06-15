import clsx from "clsx";
import { formatMnt } from "@/lib/payments";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    CONFIRMED: "bg-emerald-50 text-emerald-700",
    ARRIVED: "bg-sky-50 text-sky-700",
    COMPLETED: "bg-violet-50 text-violet-700",
    CANCELLED: "bg-neutral-100 text-neutral-500",
    NO_SHOW: "bg-red-50 text-red-600",
  };
  return <span className={clsx("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md", map[status] ?? "bg-neutral-100")}>{status}</span>;
}

export function PaymentBadge({ status, amount }: { status: string; amount: number }) {
  const map: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700",
    unpaid: "bg-amber-50 text-amber-700",
    refunded: "bg-sky-50 text-sky-700",
    failed: "bg-red-50 text-red-600",
  };
  return (
    <span className={clsx("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md whitespace-nowrap", map[status] ?? "bg-neutral-100")}>
      {status === "paid" ? `Paid · ${formatMnt(amount)}` : status}
    </span>
  );
}
