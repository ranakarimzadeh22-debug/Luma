import Link from "next/link";
import { getNewAuthSession } from "@/lib/new-auth";
import NewLogoutButton from "@/components/NewLogoutButton";
import NewFirstNameForm from "@/components/NewFirstNameForm";
import NewCycleExample from "@/components/NewCycleExample";

export const dynamic = "force-dynamic";

export default async function NewAppPage() {
  const session = await getNewAuthSession();

  if (!session) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-50 px-6">
        <section className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-500">Neue App</p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Willkommen bei Luma</h1>
            <p className="text-sm leading-6 text-neutral-600">
              Erstelle ein neues Konto oder melde dich mit deinem neuen Luma-Konto an.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/neu/registrieren" className="rounded-xl bg-neutral-900 px-5 py-3.5 text-center text-sm font-medium text-white hover:bg-neutral-700">
              Neues Konto erstellen
            </Link>
            <Link href="/neu/anmelden" className="rounded-xl border border-neutral-300 bg-white px-5 py-3.5 text-center text-sm font-medium text-neutral-900 hover:bg-neutral-100">
              Anmelden
            </Link>
            <Link href="/" className="pt-2 text-center text-sm text-neutral-500 hover:text-neutral-900">
              Zur App-Auswahl
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!session.firstName) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-50 px-6">
        <section className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-500">Nur noch ein Schritt</p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
              Wie dürfen wir dich nennen?
            </h1>
            <p className="text-sm leading-6 text-neutral-600">
              Ergänze deinen Vornamen einmalig für deine persönliche Begrüßung.
            </p>
          </div>
          <NewFirstNameForm />
          <NewLogoutButton />
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6">
      <section className="mx-auto flex w-full max-w-md flex-col gap-7 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-500">Herzlich willkommen bei Luma</p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
              Hallo {session.firstName}
            </h1>
          </div>
          <div className="grid size-11 shrink-0 place-items-center rounded-full border border-neutral-200 bg-neutral-100 text-neutral-700" aria-label="Profil">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-none stroke-current" strokeWidth="1.8">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6" strokeLinecap="round" />
            </svg>
          </div>
        </header>

        <NewCycleExample />
      </section>
    </main>
  );
}
