import Link from "next/link";
import { redirect } from "next/navigation";
import NewLoginForm from "@/components/NewLoginForm";
import { getNewAuthSession } from "@/lib/new-auth";

export const dynamic = "force-dynamic";

export default async function NewLoginPage() {
  if (await getNewAuthSession()) redirect("/neu");

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-6 py-10">
      <section className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-500">Neue App</p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Anmelden</h1>
          <p className="text-sm leading-6 text-neutral-600">Melde dich mit deinem neuen Luma-Konto an.</p>
        </div>
        <NewLoginForm />
        <p className="text-center text-sm text-neutral-600">
          Noch kein neues Konto?{" "}
          <Link href="/neu/registrieren" className="font-medium text-neutral-950 underline underline-offset-4">Registrieren</Link>
        </p>
        <Link href="/neu" className="text-center text-sm text-neutral-500 hover:text-neutral-900">Zurück</Link>
      </section>
    </main>
  );
}
