---
id: WP-024
title: "Aufgeräumte Zyklusübersicht für Nutzerin und Partner"
status: completed
created: 2026-10-20
updated: 2026-10-21
owner_approved: yes
executor: anthropic-claude
product_area: "Neue Luma – Zyklusübersicht für Nutzerin und Partner"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Aufgeräumte Zyklusübersicht für Nutzerin und Partner

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Nutzerin und freigeschalteter Partner sehen dieselbe ruhige Zyklusübersicht: den bekannten Ring mit genau einer klaren Hauptaussage sowie eine kompakte Infokarte mit den wichtigsten, vorsichtig formulierten Angaben.
- **Warum machen wir das?** Die Zyklusübersicht soll schneller verständlich sein und weniger konkurrierende Texte zeigen. Gleichzeitig sollen Prognosen klar als unsicher erkennbar bleiben.
- **Wo ist es in der App?** Auf der fertigen Nutzerinnen-Startseite `/neu` und in der verbundenen, nur lesbaren Partneransicht `/neu/partner`.
- **Was gehört ausdrücklich nicht dazu?** Keine neue Zyklusberechnung, keine neue Prognose, keine Datenmodell- oder Migrationsänderung, keine Bearbeitungsfunktion für den Partner und keine Änderung an Kalender, Historie, Eingaben, Benachrichtigungen oder Verbindungstechnik.
- **Was kann die Ownerin danach ausprobieren?** Sie vergleicht `/neu` und `/neu/partner`, schaltet die Ringfreigabe ein und aus und prüft eine laufende Periode, einen Tag außerhalb der Periode und einen Zustand ohne ausreichende Daten.

## Entstehungsweg

`Zyklusübersicht enthält mehrere konkurrierende Aussagen → wichtigste Aussage im Ring bündeln → wenige verlässliche Zusatzinformationen in eine Karte verschieben → Nutzerin und freigeschalteter Partner sehen dieselbe ruhige Darstellung → WP-024`

- bestätigtes Problem: Die erste Zyklusaussage ist nicht sofort klar genug erfassbar.
- bestätigte Wirkung: Eine Hauptaussage steht im Mittelpunkt; Zusatzinformationen sind knapp, einheitlich und Prognosen sichtbar unsicher.
- gewählte Lösung: Gemeinsame Darstellung für Nutzerin und Partner mit Ring plus kompakter Infokarte, gespeist aus derselben bestehenden Berechnungslogik.
- wichtige Sicherheitsentscheidung: Partnerdaten werden serverseitig nur bei aktiver Verbindung und aktivierter Einstellung `Zyklus-Kreis für Partner freigeben` geladen und gerendert.
- Quellen: Owner-Auftrag vom 2026-10-20, WP-002, WP-004, WP-006, WP-015, WP-023.

## Soll – von Codex

- **Problem:** Der bestehende Ring und die heutige Infokarte verteilen die wichtigsten Aussagen auf mehrere Textbereiche; die Partneransicht ist optisch und hinsichtlich der Ringfreigabe nicht mehr deckungsgleich mit dem bestätigten Ziel.
- **gewünschte Wirkung:** Nutzerin und berechtigter Partner verstehen den aktuellen Zykluszustand sofort, sehen dieselben vorsichtig formulierten Daten und erhalten keine nicht freigegebenen Informationen.
- **sichtbare Änderung:** Im Ring steht genau eine Hauptaussage. Daneben beziehungsweise mobil direkt darunter steht eine kompakte Infokarte. Segmentfarben und Heute-Marker des Rings bleiben bestehen.
- **nicht enthalten:** Keine neue Fachlogik, keine neue Berechnung, keine Kalenderänderung, keine Historien-/Eingabeänderung, keine Benachrichtigungsänderung, keine neue Partnerbearbeitung, keine neue Tabelle/Spalte/Migration und kein Deployment.
- **Abnahmekriterien:**
  1. Bei laufender tatsächlicher Periode steht im Ringzentrum ausschließlich `N. Periodentag`; außerhalb einer laufenden Periode ausschließlich `N Tage bis zur nächsten Periode`.
  2. Bei nicht ausreichenden Daten bleibt der bestehende sichere Leer-/Hinweiszustand erhalten. Es wird weder eine Tageszahl noch eine Prognose erfunden.
  3. Ringsegmente, bestehende Segmentfarben, Ringgeometrie und Heute-Marker bleiben fachlich unverändert.
  4. Die Infokarte zeigt nur: aktuelle Phase; `Nächste Periode: ca. [Datum] · Kann abweichen`; während einer laufenden Periode zusätzlich `Voraussichtliches Ende: ca. [Datum] · Kann abweichen`; individuelle Zykluslänge nur bei bereits verlässlich vorhandenem Wert.
  5. Kein prognostiziertes Datum wird sprachlich oder zugänglich als sicher dargestellt.
  6. Breit stehen Ring links und Infokarte rechts. Mobil steht der Ring zuerst und die Karte direkt darunter; kein horizontaler Überlauf.
  7. Der Partner erhält dieselbe nur-lesbare Ring-/Infokarten-Darstellung und dieselben freigegebenen Werte wie die Nutzerin, ausschließlich bei aktiver Verbindung und aktivierter Ringfreigabe.
  8. Bei ausgeschalteter Freigabe oder beendeter Verbindung erscheinen Ring, Infokarte und deren Daten weder sichtbar noch versteckt im HTML, in Server-Props oder in einer API-Antwort.
  9. Der Partner kann keine Zyklusangabe bearbeiten. Bestehende Owner-Eingaben, Kalender, Historie, Benachrichtigungen und übrige Berechtigungen funktionieren unverändert.
