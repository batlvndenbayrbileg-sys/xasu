"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTableSession } from "@/lib/table-session";
import { TABLES } from "@/lib/data";
import { toast } from "@/lib/toast";

const TABLE_BY_ID = new Map(TABLES.map((t) => [t.id, t]));

/**
 * Reads `?table=t01` from URL (QR-code link from a physical table) and locks
 * the table into the session. Ignores ids that don't match a real table so a
 * tampered/bogus `?table=` value can't poison the order.
 */
export default function TableFromUrl() {
  const params = useSearchParams();
  const setTable = useTableSession((s) => s.setTable);
  const currentTable = useTableSession((s) => s.tableId);

  useEffect(() => {
    const t = params.get("table");
    if (!t) return;
    const table = TABLE_BY_ID.get(t);
    if (!table) return; // unknown table id — ignore silently
    if (t !== currentTable) {
      setTable(t, "qr");
      toast.success(`${table.label} ширээнд тавтай морилно уу`);
    }
  }, [params, currentTable, setTable]);

  return null;
}
