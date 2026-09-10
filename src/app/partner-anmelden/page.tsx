"use client";

import Link from "next/link";
import LumaLogo from "@/components/LumaLogo";
import PartnerLoginForm from "@/components/PartnerLoginForm";

export default function PartnerLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6" style={{ background: "#fafafa" }}>
      <div className="w-full max-w-xs">
        <div className="mb-8 flex flex-col items-center">
          <LumaLogo size={0.7} />
        </div>
        <p className="mb-4 text-center text-sm" style={{ color: "#a094a8" }}>
          Für meinen Partner / meine Partnerin
        </p>
        <PartnerLoginForm />
        <p className="mt-6 text-center text-xs" style={{ color: "#a094a8" }}>
          Noch kein eigenes Konto?{" "}
          <Link href="/partner-registrieren" className="font-medium" style={{ color: "#b799e5" }}>Registrieren</Link>
        </p>
        <div className="mt-4 flex justify-center">
          <Link href="/rolle" className="text-xs" style={{ color: "#b799e5" }}>← Zurück</Link>
        </div>
      </div>
    </main>
  );
}