- **ein Prüfschritt für den Owner:** `/neu` und anschließend `/neu/partner` mobil und breit vergleichen; Ringfreigabe aus- und einschalten und prüfen, dass die Partnerübersicht vollständig verschwindet beziehungsweise identisch nur lesbar erscheint.

## Technischer Auftrag für Claude

### Bestätigte Ausgangslage im Code

- `src/components/CyclePersonalRing.tsx` rendert die gemeinsame Ringgeometrie, Segmentfarben und den Heute-Marker für Nutzerin und Partner. Sein heutiger Mittelpunkt enthält mehr als die künftig erlaubte eine Hauptaussage.
- `src/components/NewCycleExample.tsx` enthält die Owner-Übersicht mit `TodayCard`, `CyclePersonalRing` und allen bestehenden Kalender-/Eingabeinteraktionen.
- `src/components/NewPartnerCycleRing.tsx` verwendet bereits `CyclePersonalRing`, besitzt aber eine eigene umgebende Darstellung.
- `src/lib/personal-cycle-view.ts`, `src/lib/new-cycle-prediction.ts` und `src/lib/next-period-countdown.ts` enthalten die vorhandenen zentralen Ableitungen. Diese bleiben die einzigen fachlichen Quellen.
- `src/lib/new-partner-cycle-view.ts` nutzt bereits `computePersonalCycleView`, lädt aktuell aber allein bei aktiver Verbindung. Die frühere Spalte `new_partner_connections.cycle_ring_shared` ist im Datenmodell noch vorhanden, wird nach WP-004 Version 11 jedoch bewusst nicht mehr gelesen.
- Der frühere sichtbare Schalter und seine Schreibroute wurden entfernt. Für das bestätigte Soll muss die vorhandene Spalte ohne Migration wieder als enges serverseitiges Ring-/Infokarten-Gate aktiviert und der Owner-Schalter wieder bereitgestellt werden.
- Der Partnerkalender bleibt außerhalb dieses Pakets. Ausschalten der Ringfreigabe entfernt nur Ring und neue Infokarte, nicht andere bereits unabhängig freigegebene Partnerbereiche.

### Technisches Ziel

- Schaffe eine gemeinsame, rein darstellende Zyklusübersicht beziehungsweise gemeinsame Präsentationsdaten, die Owner und Partner aus denselben bereits berechneten Werten speisen. Keine zweite Phasen-, Datums- oder Prognoselogik in Komponenten oder Partnercode.
- Reduziere das Zentrum von `CyclePersonalRing` auf genau eine zustandsabhängige Aussage:
  - laufende bestätigte Periode und sicherer Periodentag: `N. Periodentag`;
  - sonst nur bei vorhandener sicher nutzbarer bestehender Vorhersage: `N Tage bis zur nächsten Periode`;
  - bei `no_data` der bereits vorhandene sichere Hinweiszustand ohne erfundene Zahl.
