---
id: WP-20261018-1300-claude-calendar-legende-kompakt-korrektur-v2
date: 2026-10-18
time: 13:00
agent: Anthropic Claude
status: completed
screens: Startseite
why_status: confirmed
why_source: Owner-Auftrag
commits: fe7def0
---

# Kurze Popover-Legende direkt am Info-Button statt langem Inline-Panel (WP-018 Korrektur Version 2)

## Was wurde gemacht?

Nach dem Antippen von `ⓘ` auf `/neu` erscheint jetzt ein kleines Fenster direkt am Info-Button, statt wie zuvor eine lange Legende unterhalb des Kalenders aufzuklappen. Das Fenster zeigt nur sechs kurze Zeilen: Periode, PMS, eine Kennzeichnung „Geschätzt“ und darunter Fruchtbare Tage, Eisprung, Nächste Periode. Die bisherigen langen Erklärungstexte und die anklickbaren P/M/E-Detailerklärungen gibt es in dieser Ansicht nicht mehr. Das Fenster schließt beim erneuten Antippen von `ⓘ`, bei Escape oder bei einem Klick/Tipp außerhalb. Der Hinweis „Vorhersage unsicher - Kann abweichen“ bleibt davon unabhängig immer sichtbar.

## Warum?

Owner-Präzisierung vom 2026-10-18 nach der ersten WP-018-Umsetzung: Die Legende sollte nicht mehr unterhalb des Kalenders erscheinen, sondern als kleines Fenster direkt am Info-Button, mit nur kurzen Farbzeilen statt langer Erklärungen.

## Prüfung und Stand

- Das bisherige, im Dokumentfluss gerenderte `calendar-legend-panel` wurde durch ein `role="dialog"`-Popover ersetzt, das per `position: absolute` direkt am Info-Button verankert ist und sich als Overlay über nachfolgende Inhalte legt, statt das Seitenlayout zu verschieben.
- Sechs kurze Zeilen mit wiederverwendeten Farbwerten, keine neue Berechnung. Schließen über `useEffect`-basierte `document`-Listener für Escape und Außenklick, ohne neue Abhängigkeit.
- Ungenutzter Code vollständig entfernt: die frühere P/M/E-Detailkomponente, ihre Erklärungstexte und der dafür nötige State.
- Testskript `scripts/verify-calendar-legend-collapsible.ts` grundlegend überarbeitet (37 Prüfungen) für die neue Popover-Struktur; alle anderen bestehenden Regressionen erneut grün.
- Live-Prüfung mit temporär installiertem Playwright: Popover öffnet/schließt korrekt über Trigger, Escape und Außenklick; bleibt mobil und breit vollständig innerhalb des Viewports ohne horizontalen Überlauf und ohne innere Scrollfläche; Unsicherheitshinweis bleibt in allen Zuständen sichtbar; Monatsname, Monatswechsel und Tagesfenster funktionieren unverändert.
- `npx tsc --noEmit`, `npm run build`: fehlerfrei/erfolgreich. `node --experimental-strip-types --test tests/*.test.ts`: 83/84, bekannter vorbestehender Defekt.

## Offene Punkte

- Owner-Prüfschritt steht erneut aus (siehe WP-018, Abschnitt „Ist – Korrektur Version 2“).

## Nächster Schritt

Owner prüft `/neu` erneut wie im Prüfschritt beschrieben. Danach erneute Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `scripts/verify-calendar-legend-collapsible.ts`, `docs/work-packages/WP-018-calendar-legende-kompakt.md`, `docs/work-packages/STATE.json`.
- Tests: `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts`, alle genannten `scripts/verify-*`-Skripte, manuelle Live-Prüfung via Playwright (temporär, mobil/breit, Escape/Außenklick, unsichere Vorhersage).
- Commit oder Referenz: fe7def0.
