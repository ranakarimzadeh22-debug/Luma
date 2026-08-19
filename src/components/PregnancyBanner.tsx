"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import {
  getCurrentWeek,
  getPregnancyProgress,
  getDueDate,
  type PregnancyWeek,
} from "@/lib/pregnancy";
import { getPregnancyWeekData } from "@/lib/pregnancy-data";

interface PregnancyBannerProps {
  lastPeriodStart: string;
  dueDate: string;
}

export default function PregnancyBanner({ lastPeriodStart, dueDate }: PregnancyBannerProps) {
  const { locale } = useLocale();
  const week = getCurrentWeek(lastPeriodStart);
  const progress = getPregnancyProgress(week);
  const due = new Date(dueDate);
  const [weekData, setWeekData] = useState<PregnancyWeek | undefined>(undefined);

  useEffect(() => {
    getPregnancyWeekData(week).then(setWeekData);
  }, [week]);

  const dueDateStr = due.toLocaleDateString(
    locale === "de" ? "de-DE" : locale === "fa" ? "fa-IR" : "en-US",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const fruitName = locale === "de" ? weekData?.fruitDe : locale === "fa" ? weekData?.fruitFa : weekData?.fruitEn;

  return (
    <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: "1.5px solid #cfe8d5" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#cfe8d533" }}>
          <span className="text-lg">🤰</span>
        </div>
        <div>
          <p className="text-xs" style={{ color: "#5a9e72" }}>
            {locale === "de" ? "Schwangerschaft" : locale === "fa" ? "بارداری" : "Pregnancy"}
          </p>
          <p className="font-medium text-sm" style={{ color: "#3a2d3f" }}>
            {locale === "de" ? `Woche ${week} von 40` : locale === "fa" ? `هفته ${week} از ۴۰` : `Week ${week} of 40`}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full mb-3" style={{ background: "#f4e8f8" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, background: "#cfe8d5" }}
        />
      </div>

      {/* Fruit & size */}
      {weekData && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🍎</span>
          <p className="text-xs" style={{ color: "#a094a8" }}>
            {locale === "de"
              ? `So groß wie eine ${fruitName} (${weekData.sizeCm} cm, ${weekData.weightG}g)`
              : locale === "fa"
              ? `به اندازه ${fruitName} (${weekData.sizeCm} سانتی‌متر، ${weekData.weightG} گرم)`
              : `Size of a ${fruitName} (${weekData.sizeCm} cm, ${weekData.weightG}g)`}
          </p>
        </div>
      )}

      {/* Due date */}
      <p className="text-xs" style={{ color: "#5a9e72" }}>
        🍼 {locale === "de" ? "Geburtstermin" : locale === "fa" ? "تاریخ زایمان" : "Due date"}: {dueDateStr}
      </p>
    </div>
  );
}