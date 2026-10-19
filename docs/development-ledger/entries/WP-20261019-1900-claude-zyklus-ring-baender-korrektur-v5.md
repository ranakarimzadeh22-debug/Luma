---
id: WP-20261019-1900-claude-zyklus-ring-baender-korrektur-v5
date: 2026-10-19
time: 19:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: 63231c1
---

# Korrektur V5: Kachel-Trennlinien innerhalb der Phasenbänder entfernt (WP-022)

## Was wurde gemacht?

Innerhalb eines mehrtägigen, zusammenhängenden Phasenbands (zum Beispiel mehrere PMS-Tage hintereinander) waren bisher noch feine senkrechte Linien zwischen den einzelnen Tagen sichtbar, weil jede Tageskachel weiterhin ihren eigenen Rand hatte. Diese Trennlinien wurden entfernt: Tage mit einem sichtbaren Band haben jetzt keinen eigenen Kachelrand mehr, sodass das Band wirklich wie ein einziges durchgehendes Stück aussieht. Tage ohne Band (neutrale Tage) behalten ihre gewohnte, ruhige Optik mit Rand unverändert. Breite der Bänder, Tageszahlen, der kleine rote Heute-Kreis und der Zyklus-Kreis bleiben unverändert.

## Warum?

Ausdrücklicher Korrekturauftrag der Ownerin vom 2026-10-19: die Owner-Referenz zeigte innerhalb eines durchgehenden Phasenbands keine solchen Tageskachel-Trennlinien.

## Prüfung und Stand

- `scripts/verify-calendar-tile-band.ts` um zwei gezielte Prüfblöcke erweitert (37 Prüfungen insgesamt): bestätigt, dass Tage mit Band keinen Rand mehr erhalten, neutrale Tage ihren Rand aber behalten, und dass alle übrigen V4-Eigenschaften unverändert bleiben.
- Zwei weitere bestehende Testskripte wurden an den jetzt bedingten (statt statischen) Rand-Ausdruck angepasst; die geprüfte fachliche Aussage bleibt dabei unverändert bestätigt.
- `npx tsc --noEmit`, `npm run build`: beide ohne Fehler, Routenliste unverändert.
- `node --experimental-strip-types --test tests/*.test.ts`: 83/84 bestanden; der eine Fehlschlag ist bekannt und unabhängig von diesem Paket.
- Vollständiger Lauf aller Prüfskripte: nur die bereits aus Korrektur V4 bekannten, vorbestehenden und unabhängigen Fehlschläge bleiben bestehen.
- Live-Prüfung mit zwei echten Testkonten (Owner und verbundener Partner): per DOM-Messung bestätigt, dass kein Tag mit sichtbarem Band noch einen sichtbaren Kachelrand zeigt, während neutrale Tage ihren Rand weiterhin behalten; Screenshots bestätigen visuell nahtlose Bänder ohne Trennlinien in beiden Kalendern.

## Offene Punkte

- Keine.

## Nächster Schritt

Keiner – Arbeitspaket abgeschlossen.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCalendar.tsx`, `scripts/verify-calendar-tile-band.ts`, `scripts/verify-mobile-partner-compact.ts`, `docs/work-packages/WP-022-zyklus-ring-baender-und-tagespunkt.md`, `docs/work-packages/STATE.json`.
- Tests: siehe Arbeitspaket-Ist-Abschnitt Version 5 für die vollständige Liste und Ergebnisse.
- Commit oder Referenz: 63231c1
