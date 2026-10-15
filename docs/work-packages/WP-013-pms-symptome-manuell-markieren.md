---
id: WP-013
title: "PMS-Symptome manuell markieren und im Partnerbereich anzeigen"
status: review
created: 2026-10-15
updated: 2026-10-15
owner_approved: yes
executor: claude
product_area: "Neue Luma – Home und Partneransicht"
brief_version: 1
technical_brief: complete
---

# Aufgabe: PMS-Symptome manuell markieren und im Partnerbereich anzeigen

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Die Nutzerin kann an einem vergangenen oder heutigen Kalendertag PMS-Symptome markieren. Dadurch beginnt der sichtbare PMS-Status an diesem Tag, statt erst am vorhergesagten PMS-Tag.
- **Warum machen wir das?** PMS kann von Frau zu Frau und von Zyklus zu Zyklus unterschiedlich früh beginnen. Die Nutzerin soll ihr tatsächliches Empfinden selbst eintragen können.
- **Woher kam die Idee?** Owner-Entscheidungen vom 2026-10-15, Akte APP-IDEA-022, DEC-131 bis DEC-133.
- **Wo ist es in der App?** Eigener Kalender und Zyklus-Kreis auf `/neu`; bei einer aktiven Verbindung dieselbe rein lesende Information auf `/neu/partner`.
- **Was gehört ausdrücklich nicht dazu?** Keine medizinische Diagnose, keine Änderung der Vorhersage für Periode, Eisprung oder Fruchtbarkeit, keine Push-Nachricht und keine Bearbeitung durch den Partner.
- **Was kann die Nutzerin danach ausprobieren?** Einen nicht zukünftigen Tag öffnen, ein oder mehrere Symptome auswählen und speichern. PMS wird ab diesem Tag sichtbar; der Partner sieht die Einträge nur lesend.

## Entstehungsweg

`Individuelle PMS-Beginnzeit → Nutzerin soll tatsächliche Symptome selbst festhalten → manuell gesetzter PMS-Status mit vier klaren Symptomen → WP-013`

- Ausgangsidee oder Problem: Die bisherige PMS-Phase ist nur eine Schätzung. Tatsächliche PMS-Symptome können früher oder später beginnen.
- bestaetigte Wirkung: Die Nutzerin erkennt ihren selbst eingetragenen PMS-Beginn; der verbundene Partner sieht denselben Status und die von ihr ausgewählten Symptome.
- gewaehlte Loesung: Datierte, bearbeitbare Symptommarkierungen setzen einen manuellen PMS-Status ab dem frühesten markierten Tag des laufenden Abschnitts. Dieser Status hat Vorrang vor einer späteren oder abweichenden PMS-Schätzung.
- wichtige Entscheidung(en): Vier Symptome, Mehrfachauswahl, Partneransicht rein lesend; keine Auswirkung auf Vorhersagen.
- Quellen/Akten: APP-IDEA-022, DEC-127, DEC-131, DEC-132, DEC-133.

## Soll – von Codex

- Problem: Eine berechnete PMS-Phase kann nicht den tatsächlich empfundenen Beginn der Nutzerin abbilden.
- gewuenschte Wirkung: Die Nutzerin kann PMS-Symptome einfach, sichtbar und korrigierbar festhalten. Bei aktiver Partnerverbindung ist diese bewusst gewünschte Information auf beiden Ansichten identisch sichtbar.
- sichtbare Aenderung:
  1. Im vorhandenen Tagesfenster eines nicht zukünftigen Kalendertags gibt es eine klar bezeichnete PMS-Symptom-Auswahl mit genau diesen vier Optionen: `Brustschmerzen/-spannen`, `Unterleibsschmerzen`, `Müdigkeit`, `Stimmungsschwankungen`.
  2. Mehrere Optionen sind gleichzeitig möglich; die Nutzerin kann ihre Auswahl für denselben Tag später ändern oder vollständig entfernen.
  3. Die erste vorhandene Symptommarkierung nach dem letzten tatsächlichen Periodenbeginn setzt den manuellen PMS-Beginn. Er wird ab diesem Datum im eigenen Kalender und im Zyklus-Kreis als von der Nutzerin eingetragener PMS-Status angezeigt. Die genauen Symptome sind im Kalender am betreffenden Tag und als verständliche Statusinformation beim Zyklus-Kreis sichtbar.
  4. Der manuelle PMS-Status hat innerhalb dieses Abschnitts Vorrang vor der berechneten PMS-Schätzung. Existieren keine manuellen Symptome, bleibt die bisherige geschätzte PMS-Anzeige unverändert.
  5. Beim tatsächlichen Start der nächsten Periode endet die sichtbare manuelle PMS-Phase. Werden alle zugehörigen Symptommarkierungen entfernt, gilt wieder die bestehende Schätzung.
  6. Ein aktiv verbundener Partner sieht dieselbe manuell eingetragene PMS-Phase und die genauen Symptome auf seinem rein lesenden Kalender und Zyklus-Kreis. Ohne aktive Verbindung oder nach deren Ende werden keine Symptomdaten geladen oder angezeigt.
- nicht enthalten: Keine Änderungen an `predictCycle`, Zykluslänge, Periodendauer, Eisprung, fruchtbarem Fenster oder ihrer Unsicherheit; keine medizinische Bewertung, Diagnose, Empfehlung, Bild, Notiz, Push, E-Mail oder neue Einzelfreigabe. Der Partner kann nichts eintragen, ändern oder löschen.
- Abnahmekriterien:
  1. Eine Nutzerin kann an einem heutigen oder vergangenen Tag eine, mehrere oder keine der vier Optionen speichern; ein zukünftiger Tag ist nicht bearbeitbar.
  2. Eine heutige Symptommarkierung zeigt PMS ab heute, auch wenn die vorhandene Schätzung den Beginn erst später ansetzt.
  3. Kalender und Zyklus-Kreis unterscheiden verständlich zwischen manuell eingetragenem PMS und der weiterhin als Schätzung markierten automatischen PMS-Phase; die genauen ausgewählten Symptome sind ohne medizinische Behauptung sichtbar.
  4. Die bestehende Perioden-, Eisprung- und Fruchtbarkeitsvorhersage bleibt durch Symptomdaten bytegleich in ihrer fachlichen Wirkung.
  5. Partneransicht ist rein lesend, zeigt nur bei `status = 'active'` die minimal nötigen Datums- und Symptomtexte und zeigt nach Verbindungsende nichts mehr.
  6. Nutzerinnen voneinander getrennt; ein Partner kann nie Symptome einer nicht verbundenen Nutzerin abrufen oder verändern.
  7. Mobile und breite Ansicht bleiben ohne horizontalen Überlauf und ohne überladene neue Hauptkarte.
