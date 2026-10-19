---
id: WP-20261019-1100-claude-owner-mobile-bottom-navigation
date: 2026-10-19
time: 11:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Mobile untere Navigation für das Owner-Konto (WP-021)

## Was wurde gemacht?

Auf dem Handy gibt es jetzt unten auf den eigenen Owner-Seiten `Home` und `Einstellungen` eine kleine feste Leiste mit genau zwei Bereichen: `Home` und `Einstellungen`. Der gerade aktive Bereich ist farblich hervorgehoben. Die Leiste erscheint nur auf dem Handy und nur auf diesen zwei Owner-Seiten – nicht auf größeren Bildschirmen, nicht beim Partnerkonto und nicht während des ersten Einrichtungsschritts.

## Warum?

Bestätigte Owner-Entscheidung vom 2026-10-19 zu `APP-IDEA-024`: Die zwei wichtigen Owner-Seiten sollen mit einem Tipp erreichbar sein, ohne die Home-Ansicht mit zusätzlichen Texten zu füllen.

## Prüfung und Stand

- Neues Skript `scripts/verify-owner-mobile-nav.ts`: 25 Quelltext-Prüfungen (genau zwei Links/Ziele, aktiver Tab über `aria-current`, mobile-only, sichere untere Kante, Tippflächengröße, keine neue Abhängigkeit, korrekte Einbindung nur in den normalen Owner-Rückgabepfaden, keine Einbindung bei Partner/Gates). Alle bestanden.
- `npx tsc --noEmit`: ohne Fehler.
- `npm run build`: erfolgreich, Routenliste unverändert.
- `node --experimental-strip-types --test tests/*.test.ts`: 83/84 bestanden; der eine Fehlschlag in `tests/calendar-day-info.test.ts` ist bekannt und unabhängig von diesem Paket (vorbestehend, durch `git stash` auf unverändertem `main` reproduzierbar).
- Bestehende Regressionsskripte für Home, Einstellungen, Partner und mobile Kompaktdarstellung erneut ausgeführt: alle bestanden.
- Live-Prüfung mit echtem Testkonto über die reale Registrierungs-UI (temporär installiertes Playwright, anschließend vollständig entfernt): mobil zeigt `/neu` und `/neu/einstellungen` die Leiste mit korrekt aktivem Tab, ausreichender Tippfläche und ohne horizontalen Überlauf; auf breiten Bildschirmen ist die Leiste nicht sichtbar und der bisherige „Einstellungen“-Link bleibt erhalten; `/neu/partner` zeigt auf dem Handy keine Leiste.

## Offene Punkte

- Keine.

## Nächster Schritt

Keiner – Arbeitspaket abgeschlossen.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewOwnerMobileNav.tsx` (neu), `src/app/neu/page.tsx`, `src/app/neu/einstellungen/page.tsx`, `scripts/verify-owner-mobile-nav.ts` (neu), `docs/work-packages/WP-021-owner-mobile-bottom-navigation.md`, `docs/work-packages/STATE.json`.
- Tests: `scripts/verify-owner-mobile-nav.ts` (25/25), `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts` (83/84, ein bekannter vorbestehender Fehlschlag), bestehende Regressionsskripte für Home/Einstellungen/Partner/Mobile, temporäre Playwright-Live-Prüfung (vollständig zurückgebaut).
- Commit oder Referenz: pending
