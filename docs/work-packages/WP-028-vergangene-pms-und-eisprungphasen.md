---
id: WP-028
title: "Vergangene PMS- und Eisprungphasen im Kalender zeigen"
status: review
created: 2026-10-23
updated: 2026-10-23
owner_approved: yes
executor: anthropic-claude
product_area: "Neue Luma – Owner- und Partnerkalender"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Vergangene PMS- und Eisprungphasen im Kalender zeigen

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Wenn du einen vergangenen Monat öffnest, bleiben deine selbst eingetragenen PMS-Tage sichtbar. Auch ein rückblickend berechneter Eisprung erscheint dort als violettes Phasenband im selben Kalenderstil.
- **Warum machen wir das?** Vergangene Zyklen sollen nachvollziehbar sein, statt nur die aktuelle und zukünftige Phase zu zeigen.
- **Wo ist es in der App?** Im Kalender auf `/neu` und in derselben rein lesenden Kalenderansicht auf `/neu/partner`.
- **Wichtig:** PMS-Einträge sind deine gespeicherten Angaben. Der Eisprung bleibt eine Schätzung und wird nie als medizinisch bestätigte Tatsache bezeichnet.
- **Was gehört nicht dazu?** Keine neue Eingabe, keine Änderung an Vorhersagen für die Zukunft, am Zyklus-Kreis, an Datenbank/API, am Partner-Gate oder an Partnerrechten.
- **Was prüfst du danach?** Einen vergangenen Monat öffnen: eingetragenes PMS ist kräftig rosa, ein rückblickend geschätzter Eisprung liegt als vorhandenes violettes Tagesband im Raster. Auf der Partneransicht erscheint dieselbe Darstellung.

## Entstehungsweg

`Owner möchte vergangene Zyklusverläufe sehen → PMS-Einträge liegen als echte Daten vor, aktuelle Prognose enthält nur zukünftige Zyklen → vergangene Abschnitte aus vorhandenen Perioden und PMS-Einträgen ableiten → gleiches Kalenderband in Owner- und Partneransicht → WP-028`

- Ausgangsproblem: Kalenderphasen sind bisher auf den offenen beziehungsweise zukünftigen Vorhersagebereich begrenzt; frühere gespeicherte PMS-Angaben gehen visuell verloren.
- bestätigte Wirkung: Frühere Monate zeigen den real eingetragenen PMS-Verlauf und eine klar als Schätzung zu verstehende Ovulationsmarkierung.
- gewählte Lösung: Historische PMS-Abschnitte ausschließlich aus gespeicherten Symptomtagen und realen Periodengrenzen ableiten; den rückblickenden möglichen Eisprung ausschließlich relativ zu einem folgenden tatsächlich gespeicherten Periodenbeginn bestimmen.
- wichtige Entscheidung: Das historische Ovulationsband nutzt den bereits bestehenden violetten Kalenderstil und die bestehende Bandgeometrie. Es erhält keine eigene medizinische Aussage oder neue Farbe.
- Quellen/Akten: APP-IDEA-032, WP-013, WP-025, WP-026.

## Soll – von Codex

- In vergangenen Monaten zeigt der Owner-Kalender alle gültigen, selbst gespeicherten PMS-Abschnitte als das bereits etablierte kräftig rosa, gefüllte Band.
- Ein historischer PMS-Abschnitt beginnt mit dem ersten Symptomtag nach einer realen Periode und endet spätestens am Tag vor der nächsten real gespeicherten Periode. Ein echter Periodentag gewinnt immer und wird nie als PMS dargestellt.
- Für einen vergangenen Zyklus mit einem folgenden real gespeicherten Periodenbeginn zeigt der Kalender den möglichen Eisprung am bereits verwendeten, zyklusfachlich bestehenden Abstand vor diesem Beginn. Die Darstellung nutzt das bestehende violette Eisprung-Tagesband, nicht einen Punkt oder ein neues visuelles System.
- Es werden keine historischen Phasen aus einer reinen Zukunftsprognose erfunden. Fehlt eine ausreichende reale Periodengrenze, erscheint für diesen vergangenen Abschnitt kein Eisprungband.
- Der bestehende aktuelle manuelle PMS-Abschnitt, seine Begrenzung durch die Zukunftsprognose und seine Wirkung auf den Zyklus-Kreis bleiben unverändert.
- Owner- und Partnerkalender erhalten für dieselben Daten dieselben historischen Bänder. Die Partneransicht bleibt strikt rein lesend und nur bei aktiver Verbindung erreichbar.
- Die bestehende Erklärung über `ⓘ` bleibt inhaltlich kurz. Falls der bestehende Eisprungtext angezeigt wird, bleibt er eindeutig als Schätzung („kann abweichen“) formuliert; keine neue Legendenzeile ist erforderlich.

