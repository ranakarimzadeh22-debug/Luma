import Link from "next/link";
import { redirect } from "next/navigation";
import { getNewAuthSession } from "@/lib/new-auth";
import { getPartnerConnectionStatusForOwner } from "@/lib/new-partner";
import NewPartnerCodeCard from "@/components/NewPartnerCodeCard";
import NewLogoutButton from "@/components/NewLogoutButton";

export const dynamic = "force-dynamic";

export default async function NewSettingsPage() {
  const session = await getNewAuthSession();
  if (!session) redirect("/neu/rolle");

  const status = await getPartnerConnectionStatusForOwner(session.userId);

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10">
      <section className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <div className="space-y-2">
          <Link href="/neu" className="text-sm text-neutral-500 hover:text-neutral-900">← Zurück</Link>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Einstellungen</h1>
        </div>
        <NewPartnerCodeCard isConnected={status.connected} />
        <NewLogoutButton />
      </section>
    </main>
  );
}
