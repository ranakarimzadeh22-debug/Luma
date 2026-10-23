---
id: WP-20261023-1800-claude-legende-bandproben-wp029
date: 2026-10-23
time: 18:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Kalenderlegende mit Bandproben (WP-029)

## Was wurde gemacht?

Im kleinen ⓘ-Fenster des Kalenders stehen links vor jeder Erklärung jetzt kurze abgerundete Mini-Bänder statt runder Punkte. Sie sehen genauso aus wie die Bänder im Kalender: „Periode“ und „PMS eingetragen“ sind gefüllt, „Nächste Periode“ und „PMS-Phase“ sind nur umrandet. Das gilt für die Nutzerin und für den Partner. Texte, Zeilen, Farben, Kalender, Daten und Partnerrechte sind unverändert.

## Warum?

Die runden Punkte wirkten wie eigene Farben und halfen nicht sicher beim Verstehen der Kalenderbänder. Das steht im freigegebenen Arbeitspaket WP-029.

## Prüfung und Stand

Das neue Prüfskript besteht (Pillenform, keine Punkte mehr, richtige Farbquelle je Zeile, Farbwerte unverändert), ebenso die bestehenden Popover-Prüfungen, TypeScript und Build. Sichtprüfung mit Testkonten bei 360, 390 und 1280 px für Nutzerin und Partner: Das Fenster liegt vollständig im Bild, schließt mit Escape, kein Überlauf, und die berechneten Farben der Proben stimmen mit den Kalenderbändern überein. Eine TodayCard-Prüfung im Partner-Legendenskript war schon vorher fehlerhaft. Nicht deployed.

## Offene Punkte

- Keine.

## Nächster Schritt

Keiner – Arbeitspaket abgeschlossen.

## Technische Nachweise

- Betroffene Dateien: `src/lib/calendar-phase-colors.ts` (nur Formkonstante), `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCalendar.tsx`, `scripts/verify-calendar-legend-band-samples-wp029.ts` (neu)
- Tests: siehe oben
- Commit oder Referenz: pending
