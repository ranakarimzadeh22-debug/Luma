---
id: WP-20261022-1500-claude-kalenderphasen-farben-wp026
date: 2026-10-22
time: 15:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Kalenderphasen klar durch Farben unterscheiden (WP-026)

## Was wurde gemacht?

Im Kalender der Nutzerin und des Partners sind die Phasen jetzt klar an Farbe und Füllung erkennbar. Die tatsächliche Periode ist gefülltes Rosa. Ein selbst eingetragenes PMS ist ein deutlich kräftigeres, gefülltes Rosa. Die geschätzte nächste Periode hat eine rosa Umrandung, das geschätzte PMS eine sehr hellrosa Umrandung, der Eisprung eine violette Umrandung. Das mögliche fruchtbare Zeitfenster hat kein eigenes Band mehr. Die Farbpunkte im ⓘ-Fenster stimmen genau mit den Kalenderfarben überein, weil beide aus derselben Farbliste kommen. Berechnung, Daten, Tagesfenster, Zyklus-Kreis und Partnerrechte sind unverändert.

## Warum?

Die bisherigen Pastelltöne wirkten zu ähnlich. Der Owner wollte den Unterschied zwischen Vorhersage und eigener Eintragung sofort erkennen. Das steht im freigegebenen Arbeitspaket WP-026.

## Prüfung und Stand

Die gezielte Kalenderprüfung wurde um die neue Farbsemantik erweitert und besteht (Farbunterschiede, Lesbarkeit der Tageszahlen, gleiche Farbquelle für Kalender und Legende, kein Fruchtbarkeitsband). TypeScript und Build bestehen. Sichtprüfung mit Testkonten bei 360, 390 und 1280 px für Nutzerin und Partner: genau die fünf Stile im Kalender, Legendenpunkte entsprechen den Bändern, kein Überlauf. Der lila Kreis hinter der geschätzten Periode wurde durch das rosa Umrissband ersetzt. Andere, schon vorher fehlerhafte Prüfskripte sind unverändert. Nicht deployed.

## Offene Punkte

- Das Info-Fenster hat keine Eisprung-Zeile (so vorgegeben); falls der violette Eisprung dort erklärt werden soll, braucht es eine eigene Freigabe.

## Nächster Schritt

Owner prüft Kalender und ⓘ nach dem nächsten Deployment.

## Technische Nachweise

- Betroffene Dateien: `src/lib/calendar-phase-colors.ts` (neu), `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCalendar.tsx`, `scripts/verify-calendar-tile-band.ts`
- Tests: siehe oben
- Commit oder Referenz: pending
