---
id: WP-20261015-1600-claude-pms-symptome-korrektur-v2-begrenzung
date: 2026-10-15
time: 16:00
agent: Anthropic Claude
status: completed
screens: Zyklus | Partner
why_status: confirmed
why_source: Owner-Auftrag
commits: 1399424
---

# Korrektur Version 2: manuelles PMS begrenzt darstellen (WP-013)

## Was wurde gemacht?

Die Ownerin hatte nach ihrer Sichtprüfung gemeldet, dass eine heutige Symptommarkierung manuelles PMS unbegrenzt über die gesamte Zukunft des Kalenders zeigte. Jetzt endet ein manueller PMS-Abschnitt am Tag vor dem vorhergesagten nächsten Periodenbeginn, sofern dieser noch in der Zukunft liegt; ist der vorhergesagte Beginn bereits überschritten ohne tatsächliche neue Periode, reicht der manuelle Status nur noch bis einschließlich heute. Eine tatsächlich gespeicherte neue Periode beendet den manuellen Status weiterhin sofort und hat unverändert Vorrang. Die bestehende Vorhersage selbst (Datum, Berechnung, Darstellung) bleibt vollständig unverändert – sie wird nur als bereits vorhandener Wert gelesen, um die Anzeige zu begrenzen.

## Warum?

Die Ownerin hat nach ihrer Sichtprüfung der vorherigen Korrektur eine zu breite Darstellung gemeldet und einen neuen Korrekturauftrag Version 2 im Arbeitspaket WP-013 formuliert (Abschnitt „Korrekturauftrag Version 2 – manuelles PMS begrenzt darstellen").

## Prüfung und Stand

- `src/lib/manual-pms.ts`: neue zentrale Begrenzungsfunktion `resolveSectionEndDate`, `deriveManualPmsSection` erhält die bestehende Vorhersage als optionalen Parameter. Alle drei Aufrufstellen (Eigenansicht, Partner-Kalender, Partner-Zyklus-Kreis) übergeben jetzt ihre jeweils bereits vorhandene, unveränderte Vorhersage.
- `tests/manual-pms.test.ts`: 4 neue gezielte Tests (22 insgesamt, alle bestanden) für die drei im Korrekturauftrag genannten Pflichtfälle sowie identische Eigen-/Partneransicht-Ergebnisse.
- `scripts/verify-manual-pms-symptom-ui.ts` und `scripts/verify-manual-pms-prediction-isolation.ts` um gezielte Prüfblöcke für Version 2 ergänzt.
- `npx tsc --noEmit`, `npm run build`: fehlerfrei/erfolgreich. Alle bestehenden Regressionen weiterhin grün.
- Live-Prüfung mit temporär installiertem Playwright: zwei Perioden im 28-Tage-Rhythmus angelegt, heutige Symptommarkierung gesetzt. Der Tag vor dem vorhergesagten nächsten Periodenbeginn zeigte korrekt weiterhin manuelles PMS, der vorhergesagte Tag selbst und ein deutlich späterer Tag zeigten kein manuelles PMS mehr. Testkonto vollständig entfernt.

## Offene Punkte

- Owner-Prüfschritt steht weiterhin aus; erneute Soll-Ist-Prüfung durch Codex nach dieser Korrektur erforderlich.

## Nächster Schritt

Codex prüft die Korrektur Version 2 gegen die gemeldete, zu breite Darstellung. Danach Owner-Abnahme.

## Technische Nachweise

- Betroffene Dateien: `src/lib/manual-pms.ts`, `src/components/NewCycleExample.tsx`, `src/lib/new-partner-calendar.ts`, `src/lib/new-partner-cycle-view.ts`, `tests/manual-pms.test.ts`, `scripts/verify-manual-pms-symptom-ui.ts`, `scripts/verify-manual-pms-prediction-isolation.ts`, `docs/work-packages/WP-013-pms-symptome-manuell-markieren.md`.
- Tests: `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts`, alle `scripts/verify-*`-Skripte, manuelle Live-Prüfung via Playwright (temporär).
- Commit oder Referenz: 1399424.
