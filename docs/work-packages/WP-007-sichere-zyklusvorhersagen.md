---
id: WP-007
title: "Sichere, persoenliche Zyklusvorhersagen"
package_revision: 2
status: review
created: 2026-10-05
updated: 2026-10-05
owner_approved: yes
executor: claude
product_area: "Neue Luma - Home-Screen /neu, Zyklus-Kreis und Kalender"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Sichere, persoenliche Zyklusvorhersagen

## Owner-Ansicht – einfach erklärt

- Kurz gesagt: Luma zeigt Eisprung, fruchtbares Zeitfenster und PMS weiterhin nur als vorsichtige Schaetzung und macht die Vorhersage mit weiteren echten Periodeneintraegen persoenlicher.
- Zyklustag 1 ist der erste Tag einer tatsaechlichen Blutung. Die Zykluslaenge wird nur von einem Periodenbeginn bis zum naechsten Periodenbeginn berechnet.
- Eine laufende oder laengere/kuerzere Periode verschiebt die fruchtbare Phase nicht. Periodendauer und Zykluslaenge bleiben getrennt.
- Der moegliche Eisprung ist genau ein vorhergesagter Tag: ungefaehr 14 Tage vor der erwarteten naechsten Periode. Das fruchtbare Zeitfenster beginnt fuenf Tage davor und endet an diesem Tag.
- Wenn Periode und fruchtbares Zeitfenster ueberlappen, bleiben beide sichtbar: Periode als Hauptfarbe, fruchtbares Zeitfenster zusaetzlich als kleine Kennzeichnung.
- Bei stark schwankenden echten Zyklen steht einfach Vorhersage unsicher - Kann abweichen. Es gibt keine Prozentzahlen.
- Ohne freiwillig gespeicherte Symptome heisst PMS nur Moegliche PMS-Phase - Kann abweichen. Eine persoenliche PMS-Anpassung aus Symptomen gehoert nicht zu diesem Paket.
- Tatsaechliche Periodentage bleiben immer die massgeblichen Eintraege und werden nie durch eine Vorhersage blockiert oder veraendert.

## Entstehungsweg

Die bestehende Vorhersage nutzt bereits echte Periodenstarts und trennt Periodendauer von Zykluslaenge. Fuer eine verstaendliche und sichere Anzeige wurden Regeln fuer Eisprung, fruchtbares Zeitfenster, PMS, Ueberlappungen und Unsicherheit bestaetigt.

- Ausgangsidee: Die bereits vorhandene Zyklusansicht soll mit persoenlichen echten Daten genauer werden, ohne biologische Sicherheit vorzutaueschen.
- bestaetigte Wirkung: Die Nutzerin erkennt Vorhersagen klar als Schaetzungen und kann echte Periodendaten jederzeit unabhaengig eintragen oder korrigieren.
- gewaehlte Loesung: Eine gemeinsame, zeitzonenfeste Vorhersagelogik mit sichtbarer Unsicherheitskennzeichnung und einer zweiten Kalenderkennzeichnung fuer das fruchtbare Zeitfenster.
- wichtige Entscheidungen: Eisprung nie aus dem Periodenende ableiten; PMS ohne Symptome nur moeglich; Ueberlappungen gleichzeitig zeigen; keine Prozentwerte.
- Quellen/Akten: APP-IDEA-007, bestaetigte Regeln vom 2026-10-05.

## Soll – von Codex

- Zyklustag 1 bleibt der erste Tag einer tatsaechlich eingetragenen Periode.
- Die persoenliche Zykluslaenge entsteht ausschliesslich aus Abstaenden zwischen zwei echten Periodenbeginnen; die Periodendauer wird getrennt behandelt.
- Die erwartete naechste Periode wird aus der eigenen verwendbaren Zyklushistorie geschaetzt und mit weiteren echten Eintraegen erneut berechnet.
- Der moegliche Eisprung liegt genau an einem geschaetzten Tag, ungefaehr 14 Tage vor dem erwarteten Periodenbeginn. Er darf nicht aus endDate oder expectedEndDate abgeleitet werden.
- Das fruchtbare Zeitfenster beginnt fuenf Tage vor diesem Tag und endet einschliesslich an diesem Tag.
- Periode und fruchtbares Zeitfenster duerfen sich zeitlich ueberlappen. Der Kalender zeigt dann die Periodenmarkierung als Hauptfarbe und die Fruchtbarkeits-Schaetzung zusaetzlich. Keine Kennzeichnung darf die andere verdecken.
- Eine laufende tatsaechliche Periode verschiebt oder loescht keine schon berechnete Fruchtbarkeits-Schaetzung.
- PMS ist eine eigene vorperiodische Schaetzung. Ohne freiwillige Symptomdaten lautet die sichtbare Bezeichnung Moegliche PMS-Phase und traegt Kann abweichen.
- Bei stark schwankenden verwendbaren Zyklusabstaenden erscheint bei Eisprung- und Fruchtbarkeitsvorhersagen Vorhersage unsicher - Kann abweichen, ohne Prozentzahl. Die konkrete, nachvollziehbare Schwellenregel wird durch Claude getestet und im Ist dokumentiert.
- Jede Eisprung-, Fruchtbarkeits- oder PMS-Angabe bleibt klar als Schaetzung erkennbar. Es gibt keine Aussage ueber bestaetigte Fruchtbarkeit, Eisprung oder medizinische Diagnose.
- Tatsaechliche Periodeneintraege, Tagesfenster, Bearbeiten, Loeschen und Historie bleiben unveraendert bedienbar.

