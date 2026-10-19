---
id: WP-20261019-2100-claude-zyklus-ring-baender-korrektur-v6
date: 2026-10-19
time: 21:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Korrektur V6: Lesbare Tageszahlen auf den Phasenbändern (WP-022)

## Was wurde gemacht?

Auf den breiten Bändern im Kalender (Eigen- und Partneransicht) waren die Zahlen und Kurzbuchstaben dunkel auf dunklem Band und dadurch kaum lesbar. Jetzt haben dunkle Bänder weisse Schrift, helle Bänder eine passende dunkle Schriftfarbe, wie vor dem Umbau auf Bänder. Bandform, Daten, Vorhersagen, Zyklus-Kreis und die rote Heute-Markierung sind unverändert.

## Warum?

Der Owner hat per Screenshot gezeigt, dass die Bänder nicht wie in der Referenz aussehen (Zahlen nicht lesbar). Ursache: Mit Korrektur V2 wurde die Farbe von der Kachel auf das Band verschoben, die zugehörige Schriftfarbe blieb aber immer dunkel.

## Prüfung und Stand

`npx tsc --noEmit` ohne Fehler. `verify-calendar-tile-band` (41 Prüfungen), `verify-mobile-home-compact`, `verify-mobile-partner-compact`, Legenden-Prüfungen und `verify-calendar-band-position` bestehen. Browser-Sichtprüfung auf `/neu` und `/neu/partner` (mobil 390 px und breit 1280 px, lokale Testkonten mit Periode, PMS-Tagen und Partnerverbindung): Zahlen und Kürzel auf allen Bändern lesbar, Bänder nahtlos, kein horizontaler Überlauf, Partneransicht rein lesend. Nachgeschärft: manuelles PMS (`M·Du`) etwas dunkler (Kontrast 3,8 auf 5,2) und die Heute-Zahl im roten Kreis weiss. `npm run build` nicht ausgeführt.

## Offene Punkte

- Keine. Der Owner hat entschieden, dass die Periodenbänder vorerst in Bordeaux bleiben.

## Nächster Schritt

Keiner – Arbeitspaket abgeschlossen.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCalendar.tsx`, `scripts/verify-calendar-tile-band.ts`, `scripts/verify-mobile-home-compact.ts`, `scripts/verify-mobile-partner-compact.ts`
- Tests: siehe oben
- Commit oder Referenz: pending