### Abnahmekriterien

1. Ein vergangener, gültiger Symptomtag erzeugt im betreffenden Monat ein kräftig rosa PMS-Band; ein echter Periodentag überdeckt dieses Band immer.
2. Bei zwei real gespeicherten aufeinanderfolgenden Perioden erscheint im dazwischenliegenden vergangenen Zyklus der mögliche Eisprung als bestehendes violettes Tagesband.
3. Ohne folgenden realen Periodenbeginn gibt es kein rückblickendes Eisprungband allein aufgrund einer Zukunftsprognose.
4. Der aktuelle und zukünftige Kalender sowie der Zyklus-Kreis verhalten sich vor und nach der Änderung gleich.
5. Partner sieht bei aktiver Verbindung dieselben historischen Bänder; ohne aktive Verbindung werden weiterhin keinerlei Ownerdaten geladen oder gezeigt.
6. Kalender bleibt mobil und breit ohne Überlauf, Tagesfenster und Monatswechsel funktionieren weiterhin.

## Technischer Auftrag für Claude

### Bestätigte Ausgangslage

- `src/lib/new-cycle-prediction.ts` erzeugt in `predictCycle()` ausschließlich `futureCycles`; `phasesForDate()` und `primaryCalendarPhase()` lesen darum bislang keine vergangenen Prognosephasen.
- `src/lib/manual-pms.ts` leitet mit `deriveManualPmsSection()` bewusst nur den aktuellen offenen PMS-Abschnitt ab. Die gespeicherten `PmsSymptomDay`-Einträge und realen Periodengrenzen liegen aber bereits als Inputs vor.
- `src/components/NewCycleExample.tsx` leitet `periods`, `pmsSymptomDays`, `prediction` und `manualPmsSection` zentral für den Ownerkalender ab. `src/lib/new-partner-calendar.ts` lädt die minimal erlaubten Ownerdaten und gibt eine abgeleitete, datensparsame Partneransicht an `src/components/NewPartnerCalendar.tsx` weiter.
- Beide Kalender verwenden bereits `primaryCalendarPhase()` sowie dieselbe Farbquelle `src/lib/calendar-phase-colors.ts`; `calendar-band-position.ts` bestimmt nur die Bandform, nicht die Phasenlogik.

### Technisches Ziel

- Ergänze eine reine, testbare Ableitung für historische Kalenderphasen. Sie darf weder `predictCycle()` noch bestehende zukünftige Vorhersagen verändern.
- Leite historische PMS-Abschnitte aus den bereits gespeicherten Symptomtagen und den realen Periodengrenzen ab. Bewahre die bestehende `deriveManualPmsSection()`-Semantik für den aktuellen Abschnitt unverändert; eine neue Hilfsfunktion oder eine klar getrennte Erweiterung darf nur die historische Kalenderdarstellung liefern.
- Leite den historischen möglichen Eisprung pro vergangenen Zyklus nur aus einer realen folgenden Periodengrenze ab. Verwende dafür die bereits vorhandene, zentrale Eisprungdatumslogik aus `cycle-fertility.ts`; keine zweite Formel und keine neue medizinische Behauptung.
- Reiche die minimale abgeleitete Phaseninformation auch durch `getPartnerCalendarView()` weiter, damit Owner und Partner dieselben Ergebnisse rendern. Keine Rohdaten, IDs, Profile oder Schreibmöglichkeit zusätzlich an den Partner geben.
- Ordne die historischen Phasen in die bestehende Priorität ein: reale Periode vor manuellem PMS vor geschätztem Eisprung; aktuelle/future Verhalten bleibt unangetastet.

### Invarianten

