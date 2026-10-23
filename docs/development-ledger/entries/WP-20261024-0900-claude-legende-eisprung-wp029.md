---
id: WP-20261024-0900-claude-legende-eisprung-wp029
date: 2026-10-24
time: 09:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Eisprung in der Kalenderlegende ergänzt (WP-029, Korrektur)

## Was wurde gemacht?

Im ⓘ-Fenster des Kalenders gibt es unter „Geschätzt“ jetzt auch die Zeile „Eisprung“. Davor steht dieselbe violette, nur umrandete Mini-Bandprobe, die im Kalender den Eisprung zeigt, darunter „Kann abweichen“. Das gilt für die Nutzerin und für den Partner. Die Zeile erscheint nur, wenn im jeweiligen Kalender ein Eisprung zu sehen sein kann. Kalenderfarben, Berechnung, Daten, PMS, Zyklus-Kreis und Partnerrechte sind unverändert.

## Warum?

Im Info-Fenster fehlte die Erklärung für den violetten Eisprung im Kalender. Das hat der Owner gemeldet.

## Prüfung und Stand

Die Popover-Prüfskripte wurden ergänzt bzw. an die neue Entscheidung angepasst (frühere Prüfungen verlangten ausdrücklich keine Eisprung-Zeile) und bestehen. TypeScript und Build bestehen. Sichtprüfung mit Testkonten bei 360, 390 und 1280 px für Nutzerin und Partner: Die Eisprung-Probe stimmt mit dem violetten Kalenderband überein, das Fenster liegt vollständig im Bild und schließt mit Escape. Eine TodayCard-Prüfung im Partner-Legendenskript war schon vorher fehlerhaft. Nicht deployed.

## Offene Punkte

- Keine.

## Nächster Schritt

Keiner – Korrektur abgeschlossen.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCalendar.tsx`, vier angepasste Prüfskripte
- Tests: siehe oben
- Commit oder Referenz: pending
