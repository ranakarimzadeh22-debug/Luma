---
id: WP-20261018-1100-claude-calendar-legende-kompakt
date: 2026-10-18
time: 11:00
agent: Anthropic Claude
status: completed
screens: Startseite
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Kalenderlegende kompakt an der Monatsüberschrift öffnen (WP-018)

## Was wurde gemacht?

Der lange Button „Erklärungen zum Kalender anzeigen“/„ausblenden“ unter dem Kalender auf `/neu` ist verschwunden. Stattdessen steht jetzt ein kleiner Info-Button `ⓘ` direkt neben dem Monatsnamen (z. B. „Oktober 2026“). Er öffnet und schließt dieselbe, unveränderte Erklärung zu Farben, Vorhersagen und P/M/E. Der Monatsname bleibt ein eigener Button, der weiterhin die Periodenhistorie öffnet — beide Aktionen sind getrennt und kollidieren nicht. Der Hinweis „Vorhersage unsicher - Kann abweichen“ bleibt unabhängig vom Öffnungszustand sichtbar.

## Warum?

Owner-Entscheidung vom 2026-10-18 (Akte APP-IDEA-025, APP-IDEA-011): Die Home-Ansicht soll ruhiger wirken und weniger Platz verbrauchen, die Hilfe soll aber genau dort erreichbar bleiben, wo der Kalender sichtbar ist.

## Prüfung und Stand

- Derselbe, unveränderte `isCalendarLegendOpen`-State und `calendar-legend-panel` werden jetzt von einem neuen, kleinen Info-Button in der Monatszeile gesteuert statt vom entfernten langen Button unterhalb des Kalenders. Dynamisches `aria-expanded`, `aria-controls` und `aria-label` sorgen für vollständige Zugänglichkeit, auch wenn nur das Symbol `ⓘ` sichtbar ist.
- Der Monatsname-Button und der Info-Button sind Geschwister-Elemente, keine Verschachtelung; beide lösen unterschiedliche, unveränderte Handler aus.
- `PhaseLegendItem` (P/M/E-Erklärungen mit Escape-Verhalten) und der Unsicherheitshinweis wurden nicht angefasst.
- Bestehende Regressionsskripte angepasst, wo sie bewusst überholte Annahmen prüften (z. B. „Erklärungen...“ als Pill-Button), sowie neue gezielte Prüfungen für die Umstellung ergänzt. Alle bestehenden, weiterhin zutreffenden Prüfungen bestehen unverändert; zwei bereits vor WP-018 bekannte, vorbestehende Testskript-Defekte bleiben unverändert und unberührt.
- Live-Prüfung mit temporär installiertem Playwright: Info-Button und Monatszeile kollidieren nicht (mobil und breit), Legende öffnet/schließt korrekt, P/M/E-Escape-Verhalten funktioniert bei echtem Fokus, Monatsname öffnet separat die Historie, Monatswechsel funktioniert, kein horizontaler Überlauf.
- `npx tsc --noEmit`, `npm run build`: fehlerfrei/erfolgreich. `node --experimental-strip-types --test tests/*.test.ts`: 83/84, bekannter vorbestehender Defekt.

## Offene Punkte

- Owner-Prüfschritt steht aus (siehe WP-018, Abschnitt „Ein Prüfschritt für den Owner“).

## Nächster Schritt

Owner prüft `/neu` wie im Prüfschritt beschrieben. Danach Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `scripts/verify-calendar-legend-collapsible.ts`, `scripts/verify-home-actions-consistent.ts`, `scripts/verify-mobile-home-compact.ts`, `docs/work-packages/WP-018-calendar-legende-kompakt.md`, `docs/work-packages/STATE.json`.
- Tests: `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts`, alle genannten `scripts/verify-*`-Skripte, manuelle Live-Prüfung via Playwright (temporär, mobil/breit, echter Fokus-Klick für Escape-Verhalten).
- Commit oder Referenz: folgt.
