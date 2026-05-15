import Link from "next/link";
import LumaLogo from "@/components/LumaLogo";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#fafafa" }}>
      {/* Logo */}
      <div className="flex flex-col items-center mb-14">
        <LumaLogo size={1.1} />
      </div>

      {/* Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        <Link
          href="/login"
          className="w-full text-white font-medium rounded-2xl py-4 text-center text-sm tracking-wide hover:opacity-90 transition-opacity"
          style={{ background: "#b799e5" }}
        >
          Anmelden
        </Link>
        <Link
          href="/register"
          className="w-full font-medium rounded-2xl py-4 text-center text-sm tracking-wide hover:opacity-90 transition-opacity"
          style={{ background: "#ec6f9e", color: "#b799e5" }}
        >
          Konto erstellen
        </Link>
      </div>

      <p className="text-xs mt-10 tracking-wide" style={{ color: "#b799e5" }}>Privat & sicher 🔒</p>
    </main>
  );
}

