import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#fafafa" }}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl" style={{ background: "#f4c7d7" }}>
          📅
        </div>
        <h1 className="text-xl font-medium" style={{ color: "#3a2d3f" }}>Kalender</h1>
        <p className="text-sm" style={{ color: "#a094a8" }}>Dein Zyklus-Kalender kommt bald</p>
        <Link href="/dashboard" className="mt-4 text-sm font-medium rounded-2xl px-6 py-3 hover:opacity-80 transition-opacity" style={{ background: "#f4c7d7", color: "#b799e5" }}>
          ← Zurück
        </Link>
      </div>
    </main>
  );
}

