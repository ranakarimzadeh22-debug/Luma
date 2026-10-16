---
id: WP-20261016-1200-claude-pms-marker-im-zyklus-kreis-korrektur-v3
date: 2026-10-16
time: 12:00
agent: Anthropic Claude
status: completed
screens: Zyklus | Partner
why_status: confirmed
why_source: Owner-Auftrag
commits: pending
---

# Manuellen PMS-Abschnitt als eigenes, sichtbar verlängertes Ringsegment darstellen (WP-014 Korrektur Version 3)

## Was wurde gemacht?

Bisher lag der rote Heute-Punkt bei manuellem PMS zwar schon richtig neben dem „PMS“-Text, aber innerhalb des alten, automatisch berechneten 5-Tage-PMS-Balkens. Trägt die Nutzerin PMS früher selbst ein, zeigt der pinke Balken im Zyklus-Kreis das jetzt auch: Er beginnt am selbst eingetragenen Starttag und reicht bis zum bereits bestehenden Ende des manuellen Abschnitts – nicht nur der Punkt verschiebt sich, sondern der ganze sichtbare PMS-Bereich. Betrifft gleichermaßen die eigene Ansicht auf `/neu` und die rein lesende Partneransicht auf `/neu/partner`.

## Warum?

Owner-Entscheidung vom 2026-10-16: Es genügte nicht, nur den Punkt in den bestehenden Balken zu verschieben – bei einem früher eingetragenen PMS-Start muss auch der Balken selbst früher beginnen.

## Prüfung und Stand

- `src/lib/cycle-ring-geometry.ts`: `buildPersonalRingGeometry` erhält jetzt ein optionales `ManualPmsRingOverride`-Objekt (`startDate`/`endDate`) statt eines einfachen Booleans. Ist es gesetzt, bestimmen diese Daten die PMS-Segmentgrenzen statt der rechnerischen Schätzung. Periode- und Fruchtbarkeitssegment bleiben unberührt. Der Marker-Platzierungsalgorithmus wurde robuster gemacht, damit er auch bei einem nur eintägigen manuellen Abschnitt innerhalb des (dann sehr schmalen) Segments bleibt.
- `src/components/CyclePersonalRing.tsx`, `NewCycleExample.tsx`, `NewPartnerCycleRing.tsx`, `src/app/neu/partner/page.tsx`: reichen nur die bereits vorhandenen `manual-pms.ts`-Datumswerte weiter, keine neue Logik oder Datenquelle.
- `scripts/verify-manual-pms-ring-marker.ts` vollständig überarbeitet (24 Prüfungen): unveränderter Fall ohne manuellen Abschnitt, mehrtägiger manueller Abschnitt verlängert das Segment sichtbar, eintägiger Grenzfall bleibt lesbar, echter Periodentag hat weiterhin Vorrang. Alle bestanden.
- Live-Prüfung mit temporär installiertem Playwright: Der gezeichnete PMS-Pfad verändert sich sichtbar und identisch in Eigenansicht breit/mobil und Partneransicht, sobald ein früherer manueller Start markiert wird; Marker-Label-Abstand konstant 26,1px, kein horizontaler Überlauf, Partneransicht weiterhin ohne Eingabemöglichkeit. Testkonten, Playwright und temporäre Skripte vollständig entfernt.
- `npx tsc --noEmit`, `npm run build`: fehlerfrei/erfolgreich. Alle bestehenden PMS-, Ring-, Kalender-, Perioden- und Partnerregressionen (inkl. `verify-home-screen-layout.ts`, zwei Assertions angepasst) erneut grün. `node --experimental-strip-types --test tests/*.test.ts`: 83/84, bekannter vorbestehender Defekt.

## Offene Punkte

- Owner-Prüfschritt steht aus (siehe WP-014, Abschnitt „Ist – Korrektur Version 3“).

## Nächster Schritt

Owner prüft `/neu` und `/neu/partner` wie im Prüfschritt beschrieben. Danach erneute Soll-Ist-Prüfung durch Codex.

## Technische Nachweise

- Betroffene Dateien: `src/lib/cycle-ring-geometry.ts`, `src/components/CyclePersonalRing.tsx`, `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCycleRing.tsx`, `src/app/neu/partner/page.tsx`, `scripts/verify-manual-pms-ring-marker.ts`, `scripts/verify-home-screen-layout.ts`, `docs/work-packages/WP-014-pms-marker-im-zyklus-kreis.md`, `docs/work-packages/STATE.json`.
- Tests: `npx tsc --noEmit`, `npm run build`, `node --experimental-strip-types --test tests/*.test.ts`, alle `scripts/verify-*`-Regressionen für PMS/Ring/Kalender/Perioden/Partner, manuelle Live-Prüfung via Playwright (temporär).
- Commit oder Referenz: folgt.
