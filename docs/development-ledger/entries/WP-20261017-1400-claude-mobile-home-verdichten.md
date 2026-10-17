---
id: WP-20261017-1400-claude-mobile-home-verdichten
date: 2026-10-17
time: 14:00
agent: Anthropic Claude
status: completed
screens: Startseite
why_status: confirmed
why_source: Owner-Auftrag
commits: 0a78988
---

# Mobile Home-Ansicht ruhig verdichten (WP-016)

## Was wurde gemacht?

Auf dem Handy wirkt die Home-Seite `/neu` jetzt ruhiger und kompakter: kleinere Schrift und engere Abstände in der Heute-Karte, ein sichtbar kleinerer Zyklus-Kreis mit schmaleren Ringbändern, sowie eine kleinere Monatsüberschrift mit engeren Kalenderabständen. Alle Texte, Hinweise, Labels und der rote Heute-Punkt bleiben vollständig lesbar und getrennt. Tagesfelder und Monatspfeile bleiben mindestens 40×40 CSS-Pixel groß und gut antippbar. Ab der bestehenden `sm`-Bildschirmbreite und in der Partneransicht bleibt alles unverändert wie zuvor.

## Warum?

Owner-Entscheidung vom 2026-10-17 (Akte APP-IDEA-019): Die mobile Home-Seite wirkte zu groß, die Nutzerin musste mehr scrollen als für einen schnellen Überblick angenehm ist.

## Prüfung und Stand

- `CyclePersonalRing.tsx` erhält eine neue, rein optionale `compact`-Prop (Default `false`), die nur Container-Größe, Ringbandbreite und Label-Schriftgröße reduziert — nie die Geometrie, Winkel oder Markerberechnung. Die Partneransicht (`NewPartnerCycleRing.tsx`) übergibt diese Prop nie und bleibt dadurch garantiert unverändert, auch mobil.
- `NewCycleExample.tsx`: Der Ring wird für die eigene Ansicht über zwei CSS-Wrapper (`sm:hidden`/`hidden sm:block`) zweimal gerendert — compact unterhalb `sm`, unverändert ab `sm` — ohne JS-Media-Query. TodayCard, Zyklus-Überschrift, Kalenderabstände und Monatsüberschrift wurden mobil verdichtet.
- Bei der Prüfung fiel auf, dass die Monatspfeile schon vor diesem Paket nur ca. 32×36px Klickfläche hatten; da das Abnahmekriterium ausdrücklich mindestens ~40px verlangt, wurde dafür eine feste 40×40px-Fläche ergänzt (keine Schriftgrößenänderung der Pfeile selbst).
- Neues Testskript `scripts/verify-mobile-home-compact.ts` (20 Prüfungen) sowie Anpassung von zwei bestehenden Regressionsskripten an die jetzt responsiven Abstandsklassen. Alle bestanden.
- Live-Prüfung mit temporär installiertem Playwright: mobil 272×272px Ring (vorher 352×352px), 40×40px Pfeile, 43×43px Tagesfelder, kein horizontaler Überlauf, Monatswechsel und Tagesfenster funktionieren; breite Ansicht unverändert 352×352px; Partneransicht unverändert groß, weiterhin rein lesend.
- Bei der Regressionsprüfung wurden drei bereits vorbestehende, nicht durch dieses Paket verursachte Testskript-Defekte bestätigt (per `git stash` auf dem unveränderten `main`-Stand reproduziert): `verify-action-success-toast.ts`, zwei Prüfungen in `verify-today-card.ts` und zwei in `verify-calendar-legend-collapsible.ts` nutzen veraltetes String-Matching gegen mittlerweile anders formatierten, aber funktional korrekten Quelltext. Nicht repariert, da außerhalb des WP-016-Auftragsumfangs; dem Owner zur Kenntnis gegeben.
- `npx tsc --noEmit`, `npm run build`: fehlerfrei/erfolgreich. `node --experimental-strip-types --test tests/*.test.ts`: 83/84, bekannter vorbestehender Defekt.

## Offene Punkte

- Owner-Prüfschritt steht aus (siehe WP-016, Abschnitt „ein Prüfschritt für den Owner“).
- Drei vorbestehende, nicht durch dieses Paket verursachte Testskript-Defekte (siehe oben) bleiben offen für eine separate Prüfung/Korrektur außerhalb dieses Pakets.

## Nächster Schritt

Owner prüft `/neu` auf dem Handy wie im Prüfschritt beschrieben. Danach Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `src/components/CyclePersonalRing.tsx`, `src/components/NewCycleExample.tsx`, `scripts/verify-mobile-home-compact.ts` (neu), `scripts/verify-home-screen-layout.ts`, `scripts/verify-home-actions-consistent.ts`, `docs/work-packages/WP-016-mobile-home-verdichten.md`, `docs/work-packages/STATE.json`.
- Tests: `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts`, alle genannten `scripts/verify-*`-Skripte, manuelle Live-Prüfung via Playwright (temporär, mobil und breit, Eigen- und Partneransicht).
- Commit oder Referenz: 0a78988.
