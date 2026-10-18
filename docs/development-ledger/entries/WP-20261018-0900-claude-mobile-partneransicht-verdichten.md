---
id: WP-20261018-0900-claude-mobile-partneransicht-verdichten
date: 2026-10-18
time: 09:00
agent: Anthropic Claude
status: completed
screens: Partner
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Mobile Partneransicht ruhig verdichten (WP-017)

## Was wurde gemacht?

Auf dem Handy wirkt `/neu/partner` jetzt ruhiger und kompakter: kleinerer Zyklus-Kreis, kleinere Monatsüberschrift, Wochentage und Tageszahlen im Kalender, engere Abstände. Alle Ring-Labels, der rote Heute-Punkt, die PMS-/Perioden-Hinweise und der Unsicherheitshinweis bleiben vollständig lesbar und getrennt. Tagesfelder und Monatspfeile bleiben mindestens 40×40 CSS-Pixel groß und gut antippbar. Die Partneransicht bleibt vollständig rein lesend. Ab der bestehenden `sm`-Bildschirmbreite und auf der eigenen Home-Seite `/neu` bleibt alles unverändert wie zuvor.

## Warum?

Owner-Entscheidung vom 2026-10-17 (Akte APP-IDEA-023): Der Partner soll auf seinem Handy möglichst wenig scrollen müssen, um Zyklus, Kalender und Hinweise zu überblicken.

## Prüfung und Stand

- `NewPartnerCycleRing.tsx` nutzt jetzt dasselbe, bereits seit WP-016 bestehende `compact`-Prop auf `CyclePersonalRing.tsx` (unverändert) über zwei CSS-Wrapper (`sm:hidden`/`hidden sm:block`) — kein JS-Media-Query, keine Änderung an der Ringkomponente selbst.
- `NewPartnerCalendar.tsx` nutzt die bereits bestehende `compact`-Prop von `CalendarTodayLine.tsx`; Monatsüberschrift, Wochentage, Haupt-Tageszahl und Abstände mobil verdichtet; Monatspfeile und der Erklärungen-Umschalter erhielten eine garantierte 40px-Mindestfläche.
- Bei der Live-Prüfung fiel auf, dass die Tagesfelder zunächst nur 36×36px maßen — die Partneransicht hat anders als die Eigenansicht eine zusätzliche Karten-Hülle um den Kalender, die bei reiner Innenabstandsverdichtung nicht genug Platz ließ. Behoben durch ein zusätzlich verdichtetes äußeres Seiten-Padding und ein engeres Tagesraster-Gap mobil; danach 42×42px.
- Neues Testskript `scripts/verify-mobile-partner-compact.ts` (28 Prüfungen) sowie zwei bewusst korrigierte, durch WP-017 überholte Annahmen in `scripts/verify-mobile-home-compact.ts` (WP-016). Alle bestehenden Partner- und Ring-Regressionen erneut grün.
- Live-Prüfung mit temporär installiertem Playwright: mobil 272×272px Ring, 40×40px Pfeile, 42×42px Tagesfelder, kein horizontaler Überlauf, Monatswechsel und Tagesfenster funktionieren, manuelles PMS stimmt zwischen Ring und Kalender überein; breite Ansicht unverändert; eigene Home-Ansicht `/neu` unverändert.
- `npx tsc --noEmit`, `npm run build`: fehlerfrei/erfolgreich. `node --experimental-strip-types --test tests/*.test.ts`: 83/84, bekannter vorbestehender Defekt.

## Offene Punkte

- Owner-Prüfschritt steht aus (siehe WP-017, Abschnitt „ein Prüfschritt für den Owner“).

## Nächster Schritt

Owner prüft `/neu/partner` als aktiver Partner auf dem Handy und breit wie im Prüfschritt beschrieben. Danach Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `src/app/neu/partner/page.tsx`, `src/components/NewPartnerCycleRing.tsx`, `src/components/NewPartnerCalendar.tsx`, `scripts/verify-mobile-partner-compact.ts` (neu), `scripts/verify-mobile-home-compact.ts`, `docs/work-packages/WP-017-mobile-partneransicht-verdichten.md`, `docs/work-packages/STATE.json`.
- Tests: `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts`, alle genannten `scripts/verify-*`-Skripte, manuelle Live-Prüfung via Playwright (temporär, mobil/breit, Partner- und Eigenansicht, manuelles PMS).
- Commit oder Referenz: folgt.
