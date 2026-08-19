"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import PregnancyBelly from "@/components/PregnancyBelly";
import {
  getCurrentWeek,
  getPregnancyProgress,
  getPregnancyWeekData,
  getDueDate,
  type PregnancyWeek,
} from "@/lib/pregnancy";

/** Map fruit names to emojis for a more visual comparison */
const fruitEmojiMap: Record<string, string> = {
  "Mohnsamen": "🌱",
  "Stecknadelkopf": "📌",
  "Apfelsamen": "🌱",
  "Erbse": "🟢",
  "Blaubeere": "🫐",
  "Himbeere": "🍇",
  "Kirsche": "🍒",
  "Pflaume": "🫐",
  "Feige": "🫐",
  "Limette": "🍈",
  "Pfirsich": "🍑",
  "Zitrone": "🍋",
  "Apfel": "🍎",
  "Avocado": "🥑",
  "Birne": "🍐",
  "Paprika": "🫑",
  "Mango": "🥭",
  "Banane": "🍌",
  "Karotte": "🥕",
  "Kokosnuss": "🥥",
  "Grapefruit": "🍊",
  "Maiskolben": "🌽",
  "Rutabaga": "🥬",
  "Kohlrabi": "🥬",
  "Zucchini": "🥒",
  "Blumenkohl": "🥦",
  "Aubergine": "🍆",
  "Butternut-Kürbis": "🎃",
  "Kohl": "🥬",
  "Honigmelone": "🍈",
  "Ananas": "🍍",
  "Melone": "🍈",
  "Wassermelone (mini)": "🍉",
  "Wassermelone": "🍉",
  "Rhabarber": "🥬",
  "Kopfsalat": "🥬",
};

function getFruitEmoji(fruitName: string | undefined): string {
  if (!fruitName) return "🍎";
  if (fruitEmojiMap[fruitName]) return fruitEmojiMap[fruitName];
  for (const [key, emoji] of Object.entries(fruitEmojiMap)) {
    if (fruitName.includes(key) || key.includes(fruitName)) return emoji;
  }
  return "🍎";
}

interface PregnancyData {
  last_period_start: string | null;
  due_date: string | null;
  is_pregnant: boolean;
  mother_name: string;
}

const API_BASE =
  typeof window !== "undefined" ? window.location.origin : "";

