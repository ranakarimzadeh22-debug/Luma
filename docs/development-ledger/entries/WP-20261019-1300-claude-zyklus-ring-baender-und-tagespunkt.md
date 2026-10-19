---
id: WP-20261019-1300-claude-zyklus-ring-baender-und-tagespunkt
date: 2026-10-19
time: 13:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: 40b2e25
---

# Zyklus-Kreis mit klaren Phasenbändern und Tagespunkt (WP-022)

## Was wurde gemacht?

Der rote Heute-Punkt im Zyklus-Kreis zeigt jetzt die heutige Kalendertagszahl, zum Beispiel `19`, statt nur ein einfarbiger Punkt zu sein. Die rosa (PMS) und violetten (Fruchtbarkeit) Bereiche im Kreis waren bereits als durchgehende Farbbänder gezeichnet; das wurde geprüft und bestätigt, ohne dass daran etwas verändert werden musste. Die Änderung gilt gleichermaßen für die eigene Ansicht und die Partneransicht, da beide dieselbe gemeinsame Kreis-Komponente verwenden.

## Warum?

Bestätigte Owner-Entscheidung vom 2026-10-19 zu `APP-IDEA-029`: Der heutige Tag und die Phasen sollen im Kreis schneller erkennbar sein.

## Prüfung und Stand

- Neues Skript `scripts/verify-cycle-ring-day-marker.ts`: 23 Prüfungen (durchgehende Segmentpfade, Tageszahl ohne führende Null aus dem bestehenden Datum, unveränderter tagesgenauer Markerwinkel, Zugänglichkeit, gemeinsame Nutzung in Eigen- und Partneransicht). Alle bestanden.
- `npx tsc --noEmit`, `npm run build`: beide ohne Fehler, Routenliste unverändert.
- `node --experimental-strip-types --test tests/*.test.ts`: 83/84 bestanden; der eine Fehlschlag in `tests/calendar-day-info.test.ts` ist bekannt und unabhängig von diesem Paket.
- Bestehende WP-020-Marker-Regression und weitere Ring-/Kalender-/Partner-/Mobile-Regressionsskripte erneut ausgeführt: alle bestanden.
- Live-Prüfung mit zwei echten Testkonten (Owner und verbundener Partner) über die reale Registrierungs- und Verbindungs-UI (temporär installiertes Playwright, anschließend vollständig entfernt): roter Marker zeigt in Owner- und Partneransicht, mobil und breit, dieselbe heutige Tageszahl; bei einem manuell markierten PMS-Tag sitzt der Marker sichtbar am Beginn des jetzt breiteren PMS-Bands; keine horizontalen Überläufe; Partneransicht bleibt ohne Eingabemöglichkeiten.

## Offene Punkte

- Keine.

## Nächster Schritt

Keiner – Arbeitspaket abgeschlossen.

## Technische Nachweise

- Betroffene Dateien: `src/components/CyclePersonalRing.tsx`, `scripts/verify-cycle-ring-day-marker.ts` (neu), `docs/work-packages/WP-022-zyklus-ring-baender-und-tagespunkt.md`, `docs/work-packages/STATE.json`.
- Tests: `scripts/verify-cycle-ring-day-marker.ts` (23/23), `scripts/verify-manual-pms-ring-marker.ts` (WP-020-Regression, vollständig bestanden), `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts` (83/84, ein bekannter vorbestehender Fehlschlag), weitere bestehende Regressionsskripte für Ring/Kalender/Partner/Mobile, temporäre Playwright-Live-Prüfung mit zwei echten Testkonten (vollständig zurückgebaut).
- Commit oder Referenz: 40b2e25