## Nicht enthalten

- Keine Erfassung, Speicherung oder Auswertung von Symptomen und keine individuelle PMS-Personalisierung.
- Keine neue Datenbankmigration, keine neue API-Route und keine Aenderung bestehender Periodendaten.
- Keine Aenderung an alter Luma, Anmeldung, Passwort-Reset oder Partner-Verbindung/Freigaben.
- Kein erwartetes Periodenende im Partnerkalender und keine Erweiterung der dort geltenden Freigabegrenzen.
- Keine medizinische Beratung, Empfaengnisverhuetung oder Aussage ueber tatsaechliche Fruchtbarkeit.

## Abnahmekriterien

1. Eisprung ist genau ein als moeglich/geschaetzt gekennzeichneter Tag und liegt 14 Tage vor der erwarteten naechsten Periode.
2. Das fruchtbare Zeitfenster umfasst genau Eisprungtag minus fuenf Tage bis einschliesslich Eisprungtag.
3. Zykluslaenge und Periodendauer werden bei kuerzerer, laengerer oder laufender Periode nicht verwechselt.
4. Tatsaechliche Perioden und fruchtbares Zeitfenster koennen am selben Tag gleichzeitig sichtbar sein; die tatsaechliche Periode bleibt optisch vorrangig.
5. PMS ohne Symptomdaten erscheint nur vorsichtig als Moegliche PMS-Phase - Kann abweichen.
6. Stark schwankende echte Zyklusabstaende fuehren zu Vorhersage unsicher - Kann abweichen; stabile Abstaende nicht.
7. Alle Vorhersagen bleiben klar von bestaetigten Periodentagen unterscheidbar und blockieren keine Eingabe oder Korrektur.
8. Auf mobilen und breiten Ansichten gibt es keinen horizontalen Ueberlauf.

## Technischer Auftrag für Claude

### Bestaetigte Ausgangslage im Code

- src/lib/new-cycle-prediction.ts berechnet predictCycle aus NewPeriodEntryOpen, Profil und explizitem Berlin-Heute. Verwendbare Abstaende zwischen startDate-Werten liefern den Median; periodLengthDays wird getrennt aus abgeschlossenen Eintraegen abgeleitet.
- cycleForPeriodStart berechnet ovulationDate bereits aus periodStart minus 14, verwendet aber fertileWindowEnd aktuell mit plus einem Tag. Das Ende muss auf den Eisprungtag angepasst werden.
- phaseForDate liefert aktuell genau eine Phase und priorisiert period vor ovulation, fertile und pms. Damit kann eine Ueberlappung nicht gleichzeitig an die Darstellung gelangen.
- src/lib/personal-cycle-view.ts versorgt Zyklus-Kreis und Heute-Karte. estimatedPhase verwendet aktuell ein mehrtaegiges Ovulationsfenster und die bestehende PMS-Phase.
- src/components/NewCycleExample.tsx verwendet predictedPhaseForCalendarDay und die bestehende Kalender-Legende. Der Kalender kann derzeit keine zweite vorhergesagte Kennzeichnung parallel zur Periodenfarbe zeigen.
- todayBerlinDateOnly aus src/lib/berlin-date.ts ist die verbindliche Tagesgrundlage. Keine neue lokale new Date()-Tagesentscheidung ergaenzen.
- Der bestehende Partner-Zyklus-Kreis nutzt die vorhandene persoenliche Zykluslogik serverseitig. Partnerfreigaben und der Partnerkalender bleiben durch WP-004 getrennt und duerfen nicht erweitert werden.

### Technisches Ziel

- Entwickle die vorhandene Vorhersagelogik weiter, statt eine zweite Berechnung aufzubauen.
- Fuehre, wenn technisch sinnvoll, eine kleine explizite Darstellung fuer mehrere Kalenderkennzeichnungen ein, damit bestaetigte Periodentage und ein fruchtbares Zeitfenster gleichzeitig sichtbar und per Legende erklaert sind.
- Halte tatsaechliche Perioden als eigene, vorrangige Information und Vorhersagen als zusaetzliche rein lesende Schicht.
- Begrenze die Ovulationsdarstellung auf genau einen geschaetzten Tag in allen von diesem Paket betroffenen Ansichten. Formuliere PMS ohne Symptomdaten vorsichtig.
- Bestimme Unsicherheit ausschliesslich aus vorhandenen, verwendbaren echten Zyklusabstaenden. Die Regel muss ohne Prozentanzeige, reproduzierbar und in gezielten Tests nachweisbar sein.
- Claude darf die passende interne Typform waehlen, solange keine bestehende API oder Datenbankstruktur geaendert wird und die bisherigen Aufrufer nachvollziehbar migriert werden.

### Invarianten - muessen unveraendert bleiben