- ein Pruefschritt fuer den Owner: Auf `/neu` einen heutigen oder vergangenen Tag öffnen, `Brustschmerzen/-spannen` und `Müdigkeit` markieren und speichern. Prüfen, dass PMS ab diesem Tag auf Kalender und Kreis sichtbar ist; anschließend dieselbe Verbindung auf `/neu/partner` öffnen und dort dieselben zwei Symptome rein lesend sehen. Einen Eintrag wieder entfernen und die Aktualisierung prüfen.

## Technischer Auftrag für Claude

Dieser Abschnitt beschreibt technische Leitplanken, aber keine unnötige Schritt-für-Schritt-Lösung.

### Bestaetigte Ausgangslage im Code

- `src/app/neu/page.tsx` lädt den authentifizierten Owner, Periodeneinträge, Profil, `predictCycle(...)` und `computePersonalCycleView(...)` und reicht sie an `NewCycleExample`.
- `src/components/NewCycleExample.tsx` enthält den bearbeitbaren eigenen Kalender, das vorhandene Tagesfenster und `CyclePersonalRing`.
- `src/lib/new-cycle-prediction.ts`, `src/lib/personal-cycle-view.ts` und `src/lib/cycle-ring-geometry.ts` bilden die bestehende geschätzte PMS-Phase. Sie dürfen nicht aus Symptomdaten neue Perioden-, Eisprung- oder Fruchtbarkeitswerte ableiten.
- `src/app/neu/partner/page.tsx` lädt für eine aktive Verbindung `getPartnerCalendarView(...)` und `getPartnerCycleView(...)` und übergibt sie an die rein lesenden Komponenten `NewPartnerCalendar` und `NewPartnerCycleRing`.
- `src/lib/new-partner-calendar.ts` und `src/lib/new-partner-cycle-view.ts` lösen den Owner ausschließlich über `new_partner_connections` mit `status = 'active'` auf und liefern bewusst keine IDs, E-Mails oder Profilwerte an den Partner.
- `src/lib/new-auth-db.ts` und `scripts/apply-luma-core-migrations.mjs` sind die bestehende Datenbank-/Migrationsbasis der neuen Luma. Bestehende `new_period_entries` sind nicht umzudeuten oder zu verändern.

### Technisches Ziel

- Führe eine kleine, klar benannte Datenhaltung für die datierten PMS-Symptommarkierungen der neuen Luma ein. Sie muss mindestens Nutzerkonto, nicht zukünftiges Kalenderdatum, einen der vier erlaubten Symptomwerte sowie sichere Erstell-/Änderzeitpunkte abbilden. Ein Nutzerkonto darf einen Symptomwert pro Datum höchstens einmal besitzen.
- Verwende eine abgesicherte Owner-API oder eine gleichwertig sichere bestehende Aktion für Erstellen, Ersetzen und Entfernen der Auswahl. Der angemeldete Owner darf ausschließlich seine eigenen Einträge verändern; ungültige Symptomwerte und zukünftige Daten werden serverseitig abgewiesen.
- Leite aus diesen Einträgen eine kleine, wiederverwendbare manuelle PMS-Ansicht ab. Sie ergänzt die bestehenden Berechnungen, ersetzt aber nur die sichtbare PMS-Phasenanzeige im betroffenen Abschnitt. Eine zweite Berechnung für Perioden, Eisprung oder Fruchtbarkeit ist verboten.
- Reiche an die Partneransicht nur die minimal nötigen Daten für Datum, manuellen PMS-Status und die vier erlaubten Symptomtexte weiter. Nutze für die Partnerprüfung wieder den alleinigen aktiven Verbindungs-Gate; kein neuer Freigabeschalter.
- Integriere die Texte zurückhaltend in bestehendes Tagesfenster, Kalender und Zyklus-Kreis. Der Partner erhält keine Klickaktion und keine Bearbeitungsoberfläche.
- Claude hat technische Vorgehensfreiheit für die genaue Komponentenaufteilung, wenn diese Wirkung, Datenminimierung und Invarianten erhalten bleiben.

### Invarianten – muessen unveraendert bleiben

- Bestehende Periodeneinträge, deren Bearbeitung und echte Periodendaten bleiben unverändert. Tatsächliche Periodendaten bleiben Vorrang vor jeder Schätzung.
- `predictCycle`, Zykluslänge, Periodendauer, geschätzte nächste Periode, Eisprung, fruchtbares Fenster und Unsicherheitslogik dürfen durch die neuen Symptomdaten weder angepasst noch personalisiert werden.
- Die automatische PMS-Schätzung bleibt unverändert sichtbar, solange keine manuelle Symptommarkierung den Abschnitt übersteuert. Jede verbleibende automatische PMS-Information bleibt als Schätzung erkennbar.
- Eine Symptommarkierung ist eine Nutzerangabe und darf nirgends als medizinische Diagnose oder bestätigtes biologisches Ereignis bezeichnet werden.
- Authentifizierung, Sitzungen, Passwort-Reset WP-005, Periodenaktionen WP-012, Push, Benachrichtigungspräferenzen, Partnerverbindungsablauf und alle alten Luma-Screens bleiben unverändert.
- Partnerdatenzugriff: ausschließlich ein aktuell verbundenes Partnerkonto darf lesen; niemals schreiben. Nach Beendigung der Verbindung muss jeder neue Lesevorgang `null`/keine Daten ergeben. Keine Namen, E-Mails, IDs, Rohprofile oder vollständige Symptomhistorie über den nötigen sichtbaren Umfang hinaus liefern.
- Keine unkontrollierten oder freien Symptomtexte; nur die vier bestätigten Werte serverseitig akzeptieren.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: ja, eine neue kleine Tabelle für PMS-Symptommarkierungen in `luma_core`; ausschließlich zur neuen Luma gehörend und über den vorhandenen Migrationsweg versioniert/anwendbar.
- betroffene API-Routen: eine begrenzte authentifizierte Owner-Schnittstelle für Symptomauswahl sowie die bestehenden serverseitigen Partner-Lesewege; keine öffentliche Route.
- Migration noetig: ja. Migration muss sicher wiederholbar, auf `luma_core` begrenzt und in die bestehende Verifikation der Luma-Core-Tabellen aufgenommen werden. Keine fremden oder alten Tabellen ändern oder löschen.