- Der Countdown muss die vorhandene `daysUntilNextPeriod()`-Ableitung beziehungsweise eine daraus zentral abgeleitete Präsentation verwenden. Keine Datumsrechnung im JSX.
- Ersetze die bisherige konkurrierende Owner-`TodayCard` im oberen Zyklusbereich durch eine kompakte gemeinsame Infokarte. Sie erhält nur bereits vorhandene, server-/fachlogisch abgeleitete Werte und formatiert keine Unsicherheit weg.
- Verwende für `aktuelle Phase` die bestehende `PersonalCycleView.todayPhase`-/Laufend-Information. Erfinde bei unbekanntem Zustand keine Phase.
- Verwende für `Nächste Periode` ausschließlich die vorhandene `CyclePrediction.nextPeriodStart`. Zeige die Zeile nur, wenn sie nach den bestehenden Sicherheitsregeln verfügbar ist, und immer mit `ca.` sowie `Kann abweichen`.
- Verwende für `Voraussichtliches Ende` ausschließlich das bereits gespeicherte `expectedEndDate` einer laufenden tatsächlichen Periode. Zeige die Zeile nur, wenn der Wert vorhanden ist, und immer mit `ca.` sowie `Kann abweichen`.
- Zeige die individuelle Zykluslänge nur aus einem bereits verlässlich abgeleiteten Wert des bestehenden persönlichen Views beziehungsweise der bestehenden Prediction. Default-/Profil-Schätzwerte dürfen nicht als verlässliche individuelle Zykluslänge ausgegeben werden.
- Richte die gemeinsame Übersicht responsiv aus: ab geeignetem Breakpoint Ring links und Karte rechts; darunter Ring zuerst und Karte direkt danach. Bestehende Touchflächen und Owner-Mobilnavigation bleiben erreichbar.

### Partnerfreigabe und serverseitiger Schutz

- Reaktiviere die vorhandene Spalte `cycle_ring_shared` als alleinige explizite Freigabe für Ring plus Infokarte. Keine Migration und keine neue Spalte.
- Stelle auf `/neu/einstellungen` bei aktiver Verbindung wieder den klar benannten Schalter `Zyklus-Kreis für Partner freigeben` bereit. Standard/gespeicherter Wert kommt ausschließlich aus der bestehenden Spalte; keine stillschweigende Freigabe.
- Der Schreibweg muss Owner-Sitzung, aktive Verbindung, erlaubten Ursprung und gültigen Boolean serverseitig prüfen. Partner dürfen diesen Wert nie ändern.
- `getPartnerCycleView()` muss aktive Verbindung und `cycle_ring_shared = TRUE` in derselben serverseitigen Abfrage prüfen, bevor Owner-Zyklusdaten geladen werden. Bei fehlender Freigabe oder beendeter Verbindung sofort `null`; kein nachträgliches Ausblenden bereits geladener Daten.
- `/neu/partner` rendert Ring und Infokarte nur aus dem nicht-null Partner-View. Nicht freigegebene Daten dürfen nicht serialisiert, in verstecktem Markup gehalten oder über eine Route ausgeliefert werden.
- Die Partnerdarstellung bleibt vollständig read-only: keine Buttons, Formulare oder Mutationen für Zyklusdaten.
- Bestehende Partnerkalender-, Benachrichtigungs- und Verbindungsbereiche bleiben unverändert und behalten ihre eigenen bestehenden Gates.

### Invarianten – müssen unverändert bleiben

