---
id: WP-002
title: "Persönlichen Zyklus-Kreis aus echten Daten anzeigen"
status: approved
created: 2026-09-06
updated: 2026-09-06
owner_approved: yes
executor: claude
product_area: "Neuer Startweg und Home-Screen /neu"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Persönlichen Zyklus-Kreis aus echten Daten anzeigen

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Luma zeigt im Kreis, wo du dich heute in deinem persönlichen Zyklus befindest.
- **Warum machen wir das?** Der bisherige Kreis ist vor allem ein Bild. Er soll aus deinen echten Angaben entstehen und verständlich zeigen: Periode, mögliche Eisprungphase oder mögliche PMS-Phase.
- **Woher kam die Idee?** Aus dem Gespräch zum Home-Screen und Zyklus-Kreis; die bestätigten Entscheidungen sind DEC-086 sowie DEC-089 bis DEC-094.
- **Wo ist es in der App?** Im Startweg nach Anmeldung und oben auf dem neuen Home-Screen `/neu`.
- **Was gehört ausdrücklich nicht dazu?** Kein KI-Modell, keine Diagnose, keine Schwangerschafts- oder Verhütungsaussage, kein Umbau des Kalenders und keine Änderung der alten Luma.
- **Was kann die Nutzerin danach ausprobieren?** Sie gibt ihre letzte Periode ein, ergänzt freiwillig bis zu drei frühere Perioden oder eine ungefähre Zykluslänge und sieht danach einen klar als unsicher markierten persönlichen Kreis.

## Entstehungsweg

`Bildhafter Kreis ohne persönliche Bedeutung → Nutzerin möchte ihren heutigen Zyklusstand verstehen → echte Daten, vorsichtige Berechnung und klare Unsicherheit → WP-002`