- startDate echter Periodeneintraege bleibt die einzige Grundlage fuer Zyklusabstaende. endDate und expectedEndDate duerfen weder Eisprung noch Zykluslaenge bestimmen.
- Eine Sch�tzung darf keinen echten Periodentag ersetzen, verstecken, veraendern oder eine Eingabe verhindern.
- Alle Zeitrechnungen bleiben zeitzonenfest auf der bestehenden Berlin-Tagesgrundlage.
- Bestehende Daten, Kontentrennung, Authentifizierung, Bearbeiten/Loeschen, Historie, Home-Kalender und Zyklus-Kreis bleiben funktional.
- Partner sehen nur bereits von WP-004 erlaubte Inhalte. Insbesondere bleiben erwartete Tage aus dem Partnerkalender ausgeschlossen.
- Keine Aussage darf medizinische Gewissheit, Empfaengnisverhuetung oder einen bestaetigten biologischen Eisprung behaupten.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- Betroffene API-Routen: keine neue Route; bestehende Periodenrouten bleiben unveraendert, sofern keine Anpassung zur reinen Anzeige zwingend erforderlich ist.
- Migration noetig: nein.
- Freiwillige Symptome werden in diesem Paket weder gelesen noch gespeichert.

### Pflichtpruefungen

- Ergaenze eine gezielte pruefbare Abdeckung fuer: Berechnung aus Periodenstarts, Trennung von Zykluslaenge und Periodendauer, Eisprung minus 14 Tage, fruchtbares Zeitfenster minus fuenf bis null Tage, ein einziger Ovulationstag, laufende Periode ohne Verschiebung, Ueberlappung, PMS-Text ohne Symptome sowie stabile und stark schwankende echte Zyklen.
- Pruefe, dass endDate und expectedEndDate die Zykluslaenge und Ovulation nicht beeinflussen.
- Pruefe, dass vorhergesagte Marker alle sichtbar als Schaetzung/Kann abweichen gekennzeichnet sind und nie den echten Perioden-CRUD blockieren.
- Fuehre die bestehenden betroffenen Zyklus-, Kalender-, Perioden- und Partnerregressionen aus. Bestehende unabh�ngige Testdefekte klar getrennt dokumentieren, nicht still reparieren.
- Fuehre TypeScript-Pruefung, Produktions-Build und eine mobile sowie breite Sichtpruefung aus. Pruefe mindestens den Ueberlappungsfall und fehlenden horizontalen Ueberlauf.
- Vermeide neue Testkonten ausserhalb von tests; entferne temporaere Testdaten und temporaere Tools nach der Sichtpruefung.

### Stoppbedingungen

- Stoppe vor jeder Datenmigration, neuen API, Symptomdatenspeicherung, Partnerfreigabe-Aenderung oder Erweiterung auf alte Luma.
- Stoppe und dokumentiere, wenn eine geforderte sichtbare Ueberlappung mit der bestehenden Darstellungsstruktur nicht sicher und zugaenglich umgesetzt werden kann.
- Stoppe, wenn eine beabsichtigte Berechnung eine medizinische Aussage ueber tatsaechliche Fruchtbarkeit erzwingen wuerde.
- Wenn ein genannter Startpunkt nicht mehr stimmt, darf Claude den passenden Ort suchen; fachliche Regeln und Invarianten bleiben bindend.

### Abschluss durch Claude

- Ist vollstaendig ergaenzen; Abweichungen und offene Punkte sichtbar nennen.
- Status auf review setzen.
- Entwicklungsledger ergaenzen.
- node scripts/work-package-state.mjs mark-updated WP-007 und danach node scripts/work-package-state.mjs validate ausfuehren.
- Ausschliesslich auftragsbezogene Dateien committen und nach main pushen. Kein manuelles Deployment ausloesen.

## Ist – von Claude