### Pflichtpruefungen

- Neue gezielte Tests für erlaubte/abgelehnte Symptome, Mehrfachauswahl, Aktualisieren, vollständiges Entfernen, Zukunftsdatum-Ablehnung, Mandantentrennung und tatsächlichen Periodenbeginn als Ende des manuellen PMS-Status.
- Vergleichstest: dieselben Perioden-/Profildaten erzeugen vor und nach Symptommarkierungen identische Periode-, Eisprung- und Fruchtbarkeitsvorhersagen.
- Partnerprüfung mit zwei echten Testkonten: aktive Verbindung sieht ausschließlich die manuelle PMS-Information der verbundenen Ownerin; nicht verbundenes Konto und beendete Verbindung sehen nichts; Partner-Schreiben wird abgewiesen.
- Bestehende Kalender-, Ring-, Partner- und Periodenregressionen ausführen; TypeScript und Build müssen bestehen.
- Migration gegen `luma_core` anwenden und mit der bestehenden Luma-Core-Verifikation prüfen.
- Mobile und breite Sichtprüfung: Kalender, Tagesfenster, Zyklus-Kreis und Partneransicht ohne horizontalen Überlauf; keine Interaktion im Partnerbereich.
- Testkonten und Testdaten nach der Prüfung vollständig entfernen, ohne echte Owner-Daten zu berühren.

### Stoppbedingungen

- Stoppe und frage nach, bevor eine weitere Symptomkategorie, Freitext, medizinische Bewertung, Vorhersageanpassung, Push oder Partner-Bearbeitung hinzugefügt wird.
- Stoppe vor einer Migration außerhalb von `luma_core`, einer Änderung an Authentifizierung/Verbindungsgate oder einer Datenweitergabe über die bestätigten vier Symptomtexte hinaus.
- Wenn ein bestehender Kalender- oder Ringstartpunkt nicht mehr passt, darf Claude den passenden Ort suchen; Datenminimierung, Vorhersagegrenze und Leserecht des Partners bleiben bindend.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger für diese größere, sensible Änderung ergänzen und prüfen.
- `node scripts/work-package-state.mjs mark-updated WP-013` ausführen.
- `node scripts/work-package-state.mjs validate` muss bestehen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment auslösen.

## Ist – von Claude

