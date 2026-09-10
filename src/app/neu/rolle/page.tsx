import Link from "next/link";
import { redirect } from "next/navigation";
import { getNewAuthSession } from "@/lib/new-auth";

export const dynamic = "force-dynamic";

export default async function NewRolePage() {
  if (await getNewAuthSession()) redirect("/neu");

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-6">
      <section className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-500">Neue App</p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Wer bist du hier?</h1>
          <p className="text-sm leading-6 text-neutral-600">
            Diese Wahl entscheidet nur über den nächsten Schritt.
          </p>
        </div>
        <nav aria-label="Rollenwahl" className="flex flex-col gap-3">
          <Link
            href="/neu/registrieren"
            className="rounded-xl bg-neutral-900 px-5 py-3.5 text-center text-sm font-medium text-white hover:bg-neutral-700"
          >
            Für mich selbst
          </Link>
          <Link
            href="/neu/partner"
            className="rounded-xl border border-neutral-300 bg-white px-5 py-3.5 text-center text-sm font-medium text-neutral-900 hover:bg-neutral-100"
          >
            Für meinen Partner / meine Partnerin
          </Link>
          <Link href="/" className="pt-2 text-center text-sm text-neutral-500 hover:text-neutral-900">
            Zur App-Auswahl
          </Link>
        </nav>
      </section>
    </main>
  );
}