- **umgesetzt:**
  - Neues zentrales, reines Modul `src/lib/cycle-fertility.ts` mit genau drei Funktionen, die ab jetzt von allen drei bisher unabhängigen Vorhersage-Implementierungen gemeinsam genutzt werden (keine zweite Berechnung):
    - `calculateOvulationDate(periodStart)`: genau 14 Tage vor einem Periodenbeginn.
    - `calculateFertileWindow(ovulationDate)`: Eisprungtag minus fünf Tage bis **einschließlich** Eisprungtag (inklusives Ende, nicht Eisprungtag + 1).
    - `isUncertainPrediction(usableGapsDays)`: reproduzierbare, prozentfreie Schwellenregel für „Vorhersage unsicher“ – die Spanne (`max - min`) der verwendbaren echten Zyklusabstände in Tagen; `> 10 Tage` gilt als unsicher. Bei weniger als zwei Abständen gilt die Vorhersage nicht als unsicher (keine Spanne berechenbar).
  - `src/lib/new-cycle-prediction.ts`: `cycleForPeriodStart` nutzt jetzt `calculateOvulationDate`/`calculateFertileWindow` statt der bisherigen eigenen Berechnung – dabei korrigiert: `fertileWindowEnd` war bisher fälschlich `ovulationDate + 1`, ist jetzt korrekt `ovulationDate` selbst. `CyclePrediction` trägt neu `isUncertain: boolean`, berechnet aus den tatsächlich für den Median verwendeten Abständen. Neue Funktion `phasesForDate(date, prediction)` liefert alle an einem Tag gleichzeitig zutreffenden Phasen (`period`, `ovulation`, `fertile`, `pms`) als unabhängige Flags, statt wie bisher nur die erste Übereinstimmung zurückzugeben – das ist die technische Grundlage für die geforderte gleichzeitige Sichtbarkeit von Periode und fruchtbarem Zeitfenster. Die bisherige `phaseForDate` bleibt als abwärtskompatible Einzelwert-Variante erhalten (gleiche Priorität wie zuvor: period > ovulation > fertile > pms) für Aufrufer, die nur einen Wert brauchen.
  - `src/lib/personal-cycle-view.ts`: `estimatedPhase` (Heute-Karte/Ring-Text) nutzt jetzt ebenfalls `calculateOvulationDate`/`calculateFertileWindow` statt des bisherigen eigenständigen `±1-Tage`-Ovulationsfensters (`OVULATION_WINDOW_HALF_DAYS`). `PersonalCyclePhase` um `"fertile"` erweitert. `PersonalCycleView` trägt neu `isUncertain: boolean`, berechnet aus den tatsächlich verwendeten Median-Abständen (`realCycleLengthMedian` gibt jetzt zusätzlich die genutzten Abstände zurück). `deriveTodayCardText` (WP-006) bleibt im Verhalten für `pms`/`ovulation`/no-data unverändert; ein `fertile`-Tag, der nicht der Eisprungtag selbst ist, fällt bewusst auf den neutralen „Heute: Zyklustag N“-Text zurück, um keine Fruchtbarkeits-/Eisprungaussage für einen Tag zu erfinden, der nicht der eine bestätigte Eisprungtag ist.
  - `src/lib/cycle-ring-geometry.ts`: `buildPersonalRingGeometry` nutzt jetzt ebenfalls das zentrale Modul; derselbe `±1-Tage`-Fensterfehler ist behoben. `buildRingGeometry` (für den Kalender-Prediction-Pfad) nutzt unverändert die bereits korrekten Werte aus `CyclePrediction` und war nicht fehlerhaft.
  - `src/components/CyclePersonalRing.tsx`: Label-Mapping um `fertile: "Mögliches fruchtbares Zeitfenster"` ergänzt; neue Anzeige „Vorhersage unsicher - Kann abweichen“ anstelle der Zykluslänge, wenn `personalCycleView.isUncertain` **und** die heutige Phase `ovulation` oder `fertile` ist (PMS/neutrale Tage behalten ihre normale Anzeige, wie im Soll-Text „bei Eisprung- und Fruchtbarkeitsvorhersagen“ vorgesehen). SVG-Beschreibungstext aktualisiert.
  - `src/components/NewCycleExample.tsx` (Kalender): `predictedPhaseForCalendarDay` liefert weiterhin genau eine Hintergrundphase mit unveränderter Priorität (`period > ovulation > pms`; `fertile` gewinnt nie den Hintergrund allein). Neue Funktion `showsFertileMarker(phases, primaryPhase)` bestimmt zusätzlich und unabhängig vom Hintergrund, ob ein kleiner, eigenständiger violetter Punkt (unten links in der Zelle, mit weißem Rand für Sichtbarkeit auf jedem Hintergrund) für das fruchtbare Zeitfenster erscheint – unterdrückt nur dann, wenn der angezeigte Haupt-Marker bereits selbst „ovulation“ zeigt (keine doppelte Information am selben Ort). Dieser Zusatzpunkt erscheint dadurch **gleichzeitig** mit einer bestätigten/laufenden/vorhergesagten Periode an überlappenden Tagen, ohne die bestehende Periodenkennzeichnung (P/Läuft/Ca./Plan/Gsch.) zu verdecken – browserseitig mit einem konstruierten, echten Überlappungsfall bestätigt (siehe Tests). Neue Legendenzeile „Mögliches fruchtbares Zeitfenster – kann abweichen“ sowie ein sichtbarer „Vorhersage unsicher - Kann abweichen“-Hinweis unter der Legende, wenn `prediction.isUncertain` zutrifft. `dayAriaLabel` nennt das fruchtbare Zeitfenster zusätzlich für Screenreader.
  - Keine neue API-Route, keine Datenbankänderung, keine Änderung an Authentifizierung, Partnerverbindung, Periodenbearbeitung/-löschung, Historie oder alter Luma. Der Partnerkalender (`new-partner-calendar.ts`) nutzt weiterhin ausschließlich `prediction.nextPeriodStart`/`nextPeriodEnd` (reine Periodendaten) und wurde nicht verändert – kein erwartetes Periodenende und keine Fruchtbarkeits-/Eisprungdaten gelangen dorthin, wie von WP-004 vorgegeben. Der lesende Partner-Zyklus-Kreis (`NewPartnerCycleRing`/`new-partner-cycle-view.ts`) nutzt unverändert `CyclePersonalRing`/`computePersonalCycleView` und profitiert damit automatisch vom Ovulations-Bugfix, ohne dass eine eigene Änderung nötig war.
  - Ein für den nativen Node-Testrunner (verwendet von `tests/new-cycle-prediction.test.ts`) nötiger technischer Kompromiss: Der neue Import von `cycle-fertility.ts` in `new-cycle-prediction.ts` nutzt einen relativen Pfad mit expliziter `.ts`-Endung plus `@ts-expect-error TS5097`-Kommentar – exakt dasselbe, bereits in allen bestehenden `tests/*.test.ts`-Dateien verwendete Muster, da `@/`-Pfadaliase unter Node's ESM-Loader nicht aufgelöst werden. `npx tsc --noEmit` und `npm run build` bestätigen, dass dies weder die TypeScript-Prüfung noch den Produktions-Build beeinträchtigt.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - Neues `tests/cycle-fertility.test.ts` (9 Prüfungen, Node-eigener Testrunner): Eisprung exakt 14 Tage vor dem Periodenbeginn, zeitzonenfest über Monats-/Jahresgrenze; fruchtbares Fenster beginnt 5 Tage vor und endet einschließlich am Eisprungtag, umfasst exakt 6 Kalendertage; `isUncertainPrediction` für stabile Abstände (false), stark schwankende Abstände (true), die Schwelle exakt bei 10 Tagen (false) und knapp darüber bei 11 Tagen (true), sowie für weniger als zwei Abstände (false). Alle 9 Prüfungen bestanden.
  - `tests/new-cycle-prediction.test.ts` um 9 neue WP-007-Fälle ergänzt: Eisprung minus 14 Tage; fruchtbares Fenster minus 5 bis 0 Tage; `endDate`/`expectedEndDate` beeinflussen weder Zykluslänge noch Eisprung (Vergleich zweier Datensätze mit unterschiedlicher Periodendauer/einem gesetzten `expectedEndDate`, aber identischer Start-Historie); eine laufende Periode verschiebt die bereits berechnete Fruchtbarkeits-Schätzung nicht; zwei konstruierte, echte Überlappungsfälle zwischen Periode und fruchtbarem Zeitfenster (`phasesForDate` liefert `period: true` und `fertile: true`/`ovulation: true` gleichzeitig für denselben Tag, `phaseForDate` priorisiert weiterhin `period` ohne Informationsverlust); stabile vs. stark schwankende echte Zyklusabstände für `isUncertain`. Alle 13 Prüfungen (4 bestehende + 9 neue) bestanden.
  - `scripts/verify-personal-cycle-view.ts` angepasst, da sich das Ovulationsfenster-Verhalten durch den Auftrag bewusst von einem 3-Tage-Fenster auf genau 1 Tag plus ein getrenntes 6-tägiges `fertile`-Fenster geändert hat (keine stille Reparatur eines Fehlers, sondern die geforderte Verhaltensänderung): Testblock „dreitägige mögliche Eisprungphase“ ersetzt durch „genau ein Eisprungtag und ein sechstägiges fruchtbares Zeitfenster“ (Tag vor dem Fenster neutral, erster/mittlerer Fenstertag `fertile`, letzter Tag `ovulation`, Tag danach neutral); Markertest-Toleranz am Eisprungtag angepasst, da der Marker jetzt am Ende statt in der Mitte des (jetzt breiteren) Ring-Segments liegt. Alle davon unabhängigen, bereits bestehenden Prüfungen bestehen unverändert.
  - Bestehende Regressionen erneut ausgeführt und grün: `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-partner-calendar.mts`, `scripts/verify-partner-estimated-period.mts`, `scripts/verify-my-periods.mts`, `scripts/verify-cycle-today-and-estimate.mts`, `scripts/verify-day-detail.ts`, `scripts/verify-period-history.ts`, `scripts/verify-history-month-jump.ts`, `scripts/verify-partner-view-no-status-card.ts`, `scripts/verify-period-day-actions.mts`.
  - `scripts/verify-personal-cycle-view.ts` zeigt weiterhin dieselben 9 Fehlschläge bei den Farbverlauf-Quelltextprüfungen wie in allen vorherigen Sitzungen dokumentiert (Gradient-Suche zeigt seit der WP-004-Version-6-Auslagerung auf `CyclePersonalRing.tsx` noch auf `NewCycleExample.tsx`) – unverändert vorbestehend, nicht durch WP-007 verursacht, hier nicht repariert (außerhalb des Auftragsumfangs).
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, Routenliste unverändert (keine neue Route).
  - Mobile (375×812) und breite (1280×900) Sichtprüfung mit Playwright (temporär installiert, danach vollständig entfernt) gegen den lokalen Dev-Server mit einem echten Testkonto und vorab isoliert mit Node berechneten, konstruierten Zyklusdaten (Zykluslänge 21 Tage, Periodendauer 10 Tage): bestätigt einen echten, visuell geprüften Überlappungsfall am 22.10.2026 – dieser Tag zeigt gleichzeitig die vorhergesagte Periode („Gsch.“, dunkler Hintergrund) und den kleinen violetten Punkt für das fruchtbare Zeitfenster, beide gleichzeitig sichtbar und durch die Legende erklärt, ohne dass eine Kennzeichnung die andere verdeckt. Die Legendenzeile „Mögliches fruchtbares Zeitfenster – kann abweichen“ ist in beiden Breiten vorhanden. Kein horizontaler Überlauf in beiden Ansichten. Screenshots geprüft. Playwright und Testkonto danach vollständig entfernt.
