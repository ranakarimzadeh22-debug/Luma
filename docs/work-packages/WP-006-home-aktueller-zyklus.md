---
id: WP-006
title: "Home-Screen: aktueller Zyklus auf einen Blick"
package_revision: 1
status: review
created: 2026-09-30
updated: 2026-10-01
owner_approved: yes
executor: claude
product_area: "Neue Luma - Home-Screen /neu"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Aktuelle Zyklus-Information klar ueber dem Zykluskreis zeigen

## Owner-Ansicht – einfach erklärt

- Kurz gesagt: Ganz oben auf dem Home-Screen steht eine kleine Karte mit der wichtigsten Information fuer heute.
- Beispiele: Heute: 3. Periodentag. Heute: PMS-Phase. Heute: moegliche Ovulationsphase.
- Danach folgen unveraendert der Zykluskreis und direkt darunter der Kalender.
- Wenn Luma noch keine ausreichenden Daten hat, zeigt die Karte nur eine neutrale Erklaerung und erfindet keine Phase.
- Eine Schaetzung ist immer klar mit Kann abweichen gekennzeichnet.

## Entstehungsweg

Home-Screen zeigt Zykluskreis und Kalender, aber die wichtigste heutige Einordnung ist nicht zuerst als kurzer Text sichtbar. Die Nutzerin soll ihren aktuellen Stand ohne Deutung des Kreises verstehen. Deshalb kommt eine kompakte Heute-Karte vor den bestehenden Zyklus-Kreis.

- bestaetigtes Problem: Der aktuelle Zyklusstand ist auf dem Home-Screen nicht sofort als einfacher Satz sichtbar.
- gewuenschte Wirkung: Die Nutzerin versteht beim Oeffnen direkt, wo sie im Zyklus steht.
- gewaehlte Loesung: Eine rein informative Heute-Karte oberhalb des vorhandenen Zyklus-Kreises.
- bestaetigte Grenzen: Keine neue medizinische Bewertung und keine neue Datenfreigabe.

## Soll – von Codex

- Auf /neu steht vor dem Bereich Dein Zyklus eine kleine, gut lesbare Heute-Karte.
- Bei einer tatsaechlichen laufenden Periode zeigt sie Heute: N. Periodentag, wenn der bestehende Zyklus-View den Tag sicher liefert.
- In der PMS-Phase zeigt sie Heute: PMS-Phase.
- In der moeglichen Ovulationsphase zeigt sie Heute: moegliche Ovulationsphase.
- In einer sonstigen berechenbaren Phase zeigt sie mindestens Heute: Zyklustag N.
- Beruht die Einordnung auf einer Schaetzung, erscheint zusaetzlich klar Kann abweichen.
- Ohne persoenliche Daten zeigt sie eine neutrale Hilfe. Es darf keine Phase, Zyklustag oder medizinische Aussage erfunden werden.
- Der Zyklus-Kreis bleibt direkt unter der Karte; der Kalender bleibt direkt darunter. Bestehende Eingaben, Tagesfenster, Historie und Einstellungen bleiben unveraendert.

## Nicht enthalten

- Keine Aenderung der Zyklusberechnung, der Periodendaten, der Kalenderlogik oder der Ring-Geometrie.
- Keine neue Partneransicht, Partnerfreigabe, Profilbild-, Notiz-, Push- oder E-Mail-Funktion.
- Keine Migration und keine Aenderung an alter Luma.

## Abnahmekriterien

1. Die Heute-Karte steht auf mobilen und breiten Ansichten oberhalb des Zyklus-Kreises.
2. Tatsaechliche laufende Periode, PMS, moegliche Ovulation, sonstiger Zyklustag und keine Daten werden klar getrennt dargestellt.
3. Schaetzungen tragen sichtbar Kann abweichen.
4. Ohne Daten werden keine Zyklusphase, keine Tageszahl und keine medizinische Aussage angezeigt.
5. Zykluskreis, Kalender, Tagesfenster und bestehende Periodenbearbeitung funktionieren unveraendert weiter.
6. Kein horizontaler Ueberlauf auf einem mobilen Bildschirm.

## Technischer Auftrag für Claude

### Bestaetigte Ausgangslage im Code

- src/app/neu/page.tsx laedt die Daten fuer /neu und rendert NewCycleExample.
- src/components/NewCycleExample.tsx rendert derzeit den Bereich Dein Zyklus mit CyclePersonalRing; direkt danach folgt der Kalender.
- src/lib/personal-cycle-view.ts liefert PersonalCycleView mit status, todayPhase, todayCycleDay, isEstimate, periodLengthDays und isRunning.
- Die vorhandene Zyklusberechnung und die Berlin-Tagesgrundlage werden bereits vom Home-Screen verwendet und sind wiederzuverwenden.

### Technisches Ziel

