"use client";

import { useRouter } from "next/navigation";
import { LogOut, ChevronRight, Heart, Receipt, CalendarRange, BookOpen, Loader2, User as UserIcon } from "lucide-react";
import { useSession } from "@/lib/useSession";
import { useI18n } from "@/lib/i18n";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout } = useSession();
  const { t } = useI18n();

  if (loading) {
    return <div className="pt-40 grid place-items-center"><Loader2 className="animate-spin text-neutral-400" /></div>;
  }

  if (!user) {
    return (
      <div className="pt-24 md:pt-32 min-h-[80vh]">
        <div className="mx-auto max-w-md px-6 text-center bg-white border border-line rounded-2xl shadow-card py-16 mt-8">
          <div className="w-16 h-16 rounded-full bg-neutral-100 grid place-items-center mx-auto"><UserIcon size={28} className="text-neutral-400" /></div>
          <h3 className="text-[18px] font-bold mt-4">{t("profile.notSignedIn")}</h3>
          <p className="text-muted mt-1">{t("profile.notSignedSub")}</p>
          <button onClick={() => router.push("/login?redirect=/profile")}
            className="mt-6 bg-accent text-white font-semibold px-7 py-3 rounded-full shadow-glow hover:bg-accent-soft transition">{t("nav.signIn")}</button>
        </div>
      </div>
    );
  }

  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="pt-24 md:pt-32 min-h-[80vh]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="bg-ink text-white rounded-3xl p-8 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-accent grid place-items-center text-[26px] font-bold shadow-glow">{initials}</div>
          <div>
            <h1 className="font-display text-[26px] font-bold">{user.name}</h1>
            <p className="text-neutral-400">{user.email}</p>
            <p className="text-[12px] text-neutral-500 mt-1">{t("profile.memberSince")} {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mt-8">
          <Section title={t("profile.activity")}>
            <Item icon={<Receipt size={18} />} label={t("profile.myBookings")} onClick={() => router.push("/orders")} />
            <Item icon={<Heart size={18} />} label={t("profile.favourites")} onClick={() => router.push("/favorites")} />
          </Section>
          <Section title={t("profile.shortcuts")}>
            <Item icon={<CalendarRange size={18} />} label={t("nav.reserve")} onClick={() => router.push("/book")} />
            <Item icon={<BookOpen size={18} />} label={t("nav.menu")} onClick={() => router.push("/menu")} />
          </Section>
        </div>

        <button onClick={async () => { await logout(); router.push("/"); router.refresh(); }}
          className="mt-8 w-full sm:w-auto flex items-center justify-center gap-2 border border-red-200 text-red-500 font-semibold px-8 py-3.5 rounded-full hover:bg-red-50 transition">
          <LogOut size={16} /> {t("profile.signOut")}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[12px] font-semibold text-neutral-400 px-1 mb-2 uppercase tracking-wide">{title}</h3>
      <div className="bg-white border border-line rounded-2xl divide-y divide-line overflow-hidden shadow-card">{children}</div>
    </div>
  );
}

function Item({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-neutral-50 transition">
      <span className="text-accent">{icon}</span>
      <span className="flex-1 text-left text-[14px] font-medium">{label}</span>
      <ChevronRight size={16} className="text-neutral-300" />
    </button>
  );
}