- **umgesetzt:**
  - **Datenhaltung:** Neue Migration `database/luma-core/migrations/202610151200_pms_symptom_entries.sql` legt die Tabelle `new_pms_symptom_entries` an: `id UUID PK`, `user_id UUID NOT NULL REFERENCES new_users(id) ON DELETE CASCADE`, `entry_date DATE NOT NULL`, `symptom TEXT NOT NULL` mit `CHECK (symptom IN ('breast_tenderness', 'abdominal_pain', 'fatigue', 'mood_swings'))`, `created_at`/`updated_at TIMESTAMPTZ DEFAULT NOW()`, `UNIQUE (user_id, entry_date, symptom)` (ein Symptomwert pro Datum höchstens einmal je Konto) sowie ein Index `(user_id, entry_date DESC)`. Migration gegen `luma_core` angewendet (`node scripts/apply-luma-core-migrations.mjs`); `scripts/verify-luma-core.mjs` wurde auf die jetzt 12 `new_*`-Tabellen angepasst (vorher hart auf 11 geprüft) und bestätigt die saubere Trennung von der alten Datenbank.
  - **Validierung:** `src/lib/new-pms-symptom-validation.ts` – exportiert `PMS_SYMPTOMS` (genau die vier bestätigten Werte), `isValidPmsSymptom`, und `validatePmsSymptomDayInput(body, today)`, die ein Datum und eine vollständige Tages-Symptomauswahl prüft: gültiges, nicht zukünftiges Datum; `symptoms` muss ein Array ausschließlich gültiger Werte sein (leeres Array ist gültig und bedeutet „alles für diesen Tag entfernen“); doppelte Werte werden dedupliziert.
  - **Datenzugriff:** `src/lib/new-pms-symptoms.ts` (`server-only`) – `getPmsSymptomDays(userId)` liest alle Tage/Symptome eines Kontos; `setPmsSymptomsForDay(userId, date, symptoms)` ersetzt transaktional (DELETE dann INSERT) die vollständige Auswahl für genau diesen Tag. Jede Operation ist strikt an `user_id` gebunden, kein Owner-Parameter aus dem Request.
  - **API-Route:** `src/app/api/neu/pms-symptoms/route.ts` – `GET` (authentifiziert, liefert alle Tage des angemeldeten Kontos) und `PUT` (authentifiziert, Origin-geschützt wie `periods/route.ts`, validiert den Body, ruft `setPmsSymptomsForDay` ausschließlich für `session.userId` auf). Keine neue Route für den Partner – die Partneransicht liest ausschließlich über die bestehenden, erweiterten Server-Funktionen.
  - **Reine Ableitungslogik (keine zweite Berechnung):** `src/lib/manual-pms.ts` – `deriveManualPmsSection(periods, symptomDays)` bestimmt rein aus bereits geladenen Perioden und Symptomtagen den aktuellen manuellen PMS-Abschnitt: Start ist die früheste Symptommarkierung ab dem letzten tatsächlichen Periodenbeginn (`date >= latestPeriodStart`); Ende ist der Tag vor dem nächsten tatsächlichen, bereits gespeicherten Periodenbeginn, oder `null` (offen), solange keine neue Periode begonnen hat. Ohne jede relevante Markierung liefert die Funktion `null` – die bestehende Schätzung bleibt dann unverändert sichtbar. `isWithinManualPmsSection`, `manualPmsSymptomsForDate` und `applyManualPmsOverride` sind kleine, pure Hilfsfunktionen, die von Eigen- und Partneransicht gemeinsam genutzt werden. Diese Datei liest zu keinem Zeitpunkt `predictCycle`/`computePersonalCycleView`-interne Zustände und wird von diesen beiden auch nicht aufgerufen – die Übersteuerung passiert ausschließlich an der jeweiligen Aufrufstelle (Call-Site), nie in der zentralen Berechnung selbst.
  - **Eigene Ansicht (`src/components/NewCycleExample.tsx`):** `initialPmsSymptomDays`-Prop und `pmsSymptomDays`-State ergänzt; `manualPmsSection = deriveManualPmsSection(periods, pmsSymptomDays)` wird bei jedem Render neu abgeleitet. Neue Funktion `saveManualPmsSymptoms(date, symptoms)` ruft `PUT /api/neu/pms-symptoms` auf und löst den bestehenden Erfolgshinweis aus WP-012 aus (`Gespeichert.` bei nicht-leerer, `Gelöscht.` bei leerer Auswahl). Das bestehende Tagesfenster (`DayDetailModal`) zeigt jetzt zusätzlich eine Checkbox-Auswahl der vier Symptome mit eigenem „Symptome speichern“-Button (deaktiviert, solange sich nichts geändert hat); die bestehenden Perioden-Action-Buttons darunter sind unverändert. Der Kalender übersteuert die bereits berechnete `primaryCalendarPhase` nur an der Darstellungsstelle über `applyManualPmsOverride`, zeigt den eigenen Marker „M·Du“ statt „M“ und ergänzt das `aria-label` um „PMS von dir eingetragen“ – echte Periodentage (`storedPeriod`/`runningPeriod`/`expectedPeriod`/`plannedPeriod`) haben unverändert Vorrang und werden nie überschrieben. Der Zyklus-Kreis erhält ein lokal übersteuertes `displayedPersonalCycleView`-Objekt (`{ ...personalCycleView, todayPhase: "pms", isEstimate: false }`) nur, wenn der heutige Tag im manuellen Abschnitt liegt – `CyclePersonalRing.tsx` selbst wurde nicht verändert. Ein zusätzlicher Text „Von dir eingetragen: …“ mit den konkreten Symptomen erscheint unter dem Ring. Die Kalenderlegende wurde um eine Zeile für den neuen Marker ergänzt.
  - **Partneransicht (rein lesend):** `src/lib/new-partner-calendar.ts` und `src/lib/new-partner-cycle-view.ts` laden zusätzlich `getPmsSymptomDays(ownerUserId)` über denselben, unveränderten `resolveActiveConnectionOwner`-Gate (`status = 'active'`) und geben `manualPmsSection` als Teil von `PartnerCalendarView` zurück bzw. übersteuern `PersonalCycleView.todayPhase` serverseitig genau wie die Eigenansicht. `src/app/neu/partner/page.tsx` reicht `calendarView.manualPmsSection` an `NewPartnerCalendar` und die daraus abgeleiteten Symptome des heutigen Tages an `NewPartnerCycleRing` weiter. `NewPartnerCalendar.tsx` bekommt einen neuen `PrimaryDayStatus`-Wert `"pms-manual"` (eigene Farbe/Buchstabe „M·Sie“, eigener Label- und Legendentext „PMS von ihr eingetragen“) und zeigt im bestehenden, weiterhin rein lesenden Tagesfenster die konkreten Symptomtexte. `NewPartnerCycleRing.tsx` erhält eine neue, rein lesende `manualPmsSymptoms`-Prop und zeigt denselben Hinweistext wie die Eigenansicht. Keine der beiden Komponenten erhielt einen neuen Netzwerkaufruf, Button oder Formular – ausschließlich zusätzliche, bereits serverseitig aufbereitete Lesedaten als Props.
  - Keine Änderung an `predictCycle`, `computePersonalCycleView`, Zykluslänge, Periodendauer, Eisprung, fruchtbarem Fenster oder Unsicherheitslogik. Keine Änderung an Authentifizierung, Sitzungen, WP-005, WP-012, Push, Benachrichtigungspräferenzen, Partnerverbindungsablauf oder alter Luma.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - `tests/new-pms-symptom-validation.test.ts` (8 Prüfungen, Node-Testrunner): gültige Mehrfachauswahl, leere Auswahl (vollständiges Entfernen), heutiger Tag erlaubt, zukünftiger Tag abgelehnt, ungültiger Symptomwert abgelehnt, Freitext/falscher Typ abgelehnt, doppelte Werte werden dedupliziert, `isValidPmsSymptom` erkennt genau die vier Werte. Alle bestanden.
  - `tests/manual-pms.test.ts` (12 Prüfungen, Node-Testrunner): kein Abschnitt ohne echte Perioden, kein Abschnitt ohne Markierungen, früheste Markierung nach letztem Periodenbeginn eröffnet den Abschnitt, eine Markierung vor dem aktuell letzten Periodenbeginn zählt nicht (inkl. des Falls, dass eine rückwirkend nachgetragene spätere Periode den „letzten Beginn“ verschiebt), eine leere Auswahl zählt nicht als Markierung, ein offener Abschnitt bleibt offen bis eine nächste Periode real gespeichert wird, eine laufende (unbeendete) Periode gilt weiterhin als letzter Beginn, `manualPmsSymptomsForDate` liefert Symptome nur innerhalb des Abschnitts, `applyManualPmsOverride` liefert „pms“ nur innerhalb des Abschnitts (sonst die Schätzung unverändert), vollständiges Entfernen aller Markierungen löst den Abschnitt vollständig auf. Alle bestanden.
  - `scripts/verify-manual-pms-prediction-isolation.ts` (neu, Pflicht-Vergleichstest laut Auftrag): bestätigt, dass `predictCycle(...)` und `computePersonalCycleView(...)` für identische Perioden-/Profildaten vor und nach dem Ableiten eines manuellen PMS-Abschnitts bytegleiche (`JSON.stringify`-identische) Ergebnisse liefern. Alle Prüfungen bestanden.
  - `scripts/verify-partner-pms-symptoms.mts` (neu, DB-Integrationstest mit echten Testkonten gegen `luma_core`, nach dem Muster von `verify-partner-calendar.mts`): Datenbank-CHECK-Constraint weist ungültige Symptomwerte ab, gültige Mehrfachauswahl wird korrekt gespeichert, erneutes Speichern ersetzt die vorherige Auswahl, leere Auswahl entfernt alles, UNIQUE-Constraint verhindert einen doppelten Symptomwert am selben Tag/Konto, Mandantentrennung zwischen zwei unabhängigen Konten, kein Zugriff ohne aktive Partnerverbindung, aktive Verbindung zeigt exakt die Symptome der verbundenen Ownerin, sofortiger Entzug nach Verbindungsende, Kontotrennung bei mehreren Partnerpaaren, und ein struktureller Beweis, dass ein Partnerkonto niemals Einträge beim verbundenen Owner-Konto anlegen kann (die Schreib-API kennt keinen Owner-Parameter, schreibt ausschließlich für `session.userId`). 14 Prüfungen, alle bestanden. Alle vier Testkonten wurden danach vollständig entfernt.
  - `scripts/verify-manual-pms-symptom-ui.ts` (neu, gezielte Quelltext-/Struktur-Prüfung): genau die vier bestätigten Symptomtexte, serverseitige Zukunftsdatum-Ablehnung, Symptomauswahl ist Teil des bestehenden, weiterhin auf nicht-zukünftige Tage begrenzten Tagesfensters, authentifizierte und CSRF-geschützte API-Route ohne Owner-Parameter, manueller Override hat Vorrang vor der Schätzung aber nie vor echten Periodentagen, `new-cycle-prediction.ts`/`personal-cycle-view.ts` bleiben vollständig frei von jeder Symptom-Abhängigkeit, Partneransicht enthält keinerlei Schreib-/Netzwerkaufruf oder Eingabeelement für Symptome. Alle Prüfungen bestanden.
  - Bestehende Regressionen erneut ausgeführt und grün: `tests/*.test.ts` (73/74 – der eine Fehlschlag ist der bereits seit mehreren vorherigen Sitzungen dokumentierte, vorbestehende Defekt in `tests/calendar-day-info.test.ts`, fehlende Funktion `applyPeriodDayAction`, nicht durch WP-013 verursacht), `scripts/verify-partner-calendar.mts`, `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-partner-estimated-period.mts`, `scripts/verify-my-periods.mts`, `scripts/verify-cycle-today-and-estimate.mts`, `scripts/verify-period-day-actions.mts`, `scripts/verify-partner-fixed-view.ts`, `scripts/verify-day-detail.ts`, `scripts/verify-period-history.ts`, `scripts/verify-history-month-jump.ts`, `scripts/verify-calendar-legend-collapsible.ts`, `scripts/verify-home-actions-consistent.ts`, `scripts/verify-start-help-no-data.ts`, `scripts/verify-action-success-toast.ts`.
  - `scripts/verify-home-screen-layout.ts` musste gezielt angepasst werden: die Prüfung erwartete wörtlich `<TodayCard personalCycleView={personalCycleView} />`/`<CyclePersonalRing personalCycleView={personalCycleView} today={todayKey} />`; durch die neue, bewusste WP-013-Übersteuerung werden beide Komponenten jetzt korrekt mit `displayedPersonalCycleView` versorgt. Die Prüfung wurde auf diese neue, korrekte Übergabe aktualisiert (keine stille Reparatur eines Fehlers, sondern die erwartete Anpassung an eine bewusste Verhaltensänderung). Nach der Anpassung bestehen alle 20 Prüfungen dieses Skripts weiterhin.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich; neue Route `/api/neu/pms-symptoms` erscheint korrekt in der Routenliste, keine sonstige Routenänderung.
  - Migration angewendet und verifiziert: `node scripts/apply-luma-core-migrations.mjs` (neue Migration `202610151200_pms_symptom_entries` angewendet, alle vorherigen bereits angewendet) und `node scripts/verify-luma-core.mjs` (12 `new_*`-Tabellen, saubere Trennung von `app_luma`, erfolgreich).
  - Mobile (375×800) und breite (1280×900) Sichtprüfung mit Playwright (temporär installiert, danach vollständig entfernt) gegen den lokalen Dev-Server mit zwei echten Testkonten (Owner und verbundener Partner) je Breite: Ein vergangener Tag wurde im Tagesfenster geöffnet, „Brustschmerzen/-spannen“ und „Müdigkeit“ markiert und gespeichert → sichtbarer Hinweis „Gespeichert.“, Kalendertag zeigt danach im `aria-label` „PMS von dir eingetragen“ und den Marker „M·Du“, der Zyklus-Kreis zeigt (da der heutige Tag im Abschnitt lag) den Zusatztext „Von dir eingetragen: …“ mit den konkreten Symptomen ohne „Kann abweichen“-Zusatz. Erneutes Öffnen, beide Haken entfernen, Speichern → „Gelöscht.“, der Marker verschwindet wieder vollständig vom Kalendertag. Ein Verbindungscode wurde erzeugt, ein zweites Testkonto registriert und verbunden: Der Partnerkalender zeigt auf den entsprechenden Tagen denselben Marker „M·Sie“ (ohne jede Eingabemöglichkeit, keine Checkbox im DOM); das geöffnete Partner-Tagesfenster zeigt rein lesend exakt den erneut gesetzten Text „Unterleibsschmerzen“. Kein horizontaler Überlauf auf `/neu` oder `/neu/partner` in beiden Breiten. Screenshots geprüft. Playwright, der Dev-Server und alle acht Testkonten (inkl. Verbindungen, Codes, Perioden und Symptomeinträgen) wurden danach vollständig entfernt; `scripts/verify-luma-core.mjs` bestätigt abschließend `pms_symptom_entries: 0` und `users: 1` (nur das echte Owner-Konto).