- Ergaenze in NewCycleExample oder in einer kleinen reinen Praesentationskomponente eine Heute-Karte unmittelbar vor dem bestehenden Zyklus-Kreis.
- Leite Text und Kennzeichnung ausschliesslich aus dem bereits gelieferten personalCycleView ab. Keine zweite Zyklus-, Datums- oder Phasenberechnung.
- Nutze klare deutsche Texte: period mit bekanntem Zyklustag: Heute: N. Periodentag; pms: Heute: PMS-Phase; ovulation: Heute: moegliche Ovulationsphase; sonstiger berechenbarer Tag: Heute: Zyklustag N; no_data: neutrale Orientierung ohne erfundene Daten.
- Ergaenze bei personalCycleView.isEstimate einen sichtbaren Hinweis Kann abweichen.
- Die Karte ist rein informativ: keine neue Schaltflaeche, Speicherung, API-Route oder Zustandsaenderung.
- Behalte die bestehende Reihenfolge danach bei: Zyklus-Kreis vor Kalender.

### Daten, Schnittstellen und Migrationen

- Migration noetig: nein.
- Keine neue API-Route und keine gespeicherten Daten.
- Wiederverwendung des bereits serverseitig gelieferten personalCycleView; keine zusaetzlichen Gesundheitsdaten an den Client geben.

### Invarianten

- Keine medizinische Diagnose oder Sicherheit suggerieren; moegliche Ovulation und Schaetzungen bleiben vorsichtig formuliert.
- Ohne Daten bleibt die Anzeige neutral.
- Alte Luma, Partneransicht, Authentifizierung, Kalender, Perioden-CRUD, Historie und die bestehende Zykluslogik bleiben unveraendert.
- Die bestehende persoenliche Ansicht und ihre Datenprioritaet bleiben massgeblich.

### Pflichtpruefungen

- Pruefe jeden Anzeigezustand: no_data, laufende Periode, PMS, moegliche Ovulation, sonstiger Zyklustag und Schaetzung.
- Pruefe, dass Text und Kreis dieselbe vorhandene personalCycleView verwenden und nicht unterschiedliche Tageswerte anzeigen.
- Pruefe, dass keine Karte Daten zeigt, wenn der bestehende View no_data liefert.
- Fuehre bestehende Zyklus-Kreis- und Periodenregressionen, TypeScript, Produktions-Build und eine mobile Sichtpruefung aus.
- Pruefe mobil und auf normaler Breite: Karte oben, Kreis darunter, Kalender danach, kein horizontaler Ueberlauf.

### Stoppbedingungen

- Stoppe vor einer neuen medizinischen Berechnung, einer Datenmigration, einer Partner- oder alten-Luma-Aenderung.
- Stoppe, wenn der vorhandene Zyklus-View den passenden Zustand nicht sicher bereitstellt; dann keine neue Berechnung ergaenzen, sondern den Befund dokumentieren.

### Abschluss durch Claude

- Ergaenze Ist, Tests, Abweichungen und offene Punkte in diesem Paket.
- Setze den Paketstatus nach Abschluss auf review.
- Ergaenze den Entwicklungsledger, fuehre node scripts/work-package-state.mjs mark-updated WP-006 und danach node scripts/work-package-state.mjs validate aus.
- Committe und pushe ausschliesslich auftragsbezogene Dateien. Kein manuelles Deployment.

## Ist – von Claude