- **Abweichungen:**
  - Beim Bau der Browser-Sichtprüfung wurde ein tatsächlicher, durch diese Version eingeführter UI-Fehler entdeckt und noch während der Umsetzung korrigiert (keine Abweichung vom fertigen Ergebnis, aber dokumentiert für Nachvollziehbarkeit): Die erste Fassung von `showsFertileMarker` unterdrückte den fruchtbaren-Fenster-Punkt pauschal an jedem Tag, an dem `phasesForDate(...).ovulation === true` war – unabhängig davon, ob an diesem Tag tatsächlich „ovulation“ als Hauptmarker angezeigt wurde. Da `period` beim Hauptmarker immer Vorrang vor `ovulation` hat, führte das dazu, dass der Überlappungstag (Periode + Eisprung gleichzeitig) fälschlich **keinen** fruchtbaren-Fenster-Punkt zeigte, obwohl genau das die Kernanforderung des Auftrags ist. Durch den Browser-Test entdeckt und korrigiert: `showsFertileMarker` prüft jetzt den tatsächlich angezeigten `primaryPhase`-Wert statt der rohen `ovulation`-Flag.
  - Der bereits bekannte, vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) sowie der vorbestehende Gradient-Fundstellen-Defekt in `scripts/verify-personal-cycle-view.ts` bestehen unverändert fort und waren für diese Version nicht im Umfang.
  - Der Auftrag erwähnt keine explizite Vorgabe zur „Vorhersage unsicher“-Anzeige in der WP-006-Heute-Karte (nur für „Eisprung- und Fruchtbarkeitsvorhersagen“ allgemein); diese wurde bewusst nur im Kalender (Legende/Hinweiszeile) und im Zyklus-Kreis ergänzt, nicht zusätzlich in `deriveTodayCardText`, um den Umfang nicht über den Auftragstext hinaus zu erweitern.
