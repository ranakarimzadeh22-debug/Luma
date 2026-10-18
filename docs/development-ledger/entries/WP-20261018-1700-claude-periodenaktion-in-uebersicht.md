---
id: WP-20261018-1700-claude-periodenaktion-in-uebersicht
date: 2026-10-18
time: 17:00
agent: Anthropic Claude
status: completed
screens: Startseite
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Periodenaktion aus Home in Periodenübersicht verlegen (WP-019)

## Was wurde gemacht?

Der große Button „Meine Periode aktualisieren“ steht nicht mehr unter dem Kalender auf `/neu`. Stattdessen öffnet der Monatsname wie bisher denselben Dialog, der jetzt sichtbar „Periodenübersicht“ heißt. Dort steht der Button direkt oben, ohne Scrollen auffindbar. Er öffnet den bereits vorhandenen Verwaltungsdialog „Meine Perioden“ und schließt dabei zuerst die Periodenübersicht, sodass niemals zwei Dialoge gleichzeitig offen sind. Perioden eintragen, ändern und löschen funktionieren wie bisher.

## Warum?

Owner-Entscheidung vom 2026-10-18 (Akte APP-IDEA-028): Der große Button wirkte auf der Home-Ansicht zu präsent; die bereits vorhandene Periodenhistorie ist der passende, bereits erreichbare Ort für die Periodenverwaltung.

## Prüfung und Stand

- Der Home-Button wurde vollständig entfernt. `PeriodHistoryModal` heißt jetzt sichtbar „Periodenübersicht“ und erhielt einen neuen `onOpenMyPeriods`-Callback, der zuerst die Übersicht schließt und danach den bereits vorhandenen `openMyPeriods()`-Weg aufruft — keine neue Modal- oder Formularlogik.
- Neues Testskript `scripts/verify-period-history-overview.ts` (20 Prüfungen) sowie vier bestehende Regressionsskripte gezielt angepasst, wo sie die jetzt bewusst entfernte Home-Button-Position prüften.
- Live-Prüfung mit temporär installiertem Playwright: kein Button mehr auf der Home-Ansicht, Periodenübersicht öffnet korrekt über den Monatsnamen, Klick auf den neuen Button öffnet „Meine Perioden“ und schließt dabei die Übersicht (genau ein offener Dialog im DOM), Ändern/Historienmonatssprung funktionieren unverändert, kein horizontaler Überlauf.
- `npx tsc --noEmit`, `npm run build`: fehlerfrei/erfolgreich. `node --experimental-strip-types --test tests/*.test.ts`: 83/84, bekannter vorbestehender Defekt. Zwei bereits vor WP-019 bekannte Testskript-Defekte (`verify-today-card.ts`, `verify-action-success-toast.ts`) per `git stash` erneut als vorbestehend bestätigt.

## Offene Punkte

- Owner-Prüfschritt steht aus (siehe WP-019, Abschnitt „Ist – von Claude“).

## Nächster Schritt

Owner prüft `/neu` wie im Prüfschritt beschrieben. Danach Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `scripts/verify-period-history-overview.ts` (neu), `scripts/verify-calendar-legend-collapsible.ts`, `scripts/verify-home-actions-consistent.ts`, `scripts/verify-home-screen-layout.ts`, `scripts/verify-mobile-home-compact.ts`, `docs/work-packages/WP-019-periodenaktion-in-uebersicht.md`, `docs/work-packages/STATE.json`.
- Tests: `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts`, alle genannten `scripts/verify-*`-Skripte, manuelle Live-Prüfung via Playwright (temporär, mobil/breit, kompletter Workflow inkl. Ändern und Monatssprung).
- Commit oder Referenz: folgt.
