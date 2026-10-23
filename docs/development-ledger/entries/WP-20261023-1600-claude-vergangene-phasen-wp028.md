---
id: WP-20261023-1600-claude-vergangene-phasen-wp028
date: 2026-10-23
time: 16:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Vergangene PMS- und Eisprungphasen im Kalender (WP-028)

## Was wurde gemacht?

Öffnet man einen vergangenen Monat, bleiben die selbst eingetragenen PMS-Tage als kräftig rosa Band sichtbar. Ein rückblickend berechneter möglicher Eisprung erscheint dort als violettes Band im vorhandenen Stil. Das gilt für den eigenen Kalender und für den Kalender des verbundenen Partners, der es nur lesen kann. Echte Periodentage haben immer Vorrang. Ein Eisprungband gibt es nur, wenn danach wirklich eine Periode eingetragen ist. Vorhersagen für die Zukunft, der Zyklus-Kreis, Datenbank, API und Partnerrechte sind unverändert.

## Warum?

Frühere Zyklen sollen nachvollziehbar sein, statt nur die aktuelle und kommende Phase zu zeigen. Das steht im freigegebenen Arbeitspaket WP-028.

## Prüfung und Stand

Elf neue Unit-Tests und ein neues Prüfskript bestehen (Vorrang der Periode, mehrere Zyklen, kein Eisprung ohne folgende Periode, Owner und Partner identisch, Partner-Gate). Die bestehenden Kalender-, PMS-, Partner- und Datenbank-Prüfungen bestehen; TypeScript und Build bestehen. Sichtprüfung mit Testkonten bei 390 und 1280 px über mehrere vergangene Monate: PMS und Eisprung an den erwarteten Tagen, Partner gleich, ein Symptomtag auf einer echten Periode bleibt Periode, kein Überlauf. Nicht deployed.

## Offene Punkte

- Die bestehende Vorhersage zeigt im aktuellen Zyklus weiter einen schon vergangenen Eisprungtag. Das ist altes Verhalten und nicht Teil der neuen historischen Phasen.

## Nächster Schritt

Owner prüft einen vergangenen Monat in `/neu` und `/neu/partner` nach dem nächsten Deployment.

## Technische Nachweise

- Betroffene Dateien: `src/lib/historical-calendar-phases.ts` (neu), `src/components/NewCycleExample.tsx`, `src/lib/new-partner-calendar.ts`, `src/app/neu/partner/page.tsx`, `src/components/NewPartnerCalendar.tsx`, `tests/historical-calendar-phases.test.ts` (neu), `scripts/verify-historical-phases-wp028.ts` (neu)
- Tests: siehe oben
- Commit oder Referenz: pending
