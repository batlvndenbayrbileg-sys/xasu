"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTableSession } from "@/lib/table-session";
import { toast } from "@/lib/toast";

/**
 * Reads `?table=T-12` from URL (QR-code link from a physical table) and locks
 * the table into the session. Once set, all orders default to that table.
 */
export default function TableFromUrl() {
  const params = useSearchParams();
  const setTable = useTableSession((s) => s.setTable);
  const currentTable = useTableSession((s) => s.tableId);

  useEffect(() => {
    const t = params.get("table");
    if (!t) return;
    if (t !== currentTable) {
      setTable(t, "qr");
      toast.success(`${t} ширээнд тавтай морилно уу`);
    }
  }, [params, currentTable, setTable]);

  return null;
}
