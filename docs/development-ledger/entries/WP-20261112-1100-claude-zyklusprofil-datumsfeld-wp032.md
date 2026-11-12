---
id: WP-20261112-1100-claude-zyklusprofil-datumsfeld-wp032
date: 2026-11-12
time: 11:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Zyklusprofil: Datumsfeld wieder bedienbar (WP-032)

## Was wurde gemacht?

In der ersten Frage des Zyklusprofils lässt sich das Datumsfeld wieder anklicken, antippen und ausfüllen. Vorher war das Feld gesperrt, sobald „Ich weiß es nicht“ gewählt war oder das gespeicherte Profil kein Datum hatte. Jetzt ist es immer offen. Wer ein Datum wählt, hebt „Ich weiß es nicht“ damit auf. Der Button „Ich weiß es nicht“ ist jetzt ein Umschalter: Er zeigt einen Haken und einen Hinweis, leert ein vorhandenes oder halb getipptes Datum und erlaubt „Weiter“ ohne Datum. Ein neu gewähltes Datum hebt „unbekannt“ wieder auf. In Frage 2 lässt sich das Feld „Anzahl der Tage“ ebenfalls wieder ausfüllen (Korrektur Version 2); es war nach „Ich weiß es nicht“ gesperrt. Alles andere im Zyklusprofil ist gleich geblieben.

## Warum?

Beim Owner-Test am 12.11.2026 ließ sich das Feld nicht bedienen. Das steht im freigegebenen Arbeitspaket WP-032.

## Prüfung und Stand

Neues Prüfskript, TypeScript und Build bestehen. Browserprüfung mit Testkonto auf Desktop (1280 px) und Mobil (390 px): Datum eingeben, „Ich weiß es nicht“ setzen, Weiter ohne Datum, danach wieder Datum eingeben, kein Überlauf. Testkonten gelöscht. Nicht deployed.

## Offene Punkte

- Das Feld „Übliche Zykluslänge“ in Frage 3 hat noch dieselbe Sperre bei „unbekannt“ und wurde bewusst nicht angefasst (nicht im Auftrag).

## Nächster Schritt

Owner prüft `/neu/zyklusprofil` lokal.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleProfileWizard.tsx`, `scripts/verify-cycle-profile-date-wp032.ts` (neu), `scripts/verify-cycle-profile-duration-wp032-v2.ts` (neu)
- Ursache: `disabled={draft.lastPeriodUnknown}` am Datumsfeld
- Tests: siehe oben
- Commit oder Referenz: pending
