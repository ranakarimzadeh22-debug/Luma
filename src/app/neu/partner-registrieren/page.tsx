import Link from "next/link";
import { redirect } from "next/navigation";
import NewRegisterForm from "@/components/NewRegisterForm";
import { getNewAuthSession } from "@/lib/new-auth";

export const dynamic = "force-dynamic";

export default async function NewPartnerRegisterPage() {
  if (await getNewAuthSession()) redirect("/neu/partner");

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-6 py-10">
      <section className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-500">Für meinen Partner / meine Partnerin</p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Eigenes Konto erstellen</h1>
          <p className="text-sm leading-6 text-neutral-600">
            Dieses Konto gehört nur dir. Danach kannst du einen Verbindungscode eingeben.
          </p>
        </div>
        <NewRegisterForm redirectTo="/neu/partner" />
        <p className="text-center text-sm text-neutral-600">
          Schon registriert?{" "}
          <Link href="/neu/partner-anmelden" className="font-medium text-neutral-950 underline underline-offset-4">Anmelden</Link>
        </p>
        <Link href="/neu/rolle" className="text-center text-sm text-neutral-500 hover:text-neutral-900">Zurück</Link>
      </section>
    </main>
  );
}