- **offene Punkte:**
  - Owner-Prüfschritt steht aus: `/neu` öffnen, einen Monat mit vorhergesagter Periode und fruchtbarem Zeitfenster ansehen, die neue Legendenzeile und – bei vorhandener Überlappung – den kleinen zusätzlichen Punkt auf einem bereits farblich markierten Tag prüfen; bei einem Konto mit stark schwankender echter Zyklushistorie den Hinweis „Vorhersage unsicher - Kann abweichen“ prüfen; mobil auf fehlenden horizontalen Überlauf prüfen.
  - Die beiden oben genannten, vorbestehenden Testdefekte sollten weiterhin in eigenen, dafür vorgesehenen Paketen behoben werden.
  - Kein Deploy ausgelöst – wie beauftragt.
- **Commit:** 145498c.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: Soll erfuellt. Die Umsetzung deckt die vereinbarten Vorhersageregeln, die sichere Trennung zu echten Periodendaten und die Ueberlappungsdarstellung ab.
- Nachschaerfung: keine fachliche. Die Unsicherheitsschwelle > 10 Tage ist reproduzierbar getestet und im Ist dokumentiert.
- Product-Map aktualisiert: ja.


## Version 2 - Einklappbare Kalender-Erklaerungen

### Owner-Ansicht - einfach erklaert

- Kurz gesagt: Der Home-Kalender wirkt ruhiger. Die vielen Erklaerungen unter dem Kalender sind zuerst geschlossen.
- Unter dem Kalender steht nur ein kleiner Button: Erklaerungen zum Kalender anzeigen.
- Nach dem Antippen erscheinen die bisherigen Bedeutungen fuer bestaetigte/laufende Periode, voraussichtliches Ende, geschaetzte naechste Periode, moegliches fruchtbares Zeitfenster sowie P, M und E.
- Der Hinweis Vorhersage unsicher - Kann abweichen bleibt sichtbar, wenn er zutrifft. Er wird nicht versteckt, weil er fuer die Einordnung der Vorhersage wichtig ist.
- Es wird nichts in die Einstellungen verschoben. Einstellungen bleiben fuer Aenderungen, der Kalender erklaert seine sichtbaren Markierungen direkt vor Ort.

### Entstehungsweg

Die neue Kalenderlegende erklaert die Markierungen korrekt, nimmt auf dem Home-Screen aber viel Platz ein. Die Ownerin moechte einen ruhigeren Home-Screen ohne Verlust der Erklaerungen. Deshalb werden die normalen Erklaerungen einklappbar; der kontextbezogene Unsicherheitshinweis bleibt sichtbar.

- bestaetigtes Problem: Die dauerhaft sichtbare Legende unter dem Kalender macht den Home-Screen unnoetig voll.
- gewuenschte Wirkung: Der Kalender bleibt verstaendlich, aber der erste Blick auf die Startseite ist ruhiger.
- gewaehlte Loesung: Ein zugaenglicher Ein-/Ausklappbereich direkt unter dem Kalender.
- bestaetigte Grenze: Keine Verlagerung in Einstellungen und keine Aenderung an Berechnung, Daten oder Markierungen.
- Quellen: Owner-Rueckmeldung vom 2026-10-05, APP-IDEA-007.

### Soll - von Codex

- Die ausfuehrliche Kalenderlegende ist beim ersten Anzeigen geschlossen.
- Ein klarer Button zeigt Erklaerungen zum Kalender anzeigen. Nach dem Oeffnen lautet er Erklaerungen ausblenden.
- Der geoeffnete Bereich enthaelt die bisherigen Erklaerungen fuer bestaetigt/laufend, voraussichtliches Ende, geschaetzte naechste Periode, moegliches fruchtbares Zeitfenster sowie die vorhandenen P/M/E-Erklaerungen.
- Die sichtbaren Kalendermarker, ihre Farben, Tagesfenster, aria-Labels und Berechnungen bleiben unveraendert.
- Vorhersage unsicher - Kann abweichen bleibt ausserhalb des eingeklappten Bereichs sichtbar, wenn die bestehende Vorhersage unsicher ist.
- Der Bereich ist ueber Tastatur, Screenreader und auf Mobilgeraeten bedienbar.

### Nicht enthalten

- Keine Aenderung von Zyklus-, Perioden-, Eisprung-, PMS- oder Fruchtbarkeitsberechnung.
- Keine Datenbank, API, Einstellungen, Partneransicht, Freigabe, Anmeldung oder alte Luma.
- Keine neue Textuebersetzung oder neue medizinische Aussage.

