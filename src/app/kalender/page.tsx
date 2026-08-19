"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KalenderPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/zyklus");
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "#fef6f8" }}>
      <p className="text-sm" style={{ color: "#a094a8" }}>Weiterleitung zum Cycle Tracker …</p>
    </main>
  );
}