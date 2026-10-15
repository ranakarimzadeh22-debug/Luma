---
id: WP-20261015-1400-claude-pms-symptome-korrektur-periodenvorrang
date: 2026-10-15
time: 14:00
agent: Anthropic Claude
status: completed
screens: Zyklus | Partner
why_status: confirmed
why_source: Fehlernachweis
commits: pending
---

# Korrektur: echte Periodendaten haben immer Vorrang vor manuellem PMS (WP-013)

## Was wurde gemacht?

Vor der Owner-Abnahme von WP-013 hat Codex eine Lücke gemeldet: Eine Symptommarkierung auf einem tatsächlichen (laufenden oder bestätigten) Periodentag konnte den Zyklus-Kreis fälschlich auf manuelles PMS setzen, da nur der Kalender, nicht aber die zentrale Ableitungslogik selbst, echte Periodentage schützte. Außerdem konnte eine während einer Periode gespeicherte Markierung nach deren Ende fälschlich eine manuelle PMS-Phase fortsetzen. Beides wurde jetzt direkt in der zentralen Funktion `isWithinManualPmsSection`/`deriveManualPmsSection` (`src/lib/manual-pms.ts`) behoben: Ein echter Periodentag wird dort jetzt strukturell immer ausgeschlossen, unabhängig von der Aufrufstelle; ein manueller PMS-Abschnitt kann frühestens am Tag nach dem echten Ende der letzten Periode beginnen, nie während einer laufenden Periode.

## Warum?

Codex' Soll-Ist-Prüfung vom 2026-10-15 hat die Lücke konkret benannt und die Owner-Abnahme bis zur Korrektur zurückgestellt (siehe WP-013, Abschnitt „Soll-Ist-Prüfung – von Codex"). Tatsächliche Periodendaten müssen laut Soll immer Vorrang vor jeder Schätzung oder manuellen Angabe haben.

## Prüfung und Stand

- `src/lib/manual-pms.ts`: neue interne Prüfung `isRealPeriodDay`, `deriveManualPmsSection` erhält einen neuen `today`-Parameter und beginnt den Abschnitt jetzt erst nach dem echten Periodenende; `isWithinManualPmsSection`/`applyManualPmsOverride`/`manualPmsSymptomsForDate` erhalten `periods`/`today` und schließen echte Periodentage strukturell aus.
- Alle Aufrufstellen angepasst: `NewCycleExample.tsx`, `new-partner-cycle-view.ts` (der von Codex konkret benannte Partner-Bug), `new-partner-calendar.ts`, `NewPartnerCalendar.tsx`, `partner/page.tsx`.
- `tests/manual-pms.test.ts`: 5 neue gezielte Tests (laufende Periode blockiert, Markierung nach Periodenende erlaubt, Markierung auf echtem Periodentag abgelehnt, nachträglich überschneidende Periode deaktiviert einen vormals gültigen Abschnitt, Override überschreibt nie einen echten Periodentag) – insgesamt 18 Tests, alle bestanden.
- `scripts/verify-manual-pms-symptom-ui.ts` um einen Korrektur-Prüfblock ergänzt; `scripts/verify-manual-pms-prediction-isolation.ts` auf neue Signatur angepasst. Beide sowie alle bestehenden Regressionen weiterhin grün.
- `npx tsc --noEmit`, `npm run build`: fehlerfrei/erfolgreich.
- Live-Prüfung mit temporär installiertem Playwright: Symptom direkt auf einem echten Periodentag gespeichert → Kalender zeigt weiterhin nur „bestätigte Periode"; Symptom am Tag nach dem Periodenende → zeigt korrekt „PMS von dir eingetragen"; laufende Periode mit Symptom am heutigen laufenden Periodentag → weder Zyklus-Kreis noch Heute-Karte noch Kalendertag zeigen PMS. Testkonten vollständig entfernt.

## Offene Punkte

- Owner-Prüfschritt steht weiterhin aus; erneute Soll-Ist-Prüfung durch Codex nach dieser Korrektur erforderlich.

## Nächster Schritt

Codex prüft die Korrektur gegen die gemeldete Lücke. Danach Owner-Abnahme.

## Technische Nachweise

- Betroffene Dateien: `src/lib/manual-pms.ts`, `src/components/NewCycleExample.tsx`, `src/lib/new-partner-calendar.ts`, `src/lib/new-partner-cycle-view.ts`, `src/components/NewPartnerCalendar.tsx`, `src/app/neu/partner/page.tsx`, `tests/manual-pms.test.ts`, `scripts/verify-manual-pms-symptom-ui.ts`, `scripts/verify-manual-pms-prediction-isolation.ts`, `docs/work-packages/WP-013-pms-symptome-manuell-markieren.md`.
- Tests: `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts`, alle `scripts/verify-*`-Skripte, manuelle Live-Prüfung via Playwright (temporär).
- Commit oder Referenz: pending.