function PartnerPregnancyContent() {
  const { token } = useParams<{ token: string }>();
  const { locale } = useLocale();

  const [data, setData] = useState<PregnancyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekData, setWeekData] = useState<PregnancyWeek | undefined>(undefined);
  const [weekDataLoading, setWeekDataLoading] = useState(false);

  async function fetchData() {
    if (!token) return;
    try {
      const res = await fetch(`/api/pregnancy/share/${token}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Unknown error" }));
        setError(errData.error ?? "Fehler beim Laden");
        setLoading(false);
        return;
      }
      const json: PregnancyData = await res.json();
      setData(json);
      setError(null);
      setLoading(false);
    } catch (err) {
      setError("Verbindungsfehler");
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Load week data from DB
  const week = data?.last_period_start ? getCurrentWeek(data.last_period_start) : 1;
  useEffect(() => {
    if (!data?.last_period_start) return;
    setWeekDataLoading(true);
    getPregnancyWeekData(week).then((wd) => {
      setWeekData(wd);
      setWeekDataLoading(false);
    });
  }, [week, data?.last_period_start]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#fafafa" }}>
        <p className="text-sm" style={{ color: "#a094a8" }}>
          {locale === "de" ? "Lade Schwangerschaftsdaten..." : locale === "fa" ? "در حال بارگذاری..." : "Loading pregnancy data..."}
        </p>
      </main>
    );
  }

  if (error || !data || !data.is_pregnant) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "#fafafa" }}>
        <div className="flex flex-col items-center gap-4 text-center max-w-xs">
          <div className="text-5xl">🤰</div>
          <h1 className="text-xl font-medium" style={{ color: "#3a2d3f" }}>
            {locale === "de" ? "Schwangerschaft" : locale === "fa" ? "بارداری" : "Pregnancy"}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#a094a8" }}>
            {error
              ? error
              : locale === "de"
              ? "Dieser Link ist nicht mehr gültig oder die Schwangerschaft wurde deaktiviert."
              : locale === "fa"
              ? "این لینک معتبر نیست یا بارداری غیرفعال شده است."
              : "This link is no longer valid or the pregnancy has been deactivated."}
          </p>
        </div>
      </main>
    );
  }

  const { last_period_start, due_date, mother_name } = data;

  if (!last_period_start) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#fafafa" }}>
        <p className="text-sm" style={{ color: "#a094a8" }}>
          {locale === "de" ? "Keine Schwangerschaftsdaten verfügbar." : locale === "fa" ? "اطلاعات بارداری موجود نیست." : "No pregnancy data available."}
        </p>
      </main>
    );
  }

  const progress = getPregnancyProgress(week);
  const dueDate = due_date ? new Date(due_date) : getDueDate(last_period_start);

  const dueDateStr = dueDate.toLocaleDateString(
    locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );

  // Countdown
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDay = new Date(dueDate);
  dueDay.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.max(0, Math.round((dueDay.getTime() - today.getTime()) / 86400000));

  const t = locale === "de" ? "de" : locale === "fa" ? "fa" : "en";

  const fruitName =
    t === "de" ? weekData?.fruitDe : t === "fa" ? weekData?.fruitFa : weekData?.fruitEn;
  const fruitEmoji = getFruitEmoji(weekData?.fruit);
  const milestoneText =
    t === "de" ? weekData?.milestoneDe : t === "fa" ? weekData?.milestoneFa : weekData?.milestoneEn;
  const tipText =
    t === "de" ? weekData?.tipDe : t === "fa" ? weekData?.tipFa : weekData?.tipEn;

  return (
    <main className="min-h-screen pb-10" style={{ background: "#fafafa" }}>
      {/* Header */}
      <div
        className="px-6 pt-10 pb-5 text-center"
        style={{ background: "#fff8f2", borderBottom: "1.5px solid #cfe8d5" }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#cfe8d5" }}>
          <span className="text-2xl">💑</span>
        </div>
        <h1 className="text-lg font-medium" style={{ color: "#3a2d3f" }}>
          {locale === "de"
            ? "Schwangerschafts-Ansicht"
            : locale === "fa"
            ? "نمایش بارداری"
            : "Pregnancy View"}
        </h1>
        {mother_name && (
          <p className="text-xs mt-1" style={{ color: "#a094a8" }}>
            {locale === "de"
              ? `Geteilt von ${mother_name}`
              : locale === "fa"
              ? `اشتراک‌گذاری شده توسط ${mother_name}`
              : `Shared by ${mother_name}`}
          </p>
        )}
      </div>

      <div className="px-5 py-6 max-w-md mx-auto flex flex-col gap-5">
        {/* === Week + Belly Card === */}
        <div
          className="rounded-3xl p-6 flex flex-col items-center gap-3"
          style={{ background: "#fff8f2", border: "1.5px solid #cfe8d5" }}
        >
          <p className="text-xs tracking-widest" style={{ color: "#5a9e72" }}>
            {locale === "de"
              ? "AKTUELLE SCHWANGERSCHAFTSWOCHE"
              : locale === "fa"
              ? "هفته فعلی بارداری"
              : "CURRENT PREGNANCY WEEK"}
          </p>

          <p className="text-5xl font-bold" style={{ color: "#3a2d3f" }}>
            {week}
          </p>

          <p className="text-xs" style={{ color: "#a094a8" }}>
            {locale === "de"
              ? `Woche ${week} von 40`
              : locale === "fa"
              ? `هفته ${week} از ۴۰`
              : `Week ${week} of 40`}
          </p>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full" style={{ background: "#f4e8f8" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "#cfe8d5" }}
            />
          </div>

          {/* SVG Belly */}
          <div className="my-2">
            <PregnancyBelly week={week} />
          </div>
        </div>

        {/* === Baby Info Card === */}
        {weekData && (
          <div
            className="rounded-3xl p-5"
            style={{ background: "#f0faf4", border: "1.5px solid #cfe8d5" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">👶</span>
              <p className="text-sm font-medium" style={{ color: "#3a2d3f" }}>
                {locale === "de" ? "Das Baby" : locale === "fa" ? "نوزاد" : "The Baby"}
              </p>
            </div>

            <div className="flex gap-6 mb-3">
              <div>
                <p className="text-xs" style={{ color: "#a094a8" }}>
                  {locale === "de" ? "Größe" : locale === "fa" ? "اندازه" : "Size"}
                </p>
                <p className="text-xl font-semibold" style={{ color: "#3a2d3f" }}>
                  {weekData.sizeCm} cm
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: "#a094a8" }}>
                  {locale === "de" ? "Gewicht" : locale === "fa" ? "وزن" : "Weight"}
                </p>
                <p className="text-xl font-semibold" style={{ color: "#3a2d3f" }}>
                  {weekData.weightG > 0 ? `${weekData.weightG} g` : "—"}
                </p>
              </div>
            </div>

            {/* Fruit comparison */}
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: "#fff8f2", border: "1.5px solid #ffd9c7" }}
            >
              <span className="text-3xl">{fruitEmoji}</span>
              <div>
                <p className="text-xs" style={{ color: "#c4845a" }}>
                  {locale === "de"
                    ? "So groß wie"
                    : locale === "fa"
                    ? "به اندازه"
                    : "The size of a"}
                </p>
                <p className="font-medium text-base" style={{ color: "#3a2d3f" }}>
                  {fruitEmoji} {fruitName}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* === Countdown + Due Date === */}
        <div
          className="rounded-3xl p-5 text-center"
          style={{ background: "#fff8f2", border: "1.5px solid #cfe8d5" }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">❤️</span>
            <p className="text-2xl font-bold" style={{ color: "#b799e5" }}>
              {daysUntilDue === 0
                ? locale === "de"
                  ? "Heute ist es soweit! 💕"
                  : locale === "fa"
                  ? "امروز روزش است! 💕"
                  : "It's today! 💕"
                : locale === "de"
                ? `Noch ${daysUntilDue} Tage`
                : locale === "fa"
                ? `${daysUntilDue} روز دیگر`
                : `${daysUntilDue} days left`}
            </p>
          </div>
          {daysUntilDue > 0 && (
            <p className="text-xs" style={{ color: "#a094a8" }}>
              {locale === "de"
                ? "bis zum errechneten Geburtstermin"
                : locale === "fa"
                ? "تا تاریخ تخمینی زایمان"
                : "until the estimated due date"}
            </p>
          )}
          <div className="mt-3 pt-3 border-t" style={{ borderColor: "#f4e8f8" }}>
            <p className="text-xs" style={{ color: "#5a9e72" }}>
              🍼{" "}
              {locale === "de"
                ? "Voraussichtlicher Geburtstermin"
                : locale === "fa"
                ? "تاریخ تخمینی زایمان"
                : "Estimated due date"}
            </p>
            <p className="text-base font-medium" style={{ color: "#3a2d3f" }}>
              {dueDateStr}
            </p>
          </div>
        </div>

        {/* === Milestone === */}
        {milestoneText && (
          <div
            className="rounded-3xl p-5"
            style={{ background: "#fff8f2", border: "1.5px solid #b799e5" }}
          >
            <p className="text-xs mb-2" style={{ color: "#b799e5" }}>
              ✨{" "}
              {locale === "de" ? "Entwicklung" : locale === "fa" ? "رشد" : "Development"}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#3a2d3f" }}>
              {milestoneText}
            </p>
          </div>
        )}

        {/* === Tip === */}
        {tipText && (
          <div
            className="rounded-3xl p-5"
            style={{ background: "#fff8f2", border: "1.5px solid #ffd9c7" }}
          >
            <p className="text-xs mb-2" style={{ color: "#c4845a" }}>
              💡{" "}
              {locale === "de" ? "Tipp" : locale === "fa" ? "نکته" : "Tip"}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#3a2d3f" }}>
              {tipText}
            </p>
          </div>
        )}

        {/* === Footer === */}
        <p className="text-center text-xs pb-4" style={{ color: "#b799e5" }}>
          Luma – Gemeinsam durch die Schwangerschaft 💕
        </p>
      </div>
    </main>
  );
}

export default function PartnerPregnancyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center" style={{ background: "#fafafa" }}>
          <p className="text-sm" style={{ color: "#a094a8" }}>Lade...</p>
        </main>
      }
    >
      <PartnerPregnancyContent />
    </Suspense>
  );
}