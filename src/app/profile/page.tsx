"use client";

import { useState } from "react";
import Link from "next/link";
import AvatarPicker, { AvatarSVG, avatarList } from "@/components/AvatarPicker";

export default function ProfilePage() {
  const [avatar, setAvatar] = useState("a1");
  const [profile, setProfile] = useState({
    name: "Rana",
    email: "rana@example.com",
    cycleLength: 28,
    periodLength: 5,
    birthday: "1995-06-15",
  });
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="min-h-screen bg-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-400 to-pink-500 px-6 pt-12 pb-8 rounded-b-3xl shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-white/80 hover:text-white text-xl">←</Link>
          <h1 className="text-xl font-bold text-white">Mein Profil</h1>
        </div>
        {/* Avatar */}
        <div className="flex flex-col items-center mt-6">
          <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg ring-4 ring-white/40">
            {(() => { const a = avatarList.find(x => x.id === avatar) ?? avatarList[0]; return <AvatarSVG bg={a.bg} skin={a.skin} hair={a.hair} hairStyle={a.hairStyle} top={a.top} />; })()}
          </div>
          <p className="text-white font-semibold mt-3 text-lg">{profile.name}</p>
          <p className="text-rose-100 text-sm">{profile.email}</p>
        </div>
      </div>

      <div className="px-5 py-6 flex flex-col gap-5 max-w-md mx-auto">
        <form onSubmit={handleSave} className="flex flex-col gap-5">

          {/* Avatar Auswahl */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <AvatarPicker selected={avatar} onSelect={setAvatar} />
          </div>

          {/* Persönliche Daten */}
          <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h2 className="font-semibold text-gray-700">Persönliche Daten</h2>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Benutzername</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="bg-rose-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">E-Mail</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="bg-rose-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Geburtstag</label>
              <input
                type="date"
                value={profile.birthday}
                onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                className="bg-rose-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-rose-400 transition-colors"
              />
            </div>
          </div>

          {/* Zyklus-Einstellungen */}
          <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h2 className="font-semibold text-gray-700">Zyklus-Einstellungen</h2>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">
                Zykluslänge: <span className="text-rose-500 font-bold">{profile.cycleLength} Tage</span>
              </label>
              <input
                type="range" min={21} max={40}
                value={profile.cycleLength}
                onChange={(e) => setProfile({ ...profile, cycleLength: Number(e.target.value) })}
                className="accent-rose-400"
              />
              <div className="flex justify-between text-xs text-gray-400"><span>21</span><span>40</span></div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">
                Periodendauer: <span className="text-rose-500 font-bold">{profile.periodLength} Tage</span>
              </label>
              <input
                type="range" min={2} max={10}
                value={profile.periodLength}
                onChange={(e) => setProfile({ ...profile, periodLength: Number(e.target.value) })}
                className="accent-rose-400"
              />
              <div className="flex justify-between text-xs text-gray-400"><span>2</span><span>10</span></div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-2xl py-4 shadow-md hover:opacity-90 transition-opacity"
          >
            {saved ? "✓ Gespeichert" : "Profil speichern"}
          </button>
        </form>

        {/* Abmelden */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">Konto</h2>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 border-2 border-rose-200 text-rose-400 font-semibold rounded-2xl py-3 text-sm hover:bg-rose-50 transition-colors"
          >
            Abmelden
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">Luma – Dein Zyklus-Begleiter 🌸</p>
      </div>
    </main>
  );
}
