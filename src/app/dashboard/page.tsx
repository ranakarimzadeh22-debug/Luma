"use client";

import Link from "next/link";
import LumaLogo from "@/components/LumaLogo";

const menu = [
  {
    href: "/kalender",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="4" width="18" height="18" rx="3" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <circle cx="8" cy="14" r="0.8" fill="currentColor" />
        <circle cx="12" cy="14" r="0.8" fill="currentColor" />
        <circle cx="16" cy="14" r="0.8" fill="currentColor" />
      </svg>
    ),
    label: "Kalender",
    desc: "Zyklus & Termine",
    bg: "#f8d7e6",
    color: "#b79bcf",
  },
  {
    href: "/yoga",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="4" r="1.5" />
        <path d="M12 6 L12 13" />
        <path d="M12 13 L7 18" />
        <path d="M12 13 L17 18" />
        <path d="M9 10 L5 12" />
        <path d="M15 10 L19 12" />
      </svg>
    ),
    label: "Yoga & Bewegung",
    desc: "Übungen für deinen Zyklus",
    bg: "#cfe8d5",
    color: "#5a9e72",
  },
  {
    href: "/partner",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    label: "Partner Link",
    desc: "Gemeinsam füreinander da",
    bg: "#f8d7e6",
    color: "#c47a9a",
  },
  {
    href: "/gefuhl",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 14s1 2 3 2 3-2 3-2" />
        <line x1="9" y1="10" x2="9.01" y2="10" strokeWidth={2} />
        <line x1="15" y1="10" x2="15.01" y2="10" strokeWidth={2} />
      </svg>
    ),
    label: "Dein Gefühl",
    desc: "Stimmung & Symptome",
    bg: "#ffd9c7",
    color: "#c4845a",
  },
  {
    href: "/gesundheit",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    label: "Gesundheit",
    desc: "Wasser, Schlaf & mehr",
    bg: "#cdb4db",
    color: "#7a5a9e",
  },
  {
    href: "/zyklus",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7 L12 12 L15 15" />
      </svg>
    ),
    label: "Mein Zyklus",
    desc: "Übersicht & Phasen",
    bg: "#fff8f2",
    color: "#b79bcf",
    border: "#f8d7e6",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen" style={{ background: "#fafafa" }}>
      {/* Header */}
      <div className="px-6 pt-10 pb-6 flex flex-col items-center" style={{ background: "#fff8f2", borderBottom: "1.5px solid #f8d7e6" }}>
        <LumaLogo size={0.65} />
      </div>

      {/* Menu */}
      <div className="px-5 py-6 max-w-md mx-auto">
        <p className="text-xs tracking-widest mb-4" style={{ color: "#cdb4db" }}>MENÜ</p>

        {/* Grid 3 Spalten */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 rounded-3xl py-5 px-2 transition-opacity hover:opacity-80"
              style={{ background: item.bg, border: `1.5px solid ${item.border ?? item.bg}` }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "#fff8f2", color: item.color }}
              >
                {item.icon}
              </div>
              <p className="text-xs font-medium text-center leading-tight" style={{ color: "#3a2d3f" }}>
                {item.label}
              </p>
            </Link>
          ))}
        </div>

        {/* Profil & Einstellungen */}
        <div className="grid grid-cols-2 gap-3 mt-1">
          <Link href="/profile"
            className="flex flex-col items-center gap-2 rounded-3xl py-5 transition-opacity hover:opacity-80"
            style={{ background: "#fff8f2", border: "1.5px solid #cdb4db" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#cdb4db22", color: "#b79bcf" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
            <p className="text-xs font-medium" style={{ color: "#3a2d3f" }}>Profil</p>
          </Link>
          <Link href="/settings"
            className="flex flex-col items-center gap-2 rounded-3xl py-5 transition-opacity hover:opacity-80"
            style={{ background: "#fff8f2", border: "1.5px solid #f8d7e6" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#f8d7e622", color: "#b79bcf" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <p className="text-xs font-medium" style={{ color: "#3a2d3f" }}>Einstellungen</p>
          </Link>
        </div>

        <p className="text-center text-xs pt-5 pb-4" style={{ color: "#cdb4db" }}>glow with care 🌸</p>
      </div>
    </main>
  );
}
