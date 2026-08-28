"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewLogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    const response = await fetch("/api/neu/auth/logout", { method: "POST" }).catch(() => null);
    if (response?.ok) {
      router.push("/neu");
      router.refresh();
      return;
    }
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-100 disabled:opacity-50"
    >
      {pending ? "Abmeldung läuft …" : "Abmelden"}
    </button>
  );
}
