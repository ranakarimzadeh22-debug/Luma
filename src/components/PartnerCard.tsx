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
    <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
      <p className="text-xs text-gray-400 mb-1">💑 Partner-Link</p>
      <p className="text-xs text-gray-300 mb-3 leading-relaxed">
        Teile diesen Link mit deinem Partner.
      </p>
      <div className="bg-gray-50 border border-gray-100 rounded-2xl px-3 py-2 text-xs text-gray-400 font-mono break-all mb-3">
        {url}
      </div>
      <button
        onClick={copy}
        className="w-full bg-rose-400 text-white font-medium rounded-2xl py-3 text-sm hover:bg-rose-500 transition-colors"
      >
        {copied ? "✓ Kopiert" : "Link kopieren"}
      </button>
    </div>
  );
}
