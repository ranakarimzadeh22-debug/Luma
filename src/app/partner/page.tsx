"use client";

import Link from "next/link";
import PartnerCard from "@/components/PartnerCard";

export default function PartnerPage() {
  return (
    <main className="min-h-screen" style={{ background: "#fafafa" }}>
      <div className="px-6 pt-12 pb-5 border-b" style={{ background: "#fff8f2", borderColor: "#ec6f9e" }}>
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Link href="/dashboard" className="text-lg" style={{ color: "#b799e5" }}>←</Link>
          <h1 className="text-lg font-medium" style={{ color: "#3a2d3f" }}>Partner Link</h1>
        </div>
      </div>
      <div className="px-5 py-6 max-w-md mx-auto">
        <PartnerCard />
      </div>
    </main>
  );
}

