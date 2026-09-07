---
id: WP-20260907-1300-claude-zyklus-kreis-roter-marker
date: 2026-09-07
time: 13:00
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-002 Version 4
commits: pending
---

# Heute-Marker im Zyklus-Kreis als kleiner roter Punkt

## Was wurde gemacht?

Der Heute-Marker im persönlichen Zyklus-Kreis auf `/neu` ist jetzt ein kleiner roter Punkt mit weißem Rand statt der bisherigen drei verschachtelten weiß/dunkelroten Kreise. Position und die zugrunde liegende Phasenregel sind unverändert.

## Warum?

Owner-Nachschärfung WP-002 Version 4: Der dynamische Heute-Marker sollte als kleiner roter Punkt festgelegt werden.

## Prüfung und Stand

`npm run build` (Next.js 16, Turbopack) erneut erfolgreich, TypeScript-Prüfung ohne Fehler, alle 28 Routen erzeugt. Mobile Sichtprüfung im echten Browser wurde nicht durchgeführt.

## Offene Punkte

- Owner-Prüfschritt (roter Punkt gut sichtbar bei Periode, möglicher Eisprungphase und möglicher PMS-Phase) steht aus.

## Nächster Schritt

Auf `/neu` mit persönlicher Zyklusansicht prüfen, ob der rote Punkt bei allen drei Phasenfarben (Periode, Eisprung, PMS) gut sichtbar bleibt.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `docs/work-packages/WP-002-persoenlicher-zyklus-kreis.md`
- Tests: `npm run build` bestanden
- Commit oder Referenz: pending