- Keine Datenbankmigration, Route, API-Änderung, neue Abhängigkeit, neue Eingabe oder Änderung an Authentifizierung/Partner-Gate.
- Bestehende Daten bleiben Quelle der Wahrheit: reale Periode schlägt immer PMS und Eisprung; ein realer PMS-Eintrag wird nicht durch eine Schätzung überschrieben.
- Keine historische Phase aus einer Zukunftsprognose; keine Anzeige eines „tatsächlichen“ Eisprungs ohne Mess- oder Nutzereingabe.
- `deriveManualPmsSection()`, dessen Begrenzung und der Zyklus-Kreis behalten für den aktuellen Zyklus ihr bisheriges Verhalten.
- Partneransicht bleibt ohne Formulare, Aktionen oder Netzwerk-Schreibzugriffe.

### Pflichtprüfungen

- Unit-Tests für historische PMS-Abschnitte: vergangener Symptomtag, mehrere Zyklen, echter Periodenvorrang, kein Überspringen über eine spätere reale Periode.
- Unit-Tests für den historischen Eisprung: zwei reale Perioden ergeben den bestehenden möglichen Eisprungtag; fehlende folgende reale Periode ergibt keine historische Ovulationsphase; Überschneidung mit echter Periode behält Periodenvorrang.
- Konsistenztest Owner/Partner mit denselben historischen Eingaben und Partner-Gate-Test ohne aktive Verbindung.
- Bestehende Tests für manuelles PMS, Vorhersage, Kalenderband, Partnerkalender und Zyklus-Kreis ausführen; `npx tsc --noEmit` und `npm run build`.
- Sichtprüfung bei schmaler und breiter Ansicht: vergangener Monat, aktueller Monat, Partneransicht, Monatswechsel und Tagesfenster; kein horizontaler Überlauf.

### Stoppbedingungen

- Stoppe, wenn historische Symptomdaten nicht sicher einem Zeitraum zwischen realen Periodengrenzen zugeordnet werden können, statt sie in einen unbestimmten Abschnitt zu verlängern.
- Stoppe, wenn der Eisprung ohne folgende reale Periodengrenze nur aus Zukunftsprognosen erzeugt werden könnte.
- Stoppe vor Änderungen an Datenbank, API, Partnerrechten, Zyklus-Kreis oder aktueller/future Vorhersagelogik und melde den Grund.

## Ist – von Claude

- umgesetzt:
  - Neue reine, testbare Ableitung `src/lib/historical-calendar-phases.ts` (`deriveHistoricalCalendarPhases`): arbeitet nur mit real gespeicherten Perioden und gespeicherten PMS-Symptomtagen, liest weder `predictCycle()` noch Zukunftsprognosen und ändert `deriveManualPmsSection()` nicht. Ein „vergangener Zyklus“ ist der Zeitraum zwischen zwei aufeinanderfolgenden realen Perioden; nach der neuesten Periode wird nichts historisch abgeleitet (aktueller Zyklus bleibt bei `manual-pms.ts`/`predictCycle`).
    - PMS: Ein Abschnitt beginnt am ersten gültigen Symptomtag nach dem echten Ende einer Periode und reicht höchstens bis zum Tag vor der folgenden realen Periode (gleiche Semantik wie die bestehende Obergrenze „Tag vor der nächsten realen Periode“ beim aktuellen Abschnitt; deshalb schrumpft ein Band nicht, sobald die nächste Periode eingetragen wird). Echte Periodentage zählen nie, Symptomtage auf echten Periodentagen oder vor der ersten Periode werden ignoriert, eine noch offene frühere Periode ordnet nichts zu (unbestimmter Abschnitt wird nicht verlängert).
    - Eisprung: pro vergangenem Zyklus der bestehende zentrale Tag `calculateOvulationDate(Beginn der folgenden realen Periode)` (14 Tage davor, aus `cycle-fertility.ts`, keine zweite Formel). Kein Eisprung ohne folgende reale Periode, nicht auf oder vor einer echten Periode, nicht an einem Tag mit eigenem PMS.
  - Owner-Kalender (`NewCycleExample.tsx`): vergangene PMS-Tage erscheinen als `pms-manual` (kräftig rosa), vergangene Eisprungtage als `ovulation` (bestehendes violettes Band). Priorität: reale Periode > aktueller manueller Abschnitt > vergangenes PMS > Vorhersage/aktuelle Phase > vergangener Eisprung. Heute und Zukunft sind nie betroffen (die Mengen enthalten nur Tage vor der letzten realen Periode).
  - Partner: `getPartnerCalendarView()` leitet serverseitig mit derselben Funktion und denselben Quellen ab und gibt nur zwei Datumslisten (`historicalPhases.pmsDates/ovulationDates`) weiter, keine Symptome, IDs oder Rohdaten; `page.tsx` reicht sie an `NewPartnerCalendar`, der dieselbe Priorität anwendet. Aktive Verbindung bleibt der Gate (ohne Verbindung `null` vor jeder Ableitung); Partner bleibt ohne Formular, Aktion oder Schreibzugriff.
  - Unverändert: Zukunftsvorhersage, `deriveManualPmsSection`, Zyklus-Kreis, Farben/Legende (bestehende Bandfarben, keine neue Legendenzeile), Tagesfenster, Bandgeometrie, API, Datenbank, Migration, Partnerrechte.