- `predictCycle`, `computePersonalCycleView`, manuelles PMS, Periodenstatusprioritäten, Ringsegment-Geometrie, Segmentfarben, Heute-Marker und zentrale Datumswerte bleiben unverändert.
- Keine neue Berechnung für Periode, PMS, Eisprung, Fruchtbarkeit, nächste Periode, erwartetes Ende oder Zykluslänge.
- Keine Änderung an Owner-Eingabewegen, Kalender, Tagesfenster, Periodenübersicht, Historie, Onboarding, Authentifizierung, Verbindungscode oder Benachrichtigungen.
- Keine Änderung an alter Luma oder `app_luma`.
- Keine neuen Abhängigkeiten und kein globales CSS.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: Nutzung der bereits vorhandenen Spalte `new_partner_connections.cycle_ring_shared`; keine Schemaänderung und keine Migration.
- Voraussichtlich betroffene Serverstellen: Owner-Statusabfrage und enger Setter für die Ringfreigabe in `src/lib/new-partner.ts`, eine authentifizierte Owner-Route unter `src/app/api/neu/partner/`, sowie das serverseitige Gate in `src/lib/new-partner-cycle-view.ts`.
- Voraussichtlich betroffene UI-Stellen: `src/components/CyclePersonalRing.tsx`, Owner-Übersicht in `src/components/NewCycleExample.tsx`, `src/components/NewPartnerCycleRing.tsx`, `/neu/partner`, `/neu/einstellungen` und eine kleine wiederverwendete Infokarten-/Übersichtskomponente.
- API-Ausgabe: keine Rohperioden, IDs, Namen, E-Mails oder Profilobjekte neu an den Client geben; nur die für die freigegebene Darstellung minimal nötigen abgeleiteten Werte.

### Pflichtprüfungen

- Gezielte Tests für Ringzentrum und Infokarte:
  - laufende tatsächliche Periode mit sicherem Periodentag;
  - Tag außerhalb einer Periode mit vorhandener nächster Prognose;
  - fehlende/nicht ausreichende Daten ohne erfundene Aussage;
  - erwartetes Ende vorhanden/nicht vorhanden;
  - verlässliche Zykluslänge vorhanden/nicht vorhanden;
  - alle Prognosezeilen sichtbar als `ca.` und `Kann abweichen`.
- Partner-Sicherheitstests gegen die lokale Testdatenbank:
  - aktive Verbindung + Freigabe aus: View `null`, keine Owner-Daten im gerenderten Output;
  - aktive Verbindung + Freigabe ein: exakt dieselben freigegebenen Präsentationswerte wie beim Owner;
  - Freigabe widerrufen: unmittelbar keine Ring-/Kartendaten mehr;
  - Verbindung beendet: unmittelbar keine Ring-/Kartendaten mehr;
  - fremdes Konto und Partner-Schreibversuch bleiben abgewiesen;
  - Setter akzeptiert nur den verbundenen Owner und gültige Eingaben.
- Read-only-Quelltextprüfung für die Partnerkomponenten: keine Zyklus-Mutation, kein Bearbeitungsformular, kein direkter Zugriff auf Owner-Rohdaten.
- Responsive Sichtprüfung mit realen lokalen Testkonten bei 360/390 px und 1280 px: mobil Ring vor Karte, breit Ring links/Karte rechts, kein horizontaler Überlauf; Owner und freigeschalteter Partner inhaltlich gleich.
- Bestehende gezielte Regressionen für Ringgeometrie/Marker, Owner-Home, Partneransicht, Kalender, Periodenaktionen, Einstellungen, Verbindung und Benachrichtigungen.
- `npx tsc --noEmit` und `npm run build`.
- Testkonten und Testverbindungen anschließend vollständig entfernen; keine Produktionsdaten und kein Deployment.

### Stoppbedingungen

- Stoppe vor jeder neuen Zyklus-, Phasen-, Datums- oder Prognoselogik.
- Stoppe vor einer Datenmodelländerung oder Migration; `cycle_ring_shared` muss im Zielstand vorhanden und sicher nutzbar sein.
- Stoppe, wenn Owner und Partner nicht aus derselben zentralen Präsentations-/Berechnungsquelle gespeist werden können.
- Stoppe, wenn bei Freigabe aus oder nach Verbindungsende Ring-/Infokartendaten noch im HTML, in Props oder einer API-Antwort nachweisbar sind.
- Stoppe vor jeder Änderung am Partnerkalender oder an anderen Freigaben, die über Ring plus Infokarte hinausgeht.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger für das abgeschlossene Arbeitspaket ergänzen.
- `node scripts/work-package-state.mjs mark-updated WP-024` und `node scripts/work-package-state.mjs validate` ausführen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein manuelles Deployment.

## Ist – von Claude

