"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPeriodReminderData } from "@/lib/actions/user-data";
import { getDaysUntilNextPeriod } from "@/lib/cycle";

const STORAGE_KEY = "luma-reminder-last-shown";

function getMessages(days: number, name: string) {
  if (days === 0) return {
    title: "🌹 Deine Periode beginnt heute",
    body: `Hallo ${name}! Deine Periode beginnt heute. Gönn dir Wärme und Fürsorge 💝`,
    banner: "Deine Periode beginnt heute 🌹",
    color: "#f4c7d7",
    textColor: "#c47a9a",
  };
  if (days === 1) return {
    title: "🌸 Morgen beginnt deine Periode",
    body: `Hallo ${name}! Morgen beginnt deine Periode. Bereite dich vor und sei sanft mit dir 💕`,
    banner: "Morgen beginnt deine Periode 🌸",
    color: "#ffd9c7",
    textColor: "#c4845a",
  };
  if (days === 2) return {
    title: "💜 In 2 Tagen beginnt deine Periode",
    body: `Hallo ${name}! In 2 Tagen beginnt deine Periode. Trink viel Wasser und ruh dich aus 🌿`,
    banner: "In 2 Tagen beginnt deine Periode 💜",
    color: "#e0d6ff",
    textColor: "#7a5a9e",
  };
  if (days === 3) return {
    title: "🌙 In 3 Tagen beginnt deine Periode",
    body: `Hallo ${name}! In 3 Tagen beginnt deine Periode. Achte auf dich 🌙`,
    banner: "In 3 Tagen beginnt deine Periode 🌙",
    color: "#fff8f2",
    textColor: "#b799e5",
  };
  return null;
}

export default function PeriodReminder() {
  const { user } = useAuth();
  const [banner, setBanner] = useState<{ text: string; color: string; textColor: string } | null>(null);

  useEffect(() => {
    if (!user) return;

    getPeriodReminderData().then((data) => {
      if (!data?.cycle?.last_period_start) return;
      const { name, cycle } = data;

      const cycleData = {
        lastPeriodStart: new Date(cycle.last_period_start),
        cycleLength: cycle.cycle_length ?? 28,
        periodLength: cycle.period_length ?? 5,
      };

      const days = getDaysUntilNextPeriod(cycleData);
      const msg = getMessages(days, name);
      if (!msg) return;

      setBanner({ text: msg.banner, color: msg.color, textColor: msg.textColor });

      const today = new Date().toISOString().split("T")[0];
      const lastShown = localStorage.getItem(STORAGE_KEY);
      if (lastShown === today) return;

      if (Notification.permission === "granted") {
        new Notification(msg.title, { body: msg.body, icon: "/favicon.ico" });
        localStorage.setItem(STORAGE_KEY, today);
      } else if (Notification.permission === "default") {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            new Notification(msg.title, { body: msg.body, icon: "/favicon.ico" });
            localStorage.setItem(STORAGE_KEY, today);
          }
        });
      }
    });
  }, [user]);

  if (!banner) return null;

  return (
    <div
      className="mx-5 mt-4 rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{ background: banner.color, border: `1.5px solid ${banner.textColor}30` }}
    >
      <span className="text-lg">🔔</span>
      <p className="text-xs font-medium flex-1" style={{ color: banner.textColor }}>
        {banner.text}
      </p>
      <button onClick={() => setBanner(null)} style={{ color: banner.textColor, opacity: 0.5 }}>✕</button>
    </div>
  );
}