"use client";

import { useEffect, useState } from "react";
import { generatePartnerCode } from "@/lib/partner";

export default function PartnerCard() {
  const [code, setCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

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
      await navigator.share({ title: "Luma – Mein Zyklus", text: "Ich teile meinen Zyklus mit dir über Luma 🌸", url });
    } else {
      copy();
    }
  }

  return (
    <div className="rounded-3xl p-5" style={{ background: "#fff8f2", border: "1.5px solid #cdb4db" }}>
      <p className="text-xs mb-1" style={{ color: "#b79bcf" }}>💑 Mit Partner teilen</p>
      <p className="text-xs mb-4 leading-relaxed" style={{ color: "#a094a8" }}>
        Dein Partner sieht deine Phase und bekommt Benachrichtigungen wenn deine Periode beginnt.
      </p>

      <div className="flex items-center justify-between rounded-2xl px-4 py-3 mb-3" style={{ background: "#fafafa", border: "1.5px solid #f8d7e6" }}>
        <span className="text-xs font-mono truncate" style={{ color: "#a094a8" }}>{url}</span>
        <button onClick={copy} className="text-xs font-medium ml-2 shrink-0" style={{ color: "#b79bcf" }}>
          {copied ? "✓" : "Kopieren"}
        </button>
      </div>

      <button
        onClick={share}
        className="w-full text-white font-medium rounded-2xl py-3 text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        style={{ background: "#cdb4db" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Link teilen
      </button>
    </div>
  );
}
