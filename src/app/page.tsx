import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex flex-col items-center mb-16">
        <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-5">
          <span className="text-4xl">🌸</span>
        </div>
        <h1 className="text-3xl font-light text-gray-900 tracking-wide">Luma</h1>
        <p className="text-gray-400 mt-2 text-sm tracking-wide">Dein Zyklus-Begleiter</p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        <Link
          href="/login"
          className="w-full bg-rose-400 text-white font-medium rounded-2xl py-4 text-center text-sm tracking-wide hover:bg-rose-500 transition-colors"
        >
          Anmelden
        </Link>
        <Link
          href="/register"
          className="w-full bg-white text-rose-400 font-medium rounded-2xl py-4 text-center text-sm tracking-wide border border-rose-200 hover:bg-rose-50 transition-colors"
        >
          Konto erstellen
        </Link>
      </div>

      <p className="text-gray-300 text-xs mt-12 tracking-wide">Privat & sicher 🔒</p>
    </main>
  );
}
