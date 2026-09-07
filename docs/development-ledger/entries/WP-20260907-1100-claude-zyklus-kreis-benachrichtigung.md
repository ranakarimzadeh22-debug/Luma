---
id: WP-20260907-1100-claude-zyklus-kreis-benachrichtigung
date: 2026-09-07
time: 11:00
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-002 Version 2
commits: pending
---

# Schließbare Benachrichtigung statt Dauertext bei fehlenden Zyklusdaten

## Was wurde gemacht?

Wenn auf `/neu` noch keine ausreichenden Zyklusdaten vorliegen, stand bisher dauerhaft ein Hinweistext unter dem Kreis. Er ist jetzt entfernt. Stattdessen erscheint eine kurze Benachrichtigung am unteren Bildschirmrand mit demselben Text, einem sichtbaren Schließen-Button und automatischem Verschwinden nach sechs Sekunden. Sie zeigt sich einmal pro Besuch des Home-Screens.

## Warum?

Owner-Nachschärfung WP-002 Version 2: Der Hinweis sollte kein dauerhafter Textbereich unter dem Kreis sein.

## Prüfung und Stand

`npm run build` (Next.js 16, Turbopack) erneut erfolgreich, TypeScript-Prüfung ohne Fehler, alle 28 Routen erzeugt. Mobile Sichtprüfung im echten Browser wurde nicht durchgeführt.

## Offene Punkte

- Owner-Prüfschritt für die Benachrichtigung (Text, Schließen-Button, automatisches Verschwinden nach sechs Sekunden, kein erneutes Erscheinen im selben Besuch) steht aus.

## Nächster Schritt

Auf `/neu` ohne gespeicherte Zyklusdaten aufrufen und prüfen: Benachrichtigung erscheint einmal, lässt sich schließen und verschwindet spätestens nach sechs Sekunden von selbst.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `docs/work-packages/WP-002-persoenlicher-zyklus-kreis.md`
- Tests: `npm run build` bestanden
- Commit oder Referenz: pending
