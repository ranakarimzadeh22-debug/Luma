"use client";

import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import VitaminChecklist from "@/components/VitaminChecklist";
import WaterTracker from "@/components/WaterTracker";

export default function GesundheitPage() {
  const { t, isRtl } = useLocale();

  const nutrients = [
    t.vitamins.folate,
    t.vitamins.vitaminD,
    t.vitamins.vitaminB12,
    t.vitamins.iron,
    t.vitamins.magnesium,
    t.vitamins.omega3,
    t.vitamins.calcium,
    t.vitamins.vitaminC,
  ];

  return (
    <main
      className="min-h-screen px-4 py-8"
      style={{ background: "#fafafa" }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: "#b799e5" }}
            >
              💚
            </div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "#3a2d3f" }}>
                {t.vitamins.title}
              </h1>
              <p className="text-xs" style={{ color: "#a094a8" }}>
                {t.vitamins.subtitle}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium rounded-2xl px-4 py-2 hover:opacity-80 transition-opacity"
            style={{ background: "#b799e5", color: "#fff" }}
          >
            ← {isRtl ? "داشبورد" : "Dashboard"}
          </Link>
        </div>

        {/* Vitamin To-do Checklist */}
        <VitaminChecklist vitamins={nutrients} />

        {/* Wasser-Tracker */}
        <section>
          <WaterTracker />
        </section>

        {/* Footer Note */}
        <p
          className="text-xs text-center opacity-50 mt-2"
          style={{ color: "#a094a8" }}
        >
          {isRtl
            ? "این اطلاعات فقط برای راهنمایی است و جایگزین مشاوره پزشکی نیست."
            : "Diese Informationen dienen nur der Orientierung und ersetzen keine ärztliche Beratung."}
        </p>
      </div>
    </main>
  );
}
