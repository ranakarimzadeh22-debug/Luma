---
id: WP-20261019-1700-claude-zyklus-ring-baender-korrektur-v4
date: 2026-10-19
time: 17:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Korrektur V4: Breite Kalender-Phasenbänder hinter den Tageszahlen (WP-022)

## Was wurde gemacht?

Die Phasen (zum Beispiel PMS oder Periode) erscheinen in den Kalendern auf `/neu` und `/neu/partner` jetzt als breites, durchgehendes Pillen-Band direkt hinter den Tageszahlen – nicht mehr als dünner Streifen am unteren Rand der Kachel. Mehrere aufeinanderfolgende Tage derselben Phase verbinden sich dabei sichtbar ohne Lücke zu einem einzigen Band; nur der erste und letzte Tag eines Abschnitts sind abgerundet. Der heutige Tag zeigt weiterhin nur einen kleinen roten Kreis hinter seiner Zahl; im Partnerkalender wurde zusätzlich ein äußerer Rahmen um die Heute-Kachel entfernt, der dort versehentlich noch übrig war. Der Zyklus-Kreis wurde nicht verändert.

## Warum?

Ausdrücklicher Korrekturauftrag der Ownerin vom 2026-10-19 mit einer Bildreferenz: der schmale Streifen aus der vorherigen Korrektur entsprach nicht der gewünschten Optik.

## Prüfung und Stand

- `scripts/verify-calendar-tile-band.ts` wurde auf die neue breite Band-Darstellung aktualisiert und erweitert (30 Prüfungen): alle bestanden.
- Drei bestehende Testskripte wurden an die geänderte Kachel-Struktur angepasst; eines davon (`verify-action-success-toast.ts`) war dabei bereits vor dieser Korrektur komplett defekt und wurde im Zuge dessen vollständig repariert.
- Zwei weitere, bereits vor dieser Korrektur unabhängig defekte Testskripte wurden identifiziert, per `git stash` als vorbestehend bestätigt und bewusst nicht verändert (außerhalb des Auftrags).
- `npx tsc --noEmit`, `npm run build`: beide ohne Fehler, Routenliste unverändert.
- `node --experimental-strip-types --test tests/*.test.ts`: 83/84 bestanden; der eine Fehlschlag ist bekannt und unabhängig von diesem Paket.
- Live-Prüfung mit zwei echten Testkonten (Owner und verbundener Partner): per Geometrie-Messung bestätigt, dass benachbarte Bandsegmente derselben Phase mit exakt 0 Pixeln Abstand aneinanderstoßen; Band ist 62% der Kachelhöhe hoch und zentriert; Heute-Kreis klein und ohne äußeren Rahmen; Tagesfenster bleibt bedienbar; kein horizontaler Überlauf; Partneransicht weiterhin rein lesend.

## Offene Punkte

- Keine.

## Nächster Schritt

Keiner – Arbeitspaket abgeschlossen.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCalendar.tsx`, `scripts/verify-calendar-tile-band.ts`, `scripts/verify-mobile-home-compact.ts`, `scripts/verify-mobile-partner-compact.ts`, `scripts/verify-action-success-toast.ts`, `docs/work-packages/WP-022-zyklus-ring-baender-und-tagespunkt.md`, `docs/work-packages/STATE.json`.
- Tests: siehe Arbeitspaket-Ist-Abschnitt Version 4 für die vollständige Liste und Ergebnisse.
- Commit oder Referenz: pending
