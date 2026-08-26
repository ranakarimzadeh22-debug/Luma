import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <nav aria-label="App auswählen" className="flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/login"
          className="w-full rounded-xl bg-neutral-900 px-5 py-4 text-center text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          Alte App
        </Link>
        <Link
          href="/neu"
          className="w-full rounded-xl border border-neutral-300 bg-white px-5 py-4 text-center text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          Neue App
        </Link>
      </nav>
    </main>
  );
}
