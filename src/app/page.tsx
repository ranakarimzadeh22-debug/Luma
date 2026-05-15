import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-400 to-purple-400 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex flex-col items-center mb-12">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
          <span className="text-4xl">🌸</span>
        </div>
        <h1 className="text-4xl font-bold text-white">Luma</h1>
        <p className="text-rose-100 mt-2 text-center text-sm">Dein persönlicher Zyklus-Begleiter</p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        <Link
          href="/login"
          className="w-full bg-white text-rose-500 font-semibold rounded-2xl py-4 text-center shadow-md hover:bg-rose-50 transition-colors"
        >
          Anmelden
        </Link>
        <Link
          href="/register"
          className="w-full bg-rose-500 text-white font-semibold rounded-2xl py-4 text-center shadow-md border-2 border-white/30 hover:bg-rose-600 transition-colors"
        >
          Konto erstellen
        </Link>
      </div>

      <p className="text-rose-100 text-xs mt-10 text-center">
        Deine Daten bleiben privat und sicher 🔒
      </p>
    </main>
  );
}
