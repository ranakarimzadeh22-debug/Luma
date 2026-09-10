import Link from "next/link";
import { redirect } from "next/navigation";
import NewLoginForm from "@/components/NewLoginForm";
import { getNewAuthSession } from "@/lib/new-auth";

export const dynamic = "force-dynamic";

export default async function NewPartnerLoginPage() {
  if (await getNewAuthSession()) redirect("/neu/partner");

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-6">
      <section className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-500">Für meinen Partner / meine Partnerin</p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Anmelden</h1>
          <p className="text-sm leading-6 text-neutral-600">Melde dich mit deinem eigenen Konto an.</p>
        </div>
        <NewLoginForm redirectTo="/neu/partner" />
        <p className="text-center text-sm text-neutral-600">
          Noch kein eigenes Konto?{" "}
          <Link href="/neu/partner-registrieren" className="font-medium text-neutral-950 underline underline-offset-4">Registrieren</Link>
        </p>
        <Link href="/neu/rolle" className="text-center text-sm text-neutral-500 hover:text-neutral-900">Zurück</Link>
      </section>
    </main>
  );
}