- Ausgangsidee oder Problem: Der obere Kreis zeigt noch nicht verlässlich den aktuellen persönlichen Zyklusstand.
- bestätigte Wirkung: Die Nutzerin erkennt auf einen Blick ihre aktuelle Position: Periode, mögliche Eisprungphase, mögliche PMS-Phase oder neutraler Zustand.
- gewählte Lösung: Echte Periodenanfänge bilden den Median; fehlende Historie kann freiwillig durch eine ungefähre Zykluslänge überbrückt werden. Ohne Datengrundlage bleibt der Kreis neutral.
- wichtige Entscheidungen: DEC-086, DEC-089, DEC-091, DEC-092, DEC-093 und DEC-094.
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-IDEA-013.md`.

## Soll – von Codex

- **Problem:** Der Zyklus-Kreis wirkt wie eine Grafik und zeigt nicht sicher, wo die Nutzerin anhand ihrer Daten heute steht.
- **gewünschte Wirkung:** Eine Nutzerin sieht eine einfache persönliche Standortanzeige, ohne dass Luma Daten erfindet oder medizinische Sicherheit vortäuscht.
- **sichtbare Änderung:**
  - Nach der letzten Periode bietet der Startweg freiwillig bis zu drei frühere Perioden an; jede zusätzliche Angabe darf übersprungen werden mit `Ich weiß es nicht`.
  - Wenn nicht genügend echte Angaben vorliegen, bietet Luma einfach und freiwillig `Mein Zyklus dauert ungefähr … Tage` sowie `Ich weiß es nicht` an.
  - Der Kreis bleibt neutral mit `Noch nicht genügend Daten für deine persönliche Zyklusansicht`, wenn weder ausreichende echte Daten noch eine ungefähre Zykluslänge vorliegen.
  - Mit einer ungefähren Zykluslänge zeigt der Kreis eine erste Orientierung mit `Kann abweichen`.
  - Ab vier echten Periodenanfängen berechnet Luma aus den drei oder mehr echten Start-Abständen einen Median und ersetzt die ungefähre Angabe damit.
  - Im Kreis stehen nur: die drei Bereiche Periode, mögliche Eisprungphase und mögliche PMS-Phase, der Heute-Marker sowie klein `Zyklus: X Tage` bei verfügbarer Länge. Keine Anzeige der nächsten Periode im Kreis.
  - Tatsächlich bestätigte Periodentage sind Periode. Die mögliche Eisprungphase umfasst drei Tage rund um den geschätzten Eisprung. Die mögliche PMS-Phase umfasst die letzten fünf Tage vor der geschätzten Periode. Eisprung und PMS tragen sichtbar `Kann abweichen`.
- **nicht enthalten:** Kalender-Interaktion oder -Umbau, neue Kalender-Historie, geplante Perioden, KI, Diagnose, Verhütung, Schwangerschaft, Push-Erinnerungen, Änderungen an alter Luma.
- **Abnahmekriterien:**
  1. Die historische Eingabe ist verständlich, optional und ohne Druck; Unbekanntes wird nicht als Zahl gespeichert.
  2. Ohne Datenbasis bleibt der Kreis neutral und erfindet keinen Marker, keine persönliche Phase und keine Länge.
  3. Mit freiwilliger ungefährer Länge wird die Orientierung sichtbar als unsicher markiert.
  4. Mit mindestens vier echten Periodenanfängen nutzt Luma den Median echter Abstände und zeigt die Länge im Kreiszentrum.
  5. Der Heute-Marker folgt der bestätigten Phasenregel; nur bestätigte Einträge sind Periode.
  6. Der Kreis enthält keine Aussage zur nächsten Periode.
  7. Alle persönlichen Daten bleiben kontogebunden; bestehende Daten bleiben erhalten.
- **ein Prüfschritt für den Owner:** Eine Nutzerin ohne frühere Daten wählt `Ich weiß es nicht` und sieht den neutralen Kreis. Danach trägt sie freiwillig eine ungefähre Zykluslänge ein und sieht eine erste Orientierung mit `Kann abweichen`.

## Technischer Auftrag für Claude

Dieser Abschnitt beschreibt technische Leitplanken, aber keine unnötige Schritt-für-Schritt-Lösung.

### Bestätigte Ausgangslage im Code

- `src/app/neu/page.tsx` lädt kontogebunden Periodeneinträge und das bestehende Zyklusprofil, ruft `predictCycle` auf und rendert `NewPeriodHistoryOnboarding` oder `NewCycleExample`.
- `src/components/NewPeriodHistoryOnboarding.tsx` erfasst aktuell eine letzte Periode und erlaubt Überspringen.
- `src/components/NewCycleExample.tsx` rendert den SVG-Kreis, übernimmt `prediction` und zeigt derzeit im Kreis noch die nächste Periode.
- `src/lib/new-cycle-prediction.ts` enthält bereits die Start-Abstände, Medianfunktion, Profil-Fallback und Kalenderphasen. Der aktuelle Default-Fallback mit 28 Tagen darf keine persönliche Anzeige erzeugen.
- `src/lib/new-cycle-profile.ts`, `src/lib/new-cycle-profile-validation.ts`, `src/components/NewCycleProfileWizard.tsx` und `/api/neu/cycle-profile` bieten bereits das kontogebundene Feld `cycleLengthDays` mit einer Unbekannt-Option.
- `src/lib/new-periods.ts` und `/api/neu/periods` speichern echte Perioden kontogebunden.

### Technisches Ziel

- Ergänze den bestehenden Startweg so, dass nach der letzten Periode bis zu drei frühere Perioden freiwillig und verständlich ergänzt werden können. Fehlende Erinnerung darf nie zu einer erfundenen historischen Periode führen.
- Nutze die bestehende kontogebundene Profil-Schnittstelle oder einen gleichwertig sicheren vorhandenen Weg für die freiwillige ungefähre Zykluslänge. Keine Schemaänderung ist vorgesehen.
- Passe `predictCycle` oder teile passende reine Berechnungslogik aus: Ein persönlicher Median darf erst ab mindestens vier tatsächlichen Periodenanfängen berechnet werden. Verwende echte positive Start-Abstände; ungewöhnliche echte Abstände dürfen nicht still durch einen festen 28-Tage-Wert ersetzt werden.
- Eine freiwillige Profilangabe darf nur als Quelle `profile` bzw. erste Orientierung dienen. Der bisherige `default`-Fallback darf keinen persönlichen Kreis, Marker oder persönliche Phasen erzeugen.
- Passe SVG-Kreis und seine zugänglichen Texte an: Heute-Marker, Phasen und `Zyklus: X Tage` nur bei zulässiger Datenbasis; keine nächste Periode im Kreis. Die bestehende Ringgeometrie darf wiederverwendet oder sauber angepasst werden.
- Für berechnete Phasen gilt: bestätigte Periodentage haben Vorrang; mögliche Eisprungphase = drei Tage rund um den geschätzten Eisprung; mögliche PMS-Phase = die letzten fünf Tage vor der geschätzten Periode. Sie müssen als Schätzung erkennbar sein.
- Claude darf Komponenten und Berechnungslogik passend aufteilen, solange Verhalten und Invarianten bindend bleiben.

### Invarianten – müssen unverändert bleiben

- Nur `luma_core` und die neuen, kontogebundenen Luma-Daten verwenden; alte Luma und `app_luma` bleiben unverändert.
- Bestehende Perioden, Profile und Nutzerkonten nicht löschen oder still ändern.
- Keine synthetischen historischen Periodeneinträge speichern.
- Keine medizinische Diagnose, Fruchtbarkeits- oder Verhütungszusage. Mögliche Eisprungphase und PMS bleiben klar unsicher.
- Kalendernavigation, `Meine Periode aktualisieren` und die P/M/E-Erklärungen bleiben funktional unverändert; dieses Paket baut sie nicht um.
- Keine neue Datenbankmigration ohne Stopp und Rückfrage.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: vorhandene Tabellen `new_period_entries` und `new_cycle_baseline_profiles` wiederverwenden; keine neue Tabelle vorgesehen.
- betroffene API-Routen: vorhandene `/api/neu/periods`, `/api/neu/cycle-profile` und Onboarding-Statusroute wiederverwenden oder nur bei zwingendem Bedarf minimal ergänzen.
- Migration nötig: nein.

### Pflichtprüfungen

- Reine Berechnungs-Unit-Tests: kein persönlicher Kreis aus dem Default; neutral ohne Daten; Profil-Orientierung klar unsicher; Median erst ab vier Periodenanfängen; Median mit variierenden echten Abständen; bestätigte Periodentage haben Vorrang.
- Phasen-Unit-Tests: dreitägige mögliche Eisprungphase, fünf PMS-Tage und `Kann abweichen` für geschätzte Phasen.
- Bestehende Auth-, Profil-, Perioden- und Kontentrennungsregressionen ausführen und anpassen.
- Sichtprüfung mobil: optionale Eingabe leicht verständlich, `Ich weiß es nicht`, neutraler Fallback, Profil-Orientierung, Median-Kreis und kein horizontaler Überlauf.
- Produktions-Build und Entwicklungsledger-Validierung ausführen.

### Stoppbedingungen

- Stoppe und dokumentiere, wenn eine Migration, neue sensible Datenart oder ein nicht bestätigter medizinischer Schluss nötig würde.
- Stoppe, wenn der vorhandene Datenweg die Trennung zwischen tatsächlicher Periode, freiwilliger ungefährer Länge und Schätzung nicht sicher abbilden kann.
- Keine automatische Aktivierung einer persönlichen Zyklusphase aus einem festen 28-Tage-Default.
- Wenn die genannten Startpunkte nicht mehr stimmen, darf Claude passende Stellen suchen; Wirkung und Invarianten bleiben bindend.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergänzen.
- `node scripts/work-package-state.mjs mark-updated WP-002` ausführen.
- `node scripts/work-package-state.mjs validate` muss bestehen.

## Ist – von Claude

- umgesetzt:
- nicht umgesetzt:
- Tests:
- Abweichungen:
- offene Punkte:
- Commit:

## Soll-Ist-Prüfung – von Codex

- Ergebnis: ausstehend
- Nachschärfung:
- Product-Map aktualisiert: nein
