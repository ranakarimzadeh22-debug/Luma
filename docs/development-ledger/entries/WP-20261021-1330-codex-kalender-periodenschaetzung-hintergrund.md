---
id: WP-20261021-1330-codex-kalender-periodenschaetzung-hintergrund
date: 2026-10-21
time: 13:30
agent: Codex
status: completed
screens: Owner-Kalender | Partner-Kalender
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Sehr heller Hintergrund für die geschätzte nächste Periode

## Was wurde gemacht?

Im Kalender liegt bei der geschätzten nächsten Periode jetzt ein sehr heller fliederfarbener Kreis direkt hinter der Datumszahl. Die deutlichere Darstellung einer bestätigten oder laufenden echten Periode bleibt unverändert und hat weiterhin Vorrang. Die Partneransicht zeigt diese Anpassung nur innerhalb ihrer bereits bestehenden Freigabe.

## Warum?

Der Owner möchte die bisherigen kleinen Markierungen durch eine ruhigere, direkt der Datumszahl zugeordnete Darstellung ersetzen.

## Prüfung und Stand

- Owner- und Partner-Kalender gezielt auf den neuen Hintergrund geprüft.
- Prioritätsreihenfolge für bestätigte und laufende echte Periodentage bleibt unverändert.
- Keine Berechnung, Datenquelle, API, Berechtigung oder Freigabe geändert.

## Offene Punkte

- Keine.

## Nächster Schritt

Owner prüft die Kalenderdarstellung in `/neu` und, bei bestehender Freigabe, in `/neu/partner`.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCalendar.tsx`.
- Gezielte Prüfung: Text-/Diff-Prüfung der Schätzungsdarstellung und Vorranglogik.
- Bezug: WP-022 Kalenderdarstellung.
- Commit oder Referenz: pending.