- **umgesetzt:**
  - Neue reine Funktion `deriveTodayCardText(view: PersonalCycleView)` in `src/lib/personal-cycle-view.ts`: leitet Überschrift und eine optionale „Kann abweichen“-Kennzeichnung ausschließlich aus dem bereits vorhandenen `PersonalCycleView` ab (`todayPhase`, `todayCycleDay`, `isRunning`, `isEstimate`). Keine zweite Datums-, Zyklus- oder Phasenberechnung; keine Fallback-Logik, die eine Phase, einen Zyklustag oder eine medizinische Aussage erfindet.
  - Reihenfolge der Textableitung: (1) tatsächlich laufende Periode mit sicherem Zyklustag → `Heute: N. Periodentag`; (2) `todayPhase === "pms"` → `Heute: PMS-Phase`; (3) `todayPhase === "ovulation"` → `Heute: mögliche Ovulationsphase`; (4) sonstiger Tag mit bekanntem `todayCycleDay` → `Heute: Zyklustag N`; (5) sonst (inklusive `status: "no_data"` und dem Grenzfall einer laufenden, aber noch nicht median-fähigen Periode ohne sicheren Zyklustag) → neutraler Satz `Noch keine ausreichenden Daten für eine persönliche Einordnung.`, ohne „Kann abweichen“. Da `computePersonalCycleView` `todayPhase` bei `confirmedToday`/`isRunning` immer auf `"period"` setzt, können die PMS-/Ovulation-Zweige nie gleichzeitig mit einer laufenden Periode greifen – kein Konfliktfall möglich.
  - `src/components/NewCycleExample.tsx`: neue rein lesende Präsentationskomponente `TodayCard` (keine Schaltfläche, keine Speicherung, kein API-Aufruf), direkt vor dem bestehenden `Dein Zyklus`-Bereich mit `CyclePersonalRing` eingebunden. Erhält exakt dieselbe `personalCycleView`-Instanz wie der Ring, damit Text und Kreis nie unterschiedliche Tageswerte zeigen können.
  - Zyklus-Kreis bleibt unverändert direkt unter der Karte, Kalender bleibt unverändert direkt darunter; an `CyclePersonalRing`, der Ring-Geometrie, der Kalenderlogik, der Zyklusberechnung, den Tagesfenstern, der Partneransicht oder der alten Luma wurde nichts geändert.
  - Keine neue API-Route, keine Migration, keine zusätzlichen Gesundheitsdaten an den Client.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - Neues `scripts/verify-today-card.ts` (gezielt, über die echte `computePersonalCycleView`, damit Testaufbau und produktive Berechnung übereinstimmen): deckt alle fünf geforderten Zustände ab – `no_data` ohne erfundene Daten; tatsächlich laufende Periode mit sicherem Zyklustag (`Heute: N. Periodentag`, derselbe Tageswert wie `view.todayCycleDay`); laufende Periode **ohne** sicheren Zyklustag (bleibt neutral, keine erfundene Tageszahl – explizite Stoppbedingungsprüfung); PMS-Phase; mögliche Ovulationsphase; sonstiger berechenbarer Tag (`Heute: Zyklustag N`); Schätzung (`profile_estimate`) zeigt sichtbar „Kann abweichen“; eine tatsächlich bestätigte, nicht geschätzte Einordnung zeigt kein „Kann abweichen“. Zusätzliche Quelltext-Prüfungen bestätigen: keine eigene Datums-/Netzwerklogik in `deriveTodayCardText`, die Karte erhält im Code dieselbe `personalCycleView`-Instanz wie `CyclePersonalRing`, und die Karte steht im Quelltext vor dem Ring. Alle Prüfungen bestanden.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, Routenliste unverändert (keine neue Route).
  - Bestehende Regressionen erneut ausgeführt: `scripts/verify-day-detail.ts`, `scripts/verify-period-history.ts`, `scripts/verify-history-month-jump.ts`, `scripts/verify-my-periods.mts`, `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-partner-calendar.mts`, `scripts/verify-partner-estimated-period.mts` — alle grün.
  - `scripts/verify-personal-cycle-view.ts` zeigt weiterhin 9 Fehlschläge bei den Farbverlauf-Quelltextprüfungen – dieser Defekt ist **nicht** durch WP-006 verursacht: Er besteht bereits seit der Gradient-Auslagerung von `NewCycleExample.tsx` in `src/components/CyclePersonalRing.tsx` (WP-004 Version 6) und wurde bereits in WP-003 Version 8 dokumentiert. Per `git stash` gegen den unveränderten Stand vor dieser Version bestätigt: identische 9 Fehlschläge. Alle funktionalen Berechnungsprüfungen desselben Skripts (Median, Ringgeometrie, Markerposition, Phasenberechnung) bestehen weiterhin fehlerfrei.
  - Mobile Sichtprüfung mit Playwright (Chromium, temporär installiert und danach vollständig entfernt) gegen den lokalen Dev-Server mit einem echten Testkonto: mobil (375×812) zeigt im `no_data`-Zustand (Onboarding übersprungen, keine Perioden) ausschließlich den neutralen Satz ohne erfundene Phase/Zahl, Karte steht vor „Dein Zyklus“, kein horizontaler Überlauf. Nach dem Anlegen von drei abgeschlossenen Perioden (für einen persönlichen Median) und einer heute laufenden Periode zeigt die Karte korrekt `Heute: 1. Periodentag` – sowohl mobil (375×812) als auch in breiter Ansicht (1280×900), jeweils Karte → Kreis → Kalender, kein horizontaler Überlauf. Screenshots geprüft. Playwright und Testkonto danach vollständig entfernt.
- **Abweichungen:** keine fachliche Abweichung.
  - Der bereits bekannte, vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) sowie der vorbestehende Gradient-Fundstellen-Defekt in `scripts/verify-personal-cycle-view.ts` bestehen unverändert fort und waren für diese Version nicht im Umfang.
- **offene Punkte:**
  - Owner-Prüfschritt steht aus: `/neu` öffnen und prüfen, dass die Heute-Karte oberhalb des Zyklus-Kreises steht; mindestens einen Zustand mit tatsächlichen Daten (laufende Periode oder sonstiger Zyklustag) sowie den `no_data`-Zustand ohne Daten ansehen; mobil auf fehlenden horizontalen Überlauf prüfen.
  - Die beiden oben genannten, vorbestehenden Testdefekte sollten weiterhin in eigenen, dafür vorgesehenen Paketen behoben werden.
  - Kein Deploy ausgelöst – wie beauftragt.
- **Commit:** folgt unmittelbar nach diesem Eintrag.

## Soll-Ist-Prüfung – von Codex

- Planung ist vollständig und für Claude freigegeben.
- Umsetzung und Owner-Prüfung stehen noch aus.
