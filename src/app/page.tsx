import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#fafafa" }}>
      {/* Logo */}
      <div className="flex flex-col items-center mb-16">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-5 shadow-sm" style={{ background: "#cdb4db" }}>
          <span className="text-5xl">🌸</span>
        </div>
        <h1 className="text-3xl font-light tracking-widest" style={{ color: "#3a2d3f" }}>Luma</h1>
        <p className="mt-2 text-sm tracking-wide" style={{ color: "#b79bcf" }}>Dein Zyklus-Begleiter</p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        <Link
          href="/login"
          className="w-full text-white font-medium rounded-2xl py-4 text-center text-sm tracking-wide transition-opacity hover:opacity-90"
          style={{ background: "#b79bcf" }}
        >
          Anmelden
        </Link>
        <Link
          href="/register"
          className="w-full font-medium rounded-2xl py-4 text-center text-sm tracking-wide transition-opacity hover:opacity-90"
          style={{ background: "#f8d7e6", color: "#b79bcf" }}
        >
          Konto erstellen
        </Link>
      </div>

      <p className="text-xs mt-12 tracking-wide" style={{ color: "#cdb4db" }}>Privat & sicher 🔒</p>
    </main>
  );
}