- **Abweichungen:** keine fachliche Abweichung vom Soll-Umfang.
  - Technische Designentscheidung, die der Auftrag Claude ausdrücklich freistellt („Claude hat technische Vorgehensfreiheit für die genaue Komponentenaufteilung“): PMS-Symptome wurden als Einzeltag-Marker (eine Zeile pro Tag und Symptom, `UNIQUE(user_id, entry_date, symptom)`) statt als Zeitraum modelliert, da der Soll-Text „Mehrfachauswahl pro Tag, später ändern oder vollständig entfernen“ verlangt, nicht einen zusammenhängenden Zeitraum wie bei Perioden.
  - Die API ist als eine einzelne `PUT /api/neu/pms-symptoms`-Route modelliert, die die vollständige Symptomauswahl eines Tages ersetzt (statt einzelner POST/DELETE-Operationen pro Symptom), da der Soll-Text „ihre Auswahl für denselben Tag später ändern oder vollständig entfernen“ als einen zusammenhängenden Tages-Zustand beschreibt.
  - Die beiden bestehenden Partner-Lesefunktionen (`new-partner-calendar.ts`, `new-partner-cycle-view.ts`) wurden direkt um die PMS-Daten erweitert statt einer dritten, separaten Datei mit erneut dupliziertem `resolveActiveConnectionOwner`-Gate – das vermeidet einen weiteren Copy-Paste des Gates und hält die Partneransicht auf exakt zwei bestehenden, bereits geprüften Einstiegspunkten.
  - Der bereits bekannte, vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort und war für dieses Paket nicht im Umfang.