- umgesetzt: Gemeinsame Präsentationsableitung und gemeinsame responsive Ring-/Infokarten-Komponente für Owner und Partner. Das Ringzentrum zeigt nur Periodentag, Countdown oder den sicheren Leerzustand. Die Karte zeigt Phase, vorsichtig markierte Datumsprognosen und nur bei persönlichem Status die individuelle Zykluslänge. Die vorhandene `cycle_ring_shared`-Spalte ist ohne Migration wieder serverseitiges Gate; Owner-Schalter und eng geprüfte Route sind reaktiviert. Partner bleibt read-only.
- nicht umgesetzt: Keine neue Berechnung, Migration, Tabellen-/Spaltenänderung, Kalender-, Historien-, Eingabe-, Benachrichtigungs- oder Deploymentänderung.
- Tests: Neue Präsentationsprüfung bestanden; echter lokaler Datenbanktest für Freigabe aus/ein, Kontotrennung, no_data und Verbindungswiderruf bestanden; Partner-Gate-/Route-/Read-only-Strukturprüfung bestanden; Ringgeometrie, SVG-IDs, Heute-Marker, manueller PMS-Marker, Kalenderbänder, Popover, Tagesfenster, Mobilnavigation und Partnerkalender-Regressionsbereiche bestanden; `npx tsc --noEmit` und `npm run build` bestanden. Browser-Sichtprüfung mit zwei echten temporären lokalen Testkonten bei 360, 390 und 1280 Pixeln bestanden: Owner und Partner zeigen dieselben Zykluswerte, mobil gestapelt, breit zweispaltig, ohne horizontalen Überlauf; Testdaten danach vollständig gelöscht.
- Abweichungen: Mehrere alte Quelltexttests erwarten ausdrücklich die durch WP-024 ersetzte TodayCard beziehungsweise das WP-004-V11-Modell ohne Ringfreigabe und sind daher nicht mehr als Abnahme des neuen Solls verwendbar. Die betroffenen Sicherheits-/Darstellungsannahmen wurden in neuen beziehungsweise gezielt aktualisierten Tests geprüft.
- offene Punkte: Owner-Sichtprüfung steht aus.
- Commit: ausstehend.

### Korrektur vor Owner-Abnahme – 2026-10-20

- Owner-Präzisierung: Auf breiten Ansichten steht der Zyklus-Kreis links und der vorhandene erklärende/statusbezogene Textbereich rechts daneben. Der Textbereich ist keine zusätzliche Karte und erhält keine eigene Kartenfläche, Umrandung oder Schatten.
- Mobil bleiben Ring und Textbereich untereinander und ohne horizontalen Überlauf.
- Die reduzierte Mittel-Aussage, Inhalte, gemeinsame Owner-/Partner-Darstellung und das serverseitige Partner-Gate bleiben unverändert.

### Präzisierung der Korrektur – 2026-10-20

- Breit ist der Ring ausdrücklich kompakt und belegt keine halbe beziehungsweise dominante Breite. Er steht in einer festen kleinen linken Spalte; die einfache Status-Textspalte steht direkt rechts daneben und ist vertikal mittig ausgerichtet.
- Die Textspalte verwendet die bereits vorhandenen konkreten Statusinformationen in klarer Form, darunter die aktuelle Phase, die nächste Periode beziehungsweise das voraussichtliche Ende und `Zyklus: N Tage`, sofern verlässlich vorhanden.
- Mobil steht derselbe kompakte Ring oben und exakt dieselbe Textspalte direkt darunter. Keine zusätzliche Karte, kein Rahmen und kein Schatten.

### Verbindliche mobile Korrektur – 2026-10-20

- Die zuvor dokumentierte mobile Stapelung ist aufgehoben. Desktop und Mobil verwenden dieselbe horizontale Grundordnung: kompakter Ring links, Status-Textspalte rechts.
- Bei 360/390 Pixeln nutzt der Ring eine begrenzte linke Spalte; die rechte Spalte darf Texte sinnvoll umbrechen und verwendet eine angepasste, weiterhin lesbare Schriftgröße. Die Seite darf nicht horizontal überlaufen.
- Die lange Countdown-Aussage darf innerhalb des Rings auf zwei Zeilen umbrechen, bleibt aber genau eine Hauptaussage.
- Diese Vorgabe gilt identisch für Owner und freigegebenen read-only Partner. Gate, Daten und Berechnung bleiben unverändert.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: erfüllt. Die gemeinsame Ring-/Textdarstellung verwendet dieselben bestehenden abgeleiteten Zykluswerte für Owner und nur bei aktiver serverseitiger Freigabe für den Partner. Die Owner-Abnahme liegt vor.
- Nachschärfung: Die aktuelle Phasenbeschriftung wurde weiter beruhigt: nur die aktuelle Phase wird am Ring benannt; die drei Phasen stehen zusätzlich als kleine Farblegende in der rechten Textspalte. Die abschließende Korrektur hält alle drei möglichen Ringbeschriftungen innerhalb ihres jeweiligen farbigen Segments.
- Product-Map aktualisiert: ausstehend, weil dort bereits unabhängige uncommittete Änderungen vorliegen; diese wurden nicht überschrieben.

