---
id: WP-20261018-1500-claude-calendar-legende-kompakt-korrektur-v3
date: 2026-10-18
time: 15:00
agent: Anthropic Claude
status: completed
screens: Partner
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Kurze erklärende Popover-Legende auch im Partner-Kalender (WP-018 Korrektur Version 3)

## Was wurde gemacht?

Auch im verbundenen Partner-Kalender auf `/neu/partner` gibt es jetzt dieselbe kompakte Hilfe wie in der eigenen Ansicht: Ein kleiner `ⓘ`-Button neben dem Monatsnamen öffnet ein kompaktes Fenster direkt am Button, statt des bisherigen langen Buttons mit Legende unterhalb des Kalenders. Die Zeilen sind für den Partner etwas verständlicher formuliert: Periode bestätigt, eine Kennzeichnung „Geschätzt“ und darunter Nächste Periode geschätzt, Eisprung geschätzt, Fruchtbare Tage geschätzt, sowie PMS vor Periode und – falls aktuell eingetragen – PMS eingetragen. Die Partneransicht bleibt vollständig rein lesend und zeigt keine neuen Informationen.

## Warum?

Owner-Wunsch vom 2026-10-18: Dieselbe kompakte Hilfe soll auch im Partner-Kalender verfügbar sein, mit etwas verständlicheren Erklärungen, da der Partner oft weniger Vorwissen hat.

## Prüfung und Stand

- Neue `PartnerCalendarLegendPopover`-Komponente in `NewPartnerCalendar.tsx`, strukturell identisch zum bereits bestehenden Owner-Popover (WP-018 Korrektur Version 2). Nutzt ausschließlich die bereits vorhandenen Komponentenvariablen `hasAnyPrediction`, `hasFertileWindowSomewhere` und `Boolean(manualPmsSection)` — keine neue Datenquelle, keine zweite Phasenberechnung.
- Der alte lange Button und das Inline-Panel sind vollständig entfernt. Die Owner-Komponente wurde für diese Korrektur nicht geöffnet und blieb nachweislich unverändert.
- Testskripte angepasst/erweitert: `scripts/verify-partner-calendar-legend-collapsible.ts` grundlegend überarbeitet (32 Prüfungen), eine durch diese Korrektur bewusst überholte WP-017-Annahme in `scripts/verify-mobile-partner-compact.ts` korrigiert. Alle anderen Partner-, Ring- und manuellen-PMS-Regressionen erneut grün.
- Live-Prüfung mit temporär installiertem Playwright: Popover zeigt mit aktiver Vorhersage und manuellem PMS alle sechs Zeilen korrekt, ohne manuelles PMS fehlt „PMS eingetragen“ zu Recht; kein horizontaler Überlauf (mobil/breit), keine innere Scrollfläche, Escape/Außenklick schließen zuverlässig, Tagesfenster und Monatswechsel funktionieren unverändert, Unsicherheitshinweis bleibt bei gezielt unregelmäßigem Perioden-Set in allen Zuständen sichtbar, 0 Eingabeelemente.
- `npx tsc --noEmit`, `npm run build`: fehlerfrei/erfolgreich. `node --experimental-strip-types --test tests/*.test.ts`: 83/84, bekannter vorbestehender Defekt.

## Offene Punkte

- Owner-Prüfschritt steht aus (siehe WP-018, Abschnitt „Ist – Korrektur Version 3“).

## Nächster Schritt

Owner prüft `/neu/partner` als aktiver Partner wie im Prüfschritt beschrieben. Danach erneute Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewPartnerCalendar.tsx`, `scripts/verify-partner-calendar-legend-collapsible.ts`, `scripts/verify-mobile-partner-compact.ts`, `docs/work-packages/WP-018-calendar-legende-kompakt.md`, `docs/work-packages/STATE.json`.
- Tests: `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts`, alle genannten `scripts/verify-*`-Skripte, manuelle Live-Prüfung via Playwright (temporär, mobil/breit, mit/ohne manuellem PMS, mit unsicherer Vorhersage).
- Commit oder Referenz: folgt.