### Abnahmekriterien

1. Beim Laden ist nur der kompakte Erklaerungsbutton sichtbar; die lange Legende ist geschlossen.
2. Ein Tipp oder Tastaturaktion oeffnet und schliesst alle Kalendererklaerungen eindeutig.
3. Der Unsicherheitshinweis bleibt sichtbar, wenn prediction.isUncertain true ist, auch bei geschlossener Legende.
4. Bestehende Kalendermarker und Tagesfenster bleiben unveraendert sichtbar und funktionsfaehig.
5. Kein horizontaler Ueberlauf auf einem mobilen Bildschirm.

### Technischer Auftrag fuer Claude - Version 2

#### Bestaetigte Ausgangslage im Code

- src/components/NewCycleExample.tsx rendert unter dem Home-Kalender zuerst die Legendenzeilen fuer Periodenstatus und fruchtbares Zeitfenster, danach bei prediction.isUncertain den Hinweis Vorhersage unsicher - Kann abweichen und anschliessend die interaktive P/M/E-Legende mit PhaseLegendItem.
- Die Komponente besitzt bereits Client-State fuer das Oeffnen einzelner P/M/E-Erklaerungen. Kalenderdaten, prediction und Phasenlogik stammen aus den bestehenden zentralen Modulen.
- Die neue Aenderung betrifft ausschliesslich die Praesentation der vorhandenen Legende im Owner-Home-Kalender.

#### Technisches Ziel

- Fuege einen kleinen zugaenglichen aufklappbaren Bereich fuer die vorhandenen normalen Kalendererklaerungen ein. Der Anfangszustand ist geschlossen.
- Der Steuerbutton verwendet einen klaren sichtbaren Text sowie aria-expanded und aria-controls. Beim Oeffnen bleiben die vorhandenen P/M/E-Einzel-Erklaerungen und Escape-Verhalten funktionsfaehig.
- Platziere den bestehenden Unsicherheitshinweis bewusst ausserhalb des einklappbaren Bereichs, damit er bei unsicherer Vorhersage immer sichtbar bleibt.
- Verschiebe oder veraendere keine Marker-, Berechnungs-, Tagesfenster- oder Datenlogik. Wiederverwende die bestehende Legende statt neue Texte oder eine zweite Erklaerungsstruktur anzulegen.

#### Invarianten

- Home-Kalender, Zyklus-Kreis, Heute-Karte, Partneransicht, Einstellungen und alle Datenwege bleiben unveraendert.
- Alle bestehenden Labels fuer Schaetzungen bleiben im geoeffneten Erklaerungsbereich vollstaendig erhalten.
- Es darf keine medizinische Aussage ergaenzt oder abgeschwaecht werden.
- Keine neue Route, Datenbankmigration, Speicherung oder Konfiguration.

#### Pflichtpruefungen

- Gezielte Pruefung: Anfangszustand geschlossen, Buttontext und aria-Zustand korrekt, Oeffnen/Schliessen sichtbar und per Tastatur bedienbar.
- Pruefe, dass Unsicherheit bei prediction.isUncertain ausserhalb der Legende sichtbar bleibt.
- Pruefe, dass alle bisherigen Legendentexte und P/M/E-Erklaerungen im geoeffneten Zustand vorhanden sind.
- Pruefe vorhandene Kalender- und WP-007-Regressionen, TypeScript und eine mobile Sichtpruefung ohne horizontalen Ueberlauf.
- Keine neue Abhaengigkeit und keine Testdaten ausserhalb von tests.

#### Stoppbedingungen

- Stoppe vor jeder Aenderung an Vorhersagelogik, Partneransicht, Einstellungen, Datenbank, API oder medizinischer Formulierung.
- Stoppe, wenn die bestehende zugaengliche P/M/E-Interaktion im Einklappbereich nicht sicher erhalten werden kann.

#### Abschluss durch Claude

- Ergaenze Ist Version 2, Tests, Abweichungen und offene Punkte sichtbar.
- Setze den Paketstatus nach Abschluss auf review.
- Ergaenze den Entwicklungsledger, fuehre node scripts/work-package-state.mjs mark-updated WP-007 und danach node scripts/work-package-state.mjs validate aus.
- Committe und pushe nur auftragsbezogene Dateien. Kein manuelles Deployment.

### Ist Version 2 - von Claude