## Ist Korrektur Ring-Beschriftung und Farb-Legende – von Claude

- Auftrag (Owner): Die Beschriftungen „PMS“, „Periode“ und „Eisprung“ sollen nicht mehr verteilt auf dem Ring stehen; nur die aktuelle Phase wird klar lesbar hervorgehoben, die drei Phasen erscheinen als kleine Farb-Legende in der rechten Textspalte (dunkelrot Periode, rosa PMS, lila Eisprung). Nur Darstellung.
- umgesetzt:
  - `src/components/CyclePersonalRing.tsx`: Es wird nur noch das Label des Segments der aktuellen Phase gezeichnet (laufende Periode bzw. Phase Periode → Periode; manuelles PMS oder Phase PMS → PMS; Eisprung- oder fruchtbare Phase → Eisprung-Segment). Die Zuordnung leitet sich nur aus bereits berechneten Werten (`isRunning`, `todayPhase`, `manualPmsOverride`) ab. Ohne aktuelle Phase steht keine Beschriftung am Ring. Die Schrift der kompakten Darstellung ist von 16 auf 20 vergrößert, damit das einzelne Label auch mobil gut lesbar ist. Segmente, Farben, Geometrie, Heute-Marker, Ringmitte und IDs sind unverändert.
  - `src/components/CycleOverviewPanel.tsx`: kleine Legende (`data-cycle-phase-legend`) unter den Texten der rechten Spalte mit drei Farbpunkten in den Ringfarben (`#7d1245`, `#f395b3`, `#b69bdf`) für Periode, PMS, Eisprung. Sie erscheint nur, wenn der Ring persönliche Segmente zeigt (nicht bei `no_data`). Das Panel wird in Owner- und Partneransicht verwendet; die Legende erscheint damit auch für den freigegebenen Partner, enthält aber keine Daten.
  - Keine Änderung an Zyklusberechnung, Daten, Partnerfreigabe, Datenschutz, Routen, Schalter oder Migration.
- Tests: neues Skript `scripts/verify-cycle-ring-phase-legend.ts` (12 Prüfungen: pro Phase nur das passende Ring-Label, kein Label ohne Phase, gleiche Segmentzahl, Legende mit den drei Farben in der Reihenfolge Periode/PMS/Eisprung, keine Legende bei `no_data`) bestanden. `verify-cycle-overview-wp024.ts`, `verify-cycle-ring-svg-ids.ts`, `verify-cycle-ring-marker-reverted.ts`, `verify-manual-pms-ring-marker.ts`, `verify-partner-fixed-view.ts` bestehen. `npx tsc --noEmit` und `npm run build` bestehen. `verify-mobile-home-compact.ts` (14 Fehlschläge) und `verify-calendar-tile-band.ts` (2 Fehlschläge) schlagen bereits auf dem Stand vor dieser Korrektur fehl (per `git stash` belegt, Ursache: frühere WP-024-Umbauten) und wurden nicht verändert.
- Sichtprüfung (lokale Testkonten, Dev-Modus; Partnerfreigabe aktiv, einmal ohne aktuelle Phase, einmal mit manuellem PMS heute): Owner und Partner bei 390 und 1280 px: ohne aktuelle Phase kein Ring-Label, mit PMS genau ein Label „PMS“ am rosa Segment, Legende mit drei Einträgen in der Textspalte, kein horizontaler Überlauf, Partneransicht rein lesend. Testkonten nur in der lokalen DB, Playwright wieder entfernt, `package.json`/`package-lock.json` ohne Diff.
- Abweichungen: keine. Offene Punkte: keine. Kein Deployment.
