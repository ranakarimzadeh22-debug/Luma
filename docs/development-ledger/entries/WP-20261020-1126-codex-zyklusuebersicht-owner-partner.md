---
id: WP-20261020-1126-codex-zyklusuebersicht-owner-partner
date: 2026-10-20
time: 11:26
agent: Codex
status: completed
screens: Owner-Startseite | Partneransicht | Einstellungen
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Aufgeräumte Zyklusübersicht für Nutzerin und Partner (WP-024)

## Was wurde gemacht?

Der Zyklus-Kreis zeigt jetzt nur noch eine klare Hauptaussage. Direkt daneben beziehungsweise auf dem Handy darunter steht eine kleine Karte mit den wichtigsten Zyklusinformationen. Ein verbundener Partner sieht dieselbe Darstellung ausschließlich dann, wenn die Nutzerin den Schalter „Zyklus-Kreis für Partner freigeben“ aktiviert hat. Der Partner kann nichts bearbeiten.

## Warum?

Der Owner-Auftrag WP-024 bestätigt, dass die erste Zyklusaussage schneller verständlich und Prognosen durchgehend als unsicher erkennbar sein sollen.

## Prüfung und Stand

- Gemeinsame Präsentationsableitung für laufende Periode, Countdown, fehlende Daten und verlässliche Zykluslänge gezielt geprüft.
- Freigabe aus/ein, Kontotrennung, fehlende Daten und Verbindungswiderruf gegen die lokale Testdatenbank geprüft; Testdaten danach entfernt.
- Ring-/Marker-, Kalender-, Popover-, Tagesfenster-, Partner- und Mobilnavigationsregressionen in den nicht durch WP-024 ersetzten Bereichen bestanden.
- TypeScript und Produktions-Build bestanden.
- Browser-Sichtprüfung mit verbundenem Owner-/Partner-Testkonto bei 360, 390 und 1280 Pixeln bestanden: mobil gestapelt, breit zweispaltig, keine horizontale Überbreite; Testkonten anschließend gelöscht.

## Offene Punkte

- Owner prüft Owner- und Partneransicht mobil und breit.

## Nächster Schritt

Owner schaltet die Ringfreigabe aus und ein und vergleicht `/neu` mit `/neu/partner`.

## Technische Nachweise

- Betroffene Dateien: gemeinsame Zykluspräsentation/-komponente, Owner-/Partner-Einbindung, Partner-Gate/Setter/Route/Schalter, gezielte Tests, WP-024 und STATE.
- Tests: `scripts/verify-cycle-overview-wp024.ts`, `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-partner-fixed-view.ts`, Ring-/Kalenderregressionen, `npx tsc --noEmit`, `npm run build`.
- Commit oder Referenz: pending.
