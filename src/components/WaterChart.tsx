"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAuth } from "@/context/AuthContext";
import { getWaterHistory, getBodyMetrics } from "@/lib/health";
import { calculateWaterGoal, getTodayKey } from "@/lib/health-utils";

const CHART_HEIGHT = 120;
const BAR_WIDTH = 28;
const DAY_LABEL_WIDTH = 40;

export default function WaterChart() {
  const { locale, isRtl } = useLocale();
  const { user } = useAuth();
  const [data, setData] = useState<{ date: string; water_liters: number }[]>([]);
  const [goal, setGoal] = useState(2.0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    async function load() {
      const [history, metrics] = await Promise.all([
        getWaterHistory(uid),
        getBodyMetrics(uid),
      ]);
      setData(history);
      setGoal(calculateWaterGoal(metrics?.weight_kg ?? null, metrics?.height_cm ?? null));
      setLoaded(true);
    }
    load();
  }, [user]);

  if (!loaded || data.length === 0) return null;

  const maxValue = Math.max(goal, ...data.map((d) => d.water_liters), 0.5);
  const maxRounded = Math.ceil(maxValue * 2) / 2; // round to nearest 0.5

  // Format day label
  const todayStr = getTodayKey();
  function dayLabel(dateStr: string): string {
    const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
    const localeDays =
      locale === "de"
        ? ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
        : locale === "fa"
        ? ["ی", "د", "س", "چ", "پ", "ج", "ش"]
        : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const d = new Date(dateStr + "T00:00:00");
    const dayIdx = d.getDay();
    if (dateStr === todayStr) {
      return locale === "de" ? "Heute" : locale === "fa" ? "امروز" : "Today";
    }
    return localeDays[dayIdx];
  }

  const svgWidth = data.length * DAY_LABEL_WIDTH + 20; // 20px left padding

  return (
    <div
      className="rounded-2xl p-5 shadow-sm"
      style={{ background: "#f0f7ff", border: "1px solid #d0e4f5" }}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📊</span>
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#2d4a6f" }}>
            {locale === "de"
              ? "Wasser der letzten 7 Tage"
              : locale === "fa"
              ? "آب ۷ روز گذشته"
              : "Last 7 days water"}
          </h2>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="overflow-x-auto">
        <svg
          width={svgWidth}
          height={CHART_HEIGHT + 40}
          viewBox={`0 0 ${svgWidth} ${CHART_HEIGHT + 40}`}
          className="block mx-auto"
        >
          {/* Y-axis goal line */}
          {goal > 0 && (
            <>
              <line
                x1={10}
                y1={yPos(goal)}
                x2={svgWidth - 10}
                y2={yPos(goal)}
                stroke="#b799e5"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                opacity={0.7}
              />
              {/* Goal label on left */}
              <text
                x={8}
                y={yPos(goal) - 4}
                fill="#b799e5"
                fontSize={9}
                fontWeight="600"
                textAnchor="start"
              >
                🎯 {goal.toFixed(1)}L
              </text>
            </>
          )}

          {/* Bars */}
          {data.map((entry, i) => {
            const barH = (entry.water_liters / maxRounded) * CHART_HEIGHT;
            const x = 20 + i * DAY_LABEL_WIDTH + (DAY_LABEL_WIDTH - BAR_WIDTH) / 2;
            const y = CHART_HEIGHT - barH;
            const isToday = entry.date === todayStr;
            const reachedGoal = entry.water_liters >= goal;

            return (
              <g key={entry.date}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={BAR_WIDTH}
                  height={barH}
                  rx={4}
                  ry={4}
                  fill={isToday ? "#38bdf8" : reachedGoal ? "#7bbf8e" : "#b0d4e8"}
                  opacity={isToday ? 1 : 0.7}
                >
                  <title>{entry.water_liters.toFixed(1)}L</title>
                </rect>
                {/* Value on top */}
                {entry.water_liters > 0 && (
                  <text
                    x={x + BAR_WIDTH / 2}
                    y={y - 6}
                    fill="#4a6a8f"
                    fontSize={9}
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {entry.water_liters.toFixed(1)}
                  </text>
                )}
                {/* Day label */}
                <text
                  x={x + BAR_WIDTH / 2}
                  y={CHART_HEIGHT + 16}
                  fill={isToday ? "#1e3a5f" : "#7a9bb5"}
                  fontSize={10}
                  fontWeight={isToday ? "700" : "500"}
                  textAnchor="middle"
                >
                  {dayLabel(entry.date)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );

  function yPos(val: number): number {
    return CHART_HEIGHT - (val / maxRounded) * CHART_HEIGHT;
  }
}