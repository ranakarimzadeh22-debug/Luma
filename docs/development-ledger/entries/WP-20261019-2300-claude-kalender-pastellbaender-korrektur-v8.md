---
id: WP-20261019-2300-claude-kalender-pastellbaender-korrektur-v8
date: 2026-10-19
time: 23:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Korrektur V8: Ruhige Pastell-Phasenbänder im Kalender (WP-022)

## Was wurde gemacht?

Der Kalender in der eigenen Ansicht und in der Partneransicht ist jetzt hell und ruhig wie im Referenzbild. Bestätigte Periode und selbst eingetragenes PMS sind sanfte rosa Bänder. Geschätzte Perioden, PMS, Eisprung und fruchtbare Tage sind hohle Bänder mit feinem rosa oder lila Rand. Eine gespeicherte Planung hat einen gestrichelten rosa Rand. Die Tageszahlen stehen klar lesbar darüber, die einzelnen Kacheln haben keinen Schatten und keinen Rahmen mehr, und das Info-Fenster zeigt die neuen Farbpunkte. Zyklus-Kreis, Daten, Vorhersagen und Partnerrechte sind unverändert.

## Warum?

Der Owner hat per Referenzbild und Korrekturauftrag Version 8 vorgegeben, dass der Kalender ruhig und hell wirken soll und dass Bordeaux im Kalender entfällt.

## Prüfung und Stand

`npx tsc --noEmit` und `npm run build` bestehen. Die gezielte Kalenderband-Prüfung (mit neuem V8-Block) und die Bandpositions-Prüfung bestehen, ebenso die Mobil-, Legenden-, Tagesfenster- und PMS-Prüfungen. `verify-historical-entry` und `verify-personal-cycle-view` waren schon vorher fehlerhaft. Sichtprüfung mit Testkonten auf `/neu` und `/neu/partner` bei 390 und 1280 px: Bänder nahtlos, Popover und Monatswechsel funktionieren, kein Überlauf. Die gespeicherte Planung wurde nur per Quelltext-Test geprüft, nicht im Bild.

## Offene Punkte

- Keine.

## Nächster Schritt

Keiner – Arbeitspaket abgeschlossen.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCalendar.tsx`, `src/lib/calendar-band-position.ts`, `scripts/verify-calendar-tile-band.ts`, `scripts/verify-calendar-band-position.ts`
- Tests: siehe oben
- Commit oder Referenz: pending
