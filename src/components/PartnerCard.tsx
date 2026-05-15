"use client";

import { useEffect, useState } from "react";
import { generatePartnerCode } from "@/lib/partner";

export default function PartnerCard() {
  const [code, setCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("luma-user");
    let partnerCode = "";
    if (raw) {
      const user = JSON.parse(raw);
      partnerCode = user.partnerCode;
    }
    if (!partnerCode) {
      partnerCode = generatePartnerCode("Luma");
      const existing = raw ? JSON.parse(raw) : {};
      localStorage.setItem("luma-user", JSON.stringify({ ...existing, partnerCode }));
    }
    setCode(partnerCode);
  }, []);

  if (!code) return null;

  const url = `${window.location.origin}/partner/${code}`;

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({
        title: "Luma – Mein Zyklus",
        text: "Ich teile meinen Zyklus mit dir über Luma 🌸",
        url,
      });
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } else {
      copy();
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">💑</span>
        <p className="text-sm font-medium text-gray-700">Mit Partner teilen</p>
      </div>
      <p className="text-xs text-gray-400 mb-4 leading-relaxed">
        Dein Partner sieht deine aktuelle Phase, nächste Periode und hilfreiche Tipps.
      </p>

      {/* Link Box */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between gap-2 mb-3">
        <span className="text-xs text-gray-400 font-mono truncate">{url}</span>
        <button
          onClick={copy}
          className="shrink-0 text-xs text-rose-400 font-medium hover:text-rose-500 transition-colors"
        >
          {copied ? "✓" : "Kopieren"}
        </button>
      </div>

      {/* Share Button */}
      <button
        onClick={share}
        className="w-full bg-rose-400 text-white font-medium rounded-2xl py-3 text-sm hover:bg-rose-500 transition-colors flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {shared ? "Geteilt!" : "Link teilen"}
      </button>
    </div>
  );
}
