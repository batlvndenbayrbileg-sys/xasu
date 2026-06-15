import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login?redirect=/admin");
  return <AdminShell user={admin}>{children}</AdminShell>;
}
