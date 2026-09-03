---
id: WP-20260903-1529-codex-periodenverlauf
date: 2026-09-03
time: 15:29
agent: Codex
status: completed
screens: Kalender | Neue Luma Home | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag HANDOFF-011
commits: pending
---

# Tatsächliche vergangene Perioden erfassen

## Was wurde gemacht?

Die Nutzerin kann im Kalender zuerst den tatsächlichen ersten und danach den letzten Periodentag auswählen. Der Zeitraum wird vor dem Speichern sichtbar geprüft. Gespeicherte Perioden erscheinen wieder im Kalender und in einer Liste und lassen sich einzeln ändern oder nach einer zweiten Bestätigung löschen. Die Angaben gehören ausschließlich zum angemeldeten neuen Luma-Konto.

## Warum?

Der Owner hat in HANDOFF-011 ausdrücklich eine verlässliche, von der Nutzerin selbst bestätigte Grundlage aus vergangenen Perioden beauftragt.

## Prüfung und Stand

Datumsreihenfolge, ungültige und zukünftige Daten sowie Überschneidungen werden serverseitig abgewiesen. Zwei Zeiträume wurden gespeichert, nach erneuter Anmeldung wieder geladen, geändert und einzeln gelöscht. Die Kontentrennung und das Mitlöschen bei Kontolöschung sind geprüft. Der vollständige Ablauf wurde mobil bei 390 Pixel Breite ohne horizontale Überbreite bedient. Gezieltes ESLint, TypeScript, Unit- und Integrationstests, Datenbanktrennung, Migration und Produktions-Build sind bestanden.

## Offene Punkte

- Keine.

## Nächster Schritt

Keiner – Arbeitspaket abgeschlossen.

## Technische Nachweise

- Betroffene Dateien: `database/luma-core/migrations/202609031500_period_history.sql`, `scripts/verify-luma-core.mjs`, `src/app/neu/page.tsx`, `src/components/NewCycleExample.tsx`, `src/app/api/neu/periods/route.ts`, `src/app/api/neu/periods/[id]/route.ts`, `src/lib/new-period-validation.ts`, `src/lib/new-periods.ts`, `tests/new-period-validation.test.ts`, `tests/new-auth-integration.mjs`
- Tests: gezieltes ESLint bestanden; `npx tsc --noEmit` bestanden; 5 Zeitraum-Unit-Tests bestanden; Auth-/Datenbankintegration bestanden; Migration und Datenbanktrennung geprüft; mobiler Browserablauf bestanden; `npm run build` bestanden
- Commit oder Referenz: HANDOFF-011; Commit ausstehend