- **offene Punkte:**
  - Owner-Prüfschritt steht aus: Auf `/neu` einen heutigen oder vergangenen Tag öffnen, `Brustschmerzen/-spannen` und `Müdigkeit` markieren und speichern; prüfen, dass PMS ab diesem Tag auf Kalender und Kreis sichtbar ist; anschließend dieselbe Verbindung auf `/neu/partner` öffnen und dort dieselben zwei Symptome rein lesend sehen; einen Eintrag wieder entfernen und die Aktualisierung prüfen.
  - Kein Deploy ausgelöst – wie beauftragt.
- **Commit:** f399101.

## Korrektur – von Claude

Codex hat vor der Owner-Abnahme eine Lücke gemeldet (siehe „Soll-Ist-Prüfung – von Codex" unten): Eine Symptommarkierung auf einem tatsächlichen Periodentag wurde vom Kalender bereits korrekt verdeckt (reine Darstellungspriorität), aber nicht strukturell in der Ableitung selbst ausgeschlossen – dadurch konnte der Zyklus-Kreis (Eigen- und Partneransicht) an einem echten laufenden/bestätigten Periodentag fälschlich `pms` zeigen, und eine während einer Periode gespeicherte Markierung konnte nach deren Ende eine manuelle PMS-Phase fortsetzen, obwohl sie fachlich nie außerhalb der Periode lag.

- **umgesetzt:**
  - `src/lib/manual-pms.ts` strukturell korrigiert, statt sich weiter auf zufällige Rendering-Reihenfolge an den Aufrufstellen zu verlassen:
    - Neue interne Prüfung `isRealPeriodDay(periods, date, today)`: ein Datum gilt als echter Periodentag, wenn es auf/nach einem `startDate` liegt und auf/vor dessen `endDate` (bzw. bei einer noch laufenden Periode ohne echtes Ende: bis einschließlich `today`, da eine offene Periode nicht als bereits beendet gelten darf).
    - `deriveManualPmsSection(periods, symptomDays, today)` erhält einen neuen, dritten Pflichtparameter `today` und lässt den Abschnitt jetzt frühestens am Tag **nach** dem echten Ende der letzten Periode beginnen (`firstDayAfterLatestPeriod`), nicht mehr ab deren Start. Eine noch laufende Periode (kein echtes Ende) lässt gar keinen neuen Abschnitt zu, solange sie läuft. Zusätzlich werden Symptomtage, die selbst auf einen echten Periodentag fallen, aus den für den Abschnitt relevanten Markierungen ausgefiltert.
    - `isWithinManualPmsSection(section, date, periods, today)` erhält dieselben zwei neuen Parameter und gibt jetzt immer `false` zurück, wenn `date` ein echter Periodentag ist – unabhängig vom aufrufenden Code und unabhängig davon, ob der übergebene Abschnitt (aus welchem Grund auch immer) veraltet wäre. `manualPmsSymptomsForDate` und `applyManualPmsOverride` leiten dieselbe Prüfung automatisch mit ab, da beide intern `isWithinManualPmsSection` aufrufen.
    - Damit ist der Schutz „echte Periodendaten haben immer Vorrang" jetzt eine Eigenschaft der zentralen Funktionen selbst, nicht mehr nur ein Nebeneffekt der Darstellungsreihenfolge an einzelnen Aufrufstellen.
  - Alle Aufrufstellen auf die neue Signatur angepasst: `src/components/NewCycleExample.tsx` (Kalender-Marker und Zyklus-Kreis-Override, beide übergeben jetzt `periods`/`todayKey`), `src/lib/new-partner-cycle-view.ts` (der von Codex konkret benannte Partner-Ring-Bug – identische Korrektur wie in der Eigenansicht), `src/lib/new-partner-calendar.ts` (liefert jetzt zusätzlich eine datenminimale `periods: { startDate, endDate }[]`-Liste ohne IDs sowie `today` als Teil von `PartnerCalendarView`, damit die Partner-Komponenten denselben Schutz anwenden können, ohne Owner-interne IDs zu erhalten), `src/components/NewPartnerCalendar.tsx` (neue `periods`/`today`-Props, an beiden Aufrufstellen von `isWithinManualPmsSection`/`manualPmsSymptomsForDate` durchgereicht) und `src/app/neu/partner/page.tsx` (reicht `calendarView.periods`/`calendarView.today` an `NewPartnerCalendar` und `NewPartnerCycleRing` weiter).
  - Zur sauberen Typisierung wurde in `manual-pms.ts` ein neuer, minimaler Typ `PeriodDateRange { startDate, endDate }` eingeführt (statt des vollen `NewPeriodEntryOpen` mit `id`/`expectedEndDate`), den sowohl die Eigenansicht (volle Periodeneinträge erfüllen ihn strukturell) als auch die datenminimale Partneransicht gleichermaßen erfüllen.
  - Keine Änderung an `predictCycle`, `computePersonalCycleView`, der Datenbank, der API-Route oder den vier erlaubten Symptomwerten.
- **Tests (neu/ergänzt):**
  - `tests/manual-pms.test.ts`: 5 neue gezielte Prüfungen ergänzt (insgesamt jetzt 18, alle bestanden): eine laufende Periode ohne echtes Ende erlaubt keinen manuellen Abschnitt, solange sie läuft; nach dem echten Ende einer (vormals laufenden) Periode kann ein neuer Abschnitt beginnen; eine Markierung auf einem echten bestätigten Periodentag eröffnet keinen Abschnitt; `isWithinManualPmsSection` liefert `false`, sobald ein Tag nachträglich durch eine neu gespeicherte Periode zu einem echten Periodentag wird, selbst mit einem (dann veralteten) passenden Abschnitt; `applyManualPmsOverride` überschreibt nie einen echten Periodentag. Außerdem wurden alle bestehenden 13 Tests auf die neue, um `periods`/`today` erweiterte Funktionssignatur angepasst (reine Signaturanpassung, keine inhaltliche Änderung an den bereits bestandenen Fällen).
  - `scripts/verify-manual-pms-symptom-ui.ts`: neuer Prüfblock „WP-013-Korrektur: echte Periodentage haben strukturellen Vorrang, nicht nur per Rendering-Reihenfolge" bestätigt per Quelltextprüfung, dass `isWithinManualPmsSection` selbst den Periodenschutz enthält, dass `deriveManualPmsSection` den Abschnitt erst nach dem echten Periodenende beginnen lässt, dass eine laufende Periode bis einschließlich heute blockiert, und dass sowohl der Eigen-Kalender als auch die Partner-Zyklus-Kreis-Ableitung die korrigierte Signatur tatsächlich verwenden.
  - `scripts/verify-manual-pms-prediction-isolation.ts`: auf die neue Signatur angepasst, weiterhin bestätigt, dass `predictCycle`/`computePersonalCycleView` unverändert bytegleich bleiben.
  - Mobile/breite Live-Verifikation mit temporär installiertem Playwright gegen einen echten Dev-Server (zwei eigene, gezielte Testläufe, danach vollständig entfernt): (1) ein Symptom wurde direkt auf einem echten, bereits bestätigten Periodentag gespeichert – der Kalendertag zeigte weiterhin ausschließlich „bestätigte Periode", nie „PMS von dir eingetragen"; nach zusätzlicher Markierung eines Tages direkt nach dem echten Periodenende zeigte genau dieser Folgetag korrekt den manuellen PMS-Marker, während der echte Periodentag selbst weiterhin unverändert blieb. (2) Eine laufende Periode wurde angelegt und am heutigen, laufenden Periodentag ein Symptom markiert – weder der Zyklus-Kreis noch die Heute-Karte noch der Kalendertag zeigten danach einen manuellen PMS-Status; der Tag zeigte weiterhin ausschließlich „laufende Periode". Beide Testkonten vollständig entfernt.
  - `npx tsc --noEmit` und `npm run build`: fehlerfrei/erfolgreich. Alle bereits dokumentierten Pflichtprüfungen (bestehende Unit-Tests, alle `scripts/verify-*`-Regressionen, `scripts/verify-luma-core.mjs`) erneut ausgeführt und weiterhin grün; einzige Ausnahme weiterhin der bereits mehrfach dokumentierte, vorbestehende Defekt in `tests/calendar-day-info.test.ts` (nicht durch dieses Paket verursacht).
- **Abweichungen:** keine fachliche Abweichung vom Soll; dies ist eine Korrektur eines vor der Owner-Abnahme gemeldeten Fehlers, keine Umfangsänderung.
- **offene Punkte:**
  - Owner-Prüfschritt steht weiterhin aus (siehe oben, unverändert: Symptome auf `/neu` markieren, Kalender/Kreis prüfen, Partneransicht prüfen, Entfernen prüfen). Zusätzlich sinnvoll zu prüfen: eine Markierung auf einem echten Periodentag zeigt dort kein PMS.
  - Kein Deploy ausgelöst – wie beauftragt.
- **Commit (Korrektur):** b9ea726.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: Soll erfüllt; Owner-Abnahme steht aus.
- Nachschaerfung: Die vor der Owner-Abnahme festgestellte Prioritätslücke ist zentral in `manual-pms.ts` korrigiert. Die Wiederprüfung bestätigt: Ein tatsächlicher bestätigter oder laufender Periodentag wird von `isWithinManualPmsSection` und allen darauf aufbauenden Hilfen immer ausgeschlossen. Ein manueller Abschnitt kann erst nach einem tatsächlichen Periodenende beginnen. Damit haben echte Periodendaten im Kalender und im Zyklus-Kreis der Nutzerin wie des Partners strukturell Vorrang. Die übrigen vereinbarten Grenzen – vier feste Symptome, reine Partner-Leseansicht, keine Vorhersageänderung – sind laut Implementierungs- und Prüfnachweis eingehalten.
- Product-Map aktualisiert: ja.

## Korrekturauftrag Version 2 – manuelles PMS begrenzt darstellen

Die Ownerin hat nach ihrer Sichtprüfung eine zu breite Darstellung gemeldet: Nach einer heutigen Symptommarkierung wurde manuelles PMS über die gesamte Zukunft des Kalenders gezeigt. Das widerspricht der gewünschten Wirkung.

- Die bestehende Vorhersage für die nächste Periode bleibt vollständig unverändert, einschließlich ihres Datums, ihrer Darstellung und aller Berechnungen.
- Ein manuell gesetzter PMS-Status beginnt am gewählten Symptomtag. Im Kalender darf er nie über `heute` hinaus als bestätigter manueller Status erscheinen.
- Liegt der vorhergesagte Periodenbeginn noch in der Zukunft, darf die manuelle PMS-Phase vom gewählten Tag bis zum Tag vor diesem erwarteten Beginn sichtbar sein. Die bestehende geschätzte Periode behält an ihren Tagen ihren Vorrang und ihre Schätzungskennzeichnung.
- Ist das erwartete Startdatum bereits vergangen, aber keine tatsächliche neue Periode gespeichert, darf der manuelle PMS-Status nur tageweise bis einschließlich `heute` weiterlaufen. Künftige Tage bleiben frei von manuellem PMS.
- Beginnt die Periode tatsächlich, endet manuelles PMS sofort. Echte bestätigte oder laufende Periodentage behalten immer Vorrang.
- Diese Darstellung gilt gleich für Kalender und Zyklus-Kreis der Nutzerin sowie die rein lesende Partneransicht. Sie verändert niemals `predictCycle`, Zykluslänge, Eisprung oder Fruchtbarkeit.

### Pflichtprüfungen für die Korrektur Version 2

- Mit einer heutigen Symptommarkierung und einer in einer Woche erwarteten Periode: PMS endet sichtbar am Tag vor dem erwarteten Beginn; die geschätzte Periode bleibt unverändert sichtbar.
- Mit einem bereits überschrittenen erwarteten Beginn ohne tatsächliche neue Periode: Manuelles PMS reicht höchstens bis `heute`, nie auf einen künftigen Kalendertag.
- Mit einer tatsächlichen neuen Periode: Manuelles PMS endet sofort und echte Periodentage bleiben vorrangig.
- Eigen- und Partneransicht zeigen dieselben Datumsgrenzen; Partner bleibt vollständig rein lesend.
- Bestehender Vergleichstest bestätigt weiterhin unveränderte Vorhersagen; TypeScript, Build und die betroffenen PMS-/Partner-Regressionen bestehen.

## Korrektur Version 2 – von Claude

Die Ownerin hatte nach der ersten Korrektur gemeldet, dass manuelles PMS nach einer heutigen Markierung über die gesamte Zukunft des Kalenders sichtbar blieb (`endDate: null`, unbegrenzt offen, solange keine reale nächste Periode gespeichert war). Der Abschnitt musste stattdessen auf die bestehende Vorhersage und `heute` begrenzt werden.

- **umgesetzt:**
  - `src/lib/manual-pms.ts`: `deriveManualPmsSection` erhält einen neuen, optionalen vierten Parameter `predictedNextPeriodStart: string | null`. Eine neue interne Funktion `resolveSectionEndDate(predictedNextPeriodStart, today)` bestimmt das Abschnittsende jetzt immer begrenzt: Liegt die übergebene Vorhersage noch in der Zukunft, endet der Abschnitt am Tag davor; sonst (keine Vorhersage, oder die Vorhersage liegt bereits auf/vor `heute`) endet er spätestens `heute`. `ManualPmsSection.endDate` ist dadurch nie mehr `null`, sondern immer ein konkretes Datum – `isWithinManualPmsSection` wurde entsprechend vereinfacht (keine `null`-Prüfung mehr nötig).
  - Eine real bereits gespeicherte, spätere Periode hat weiterhin unverändert Vorrang: Sie wird selbst zur „letzten Periode“ (`firstDayAfterLatestPeriod` berechnet weiterhin aus der zeitlich letzten gespeicherten Periode), wodurch der Abschnitt ohnehin erst nach deren eigenem Ende neu beginnen kann – ein gesonderter `nextPeriodStart`-Zweig war dafür nicht nötig; der ursprünglich dafür vorgesehene, aber strukturell unerreichbare Code-Pfad wurde entfernt, um keinen toten Code zu behalten.
  - Alle drei Aufrufstellen übergeben jetzt die jeweils bereits vorhandene, unveränderte Vorhersage als reine Begrenzung, ohne eine zweite Berechnung einzuführen: `src/components/NewCycleExample.tsx` (`prediction?.nextPeriodStart ?? null`, aus der bereits vorhandenen `prediction`-Prop), `src/lib/new-partner-calendar.ts` (aus dem dort bereits berechneten `predictCycle(...)`-Ergebnis) und `src/lib/new-partner-cycle-view.ts` (ruft dafür zusätzlich `predictCycle` mit denselben, bereits geladenen Perioden/Profil/`today` auf – dieselbe bestehende Funktion, die auch der Eigenkalender nutzt, keine neue oder abweichende Berechnung).
  - Keine Änderung an `predictCycle`, `computePersonalCycleView`, der Datenbank, der API-Route oder den vier erlaubten Symptomwerten. Die Vorhersage selbst (Datum, Darstellung, Berechnung) bleibt vollständig unverändert; sie wird nur als bereits existierender Wert gelesen, um die Anzeige des manuellen Status zu begrenzen.
- **Tests (neu/ergänzt):**
  - `tests/manual-pms.test.ts`: 4 neue gezielte Prüfungen für Version 2 (insgesamt jetzt 22, alle bestanden): eine heutige Markierung mit einer in einer Woche erwarteten Periode endet sichtbar am Tag davor; ein bereits überschrittener erwarteter Beginn ohne reale neue Periode begrenzt manuelles PMS auf höchstens `heute`; eine tatsächliche neue Periode beendet manuelles PMS sofort, auch wenn eine (jetzt veraltete) Vorhersage einen späteren Termin genannt hatte; Eigen- und Partneransicht erzeugen bei gleichen Eingaben einen identischen Abschnitt. Zusätzlich wurden zwei bereits bestehende Tests, die noch ein unbegrenztes `endDate: null` erwarteten, auf das neue, korrekt begrenzte Verhalten (Enddatum = `heute` ohne Vorhersage) angepasst, und ein Test, der versehentlich den jetzt toten `nextPeriodStart`-Codepfad prüfte, wurde auf das tatsächlich erreichbare Verhalten korrigiert (eine real gespeicherte spätere Periode wird selbst zur letzten Periode, der Abschnitt öffnet sich erst nach deren eigenem Ende neu).
  - `scripts/verify-manual-pms-symptom-ui.ts`: neuer Prüfblock „WP-013-Korrektur Version 2: manuelles PMS reicht nie unbegrenzt in die Zukunft“ bestätigt per Quelltextprüfung die zentrale Begrenzungsfunktion sowie, dass alle drei Aufrufstellen tatsächlich `prediction?.nextPeriodStart ?? null` übergeben.
  - `scripts/verify-manual-pms-prediction-isolation.ts`: neuer Prüfblock bestätigt zusätzlich, dass der abgeleitete Abschnitt strikt vor dem vorhergesagten nächsten Periodenbeginn endet, und dass `predictCycle` bytegleich bleibt, auch wenn seine Vorhersage als Begrenzung an `deriveManualPmsSection` übergeben wird.
  - Mobile/breite Live-Verifikation mit temporär installiertem Playwright gegen einen echten Dev-Server (zwei abgeschlossene Perioden im 28-Tage-Rhythmus angelegt, sodass `predictCycle` einen konkreten nächsten Beginn in der Zukunft lieferte; Symptom am heutigen Tag markiert): Der Tag vor dem vorhergesagten Beginn zeigte korrekt weiterhin „PMS von dir eingetragen“, der vorhergesagte Tag selbst zeigte kein manuelles PMS mehr (dort gilt wieder die bestehende Schätzung), und ein deutlich späterer Tag (rund drei Wochen weiter) zeigte ebenfalls kein manuelles PMS. Testkonto vollständig entfernt.
  - `npx tsc --noEmit`, `npm run build`: fehlerfrei/erfolgreich. Alle bereits dokumentierten Pflichtprüfungen (Unit-Tests, alle `scripts/verify-*`-Regressionen, `scripts/verify-luma-core.mjs`) erneut ausgeführt und weiterhin grün; einzige Ausnahme weiterhin der bereits mehrfach dokumentierte, vorbestehende Defekt in `tests/calendar-day-info.test.ts` (nicht durch dieses Paket verursacht).
- **Abweichungen:** keine fachliche Abweichung vom Korrekturauftrag Version 2; dies ist eine erneute Korrektur vor der Owner-Abnahme, keine Umfangsänderung.
- **offene Punkte:**
  - Owner-Prüfschritt steht weiterhin aus (siehe oben, unverändert). Zusätzlich sinnvoll zu prüfen: eine heutige Markierung zeigt manuelles PMS nicht mehr über den vorhergesagten nächsten Periodenbeginn hinaus.
  - Kein Deploy ausgelöst – wie beauftragt.
- **Commit (Korrektur Version 2):** wird nach dem Commit ergänzt.
