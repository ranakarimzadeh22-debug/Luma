"use client";

import { useEffect, useState } from "react";

type ActivationState =
  | "checking"
  | "unsupported"
  | "needs_home_screen"
  | "prompt"
  | "granted"
  | "denied"
  | "error";

function isIosDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

export default function NewPartnerPushActivation() {
  const [state, setState] = useState<ActivationState>("checking");
  const [pending, setPending] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkInitialState() {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        setState("unsupported");
        return;
      }
      if (isIosDevice() && !isStandalone()) {
        setState("needs_home_screen");
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }
      if (Notification.permission === "granted") {
        const registration = await navigator.serviceWorker.ready.catch(() => null);
        const existing = await registration?.pushManager.getSubscription().catch(() => null);
        setState(existing ? "granted" : "prompt");
        return;
      }
      setState("prompt");
    }
    checkInitialState();
  }, []);

  async function activate() {
    setPending(true);
    setError("");
    try {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) throw new Error("unsupported");

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "prompt");
        setPending(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const response = await fetch("/api/neu/partner/push-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      }).catch(() => null);

      if (!response?.ok) {
        setError("Die Anmeldung konnte nicht gespeichert werden.");
        setState("error");
        setPending(false);
        return;
      }

      setState("granted");
    } catch {
      setError("Benachrichtigungen konnten nicht aktiviert werden.");
      setState("error");
    }
    setPending(false);
  }

  async function sendTest() {
    setPending(true);
    const response = await fetch("/api/neu/partner/push-test", { method: "POST" }).catch(() => null);
    setPending(false);
    if (response?.ok) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  }

  if (state === "checking") return null;

  if (state === "needs_home_screen") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
        <p className="font-medium text-neutral-900">Benachrichtigungen auf dem iPhone</p>
        <p className="mt-1">
          Füge Luma zuerst über „Teilen“ → „Zum Home-Bildschirm“ hinzu. Öffne Luma danach über dieses Symbol, um
          Benachrichtigungen zu aktivieren.
        </p>
      </div>
    );
  }

  if (state === "unsupported") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
        <p className="font-medium text-neutral-900">Benachrichtigungen nicht verfügbar</p>
        <p className="mt-1">Dieser Browser unterstützt keine Benachrichtigungen. Der Kalender bleibt nutzbar.</p>
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
        <p className="font-medium text-neutral-900">Benachrichtigungen sind blockiert</p>
        <p className="mt-1">
          Du kannst sie später in den Browser- oder Geräteeinstellungen für diese Seite wieder erlauben.
        </p>
      </div>
    );
  }

  if (state === "granted") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
        <p className="font-medium text-neutral-900">Benachrichtigungen sind aktiviert</p>
        <button
          type="button"
          onClick={sendTest}
          disabled={pending}
          className="mt-2 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 disabled:opacity-50"
        >
          {testSent ? "Gesendet" : pending ? "Wird gesendet …" : "Test-Benachrichtigung senden"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
      <p className="font-medium text-neutral-900">Benachrichtigungen aktivieren</p>
      <p className="mt-1">
        Erhalte einen Hinweis, wenn die Periode deiner Partnerin heute beginnt oder endet. Freiwillig, jederzeit
        abschaltbar.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-red-700">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={activate}
        disabled={pending}
        className="mt-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {pending ? "Wird aktiviert …" : "Benachrichtigungen aktivieren"}
      </button>
    </div>
  );
}
