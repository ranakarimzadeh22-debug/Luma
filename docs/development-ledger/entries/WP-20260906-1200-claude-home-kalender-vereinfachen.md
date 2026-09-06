---
id: WP-20260906-1200-claude-home-kalender-vereinfachen
date: 2026-09-06
time: 12:00
agent: Anthropic Claude
status: completed
screens: Heute | Kalender | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-001
commits: pending
---

# Home-Kalender vereinfacht, ein Eingabeweg geschaffen

## Was wurde gemacht?

Auf dem Home-Screen `/neu` löst ein Antippen von Kalendertagen keine Aktion mehr aus – Kreis und Kalender dienen nur noch der Orientierung. Die Bereiche „Periode eintragen oder planen“, „Vergangene Perioden nachtragen“ und „Gespeicherte Perioden“ sind vom Home-Screen verschwunden. Stattdessen gibt es genau einen Einstieg „Meine Periode aktualisieren“, der ein Fenster mit dem geführten Weg Beginn wählen → Ende wählen → prüfen → ausdrücklich speichern öffnet. Der Startweg nach Registrierung fragt jetzt nur noch die eine letzte Periode ab statt bis zu sechs.

## Warum?

Owner-Auftrag WP-001: Der Home-Screen bot mehrere Wege für dieselbe Aufgabe an und war dadurch verwirrend.

## Prüfung und Stand

`npm run build` (Next.js 16, Turbopack) erfolgreich, TypeScript-Prüfung ohne Fehler, alle 28 Routen erzeugt. Keine automatisierten Auth-/Perioden-/Kalendertests im Repo gefunden, die anzupassen wären. Mobile Sichtprüfung im echten Browser wurde nicht durchgeführt (keine Browser-Automatisierung in dieser Umgebung verfügbar); übernommene Layoutklassen stammen unverändert aus der bisherigen, bereits mobil geprüften Struktur.

## Offene Punkte

- Owner-Prüfschritt (Kalendertag antippen, dann „Meine Periode aktualisieren“ öffnen) steht aus.
- `src/app/neu/perioden-nachtragen/page.tsx` ist nicht mehr verlinkt, aber technisch noch erreichbar; Löschung war nicht ausdrücklich gefordert.

## Nächster Schritt

Auf `/neu` einen Kalendertag antippen (keine Wirkung erwartet) und danach „Meine Periode aktualisieren“ öffnen und einmal durchklicken.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `src/components/NewPeriodHistoryOnboarding.tsx`, `src/lib/calendar-day-info.ts`, `docs/work-packages/WP-001-home-kalender-vereinfachen.md`
- Tests: `npm run build` bestanden (Compile, TypeScript, 28 Routen)
- Commit oder Referenz: pending