- nicht umgesetzt: nichts offen.
- Tests:
  - Unit-Tests `tests/historical-calendar-phases.test.ts` (11, bestanden): vergangener Symptomtag, mehrere Zyklen ohne Überspringen realer Perioden, echter Periodenvorrang, Symptom vor erster/nach neuester Periode, offene frühere Periode, leere Symptome, Eisprung aus zwei realen Perioden, kein Eisprung ohne folgende reale Periode, sehr kurzer Zyklus, PMS vor Eisprung, Reihenfolge-/Unveränderlichkeit.
  - `scripts/verify-historical-phases-wp028.ts` (bestanden): Vorhersage und aktueller manueller Abschnitt unverändert, Owner/Partner nutzen dieselbe Ableitung mit identischem Ergebnis, Prioritätsreihenfolge im Partner, Gate und Datensparsamkeit, keine Phase aus Zukunftsprognose, zentrale Eisprungregel, Partner ohne Schreibzugriff.
  - Bestehende Regressionen bestehen: Kalenderband-, Legenden-, PMS-, Tagesfenster-, Partner-Skripte, `verify-partner-cycle-ring.mts`, `verify-partner-estimated-period.mts`, `verify-partner-calendar.mts` (lokale Test-DB); `node --test tests/*.test.ts`: 94/95 (der eine Fehlschlag in `calendar-day-info.test.ts` ist vorbestehend). Die TodayCard-Prüfung in `verify-partner-calendar-legend-collapsible.ts` ist weiter vorbestehend. `npx tsc --noEmit` und `npm run build` bestehen.
  - Sichtprüfung (lokale Testkonten, Dev-Modus; Owner und Partner bei 390 und 1280 px; drei reale Perioden, vier PMS-Einträge, davon einer auf einem echten Periodentag): Aug/Sep/Okt gelesen: PMS 26.–31.08. und 23.–28.09. kräftig rosa (bis zum Tag vor der folgenden Periode), Eisprung 18.08. und 15.09. violett (14 Tage vor der folgenden realen Periode), der Symptomtag auf der Periode (03.09.) bleibt Periode, im Oktober nur die bestehende Prognose; Owner und Partner identisch; Monatswechsel funktioniert, kein horizontaler Überlauf; ein Konto ohne Verbindung sieht keinen Kalender. Testkonten entfernt, Playwright entfernt, `package.json`/`package-lock.json` ohne Diff.
- Abweichungen: keine. Auslegung: „endet spätestens am Tag vor der nächsten realen Periode“ wurde als Obergrenze mit genau diesem Tag umgesetzt (siehe oben).
- offene Punkte: Die bereits bestehende Prognose zeigt im aktuellen Zyklus weiterhin einen (schon vergangenen) Eisprungtag aus der Vorhersage (z. B. 13.10.); das ist unverändertes Altverhalten und gehört nicht zu den neuen historischen Phasen. Vorbestehende Prüfskript-Fehler bleiben. Kein Deployment ausgelöst.
- Commit: siehe Git-Verlauf (`feat(wp-028)`).

## Soll-Ist-Prüfung – von Codex

- ausstehend.
