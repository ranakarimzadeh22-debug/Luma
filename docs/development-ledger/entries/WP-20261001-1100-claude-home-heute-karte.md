---
id: WP-20261001-1100-claude-home-heute-karte
date: 2026-10-01
time: 11:00
agent: Anthropic Claude
status: completed
screens: Startseite | App-weit und Technik
why_status: confirmed
why_source: Owner-Auftrag WP-006
commits: pending
---

# Heute-Karte zeigt den aktuellen Zyklusstand über dem Zyklus-Kreis

## Was wurde gemacht?

Ganz oben auf dem Home-Screen steht jetzt eine kleine, gut lesbare Karte mit der wichtigsten Information für heute: zum Beispiel „Heute: 3. Periodentag“, „Heute: PMS-Phase“, „Heute: mögliche Ovulationsphase“ oder „Heute: Zyklustag N“. Beruht die Angabe auf einer Schätzung, steht zusätzlich sichtbar „Kann abweichen“. Ohne ausreichende Daten zeigt die Karte nur eine neutrale Erklärung und erfindet keine Phase oder Zahl. Der Zyklus-Kreis und der Kalender folgen unverändert direkt darunter.

## Warum?

Owner-Auftrag WP-006: Die wichtigste heutige Einordnung war bisher nicht als kurzer Text sofort sichtbar; die Nutzerin sollte ihren aktuellen Stand ohne Deutung des Kreises verstehen.

## Prüfung und Stand

Eine neue reine Funktion leitet den Kartentext ausschließlich aus dem bereits vorhandenen, serverseitig berechneten Zyklus-View ab – keine zweite Berechnung, keine erfundenen Daten. Ein neues gezieltes Prüfskript deckt alle fünf geforderten Zustände ab (laufende Periode, PMS, mögliche Ovulation, sonstiger Zyklustag, keine Daten) sowie den Grenzfall einer laufenden Periode ohne sicher berechenbaren Tag, der bewusst neutral bleibt statt eine Zahl zu erfinden. Bestehende Regressionen für Zyklus-Kreis, Perioden und Partneransicht sind weiterhin grün; `npx tsc --noEmit` und `npm run build` fehlerfrei. Mobile Sichtprüfung mit temporär installiertem Playwright bestätigt die Karte oberhalb des Kreises in mobiler und breiter Ansicht ohne horizontalen Überlauf, für den Zustand ohne Daten und für eine echte laufende Periode.

Ein bereits bekannter, vorbestehender Testdefekt in einem anderen Prüfskript (Farbverlauf-Fundstelle seit einer früheren Komponentenauslagerung) besteht unverändert fort und wurde durch diese Version nicht verursacht – per Vergleich mit dem unveränderten Stand bestätigt.

## Offene Punkte

- Owner-Prüfschritt steht aus: Home-Screen öffnen und die Heute-Karte oberhalb des Zyklus-Kreises in mindestens einem Datenzustand und im Zustand ohne Daten ansehen, mobil auf fehlenden horizontalen Überlauf prüfen.
- Die bereits bekannten, vorbestehenden Testdefekte in zwei anderen Prüfskripten sollten weiterhin in eigenen Paketen behoben werden.
- Kein Deploy ausgelöst – wie beauftragt.

## Nächster Schritt

Owner testet die neue Heute-Karte auf dem Home-Screen im Browser.

## Technische Nachweise

- Betroffene Dateien: `src/lib/personal-cycle-view.ts`, `src/components/NewCycleExample.tsx`, `scripts/verify-today-card.ts` (neu).
- Tests: `npx tsx scripts/verify-today-card.ts`, `npx tsx scripts/verify-day-detail.ts`, `npx tsx scripts/verify-period-history.ts`, `npx tsx scripts/verify-history-month-jump.ts`, `npx tsx scripts/verify-my-periods.mts`, `npx tsx scripts/verify-partner-cycle-ring.mts`, `npx tsx scripts/verify-partner-calendar.mts`, `npx tsx scripts/verify-partner-estimated-period.mts`, `npx tsc --noEmit`, `npm run build`, temporäre Playwright-Sichtprüfung (installiert und vollständig entfernt) gegen echten lokalen Dev-Server mit einem Testkonto, mobil und breit.
- Commit oder Referenz: pending
