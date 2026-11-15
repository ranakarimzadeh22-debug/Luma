import Link from "next/link";
import { redirect } from "next/navigation";
import { getNewAuthSession } from "@/lib/new-auth";
import { getPartnerConnectionStatusForOwner } from "@/lib/new-partner";
import NewPartnerCodeCard from "@/components/NewPartnerCodeCard";
import NewLogoutButton from "@/components/NewLogoutButton";
import NewOwnerMobileNav from "@/components/NewOwnerMobileNav";

export const dynamic = "force-dynamic";

export default async function NewSettingsPage() {
  const session = await getNewAuthSession();
  if (!session) redirect("/neu/rolle");

  const status = await getPartnerConnectionStatusForOwner(session.userId);

  return (
    <>
    <main className="min-h-screen bg-neutral-50 px-6 pb-24 pt-10 sm:pb-10">
      <section className="mx-auto flex w-full max-w-sm flex-col gap-8">
        <div className="space-y-2">
          <Link href="/neu" className="text-sm text-neutral-500 hover:text-neutral-900">← Zurück</Link>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Einstellungen</h1>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Partnerverbindung</h2>
          <NewPartnerCodeCard isConnected={status.connected} />
          {/* WP-027: read-only info card — the active connection alone decides what the partner sees. */}
          {status.connected && status.role === "owner" && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-neutral-950">Aktive Partnerverbindung</h3>
              <p className="mt-1 text-sm leading-6 text-neutral-600">Dein Partner sieht Kalender und Zyklus-Kreis.</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Konto</h2>
          <NewLogoutButton />
        </div>
      </section>
    </main>
    <NewOwnerMobileNav />
    </>
  );
}
