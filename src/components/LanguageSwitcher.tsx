"use client";

import { useLocale } from "@/context/LocaleContext";
import { type Locale } from "@/lib/i18n";

const languages: { code: Locale; label: string; flag: string; native: string }[] = [
  { code: "de", label: "Deutsch", flag: "🇩🇪", native: "Deutsch" },
  { code: "en", label: "English", flag: "🇬🇧", native: "English" },
  { code: "fa", label: "Farsi", flag: "🇮🇷", native: "فارسی" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <h2 className="font-semibold text-gray-700 mb-3">{t.selectLanguage}</h2>
      <div className="flex gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={`flex-1 flex flex-col items-center gap-1 rounded-xl py-3 px-2 border-2 transition-all text-sm ${
              locale === lang.code
                ? "border-rose-400 bg-rose-50 text-rose-600 font-semibold"
                : "border-gray-100 bg-gray-50 text-gray-500 hover:border-rose-200"
            }`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span>{lang.native}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
