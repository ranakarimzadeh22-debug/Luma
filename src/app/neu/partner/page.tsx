import Link from "next/link";
import { getNewAuthSession } from "@/lib/new-auth";
import { getPartnerConnectionStatusForPartner } from "@/lib/new-partner";
import NewPartnerRedeemForm from "@/components/NewPartnerRedeemForm";
import NewPartnerEndButton from "@/components/NewPartnerEndButton";
import NewLogoutButton from "@/components/NewLogoutButton";

export const dynamic = "force-dynamic";

export default async function NewPartnerPage() {
  const session = await getNewAuthSession();

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-50 px-6">
        <section className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-500">Für meinen Partner / meine Partnerin</p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Erst ein eigenes Konto</h1>
            <p className="text-sm leading-6 text-neutral-600">
              Du brauchst ein eigenes Konto, bevor du einen Verbindungscode eingeben kannst.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href="/neu/partner-registrieren"
              className="rounded-xl bg-neutral-900 px-5 py-3.5 text-center text-sm font-medium text-white hover:bg-neutral-700"
            >
              Eigenes Konto erstellen
            </Link>
            <Link
              href="/neu/partner-anmelden"
              className="rounded-xl border border-neutral-300 bg-white px-5 py-3.5 text-center text-sm font-medium text-neutral-900 hover:bg-neutral-100"
            >
              Anmelden
            </Link>
            <Link href="/neu/rolle" className="pt-2 text-center text-sm text-neutral-500 hover:text-neutral-900">
              Zurück
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const status = await getPartnerConnectionStatusForPartner(session.userId);

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-6">
      <section className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-500">Für meinen Partner / meine Partnerin</p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
            {status.connected ? "Verbindung aktiv" : "Verbindungscode eingeben"}
          </h1>
        </div>

        {status.connected ? (
          <>
            <p className="text-sm leading-6 text-neutral-600">
              Deine Verbindung ist aktiv. Weitere Inhalte folgen in einem späteren Schritt.
            </p>
            <NewPartnerEndButton />
          </>
        ) : (
          <NewPartnerRedeemForm />
        )}

        <NewLogoutButton />
      </section>
    </main>
  );
}
