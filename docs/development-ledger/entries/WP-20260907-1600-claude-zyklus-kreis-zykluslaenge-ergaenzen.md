---
id: WP-20260907-1600-claude-zyklus-kreis-zykluslaenge-ergaenzen
date: 2026-09-07
time: 16:00
agent: Anthropic Claude
status: completed
screens: Heute | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-002 Version 6
commits: pending
---

# Zykluslänge direkt aus dem neutralen Kreis ergänzbar

## Was wurde gemacht?

Wer bereits eine echte Periode gespeichert, aber noch keine Zykluslänge angegeben hat, sieht jetzt direkt unter dem neutralen Kreis den Einstieg „Zykluslänge ergänzen“. Er öffnet einen kurzen Dialog mit nur einem Zahlenfeld und „Ich weiß es nicht“ – nicht den vollständigen Vier-Fragen-Assistenten. Nach dem Speichern zeigt der Kreis sofort die erste Orientierung mit „Kann abweichen“.

## Warum?

Owner-Nachschärfung WP-002 Version 6: Nach einer einzigen tatsächlichen Periode sollte die freiwillige ungefähre Zykluslänge direkt vom neutralen Kreis aus erreichbar sein, ohne Umweg über den langen Assistenten.

## Prüfung und Stand

`scripts/verify-personal-cycle-view.ts` um drei neue Prüfblöcke für Version 6 erweitert, Gesamtskript 45/45 bestanden. `npm run build` erfolgreich. Mobile Sichtprüfung mit Playwright bestätigt: Button erscheint nur bei genau der richtigen Bedingung, Modal ist kurz und fokussiert, nach Speichern erscheint „Kann abweichen“ und der Button verschwindet korrekt, kein horizontaler Overflow.

## Offene Punkte

- Owner-Prüfschritt für Version 6 steht aus.

## Nächster Schritt

Mit genau einer echten, gespeicherten Periode ohne Zykluslänge auf `/neu` prüfen: Button „Zykluslänge ergänzen“ sichtbar, Dialog öffnen, 28 Tage eintragen, „Kann abweichen“ im Kreis sehen.

## Technische Nachweise

- Betroffene Dateien: `src/components/NewCycleExample.tsx`, `src/app/neu/page.tsx`, `scripts/verify-personal-cycle-view.ts`, `docs/work-packages/WP-002-persoenlicher-zyklus-kreis.md`
- Tests: `npx tsx scripts/verify-personal-cycle-view.ts` (45/45 bestanden), `npm run build` (bestanden), mobile Sichtprüfung mit Playwright-Screenshots
- Commit oder Referenz: pending