- **umgesetzt:**
  - `src/components/NewCycleExample.tsx`: neuer Client-State `isCalendarLegendOpen` (Default `false` – geschlossen). Die bisherigen zwei Legendenblöcke unter dem Home-Kalender (die Zeile „Bestätigt/Laufend · Voraussichtliches Ende · Geschätzte nächste Periode · Mögliches fruchtbares Zeitfenster“ sowie die interaktive P/M/E-Legende mit `PhaseLegendItem`) wurden unverändert in einen gemeinsamen, bedingt gerenderten Bereich (`id="calendar-legend-panel"`) verschoben, der nur erscheint, wenn `isCalendarLegendOpen` true ist.
  - Neuer Steuerbutton direkt darüber: Text „Erklärungen zum Kalender anzeigen“ im geschlossenen und „Erklärungen ausblenden“ im geöffneten Zustand, mit `aria-expanded={isCalendarLegendOpen}` und `aria-controls="calendar-legend-panel"`.
  - Der bestehende „Vorhersage unsicher - Kann abweichen“-Hinweis (`prediction?.isUncertain`) wurde bewusst **vor** dem neuen Steuerbutton belassen, außerhalb des Einklappbereichs – er bleibt unabhängig vom Öffnungszustand sichtbar, genau wie gefordert.
  - Keine Änderung an Marker-, Berechnungs-, Tagesfenster- oder Datenlogik: `primaryCalendarPhase`, `showsFertileMarker`, `phasesForDate`, alle Kalenderzellen, `DayDetailModal`, `aria-label`s der Tage sowie `PhaseLegendItem` (inklusive dessen eigenständigem Escape-Verhalten und Einzel-`aria-expanded` je Phase) sind unverändert. Es wurden ausschließlich vorhandene Texte und Komponenten in eine neue, bedingt sichtbare Hülle verschoben – keine neuen Texte, keine zweite Erklärungsstruktur.
  - Keine neue Route, keine Datenbankänderung, keine Konfiguration, keine neue Abhängigkeit. Zyklus-Kreis, Heute-Karte, Partneransicht und Einstellungen bleiben unberührt.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - Neues `scripts/verify-calendar-legend-collapsible.ts`: Quelltext-Prüfungen bestätigen den geschlossenen Anfangszustand (`useState(false)`), `aria-expanded`/`aria-controls` am Steuerbutton samt passender Panel-`id`, beide Button-Textzustände, dass der Unsicherheitshinweis im Quelltext vor dem Einklappbereich steht und unverändert an `prediction?.isUncertain` gebunden bleibt (nicht an den Öffnungszustand), dass alle bisherigen Legendentexte (inklusive „Mögliches fruchtbares Zeitfenster“) und die vollständige P/M/E-Legende im geöffneten Bereich enthalten sind, dass `PhaseLegendItem` sein Escape-Verhalten und eigenes `aria-expanded` unverändert behält, und dass die zentrale WP-007-Marker-Logik (`primaryCalendarPhase`, `showsFertileMarker`) unverändert eingebunden bleibt. Alle Prüfungen bestanden.
  - Bestehende Regressionen erneut ausgeführt und grün: `scripts/verify-day-detail.ts`, `scripts/verify-period-history.ts`, `scripts/verify-history-month-jump.ts`, `scripts/verify-partner-fixed-view.ts`, `scripts/verify-partner-calendar.mts`, `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-my-periods.mts`, `scripts/verify-period-day-actions.mts`.
  - `node --experimental-strip-types --test tests/new-cycle-prediction.test.ts tests/cycle-fertility.test.ts`: alle 22 Prüfungen weiterhin bestanden (reine Präsentationsänderung, keine Berührung der Vorhersagelogik).
  - `scripts/verify-personal-cycle-view.ts` zeigt weiterhin dieselben, bereits seit mehreren vorherigen Versionen dokumentierten 9 Fehlschläge bei den Farbverlauf-Quelltextprüfungen (Gradient-Fundstelle seit WP-004 Version 6) – unverändert vorbestehend, nicht durch diese Version verursacht.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, Routenliste unverändert (keine neue Route).
  - Mobile Sichtprüfung (375×812) mit Playwright (temporär installiert, danach vollständig entfernt) gegen den lokalen Dev-Server mit einem echten Testkonto mit stark schwankender Zyklushistorie (Spanne der echten Abstände > 10 Tage, löst `isUncertain` aus): Anfangszustand zeigt nur den kompakten Button (`aria-expanded="false"`), das Panel ist nicht im DOM vorhanden; der Unsicherheitshinweis ist bereits vor dem Öffnen sichtbar. Nach dem Öffnen (`aria-expanded="true"`) sind alle vier Legendenzeilen und die vollständige P/M/E-Legende vorhanden; ein Klick auf „M – PMS“ öffnet die PMS-Erklärung, Escape schließt sie wieder – unverändert funktionsfähig. Der Unsicherheitshinweis bleibt während des geöffneten Zustands weiterhin sichtbar. Nach dem Schließen ist das Panel wieder aus dem DOM entfernt, der Unsicherheitshinweis bleibt weiterhin sichtbar. Kein horizontaler Überlauf. Screenshots geprüft (geschlossener und geöffneter Zustand). Playwright und Testkonto danach vollständig entfernt.
- **Abweichungen:** keine fachliche Abweichung.
  - Der bereits bekannte, vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) sowie der vorbestehende Gradient-Fundstellen-Defekt in `scripts/verify-personal-cycle-view.ts` bestehen unverändert fort und waren für diese Version nicht im Umfang.
- **offene Punkte:**
  - Owner-Prüfschritt steht aus: `/neu` öffnen, prüfen dass unter dem Kalender nur der kompakte Button sichtbar ist, öffnen und alle Erklärungen inklusive P/M/E-Einzelerklärungen prüfen, bei einem Konto mit unsicherer Vorhersage prüfen, dass der Hinweis unabhängig vom Öffnungszustand sichtbar bleibt, mobil auf fehlenden horizontalen Überlauf prüfen.
  - Die beiden oben genannten, vorbestehenden Testdefekte sollten weiterhin in eigenen, dafür vorgesehenen Paketen behoben werden.
  - Kein Deploy ausgelöst – wie beauftragt.
- **Commit:** folgt unmittelbar nach diesem Eintrag.
