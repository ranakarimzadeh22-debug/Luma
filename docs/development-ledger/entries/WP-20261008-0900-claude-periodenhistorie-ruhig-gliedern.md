---
id: WP-20261008-0900-claude-periodenhistorie-ruhig-gliedern
date: 2026-10-08
time: 09:00
agent: Anthropic Claude
status: completed
screens: Zyklus
why_status: confirmed
why_source: Owner-Auftrag
commits: 1ebd621
---

# Periodenhistorie ruhig und lesbar gliedern (WP-008)

## Was wurde gemacht?

Die bestehende Periodenhistorie im Kalender (`/neu`, über Tippen auf die Monatsanzeige) zeigt jede Zeile jetzt ruhiger geordnet: Monat und Jahr sind die deutlichste Angabe, direkt darunter steht der tatsächliche Zeitraum. Dauer und Zykluslänge stehen nicht mehr in einer gemeinsamen Textzeile, sondern als zwei getrennte, einzeln beschriftete Felder ("Dauer: X Tage" und "Zyklus: X Tage"). Eine laufende Periode zeigt weiterhin keine erfundene Dauer, eine noch unbekannte Zykluslänge zeigt weiterhin "Noch nicht bekannt". Jede Zeile bleibt vollständig antippbar und springt wie vorher in den passenden Kalendermonat.

## Warum?

Der Owner-Auftrag WP-008 bestätigt: Die Historienzeilen enthalten die richtigen Informationen, wirkten aber in einer einzigen Textzeile für Zyklus und Dauer weniger schnell erfassbar. Ziel ist, dass Monat, Zeitraum, Dauer und Zykluslänge ohne Suchen überblickbar sind, als erste Aufräumpriorität vor neuen Fähigkeiten.

## Prüfung und Stand

- `npx tsc --noEmit` — fehlerfrei.
- `npx tsx scripts/verify-period-history.ts` — bestehende Berechnungs- und Darstellungstests, inklusive einer an die neue Markup-Struktur angepassten Assertion. Alle Prüfungen bestanden.
- `npx tsx scripts/verify-period-history-layout.ts` (neu) — gezielte Prüfung der Zeilenhierarchie und der drei Zustände (abgeschlossen mit Dauer/Zyklus, laufend ohne Dauer, Zyklus noch nicht bekannt). Alle Prüfungen bestanden.
- `npx tsx scripts/verify-history-month-jump.ts` — bestehende Historiennavigation erneut geprüft. Alle Prüfungen bestanden.
- `npm run build` — erfolgreich, Routenliste unverändert.
- Live-Prüfung mit temporär installiertem Playwright gegen einen echten lokalen Dev-Server auf 375 px und 1280 px Breite: Historie öffnet sich korrekt, alle drei Zustände sichtbar korrekt, kein horizontaler Überlauf, Escape und Zeilenklick schließen den Dialog, Navigation zum passenden Monat funktioniert. Testkonto, Perioden und temporäre Werkzeuge wurden danach vollständig entfernt.

## Offene Punkte

- Owner-Prüfschritt steht aus (siehe WP-008, Abschnitt „Owner-Pruefort nach Umsetzung“).

## Nächster Schritt

Owner prüft `/neu`, tippt auf die Monatsanzeige und bestätigt die Periodenhistorie. Danach Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `scripts/verify-period-history.ts`, `scripts/verify-period-history-layout.ts` (neu), `docs/work-packages/WP-008-periodenhistorie-ruhig-gliedern.md`, `docs/work-packages/STATE.json`.
- Tests: `npx tsc --noEmit`, `npx tsx scripts/verify-period-history.ts`, `npx tsx scripts/verify-period-history-layout.ts`, `npx tsx scripts/verify-history-month-jump.ts`, `npm run build`, manuelle Live-Prüfung via Playwright (temporär).
- Commit oder Referenz: 1ebd621.
