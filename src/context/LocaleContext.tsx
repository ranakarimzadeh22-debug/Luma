"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type Locale, translations } from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (typeof translations)[Locale];
  isRtl: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("de");

  useEffect(() => {
    const saved = localStorage.getItem("luma-locale") as Locale | null;
    if (saved && saved in translations) setLocaleState(saved);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("luma-locale", l);
  }

  const isRtl = locale === "fa";

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: translations[locale], isRtl }}>
      <div dir={isRtl ? "rtl" : "ltr"} className={isRtl ? "font-['Vazirmatn',sans-serif]" : ""}>
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
