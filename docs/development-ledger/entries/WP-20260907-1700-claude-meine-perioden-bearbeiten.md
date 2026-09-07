---
id: WP-20260907-1700-claude-meine-perioden-bearbeiten
date: 2026-09-07
time: 17:00
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-003
commits: pending
---

# Gespeicherte Perioden sicher bearbeiten

## Was wurde gemacht?

„Meine Periode aktualisieren“ öffnet jetzt zuerst eine ruhige Liste „Meine Perioden“ mit allen gespeicherten Zeiträumen und je einem „Ändern“-Button. Von dort lässt sich entweder ein bestehender Zeitraum korrigieren (Formular startet vorbelegt mit den vorhandenen Daten) oder über „Neue Periode eintragen“ ein neuer Zeitraum ergänzen. Jede Änderung wird erst nach einer sichtbaren Prüfung gespeichert. Der Home-Kalender bleibt unverändert reine Orientierung.

## Warum?

Owner-Auftrag WP-003: Ein Beginn oder Ende kann versehentlich falsch eingetragen worden sein und musste bisher sicher korrigierbar gemacht werden, ohne den Kalender oder andere Perioden zu beeinflussen.

## Prüfung und Stand

Neues `scripts/verify-my-periods.mts` gegen die echte lokale Datenbank: 15/15 Prüfungen bestanden (Bearbeiten ändert nur den gewählten Eintrag, Überschneidung abgelehnt, Kontotrennung wirksam, fremde/nicht vorhandene ID abgelehnt, ungültige Reihenfolge/Zukunft abgelehnt). `scripts/verify-luma-core.mjs` erneut grün. `npm run build` erfolgreich. Mobile Sichtprüfung mit Playwright bestätigt Liste, Ändern-Formular mit Vorbelegung, Zurück-Navigation und keinen horizontalen Overflow.

## Offene Punkte

- Owner-Prüfschritt steht aus.

## Nächster Schritt

„Meine Periode aktualisieren“ öffnen, eine gespeicherte Periode ändern, prüfen, speichern, Seite neu laden und die dauerhafte Änderung bestätigen.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `scripts/verify-my-periods.mts` (neu), `docs/work-packages/WP-003-meine-perioden-bearbeiten.md`
- Tests: `npx tsx scripts/verify-my-periods.mts` (15/15 bestanden), `node scripts/verify-luma-core.mjs` (bestanden), `npm run build` (bestanden), mobile Sichtprüfung mit Playwright-Screenshots
- Commit oder Referenz: pending
