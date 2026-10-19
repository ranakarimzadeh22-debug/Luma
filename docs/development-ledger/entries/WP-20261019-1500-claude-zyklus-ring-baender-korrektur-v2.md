---
id: WP-20261019-1500-claude-zyklus-ring-baender-korrektur-v2
date: 2026-10-19
time: 15:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Korrektur V2: Kalender mit Phasenbändern statt Vollflächen-Tagen (WP-022)

## Was wurde gemacht?

Die Ownerin hatte die erste Umsetzung von WP-022 nicht abgenommen. Der rote Heute-Punkt im Zyklus-Kreis zeigt jetzt wieder, wie vor dieser Änderung, nur einen einfachen kleinen Punkt ohne Zahl. Stattdessen wurden die Kalender auf `/neu` und `/neu/partner` geändert: die Tage sind nicht mehr vollflächig in der Phasenfarbe eingefärbt, sondern zeigen nur noch einen schmalen farbigen Streifen am unteren Rand, der sich über mehrere zusammenhängende Tage einer Phase (zum Beispiel mehrere PMS-Tage hintereinander) als durchgehendes Band verbindet. Der heutige Tag zeigt nur noch einen kleinen roten Kreis direkt hinter der Zahl, nicht mehr die ganze Kachel farbig hervorgehoben.

## Warum?

Ausdrücklicher Korrekturauftrag der Ownerin vom 2026-10-19: die erste Umsetzung von WP-022 wurde nicht abgenommen, der Zyklus-Kreis soll auf den vorherigen Stand zurück, und stattdessen sollen die Kalender ein Band-Design mit kleinerem Heute-Kreis erhalten.

## Prüfung und Stand

- Neue Skripte `scripts/verify-calendar-band-position.ts` (16 Prüfungen), `scripts/verify-cycle-ring-marker-reverted.ts` (11 Prüfungen) und `scripts/verify-calendar-tile-band.ts` (28 Prüfungen): alle bestanden.
- Das WP-022-Version-1-Skript `scripts/verify-cycle-ring-day-marker.ts` wurde gelöscht, da es eine jetzt zurückgenommene, von der Ownerin nicht abgenommene Änderung prüfte.
- Vier bestehende Testskripte wurden an die bewusst geänderte Darstellung angepasst (Details im Arbeitspaket); das zugrunde liegende Produktverhalten dieser Skripte ist unverändert geprüft und besteht weiterhin.
- `npx tsc --noEmit`, `npm run build`: beide ohne Fehler, Routenliste unverändert.
- `node --experimental-strip-types --test tests/*.test.ts`: 83/84 bestanden; der eine Fehlschlag in `tests/calendar-day-info.test.ts` ist bekannt und unabhängig von diesem Paket.
- Alle weiteren potenziell betroffenen Regressionsskripte (Kalender, PMS, Partner, mobile Kompaktdarstellung, Tagesfenster, Periodenhistorie) erneut ausgeführt: alle bestanden.
- Live-Prüfung mit zwei echten Testkonten (Owner und verbundener Partner) über die reale Registrierungs- und Verbindungs-UI (temporär installiertes Playwright, anschließend vollständig entfernt): mehrtägiges PMS-Band sichtbar durchgehend mit abgerundeten Enden, neutrale Kachelfarbe bestätigt, genau ein kleiner roter Heute-Kreis im Raster, Tagesfenster öffnet weiterhin, keine horizontalen Überläufe, Partneransicht identisch und weiterhin vollständig rein lesend.

## Offene Punkte

- Keine.

## Nächster Schritt

Keiner – Arbeitspaket abgeschlossen.

## Technische Nachweise

- Betroffene Dateien: `src/components/CyclePersonalRing.tsx`, `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCalendar.tsx`, `src/lib/calendar-band-position.ts` (neu), `scripts/verify-calendar-band-position.ts` (neu), `scripts/verify-cycle-ring-marker-reverted.ts` (neu), `scripts/verify-calendar-tile-band.ts` (neu), `scripts/verify-cycle-ring-day-marker.ts` (gelöscht), `scripts/verify-mobile-home-compact.ts`, `scripts/verify-mobile-partner-compact.ts`, `scripts/verify-manual-pms-symptom-ui.ts`, `scripts/verify-today-card.ts`, `docs/work-packages/WP-022-zyklus-ring-baender-und-tagespunkt.md`, `docs/work-packages/STATE.json`.
- Tests: siehe Arbeitspaket-Ist-Abschnitt Version 2 für die vollständige Liste und Ergebnisse.
- Commit oder Referenz: pending
