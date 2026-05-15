"use client";

import { useEffect, useState } from "react";

export default function PartnerCard() {
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("luma-user");
    if (raw) {
      const user = JSON.parse(raw);
      setCode(user.partnerCode ?? null);
    }
  }, []);

  if (!code) return null;

  const url = `${window.location.origin}/partner/${code}`;

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">💑</span>
        <h2 className="font-semibold text-gray-700">Partner-Link</h2>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Teile diesen Link mit deinem Partner — er sieht deine aktuelle Phase und nützliche Tipps.
      </p>
      <div className="bg-rose-50 rounded-xl px-3 py-2 text-xs text-gray-500 font-mono break-all mb-3">
        {url}
      </div>
      <button
        onClick={copy}
        className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-xl py-3 text-sm hover:opacity-90 transition-opacity"
      >
        {copied ? "✓ Kopiert!" : "🔗 Link kopieren"}
      </button>
    </div>
  );
}
