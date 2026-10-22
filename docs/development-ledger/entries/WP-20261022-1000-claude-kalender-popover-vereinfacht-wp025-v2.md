---
id: WP-20261022-1000-claude-kalender-popover-vereinfacht-wp025-v2
date: 2026-10-22
time: 10:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Kalender-Info-Fenster vereinfacht (WP-025, Version 2)

## Was wurde gemacht?

Das ⓘ-Fenster im Kalender zeigt nur noch vier Zeilen. Unter „Eingetragen“ stehen „Periode (tatsächlich)“ und „PMS von dir eingetragen“. Unter „Geschätzt“ stehen „Nächste Periode“ und „PMS-Phase“, beide mit „Kann abweichen“. „Gespeicherte Planung“, „Voraussichtliches Ende“, „Eisprung“ und „Mögliches fruchtbares Zeitfenster“ sind ganz entfernt, ohne leere Überschrift. Das gilt für die Nutzerin und für den Partner. Der Kalender selbst, die Daten und die Partnerrechte sind unverändert.

## Warum?

Der Owner wollte im Info-Fenster nur noch die für den täglichen Überblick nötigen Zeilen sehen.

## Prüfung und Stand

Die Prüfskripte für Popover und Kalender wurden angepasst und prüfen, dass die vier entfernten Begriffe nirgends mehr vorkommen. TypeScript, ESLint für den Partnerkalender und Build bestehen. Sichtprüfung mit Testkonten bei 360, 390 und 1280 px für Nutzerin und Partner: nur die vier Zeilen, Fenster öffnet und schließt, kein Überlauf. Eine TodayCard-Prüfung im Partner-Legendenskript war schon vorher fehlerhaft und ist unverändert. Nicht deployed.

## Offene Punkte

- Keine.

## Nächster Schritt

Keiner – Arbeitspaket abgeschlossen.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCalendar.tsx`, vier angepasste Prüfskripte
- Tests: siehe oben
- Commit oder Referenz: pending
