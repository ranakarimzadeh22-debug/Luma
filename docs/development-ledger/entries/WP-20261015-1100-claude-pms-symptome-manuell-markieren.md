---
id: WP-20261015-1100-claude-pms-symptome-manuell-markieren
date: 2026-10-15
time: 11:00
agent: Anthropic Claude
status: completed
screens: Zyklus | Partner
why_status: confirmed
why_source: Owner-Auftrag
commits: f399101
---

# PMS-Symptome manuell markieren und im Partnerbereich anzeigen (WP-013)

## Was wurde gemacht?

Auf `/neu` kann die Nutzerin jetzt an einem heutigen oder vergangenen Kalendertag im bestehenden Tagesfenster bis zu vier PMS-Symptome markieren (Brustschmerzen/-spannen, Unterleibsschmerzen, Müdigkeit, Stimmungsschwankungen). Die früheste Markierung nach dem letzten echten Periodenbeginn setzt einen manuellen PMS-Status, der im Kalender und im Zyklus-Kreis Vorrang vor der bisherigen Schätzung hat und deutlich als eigene Angabe gekennzeichnet ist ("PMS von dir eingetragen" / "M·Du"). Die Markierung lässt sich jederzeit ändern oder vollständig entfernen; danach gilt wieder die bisherige Schätzung. Startet die nächste echte Periode, endet der manuelle PMS-Status automatisch. Bei einer aktiven Partnerverbindung sieht der Partner auf `/neu/partner` dieselbe Information rein lesend ("PMS von ihr eingetragen" / "M·Sie"), ohne jede Eingabemöglichkeit.

## Warum?

Der Owner-Auftrag WP-013 bestätigt: PMS kann von Frau zu Frau und von Zyklus zu Zyklus unterschiedlich früh beginnen. Die bisherige PMS-Phase ist nur eine Schätzung; die Nutzerin soll ihr tatsächliches Empfinden selbst eintragen können, und der verbundene Partner soll denselben Status sehen.

## Prüfung und Stand

- `npx tsc --noEmit` und `npm run build` — fehlerfrei, neue Route `/api/neu/pms-symptoms` erscheint korrekt, keine sonstige Routenänderung.
- Neue Migration `202610151200_pms_symptom_entries.sql` gegen `luma_core` angewendet; `scripts/verify-luma-core.mjs` auf 12 Tabellen angepasst und bestätigt erfolgreich.
- Neue Unit-Tests (`tests/new-pms-symptom-validation.test.ts`, `tests/manual-pms.test.ts`, 20 Prüfungen) sowie neue gezielte Skripte (`scripts/verify-manual-pms-prediction-isolation.ts`, `scripts/verify-manual-pms-symptom-ui.ts`, `scripts/verify-partner-pms-symptoms.mts` mit echten Testkonten gegen die Datenbank) — alle bestanden. Der Pflicht-Vergleichstest bestätigt, dass `predictCycle`/`computePersonalCycleView` vor und nach dem Ableiten eines manuellen PMS-Abschnitts bytegleiche Ergebnisse liefern.
- Bestehende Perioden-, Kalender-, Ring- und Partnerregressionen erneut ausgeführt und grün (einzige Ausnahme: der bereits seit mehreren Sitzungen bekannte, vorbestehende Testdefekt in `tests/calendar-day-info.test.ts`, nicht durch dieses Paket verursacht).
- Live-Prüfung mit temporär installiertem Playwright gegen einen echten lokalen Dev-Server auf 375 px und 1280 px Breite mit zwei verbundenen Testkonten: Symptome markieren/ändern/entfernen funktioniert, löst "Gespeichert."/"Gelöscht." aus, Kalender und Ring zeigen den manuellen Status verständlich unterscheidbar von der Schätzung, der verbundene Partner sieht dieselbe Information rein lesend ohne Eingabemöglichkeit, kein horizontaler Überlauf. Alle Testkonten und temporären Werkzeuge wurden danach vollständig entfernt.

## Offene Punkte

- Owner-Prüfschritt steht aus (siehe WP-013, Abschnitt "ein Prüfschritt für den Owner").

## Nächster Schritt

Owner prüft `/neu` und `/neu/partner` wie im Prüfschritt beschrieben. Danach Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `database/luma-core/migrations/202610151200_pms_symptom_entries.sql`, `src/lib/new-pms-symptom-validation.ts`, `src/lib/new-pms-symptoms.ts`, `src/lib/manual-pms.ts`, `src/app/api/neu/pms-symptoms/route.ts`, `src/app/neu/page.tsx`, `src/components/NewCycleExample.tsx`, `src/lib/new-partner-calendar.ts`, `src/lib/new-partner-cycle-view.ts`, `src/app/neu/partner/page.tsx`, `src/components/NewPartnerCalendar.tsx`, `src/components/NewPartnerCycleRing.tsx`, `scripts/verify-luma-core.mjs`, `scripts/verify-home-screen-layout.ts`, `tests/new-pms-symptom-validation.test.ts`, `tests/manual-pms.test.ts`, `scripts/verify-manual-pms-prediction-isolation.ts`, `scripts/verify-manual-pms-symptom-ui.ts`, `scripts/verify-partner-pms-symptoms.mts`, `docs/work-packages/WP-013-pms-symptome-manuell-markieren.md`, `docs/work-packages/STATE.json`.
- Tests: `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts`, alle genannten `scripts/verify-*`-Skripte, Migration + `verify-luma-core.mjs`, manuelle Live-Prüfung via Playwright (temporär).
- Commit oder Referenz: f399101.
