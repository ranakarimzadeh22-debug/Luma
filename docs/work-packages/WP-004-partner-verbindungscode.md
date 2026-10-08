---
id: WP-004
title: "Sichere Partnerverbindung mit persönlichem Code"
package_revision: 13
status: completed
created: 2026-09-10
updated: 2026-10-09
owner_approved: yes
executor: claude
product_area: "Alte und neue Luma – Partnerverbindung"
brief_version: 1
technical_brief: complete
migration_approval: approved_2026-09-10
---

## Version 10 - Partneransicht ohne grosse Statuskarte

### Owner-Ansicht - einfach erklaert

- Kurz gesagt: Nach einer aktiven Verbindung sieht der Partner direkt den freigegebenen Zyklus-Kreis und den Kalender.
- Die grosse Anzeige Verbindung aktiv verschwindet vollstaendig.
- Die Buttons Verbindung beenden und Abmelden verschwinden ebenfalls aus der Partneransicht.
- Kreis, Kalender und die vorhandene neutrale Meldung bei fehlender Freigabe bleiben unveraendert.

### Soll - von Codex

- Im verbundenen Zustand von /neu/partner erscheint kein grosser Statusbereich mit Verbindung aktiv.
- Im verbundenen Zustand erscheinen weder Verbindung beenden noch Abmelden.
- Der Partner sieht zuerst nur die bereits erlaubten Inhalte: Zyklus-Kreis bei Kreisfreigabe und Kalender bei Kalenderfreigabe.
- Ohne Kalenderfreigabe bleibt die neutrale Meldung Keine freigegebene Information sichtbar.
- Die nicht verbundene Ansicht mit Verbindungscode eingeben, Registrierung und Anmeldung bleibt unveraendert.
- Die Eigentuemerin kann die Verbindung weiterhin in ihrem eigenen Bereich verwalten. Diese Version fuegt keine neue Partneraktion hinzu.

### Nicht enthalten

- Keine Aenderung an Verbindungscode, Sitzung, Widerruf, Freigaben, Periodendaten, Kreis, Kalender, Benachrichtigungs-Auswahl oder alter Luma.
- Keine neue Route, Migration oder Datenbankaenderung.

### Abnahmekriterien

1. Ein verbundener Partner sieht keinen Text Verbindung aktiv.
2. Ein verbundener Partner sieht weder Verbindung beenden noch Abmelden.
3. Zyklus-Kreis, Kalender und die neutrale Freigabe-Meldung funktionieren in ihren bisherigen Freigabe-Zustaenden weiter.
4. Ein nicht verbundener Partner sieht weiterhin den bestehenden Code-Eingabeweg.
5. Die mobile Ansicht bleibt ohne horizontalen Ueberlauf.

### Technischer Auftrag fuer Claude - Version 10

#### Bestaetigte Ausgangslage im Code

- src/app/neu/partner/page.tsx rendert im verbundenen Zustand derzeit den Kopf Fuer meinen Partner / meine Partnerin mit Verbindung aktiv, NewPartnerEndButton und NewLogoutButton.
- Derselbe Bereich rendert bereits NewPartnerCycleRing, NewPartnerCalendar, die neutrale Freigabe-Meldung und NewPartnerNotificationPreference.
- Die Verbindung, Freigaben und Datenzugriffe werden serverseitig vor dem Rendern ueber die bestehenden Helfer geprueft.

#### Technisches Ziel

- Entferne im verbundenen Zustand ausschliesslich den grossen Kopf mit Verbindung aktiv sowie NewPartnerEndButton und NewLogoutButton aus src/app/neu/partner/page.tsx.
- Behalte den Code-Eingabeweg im nicht verbundenen Zustand unveraendert.
- Kreis, Kalender, neutrale Meldung und Benachrichtigungs-Auswahl bleiben an ihrer bisherigen Logik; keine Freigabe oder Datenableitung darf sich veraendern.
- Entferne nur dadurch unbenutzte Imports. Keine Komponenten, Routen oder Datenmodelle loeschen, wenn sie ausserhalb dieser Ansicht noch bestehen oder als spaetere Option erhalten bleiben sollen.

#### Daten, Schnittstellen und Migrationen

- Migration noetig: nein.
- Keine API- oder Datenwirkung.

#### Invarianten

- Partnerzugriff bleibt rein lesend und serverseitig freigabegeprueft.
- Die Eigentuemerin kann die Verbindung weiterhin im eigenen Bereich beenden.
- Keine automatische Abmeldung, kein Verbindungswiderruf und keine Aenderung gespeicherter Daten.

#### Pflichtpruefungen

- Pruefe verbundenen Zustand mit allen vier Kombinationen aus Kreis- und Kalenderfreigabe: Keine Statuskarte oder entfernte Buttons; nur erlaubte Inhalte erscheinen.
- Pruefe nicht verbundenen Zustand: Code-Eingabeweg bleibt sichtbar.
- Pruefe, dass keine schreibende Partneraktion entsteht und die neutrale Meldung bei fehlender Freigabe erhalten bleibt.
- Fuehre TypeScript, gezielte Partneransicht-Pruefung, mobile Sichtpruefung und Produktions-Build aus.

#### Stoppbedingungen

- Stoppe vor einer Aenderung an Verbindung, Abmeldung, Freigaben, Datenbank, alter Luma oder einer neuen Partner-Einstellung.
- Stoppe, wenn das Entfernen der Anzeige den Code-Eingabeweg oder die serverseitige Zugriffskontrolle beeinflusst.

#### Abschluss durch Claude

- Ergaenze Ist Version 10, Tests, Abweichungen und offene Punkte sichtbar.
- Setze WP-004 nach Abschluss auf review.
- Ergaenze den Entwicklungsledger, fuehre node scripts/work-package-state.mjs mark-updated WP-004 und danach node scripts/work-package-state.mjs validate aus.
- Committe und pushe ausschliesslich auftragsbezogene Dateien. Kein manuelles Deployment.

### Ist Version 10 – von Claude

- **Umgesetzt:**
  - `src/app/neu/partner/page.tsx`: Der verbundene Zustand ist jetzt ein eigener früher Rückgabepfad (`if (status.connected) { return (...) }`), getrennt vom nicht verbundenen Zustand. Im verbundenen Pfad wurden der Kopfbereich mit `Für meinen Partner / meine Partnerin` und `Verbindung aktiv` sowie `NewPartnerEndButton` und `NewLogoutButton` vollständig entfernt. Der Partner sieht dort direkt und ausschließlich die bereits erlaubten Inhalte in unveränderter Reihenfolge: `NewPartnerCycleRing` bei Kreisfreigabe, danach `NewPartnerCalendar` bei Kalenderfreigabe bzw. unverändert die neutrale Meldung `Keine freigegebene Information.` ohne Kalenderfreigabe, danach `NewPartnerNotificationPreference`.
  - Der nicht verbundene Zustand (`Verbindungscode eingeben`, `NewPartnerRedeemForm`, `NewLogoutButton`) sowie der nicht angemeldete Zustand (`Erst ein eigenes Konto`) wurden unverändert belassen.
  - Keine Freigabe- oder Datenableitung wurde verändert: `getPartnerCalendarView`, `getPartnerCycleView`, `getPartnerConnectionStatusForPartner` und `getPartnerNotificationPreference` werden unverändert und mit denselben Parametern aufgerufen wie zuvor.
  - Unbenutzten Import `NewPartnerEndButton` aus `src/app/neu/partner/page.tsx` entfernt, da die Komponente in dieser Datei nicht mehr eingebunden wird. Die Komponente selbst (`src/components/NewPartnerEndButton.tsx`) wurde nicht gelöscht, wie im Auftrag gefordert.
  - **Beobachtung außerhalb des Auftragsumfangs, nicht behoben:** `NewPartnerEndButton` ruft `POST /api/neu/partner/end` auf, das serverseitig nach `owner_user_id = session.userId` filtert (`endPartnerConnection` in `src/lib/new-partner.ts`). War der Button bisher auf der Partner-Seite sichtbar, hätte ein Klick durch den Partner (dessen `session.userId` die `partner_user_id`, nicht die `owner_user_id` ist) ohnehin nie eine Zeile betroffen und die Verbindung still nicht beendet. Die Eigentümerin konnte und kann die Verbindung weiterhin über `NewPartnerCodeCard` in `/neu/einstellungen` beenden (eigene, unabhängige Implementierung mit derselben Route, aber korrekt mit der eigenen `ownerUserId`). Diese vorbestehende, durch das Entfernen des Buttons nun gegenstandslose Inkonsistenz wird hier nur dokumentiert, nicht repariert, da außerhalb des WP-004-Version-10-Auftragsumfangs.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - Neues `scripts/verify-partner-view-no-status-card.ts`: Quelltext-Prüfungen bestätigen, dass der verbundene Rückgabepfad weder `Verbindung aktiv` noch `NewPartnerEndButton` noch `NewLogoutButton` enthält, aber `NewPartnerCycleRing`, `NewPartnerCalendar`, die neutrale Meldung und `NewPartnerNotificationPreference` weiterhin enthält; dass der nicht verbundene Pfad weiterhin `Verbindungscode eingeben`, `NewPartnerRedeemForm` und `NewLogoutButton` enthält; dass die Seite selbst keinen schreibenden Partner-API-Aufruf auslöst und die bestehenden freigabegeprüften Lade-Funktionen unverändert genutzt werden; dass `NewPartnerEndButton.tsx` als Datei weiterhin besteht. Alle Prüfungen bestanden.
  - Bestehende Regressionen erneut ausgeführt: `scripts/verify-partner-calendar.mts`, `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-partner-estimated-period.mts`, `scripts/verify-partner-new.mts`, `scripts/verify-partner-old.mts`, `scripts/verify-partner-notification-preference.mts` — alle grün.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, Routenliste unverändert (keine neue Route, wie im Auftrag vorgesehen).
  - Mobile und breite Sichtprüfung mit Playwright (Chromium, temporär installiert und danach vollständig entfernt) gegen den lokalen Dev-Server mit zwei echten, verbundenen Testkonten (Owner + Partner): nicht verbundener Zustand (mobil) zeigt weiterhin `Verbindungscode eingeben` und `Abmelden`. Alle vier Kombinationen aus Kreis-/Kalenderfreigabe im verbundenen Zustand geprüft (Kreis aus/Kalender aus, Kreis an/Kalender aus, Kreis an/Kalender an, Kreis aus/Kalender an) – in jeder Kombination fehlen `Verbindung aktiv`, `Verbindung beenden` und `Abmelden` vollständig, während genau die laut Freigabe erlaubten Inhalte (Zyklus-Kreis, Kalender, neutrale Meldung) korrekt erscheinen bzw. fehlen. Kein horizontaler Überlauf in keiner der geprüften Kombinationen (mobil 375×812 und breit 1280×900). Playwright und beide Testkonten (inkl. Verbindung, Code und Perioden) danach vollständig entfernt.
- **Abweichungen:** keine fachliche Abweichung.
  - Der bereits bekannte, vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) sowie der vorbestehende Gradient-Fundstellen-Defekt in `scripts/verify-personal-cycle-view.ts` (seit WP-004 Version 6) bestehen unverändert fort und waren für diese Version nicht im Umfang.
- **offene Punkte:**
  - Owner-Prüfschritt steht aus: als verbundener Partner `/neu/partner` öffnen und bestätigen, dass kein Statustext und keine der beiden entfernten Schaltflächen mehr erscheinen, während Zyklus-Kreis/Kalender/neutrale Meldung weiterhin wie gewohnt funktionieren; als nicht verbundener Partner den unveränderten Code-Eingabeweg bestätigen; mobil auf fehlenden horizontalen Überlauf prüfen.
  - Die oben genannten, vorbestehenden Testdefekte sollten weiterhin in eigenen, dafür vorgesehenen Paketen behoben werden.
  - Kein Deploy ausgelöst – wie beauftragt.
- **Commit:** folgt unmittelbar nach diesem Eintrag.

## Owner-Abnahme

- Die Ownerin hat WP-004 nach der Prüfung der Partneransicht, der getrennten Kalenderfreigabe und der Kreisfreigabe am 2026-09-30 bestätigt.
- Status: abgeschlossen.

## Version 9 – Grundkalender nur nach ausdrücklicher Freigabe

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Der eigene Bereich erhält einen separaten Schalter `Periodenkalender für Partner freigeben`. Er ist anfangs ausgeschaltet.
- **Wenn der Schalter aus ist:** Der Partner sieht keine Kalenderdaten und keinen Zeitraum der Periode.
- **Wenn der Schalter an ist:** Der Partner sieht weiterhin nur den einfachen, nicht bearbeitbaren Kalender mit tatsächlich bestätigten Periodentagen. Eine laufende Periode zeigt bestätigte Tage vom echten Beginn bis heute.
- **Was der Partner nicht sieht:** Kein erwartetes Ende, keine geschätzte nächste Periode, keine Zykluslänge, keine Historie und keine Bearbeitungsfunktion.
- **Wichtig:** Diese Kalenderfreigabe ist getrennt von `Zyklus-Kreis für Partner freigeben`. Der Kreis bleibt nur nach seiner eigenen Freigabe sichtbar.
- **Sofort wirksam:** Schaltet die Eigentümerin den Kalender aus oder beendet sie die Verbindung, verschwinden die Kalenderdaten beim Partner beim nächsten Laden sofort.

### Entstehungsweg

`Partnerkalender zeigt bisher bestätigte und erwartete Tage nach einer aktiven Verbindung → die Eigentümerin soll selbst entscheiden, ob überhaupt Kalenderdaten geteilt werden → eigener standardmäßig ausgeschalteter Freigabeschalter mit minimaler reiner Ansicht → WP-004 Version 9`

- bestätigtes Problem: Die Partneransicht benötigt eine eigene, klare Datenschutzentscheidung für den einfachen Periodenkalender.
- gewünschte Wirkung: Die Eigentümerin kontrolliert getrennt, ob der Partner tatsächliche Periodentage sehen darf.
- gewählte Lösung: Eine kontogebundene serverseitige Kalenderfreigabe pro aktiver Partnerverbindung, Standardwert aus.
- bestätigte Grenzen: Der Partner bleibt vollständig lesend. Zyklus-Kreis, Schätzungen und Kalenderfreigabe sind getrennte Entscheidungen.

### Soll – von Codex

- In `/neu/einstellungen` gibt es für eine aktive Partnerverbindung den Schalter `Periodenkalender für Partner freigeben`.
- Der Standard für eine neue Verbindung ist aus.
- Der Partner erhält Kalenderdaten ausschließlich bei aktiver Verbindung **und** aktiver Kalenderfreigabe. Ohne diese Kombination enthält weder Server-HTML, Client-Props noch eine Route Periodentage.
- Bei Freigabe zeigt der Partner nur tatsächlich bestätigte Periodentage. Bei einer laufenden Periode sind die Tage vom echten Start bis einschließlich heute bestätigt.
- Erwartete Tage, voraussichtliches Ende, geschätzte nächste Periode und sonstige Zyklusdaten gehören nicht zum freigegebenen Grundkalender.
- Der Partner kann weiterhin nichts eintragen, ändern oder löschen.
- Die vorhandene Kreisfreigabe bleibt unverändert und unabhängig: Sie darf nicht automatisch die Kalenderfreigabe einschalten oder umgekehrt.

### Nicht enthalten

- Keine neue Vorhersage, Zyklusberechnung, PMS-/Eisprunginformation, Historie, Profilbild oder Push-Nachricht.
- Keine Freigabe für die alte Luma.
- Keine Bearbeitung von Periodendaten durch den Partner.
- Keine automatische Aktivierung einer Freigabe oder Datenkopie zwischen Konten.

### Abnahmekriterien

1. Eine neue oder bestehende aktive Verbindung hat die Kalenderfreigabe standardmäßig aus, bis die Eigentümerin sie bewusst einschaltet.
2. Bei ausgeschaltetem Schalter zeigt `/neu/partner` keine Kalendertage, keinen erwarteten Zeitraum und keine versteckten Periodendaten.
3. Bei eingeschaltetem Schalter sieht nur der verbundene Partner tatsächliche bestätigte Tage; bei einer laufenden Periode reicht die Bestätigung vom echten Start bis heute.
4. Erwartete und geschätzte Tage erscheinen im Grundkalender nie.
5. Ausschalten oder Verbindungswiderruf sperrt den Zugriff sofort beim nächsten serverseitigen Laden.
6. Kreisfreigabe und Kalenderfreigabe funktionieren unabhängig voneinander.
7. Partneransicht enthält keine schreibende Kalenderaktion und bleibt mobil ohne horizontalen Überlauf.

### Technischer Auftrag für Claude – Version 9

#### Bestätigte Ausgangslage im Code

- `src/app/neu/partner/page.tsx` rendert die lesende Partneransicht mit `NewPartnerCalendar`; `src/lib/new-partner-calendar.ts` liefert dafür bestätigte Tage, erwartete Tage und – aus Version 8 – bei Kreisfreigabe geschätzte nächste Tage.
- Die aktive Verbindung liegt in `new_partner_connections`. Die vorhandene Spalte `cycle_ring_shared` steuert ausschließlich den Partnerkreis und die daraus erlaubte Schätzung.
- `/neu/einstellungen` enthält bereits die Eigentümer-Einstellungen und die bestehende Kreisfreigabe. Die Verbindung, Sitzungen und Widerruf werden serverseitig über die bestehenden neuen Partner-Helfer geprüft.
- Tatsächliche Periodendaten stammen aus `new_period_entries`: `startDate` und optionales echtes `endDate`; `expectedEndDate` ist ausdrücklich nur vorläufig.

#### Technisches Ziel

- Ergänze auf der aktiven Verbindung eine **eigene** boolesche Kalenderfreigabe, zum Beispiel `calendar_shared`, mit Default `false`. Sie darf nicht für die Kreisfreigabe wiederverwendet werden.
- Ergänze in den Eigentümer-Einstellungen einen klar beschrifteten Schalter. Nur die Eigentümerin der aktiven Verbindung darf ihn lesen oder verändern; Route und Speicherung prüfen Sitzung, Herkunft und Eigentümerschaft serverseitig.
- Ändere den Partner-Kalender-View so, dass er vor jeder Datenableitung in derselben serverseitigen Abfrage aktive Verbindung und `calendar_shared = true` prüft. Ohne Freigabe liefert der View keine Kalenderdaten.
- Reduziere den freigegebenen Grundkalender auf echte bestätigte Tage. Bei einer laufenden echten Periode darf die bestehende Ableitung Start bis heute weiterverwendet werden. `expectedEndDate`, geschätzte nächste Tage und sämtliche Vorhersagewerte gehören nicht in diesen Grundkalender.
- Behalte die Kreisfreigabe getrennt: Der Partnerkreis und dessen erlaubte Inhalte werden weiterhin ausschließlich über `cycle_ring_shared` gesteuert. Die neue Kalenderfreigabe darf keine Kreislogik verändern.
- Zeige bei fehlender Kalenderfreigabe eine neutrale, datensparsame Erklärung statt eines leeren oder fehlerhaften Kalenders. Der Partner darf daraus keinen Gesundheitszustand ableiten.

#### Daten, Schnittstellen und Migrationen

- **Migration nötig:** ja, ausschließlich in `luma_core`: eine nicht-nullbare boolesche Freigabespalte mit sicherem Standardwert `false` auf der aktiven Verbindungsstruktur. Keine Datenkopie und keine Änderung der alten Luma.
- Die bereits vom Owner genehmigte getrennte WP-004-Datenbankmigration gilt nur für diesen minimalen Freigabestatus. Keine weiteren Tabellen oder Gesundheitsdaten speichern.
- Eine geschützte neue-Luma-Route für die Eigentümer-Einstellung ist erlaubt. Sie darf nur den eigenen Schalter ändern und keine Partner- oder Periodendaten zurückgeben.
- Der Partner-View darf intern angepasst werden, aber keine neue öffentliche Periodendaten-API eröffnen.

#### Invarianten – müssen unverändert bleiben

- Ohne aktive Verbindung oder ohne Kalenderfreigabe gelangen keine Kalenderdaten zur Partneransicht.
- Partnerzugriff bleibt lesend, paargebunden und nach Widerruf gesperrt.
- `expectedEndDate` und Schätzungen werden nie als echte Daten ausgegeben.
- Die Kreisfreigabe `cycle_ring_shared` bleibt getrennt und standardmäßig unverändert.
- Alte Luma, Authentifizierung, Verbindungscode, Periodenspeicherung, Bildidee, Push-Auswahl und Zyklusberechnung bleiben außerhalb der nötigen Einhängepunkte unverändert.

#### Pflichtprüfungen

- Prüfe neue und bestehende aktive Verbindungen: Standardwert aus und bewusster Wechsel an/aus nur durch die Eigentümerin.
- Prüfe Partnerdaten streng serverseitig: ohne Sitzung, ohne Verbindung, mit fremdem Partnerkonto, mit ausgeschaltetem Schalter und nach Widerruf sind keine Periodentage abrufbar oder gerendert.
- Prüfe die erlaubte Ansicht: abgeschlossene und laufende echte Perioden zeigen nur bestätigte Tage; erwartete Enden und geschätzte nächste Perioden fehlen vollständig.
- Prüfe die Unabhängigkeit beider Schalter in allen vier Kombinationen (Kreis an/aus × Kalender an/aus).
- Prüfe, dass der Partner keine schreibende Kalenderaktion erhält.
- Führe gezielte Partnerkalender-/Partnerkreis-/Verbindungsregressionen, TypeScript, mobile Sichtprüfung, Produktions-Build und `node scripts/work-package-state.mjs validate` aus. Testdaten danach löschen.

#### Stoppbedingungen

- Stoppe vor einer stillen Aktivierung für bestehende Paare, einer Datenkopie, einer Freigabe über Client-Filter oder jeder Erweiterung um Vorhersagen, Push oder private Profile.
- Stoppe, wenn die Freigabe nicht in derselben serverseitigen Prüfung wie die Verbindungsauflösung nachweisbar ist.
- Stoppe vor einer Änderung an alter Luma oder vor einem manuellen Deployment.

#### Abschluss durch Claude

- Ergänze `Ist Version 9`, Tests, Abweichungen und offene Punkte sichtbar.
- Lasse den Paketstatus auf `review`.
- Ergänze den Entwicklungsledger, führe `node scripts/work-package-state.mjs mark-updated WP-004` und danach `node scripts/work-package-state.mjs validate` aus.
- Committe und pushe ausschließlich auftragsbezogene Dateien. Kein manuelles Deployment.

### Ist Version 9 – von Claude

- **Umgesetzt:**
  - Neue Migration `database/luma-core/migrations/202609261200_partner_calendar_sharing.sql` (ausschließlich `luma_core`): `ALTER TABLE new_partner_connections ADD COLUMN calendar_shared BOOLEAN NOT NULL DEFAULT FALSE`. Bewusst eine eigene Spalte, getrennt von `cycle_ring_shared`. Lokal angewendet und per `node scripts/apply-luma-core-migrations.mjs` (prüft die Zieldatenbank selbst) sowie `scripts/verify-luma-core.mjs` bestätigt; `app_luma` unverändert.
  - `src/lib/new-partner.ts`: `PartnerConnectionStatus` (Owner-Zweig) trägt jetzt zusätzlich `calendarShared`; `getPartnerConnectionStatusForOwner` liest die neue Spalte in derselben Abfrage. Neue Funktion `setPartnerCalendarShared(ownerUserId, shared)` – eigenständig, keine Wiederverwendung von `setPartnerCycleRingShared` –, aktualisiert ausschließlich die aktive Verbindung der aufrufenden Eigentümerin.
  - Neue geschützte Route `POST /api/neu/partner/calendar-sharing` (analog zu `cycle-ring-sharing`): prüft Herkunft, Sitzung und Eigentümerschaft serverseitig, ändert ausschließlich den eigenen Schalter, gibt keine Partner- oder Periodendaten zurück.
  - Neue Client-Komponente `NewPartnerCalendarSharingToggle` in `src/app/neu/einstellungen/page.tsx` ergänzt, direkt neben (nicht anstelle) der bestehenden `NewPartnerCycleRingSharingToggle` – beide Schalter unabhängig voneinander bedienbar.
  - `src/lib/new-partner-calendar.ts`: `resolveActiveConnection` liest jetzt zusätzlich `calendar_shared` in derselben Verbindungsabfrage. `getPartnerCalendarView` liefert `null`, sobald keine aktive Verbindung besteht **oder** `calendar_shared` nicht aktiv ist – geprüft in derselben Abfrage wie die Verbindung selbst, kein zeitliches Fenster für einen veralteten Freigabestatus. Der freigegebene Grundkalender wurde wie im Auftrag gefordert auf echte bestätigte Tage reduziert: `expectedEndDate`-Tage wurden aus `PartnerCalendarView` und der Berechnung vollständig entfernt (`expectedDates` existiert nicht mehr); eine laufende Periode zeigt weiterhin bestätigte Tage vom echten Start bis einschließlich heute. Die geschätzte nächste Periode (`estimatedNextPeriodDates`) bleibt unverändert ausschließlich an `cycle_ring_shared` gekoppelt, in derselben Abfrage geprüft – beide Freigaben sind vollständig unabhängig voneinander.
  - `src/components/NewPartnerCalendar.tsx`: `expectedDates`-Prop und der `"expected"`-Tagesstatus vollständig entfernt (Typ, Ableitung, Darstellung, Legende); die Komponente kennt jetzt nur noch `confirmed`, `estimated` und `none`. Keine schreibende Aktion vorhanden (unverändert rein lesend).
  - `src/app/neu/partner/page.tsx`: übergibt `NewPartnerCalendar` nicht mehr `expectedDates`. Der bereits vorhandene Fallback `„Keine freigegebene Information.“` bei `calendarView === null` erfüllt unverändert die geforderte neutrale, datensparsame Erklärung – er greift jetzt zusätzlich, wenn eine aktive Verbindung besteht, aber `calendar_shared` aus ist.
  - Kommentar in `src/lib/new-partner-cycle-view.ts` aktualisiert, da er auf die entfernte `expectedDates`-Logik verwiesen hatte; die Funktion selbst (Kreis-Freigabe, `runningPeriodExpectedEndDate`) wurde inhaltlich nicht verändert.
  - Keine neue Tabelle, keine Datenkopie, keine Änderung an `cycle_ring_shared`, an der Vorhersagelogik, an alter Luma oder an der Verbindungslogik selbst.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - `scripts/verify-partner-calendar.mts` grundlegend überarbeitet (spiegelt weiterhin `getPartnerCalendarView` server-seitig gegen die echte Datenbank, da die Originaldatei `import "server-only"` nutzt): neue Fälle für Standardwert aus bei neuer Verbindung, keine Kalenderdaten ohne Freigabe, nur bestätigte Tage nach Freigabe (kein `expectedDates`-Feld mehr im Rückgabetyp), sofortiger Entzug beim Ausschalten und beim Widerruf, sowie alle vier Kombinationen aus Kalender- und Kreisfreigabe unabhängig voneinander. Alle Prüfungen bestanden.
  - `scripts/verify-partner-estimated-period.mts`, `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-partner-new.mts`, `scripts/verify-partner-old.mts`, `scripts/verify-partner-notification-preference.mts`, `scripts/verify-cycle-today-and-estimate.mts`, `scripts/verify-my-periods.mts` erneut ausgeführt (Regression): alle weiterhin grün, unverändert durch diese Version betroffen.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, neue Route `/api/neu/partner/calendar-sharing` erscheint in der Routenliste, alle übrigen Routen unverändert.
  - `node scripts/apply-luma-core-migrations.mjs` und `node scripts/verify-luma-core.mjs`: Migration erfolgreich auf `luma_core` angewendet und in der Migrationsliste bestätigt; `app_luma` unverändert.
  - Mobile Sichtprüfung mit Playwright (Chromium, 375×812, temporär installiert und danach vollständig wieder entfernt) gegen den lokalen Dev-Server mit zwei echten Testkonten (Owner + Partner, verbunden über echten Code): Partneransicht zeigt vor der Freigabe „Keine freigegebene Information.“ (keine Kalenderzellen, keine Legende); nach Einschalten der Kalenderfreigabe erscheinen Kalender und Legende „Bestätigt“, keine Legende „Erwartet“ mehr; ein bestätigter Tag zeigt im Tagesdetail „Bestätigt“; nach Ausschalten der Freigabe verschwindet der Kalender beim nächsten Laden sofort wieder zugunsten der neutralen Meldung. Owner-Einstellungen zeigen beide Schalter (`Zyklus-Kreis für Partner freigeben`, `Periodenkalender für Partner freigeben`) unabhängig und unbeeinflusst voneinander. Kein horizontaler Überlauf in Partneransicht oder Einstellungen. Screenshots geprüft. Playwright und beide Testkonten (inkl. Verbindung und Perioden) danach vollständig entfernt.
- **Abweichungen:**
  - Der Auftrag verlangt ausdrücklich, dass `expectedEndDate` nicht mehr Teil des freigegebenen Grundkalenders ist (Soll-Text und Abnahmekriterium 4: „Erwartete und geschätzte Tage erscheinen im Grundkalender nie“). Das bedeutet gegenüber dem vorherigen Stand (Version 3) eine Verengung des Partnerkalenders: die bisherige `expectedDates`-Anzeige (voraussichtliches Ende einer laufenden Periode) ist im Grundkalender jetzt vollständig entfernt, nicht nur bei fehlender Freigabe. Dies ist keine eigene Interpretation, sondern die wörtliche Umsetzung des expliziten Auftragstexts; das bereits getrennt bestehende `runningPeriodExpectedEndDate` im Zyklus-Kreis (`cycle_ring_shared`-gesteuert) ist davon nicht betroffen und bleibt unverändert.
  - Der bereits bekannte, unabhängige Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort und war für diese Version nicht im Umfang.
- **offene Punkte:**
  - Owner-Prüfschritt steht aus: in den Einstellungen den neuen Schalter `Periodenkalender für Partner freigeben` prüfen (Standard aus), einschalten und in der Partneransicht den Grundkalender mit ausschließlich bestätigten Tagen sehen, ausschalten und den sofortigen Entzug beim nächsten Laden prüfen, Unabhängigkeit von der bestehenden Kreisfreigabe prüfen.
  - Der vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` sollte weiterhin in einem eigenen, dafür vorgesehenen Paket behoben werden.
  - Kein Deploy ausgelöst – wie beauftragt.
- **Commit:** folgt unmittelbar nach diesem Eintrag.


## Version 8 – Klare aktuelle und nächste Periode im Kalender

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Der Kalender zeigt klar die aktuelle tatsächliche Periode, die nächste geschätzte Periode und den heutigen Tag.
- **Heute:** Über dem Kalender steht `Heute · [Wochentag], [Datum]`. Ein deutlicher roter Punkt markiert zusätzlich genau diesen Kalendertag und wandert automatisch jeden Tag weiter.
- **Eigene Ansicht:** Tatsächliche Periodentage sind klar von der nächsten geschätzten Periode unterscheidbar. Die Schätzung trägt immer `Kann abweichen`.
- **Partneransicht:** Der Partner sieht ebenfalls Heute und die tatsächlich bestätigten Periodentage. Die nächste geschätzte Periode sieht er nur, wenn `Zyklus-Kreis für Partner freigeben` aktiv ist.
- **Was bleibt gleich?** Der Partner kann nichts bearbeiten. Eine Vorhersage ist keine Tatsache und wird nie so dargestellt.

### Entstehungsweg

`Kalender enthält bereits echte Periodentage und einzelne Schätzlogik → aktuelle Orientierung ist noch nicht klar genug → aktuelles Datum und nächste Schätzung sichtbar und ehrlich ordnen → WP-004 Version 8`

- bestätigtes Problem: Die aktuelle Periode, der heutige Tag und die nächste geschätzte Periode sind noch nicht in beiden Ansichten gleich klar erkennbar.
- gewünschte Wirkung: Die Nutzerin und der berechtigte Partner sehen schnell, was heute tatsächlich gilt und was nur eine vorsichtige nächste Schätzung ist.
- gewählte Lösung: Eine gemeinsame, datumsabhängige Kalenderkennzeichnung mit klar getrennten Zuständen für bestätigt, erwartetes Ende und nächste Schätzung.
- wichtige Entscheidungen: DEC-121, DEC-123 und DEC-124.
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-IDEA-013.md` und `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-IDEA-014.md`.

### Soll – von Codex

- Über dem eigenen Kalender und dem Partnerkalender steht `Heute · [Wochentag], [Datum]` in einfachem Deutsch.
- Der heutige echte Kalendertag erhält zusätzlich einen deutlichen roten Punkt. Die Position ergibt sich ausschließlich aus dem aktuellen Datum und wechselt automatisch am nächsten Kalendertag.
- Tatsächlich bestätigte oder laufende Periodentage bleiben klar als echt erkennbar.
- Die nächste geschätzte Periode des kommenden Zyklus ist in der eigenen Ansicht sichtbar und trägt immer `Geschätzt · Kann abweichen`.
- Im Partnerkalender wird diese nächste Schätzung nur bei aktiver Kreisfreigabe gezeigt. Ohne Freigabe bleiben ausschließlich bisher erlaubte bestätigte und erwartete Tage sichtbar.
- Das voraussichtliche Ende einer laufenden Periode bleibt von der nächsten Zyklus-Schätzung unterscheidbar, auch wenn beide nicht tatsächlich bestätigt sind.

### Nicht enthalten

- Keine neue Berechnung von Zykluslänge, PMS oder Eisprung und keine Änderung der bestehenden persönlichen Zykluslogik.
- Keine neue Bildfunktion, Profilfunktion, Push-Nachricht, Echtzeitverbindung oder Änderung an alter Luma.
- Keine Bearbeitungsfunktion für den Partner und keine Freigabe von Historie oder anderen privaten Daten.

### Abnahmekriterien

1. Heute steht in beiden Kalendern in der Form `Heute · [Wochentag], [Datum]`; der rote Punkt liegt auf genau demselben Tag.
2. Der rote Punkt ist auch auf einem echten oder geschätzten Periodentag klar erkennbar und wird nicht durch dessen Hintergrund verdeckt.
3. Die eigene Ansicht unterscheidet tatsächliche/laufende Tage, voraussichtliches Ende einer laufenden Periode und nächste geschätzte Periodentage verständlich per Text und visueller Kennzeichnung.
4. Der Partner sieht die nächste geschätzte Periode ausschließlich bei aktiver Kreisfreigabe; nach Ausschalten und Neuladen sind diese Daten nicht mehr abrufbar.
5. Ohne berechenbare Schätzung wird kein nächster Periodentag erfunden.
6. Partner kann weiterhin keine Kalenderdaten eintragen, ändern oder löschen.

### Technischer Auftrag für Claude – Version 8

#### Bestätigte Ausgangslage im Code

- `src/components/NewCycleExample.tsx` rendert den privaten Kalender. Es kennt tatsächliche/laufende Einträge, `expectedEndDate`, gespeicherte Pläne und `prediction` aus `src/lib/new-cycle-prediction.ts`. Heute wird derzeit über `isToday` mit Ring und Text markiert.
- `src/lib/new-cycle-prediction.ts` liefert bereits `nextPeriodStart`, `nextPeriodEnd` und `futureCycles`. `phaseForDate(...)` markiert vorhandene geschätzte Phasen. Diese Logik ist wiederzuverwenden; keine zweite Berechnung.
- `src/components/NewPartnerCalendar.tsx` rendert den lesenden Partnerkalender. `src/lib/new-partner-calendar.ts` liefert derzeit nur bestätigte Tage und erwartete Tage einer laufenden Periode.
- `src/app/neu/partner/page.tsx` lädt die Partneransicht serverseitig. Der bestehende Kreis-Schalter ist als `cycle_ring_shared` auf der aktiven Partnerverbindung gespeichert und wird serverseitig für den Partnerkreis geprüft.

#### Technisches Ziel

- Ergänze eine kleine gemeinsame Präsentationshilfe für die deutsche Heute-Zeile und den roten Heute-Marker, sofern das die beiden Kalender ohne doppelte, abweichende Datumsformatierung ermöglicht.
- Verwende für Owner- und Partnerkalender dieselbe klare, zeitzonenstabile Tagesgrundlage. Falls der bestehende Helfer das nicht zuverlässig für Europe/Berlin gewährleistet, extrahiere einen gemeinsamen, geprüften Datumshelfer statt lokaler `new Date()`-Abweichungen.
- Erhalte im Ownerkalender die Priorität echter Daten: echte/laufende Periode steht immer vor einer gleichzeitigen Schätzung.
- Ergänze für den Partner einen minimalen serverseitigen Kalender-View, der die vorhandene Owner-Prediction nur bei aktiver Verbindung **und** `cycle_ring_shared = true` in sichere, reine Datumslisten für die nächste geschätzte Periode übersetzt.
- Trenne in der Darstellung mindestens: `Bestätigt`, `Voraussichtliches Ende – kann abweichen` und `Geschätzte nächste Periode – kann abweichen`. Nutze nicht nur Farbe, sondern auch verständlichen Text/Kürzel und Legende.
- Rendere beim Partner ohne aktive Kreisfreigabe nie die geschätzte Liste, auch nicht versteckt in HTML, Props oder Client-State.

#### Daten, Schnittstellen und Migrationen

- **Migration nötig:** nein. Die bestehende serverseitige Kreisfreigabe `cycle_ring_shared` ist die Berechtigung für die Partner-Schätzung.
- **Datenwirkung:** keine neuen gespeicherten Gesundheits- oder Profildaten; nur abgeleitete Datumslisten während des serverseitigen Renderns.
- **API-Wirkung:** keine neue öffentliche API nötig. Eine vorhandene serverseitige Partner-View-Schicht darf minimal erweitert werden; falls Claude eine Route technisch benötigt, muss sie Sitzung, aktive Verbindung und Kreisfreigabe serverseitig prüfen.

#### Invarianten – müssen unverändert bleiben

- Echte Periodendaten, `expectedEndDate` und Schätzungen bleiben semantisch getrennt.
- Keine Vorhersage ohne bestehende berechenbare Grundlage. `no_data` bleibt neutral.
- Partnerzugriff bleibt kontogebunden, lesend und nach Widerruf vollständig gesperrt.
- Ohne Kreisfreigabe erhält der Partner keine nächste Periodenschätzung oder andere zusätzlich daraus abgeleitete Zyklusdaten.
- Alte Luma, Verbindungscode, Anmeldung, Bildidee und Push-Auswahl bleiben unverändert.

#### Pflichtprüfungen

- Teste einen festen Zeitpunkt kurz vor und nach Mitternacht in `Europe/Berlin`: Heute-Zeile und roter Punkt müssen denselben Kalendertag zeigen.
- Teste private Ansicht: echte laufende Periode, erwartetes Ende, vorhandene nächste Schätzung und fehlende Datenbasis.
- Teste Partneransicht: aktive Verbindung mit Freigabe an/aus, zwei getrennte Paare, Widerruf und fehlende Sitzung. Geschätzte nächste Tage dürfen nur im erlaubten Zustand erscheinen.
- Teste, dass heutige Markierung trotz bestätigtem oder geschätztem Hintergrund sichtbar bleibt.
- Führe bestehende Partnerkalender-, Partnerkreis-, Perioden- und Zyklus-Prognose-Regressionsprüfungen, TypeScript, mobile Sichtprüfung und Produktions-Build aus.

#### Stoppbedingungen

- Stoppe, wenn die bestehende Vorhersagelogik keine sichere nächste Schätzung liefert; zeige dann keinen geschätzten Zeitraum.
- Stoppe vor einer stillen Partnerfreigabe, einer Datenkopie, Echtzeit-/Push-Erweiterung oder jeder Änderung an alter Luma.
- Stoppe, wenn der Partner-View die Freigabe nicht serverseitig vor jeder Datenableitung prüfen kann.

#### Abschluss durch Claude

- Ergänze `Ist Version 8`, Tests, Abweichungen und offene Punkte sichtbar.
- Setze den Paketstatus auf `review`.
- Ergänze den Entwicklungsledger, führe `node scripts/work-package-state.mjs mark-updated WP-004` und danach `node scripts/work-package-state.mjs validate` aus.
- Committe und pushe ausschließlich auftragsbezogene Dateien. Kein manuelles Deployment.

### Ist Version 8 – von Claude

- **Umgesetzt:** Neuer, zeitzonenstabiler Helfer `src/lib/berlin-date.ts` (`todayBerlinDateOnly`, `formatHeuteLine`) liefert „heute“ explizit über `Intl.DateTimeFormat` mit `timeZone: "Europe/Berlin"` statt über Server-lokale Zeit — nötig, weil der Produktions-Container (`node:20-alpine` ohne gesetzte `TZ`) sonst UTC verwendet und um Mitternacht in Berlin vom sichtbaren Kalendertag abweichen könnte. Eine neue gemeinsame Präsentationskomponente `CalendarTodayLine.tsx` rendert `Heute · [Wochentag], [Datum]` identisch in beiden Kalendern.
- `src/components/NewCycleExample.tsx` (Owner) und `src/components/NewPartnerCalendar.tsx` (Partner) wurden auf `todayBerlinDateOnly()` statt eigener `new Date()`/`todayDateOnly()`-Berechnung umgestellt und zeigen jetzt beide die Heute-Zeile sowie einen deutlichen roten Punkt-Marker direkt auf dem heutigen Kalendertag – sichtbar auch auf dunklem (bestätigtem) Hintergrund durch weißen Rand und Schattenkontur.
- `src/lib/new-cycle-prediction.ts`: `today` ist jetzt ein **Pflichtparameter** von `predictCycle` statt einer intern berechneten `new Date()` – erzwingt an jeder Aufrufstelle dieselbe, explizit übergebene Berlin-Tagesgrundlage. Beide bestehenden Aufrufer (`src/app/neu/page.tsx`, `src/lib/new-partner-calendar.ts`) übergeben jetzt denselben `todayBerlinDateOnly()`-Wert, den auch die Heute-Zeile nutzt. Keine zweite, abweichende Berechnung.
- Der Owner-Kalender unterscheidet jetzt per Text/Kürzel klar `Bestätigt/Laufend`, `Voraussichtliches Ende – kann abweichen` und `Geschätzte nächste Periode – kann abweichen` (eigene Legende oberhalb der bestehenden Phasen-Legende; Kürzel `Gsch.` statt des mehrdeutigen `P` für reine Vorhersage-Tage). Die bestehende Priorität „echte/laufende Periode vor Schätzung“ war bereits durch die vorhandene Klassennamen-Kette (`storedPeriod || runningPeriod` zuerst) korrekt und wurde nicht verändert.
- `src/lib/new-partner-calendar.ts` liefert jetzt zusätzlich `estimatedNextPeriodDates`: Die Freigabe (`cycle_ring_shared`) wird in derselben Abfrage wie die aktive Verbindung geprüft (kein zeitliches Fenster für ein Leck durch eine zwischenzeitlich geänderte Freigabe); nur bei `cycle_ring_shared = true` wird die vorhandene `predictCycle`-Logik auf die Owner-Perioden angewendet und der Zeitraum `nextPeriodStart`–`nextPeriodEnd` als reine Datumsliste zurückgegeben – ohne Freigabe bleibt die Liste immer leer, auch nicht versteckt in Props oder Client-State.
- `src/components/NewPartnerCalendar.tsx` rendert die geschätzten Tage optisch klar getrennt (violett, Kürzel `Gsch.`) von bestätigten (schwarz, `B`) und erwarteten (grau, `E`) Tagen; die zugehörige Legende erscheint nur, wenn tatsächlich geschätzte Tage geliefert wurden.
- Keine neue Migration (wie im Auftrag vorgesehen), keine neue öffentliche API-Route, keine Änderung an PMS-/Eisprung-/Zykluslängen-Berechnung, keine Änderung an alter Luma.

**Tests:**
- Neue `tests/new-cycle-prediction.test.ts` (5 Prüfungen, Node-eigener Testrunner): `predictCycle` nutzt konsequent den übergebenen `today`-Parameter statt eigener Zeitberechnung; an der Europe/Berlin-Tagesgrenze liefert die Funktion exakt den erwarteten nächsten Zeitraum; `phaseForDate` markiert ausschließlich die berechnete Vorhersage; der bestehende 28-Tage-Standardfall bei einer einzelnen Periode bleibt unverändert; ganz ohne Daten wird nichts erfunden. Alle 5 Prüfungen bestanden.
- Neue `scripts/verify-cycle-today-and-estimate.mts` (6 Prüfungen): `todayBerlinDateOnly` bleibt exakt an der Europe/Berlin-Mitternachtsgrenze stabil, unabhängig davon, ob der zugrunde liegende UTC-Zeitstempel schon oder noch nicht über die eigene Mitternacht ist; `formatHeuteLine` liefert korrekte deutsche Wochentagsnamen inklusive Wochenende. Alle 6 Prüfungen bestanden.
- Neue `scripts/verify-partner-estimated-period.mts` (9 Prüfungen) gegen die lokale Testdatenbank: ohne Freigabe liefert die Partner-Schätzung nachweislich eine leere Liste (nie die echte Schätzung, auch nicht teilweise); mit Freigabe stimmt die gelieferte Schätzung exakt mit der `predictCycle`-Berechnung überein; Ausschalten der Freigabe entfernt die Schätzung sofort; zwei unabhängige Paare beeinflussen sich nie; ein Widerruf der Verbindung entfernt die Schätzung zusätzlich zur reinen Freigabe. Alle 9 Prüfungen bestanden.
- End-to-end über echten lokalen Dev-Server mit echten HTTP-Anfragen: Owner-Ansicht zeigt „Heute · Sonntag, 13.09.2026“ (korrekt für das echte Testdatum) und die „Geschätzte nächste Periode“-Legende; Partneransicht ohne Freigabe zeigt Heute-Zeile, aber keine Schätzungs-Legende; nach Einschalten der Freigabe erscheint sie, nach Ausschalten verschwindet sie sofort wieder beim nächsten Laden.
- Mobile Sichtprüfung (Playwright temporär installiert, iPhone-Viewport 375×812, danach vollständig entfernt): Screenshots bestätigen roten Punkt-Marker auf dem heutigen Tag in beiden Kalendern (auch im Ring erkennbar, nicht vom Hintergrund verdeckt), korrekt getrennte Legende mit drei Zuständen im Ownerkalender, Schätzungs-Legende im Partnerkalender bei aktiver Freigabe. Kein horizontaler Überlauf in beiden Ansichten.
- Bestehende Regressionen erneut grün: `scripts/verify-partner-calendar.mts`, `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-partner-new.mts`, `scripts/verify-partner-old.mts`, `scripts/verify-my-periods.mts`, `scripts/verify-partner-notification-preference.mts`, `node scripts/verify-luma-core.mjs` (unverändertes Schema, keine Migration).
- `npx tsc --noEmit` fehlerfrei. `npm run build` erfolgreich, Routenliste unverändert. Alle Testkonten nach der Prüfung aus `luma_core` gelöscht.
- Der bereits bekannte, unabhängige Testdefekt in `tests/calendar-day-info.test.ts` (referenziert eine nicht existierende Funktion `applyPeriodDayAction`, dokumentiert seit WP-004 Version 4) besteht unverändert fort und wurde durch diese Version weder verursacht noch behoben.

**Abweichungen:**
- `predictCycle` wurde von einem optionalen auf einen **Pflicht**-`today`-Parameter umgestellt (statt eines Default-Werts `= todayBerlinDateOnly()`), da ein Default-Import von `berlin-date.ts` in `new-cycle-prediction.ts` mit Node's nativem ESM-Testrunner (genutzt von `tests/*.test.ts`) an dessen fehlender `@/`-Pfadalias-Auflösung gescheitert wäre. Ein Pflichtparameter ist zusätzlich strenger und macht die Zeitquelle an jeder Aufrufstelle explizit sichtbar, statt sie implizit zu verstecken – im Sinne der Auftragsvorgabe „keine zweite, abweichende Berechnung“.

**Offene Punkte:**
- Owner-Prüfschritt im Browser steht aus (Heute-Zeile, roter Punkt und Schätzungs-Kennzeichnung in beiden Ansichten selbst betrachten).
- Kein Deploy ausgelöst – wie beauftragt.

## Version 7 – Zyklus-Kreis vor Partnerkalender

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** In der Partneransicht steht der Zyklus-Kreis ganz oben. Direkt darunter folgt der Kalender.
- **Warum machen wir das?** Der Partner soll zuerst die aktuelle Orientierung sehen und danach die einzelnen Kalendertage.
- **Wo ist es in der App?** Ausschließlich im verbundenen Bereich der Neuen Luma unter `/neu/partner`.
- **Was bleibt gleich?** Freigabe, Daten, Kreis-Inhalt und der vollständig lesende Kalender bleiben unverändert.

### Soll – von Codex

- Wenn die Kreisfreigabe aktiv ist, rendert `/neu/partner` zuerst den lesenden Zyklus-Kreis und direkt danach den Partnerkalender.
- Ohne Kreisfreigabe bleibt der Kalender an seiner bisherigen Stelle sichtbar; der Kreis erscheint nicht.
- Keine neue Interaktion, Berechnung, API, Datenbankänderung, Berechtigung oder Gestaltungsexpansion.

### Technischer Auftrag für Claude – Version 7

- **Startpunkt:** `src/app/neu/partner/page.tsx` rendert den bestehenden Kreis- und Kalenderbereich.
- **Änderung:** Passe ausschließlich die Reihenfolge der vorhandenen Komponenten an: `NewPartnerCycleRing` vor `NewPartnerCalendar`.
- **Invarianten:** Der Kreis bleibt rein lesend und nur nach der bestehenden serverseitigen Freigabe sichtbar. Kalenderdaten und Kalenderverhalten bleiben unverändert.
- **Prüfung:** Prüfe beide Zustände (Freigabe an/aus) mobil und auf normaler Breite. Bei Freigabe muss der Kreis oberhalb des Kalenders sichtbar sein; ohne Freigabe darf nur der Kalender erscheinen. Führe mindestens TypeScript und eine gezielte sichtbare Prüfung aus.
- **Abschluss:** Ergänze `Ist Version 7`, markiere WP-004 aktualisiert, validiere den Work-Package-Status, committe und pushe nur die betroffene Änderung. Kein manuelles Deployment.

### Ist Version 7 – von Claude

- **Umgesetzt:** In `src/app/neu/partner/page.tsx` wurde ausschließlich die Reihenfolge der beiden bestehenden bedingten Blöcke im verbundenen Zustand vertauscht: `NewPartnerCycleRing` (bei aktiver Freigabe) wird jetzt vor `NewPartnerCalendar` gerendert. Keine Komponente, keine Props, keine Berechnung, keine API und keine Datenbank wurden verändert.
- Ohne Kreisfreigabe erscheint weiterhin ausschließlich der Kalender an seiner bisherigen Stelle; der Kreis-Block wird gar nicht gerendert (`{cycleView && (...)}` unverändert).

**Tests:**
- `npx tsc --noEmit` fehlerfrei.
- Gezielte sichtbare Prüfung über echten lokalen Dev-Server mit echten HTTP-Anfragen: Ohne Freigabe enthält die gerenderte Partnerseite keinen „Zyklus-Kreis“-Text, nur den Kalender. Nach Einschalten der Freigabe (`POST /api/neu/partner/cycle-ring-sharing`) erscheint „Zyklus-Kreis“ im HTML nachweislich vor der Kalender-Legende (Byte-Position 2947 vs. 15314).
- Mobile (375×812) und normale Breite (1280×900) per Screenshot geprüft (Playwright temporär installiert, danach vollständig entfernt): in beiden Breiten steht der Kreis oben, der Kalender direkt darunter, kein horizontaler Überlauf (`scrollWidth > clientWidth` ist `false` in beiden Fällen).
- `npm run build` erfolgreich, Routenliste unverändert (reine Reihenfolgenänderung ohne neue Route).
- Testkonten nach der Prüfung aus `luma_core` gelöscht.

**Abweichungen:** keine.

**Commit:** siehe unmittelbar folgenden Commit.

# Aufgabe: Sichere Partnerverbindung mit persönlichem Code

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Eine Person kann im eigenen Bereich einen kurzen Verbindungscode erzeugen. Der Partner meldet sich mit einem eigenen Konto an und gibt diesen Code ein. Danach sind genau diese beiden Konten verbunden.
- **Warum machen wir das?** Der Partner soll nur die später ausdrücklich freigegebenen Informationen sehen, niemals den privaten Bereich der anderen Person.
- **Woher kam die Idee?** Aus `APP-IDEA-014` und den Entscheidungen DEC-106 bis DEC-114.
- **Wo ist es in der App?** Nach der Auswahl `Alte App` oder `Neue App` folgt die Rollenwahl `Für mich selbst` oder `Für meinen Partner / meine Partnerin`. Den Code gibt es später im privaten Profil oder in den Einstellungen.
- **Was gehört ausdrücklich nicht dazu?** Noch kein Partnerkalender, keine Anzeige von Periodendaten, keine Push-Nachricht, keine medizinische Vorhersage und keine Vermischung von alter und neuer Luma.
- **Was kann die Nutzerin danach ausprobieren?** Sie kann für ihren eigenen Bereich einen Code erzeugen. Der Partner löst ihn nach der eigenen Anmeldung ein und sieht nur die neutrale Meldung `Verbindung aktiv`.

## Entstehungsweg

`Private Zyklusdaten sollen nicht offen geteilt werden → klar begrenzte Verbindung zwischen zwei eigenen Konten → einmaliger, kurzer und sicher gespeicherter Code → WP-004`

- Ausgangsidee oder Problem: Ein früherer Link-Weg war nur eine Grundidee; eine sichere und eindeutige Partnerverbindung fehlte.
- bestätigte Wirkung: Genau ein Partnerkonto erhält nur nach ausdrücklicher Verbindung Zugriff auf einen späteren begrenzten Partnerbereich. Die Person mit den Zyklusdaten kann die Verbindung bewusst beenden.
- gewählte Lösung: Ein weltweit eindeutiger Code gilt zehn Minuten und kann genau einmal eingelöst werden. Eine aktive Verbindung gehört genau einem Paar.
- wichtige Entscheidung(en): DEC-106 bis DEC-114.
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-IDEA-014.md`.

## Soll – von Codex

- Nach `Alte App` und nach `Neue App` erscheint dieselbe einfache Rollenwahl: `Für mich selbst` oder `Für meinen Partner / meine Partnerin`.
- Die Rollenwahl ist geschlechtsneutral. Sie entscheidet nur über den folgenden Weg, nicht über persönliche Eigenschaften.
- Der Selbst-Weg führt wie bisher zum jeweiligen privaten Login und Bereich.
- Der Partner-Weg verlangt ein eigenes Konto. Erst danach kann ein Verbindungscode eingegeben werden.
- Eine Person im Selbst-Weg kann im jeweiligen eigenen Profil oder Einstellungsbereich einen Verbindungscode erzeugen und bewusst erneuern.
- Ein Code ist weltweit eindeutig, nur zehn Minuten gültig und nach der ersten erfolgreichen Einlösung dauerhaft ungültig.
- Eine erfolgreiche Einlösung verbindet genau das eigene Partnerkonto mit genau einem privaten Bereich derselben App-Variante.
- Pro privatem Bereich gibt es höchstens eine aktive Partnerverbindung. Eine neue Verbindung ist erst nach einem bewussten Beenden der bestehenden Verbindung möglich.
- Nach einer aktiven Verbindung zeigt der Partner-Weg nur eine neutrale, eingeschränkte Ansicht `Verbindung aktiv`. Sie enthält noch keine Zyklus- oder Kalenderdaten.
- Nach dem Beenden einer Verbindung ist der bisherige Partner sofort nicht mehr berechtigt und sieht keinen Partnerbereich mehr.

### Nicht enthalten

- Partnerkalender und jede Anzeige echter Periodenstarts oder -enden.
- Push-Benachrichtigungen, Geräteberechtigung oder E-Mail-Erinnerungen.
- Vorhersagen, PMS, Eisprung, Zykluslänge, Historie, Profilangaben oder Bearbeitungsrechte für Partner.
- Verbindung zwischen alter und neuer App, Kopieren von Daten oder gemeinsamer Datenbankzugriff.

### Abnahmekriterien

1. Die Rollenwahl ist nach beiden App-Varianten sichtbar und verständlich.
2. Ein Partner kann ohne eigenes Konto und ohne gültigen Code keinen Partnerbereich öffnen.
3. Ein Code funktioniert genau einmal innerhalb von zehn Minuten; abgelaufene, verbrauchte, falsche oder eigene Codes verbinden nichts.
4. Ein Paar bleibt strikt von allen anderen Paaren getrennt.
5. Eine bestehende Verbindung muss bewusst beendet werden, bevor ein neuer Partner verbunden werden kann.
6. Nach dem Beenden verliert das alte Partnerkonto beim nächsten Zugriff sofort den Zugriff.
7. Die Partneransicht zeigt in diesem Paket keine Gesundheits- oder Zyklusdaten.

## Technischer Auftrag für Claude

Dieser Abschnitt beschreibt die benötigten Sicherheitsgrenzen und Startpunkte. Er schreibt keine unnötige interne Umsetzungsschrittfolge vor.

### Bestätigte Ausgangslage im Code

- `src/app/page.tsx` zeigt derzeit die Auswahl `Alte App` (`/login`) und `Neue App` (`/neu`).
- Der neue Weg besitzt eigene E-Mail/Passwort-Authentifizierung unter `src/app/api/neu/auth/` und serverseitige Sitzungen in `src/lib/new-auth.ts`.
- `database/luma-core/migrations/202608261700_new_auth.sql` sowie spätere Migrationen definieren die getrennten neuen Tabellen, insbesondere `new_users` und `new_sessions`.
- `src/components/AppProviders.tsx` trennt `/neu` bereits von den alten Auth-Providern. Alte Luma nutzt ihren bestehenden, getrennten Auth- und Datenweg.
- Für die neue App existiert noch kein eigener Profil-/Einstellungsweg und keine Partnerverbindungslogik. Claude muss für die alte Luma den passenden bestehenden Auth- und Datenstartpunkt vor einer Änderung lesend bestimmen.

### Technisches Ziel

- Ergänze nach der App-Auswahl in beiden Varianten eine klare Rollenroute oder gleichwertige Navigation. Sie darf nicht die bestehende Anmeldung umgehen.
- Baue den sicheren Verbindungskern für alte und neue Luma **getrennt**: Ein Code und eine Verbindung gelten nur für dieselbe App-Variante und deren eigene Datenbasis.
- Codes werden kryptografisch zufällig erzeugt, nur gehasht gespeichert und niemals im Klartext geloggt oder später aus der Datenbank abgelesen.
- Das Erzeugen, Einlösen, Erneuern und Beenden erfolgt ausschließlich serverseitig, sitzungsgebunden, mit Herkunftsprüfung sowie Rate-Limit gegen wiederholtes Raten.
- Das Einlösen muss atomar sein: Ablauf, Einmaligkeit, Eigentümer, App-Variante und bereits vorhandene aktive Verbindungen sind gemeinsam zu prüfen. Zwei parallele Einlösungen dürfen nie denselben Code oder Bereich doppelt verbinden.
- Ein Partner darf den eigenen Code nicht einlösen. Eine aktive Verbindung darf nur die dafür bestimmte eingeschränkte Partnerroute öffnen.
- Die anfängliche Partnerroute ist ein geschützter Platzhalter ohne Gesundheitsdaten. Sie muss bei fehlender, widerrufener oder fremder Verbindung schließen oder zu einem neutralen, nicht verräterischen Hinweis führen.
- Der Code wird im klar bezeichneten eigenen Profil-/Einstellungsbereich gezeigt. Falls ein solcher Weg fehlt, darf Claude eine minimale geschützte Einstellung nur für Code erzeugen; keine allgemeine Profilfunktion erweitern.

### Daten, Schnittstellen und Migrationen

- **Migration nötig:** ja, getrennt für die Datenbasis der neuen und der alten Luma. Der Owner hat diese Migration am 10. September 2026 ausdrücklich freigegeben.
- **Neue Luma (`luma_core`):** Ergänze getrennte, kontogebundene Daten für kurzlebige Code-Ausgaben und aktive Partnerverbindungen. Die Verbindung braucht mindestens Eigentümerkonto, Partnerkonto, App-Variante, aktiven/beendeten Zustand sowie sichere Zeitstempel. Datenbank-Constraints und eindeutige Indizes müssen eine doppelte aktive Zuordnung verhindern.
- **Alte Luma:** Erst den vorhandenen Auth- und Migrationsweg lesend feststellen. Dann ein gleichwertiges, aber von `luma_core` getrenntes Modell ergänzen. Niemals neue Luma-Konten oder Daten in die alte Datenbasis schreiben oder umgekehrt.
- **API-Wirkung:** geschützte Endpunkte für Code erzeugen/erneuern, einlösen, Verbindungsstatus lesen und Verbindung beenden. Keine Perioden-, Zyklus- oder Profil-API darf in diesem Paket für Partner geöffnet werden.

### Invarianten – müssen unverändert bleiben

- Bestehende Nutzerkonten, Sitzungen, Passwörter, Perioden und Zyklusdaten werden nicht umgeschrieben oder kopiert.
- Alte und neue Luma bleiben auth-, routen- und datengetrennt.
- Ohne aktive Verbindung gibt es keinen Partnerzugriff. Eine Verbindung gibt nie Zugang zum privaten Owner-Bereich.
- Ein Partner kann keine Daten bearbeiten und sieht in WP-004 keine Gesundheitsdaten.
- Keine Klartextcodes in Datenbank, Logs, Entwicklungsledger, Tests, Screenshots oder Fehlermeldungen.
- Kein Push und keine Benachrichtigung in diesem Paket.

### Pflichtprüfungen

- Code-Lebenszyklus: erzeugen, innerhalb von zehn Minuten genau einmal einlösen; danach erneuter Versuch ablehnen.
- Abgelaufenen, falschen, fremden und eigenen Code ablehnen, ohne Details über fremde Konten preiszugeben.
- Parallele Einlöseversuche testen: höchstens eine Verbindung entsteht.
- Eindeutigkeit und Kontotrennung für mindestens zwei verschiedene Paare prüfen.
- Bestehende aktive Verbindung blockiert eine zweite Verbindung, bis die Owner-Person sie bewusst beendet.
- Nach dem Beenden blockiert die Partnerroute sofort; ein neuer Code kann erst danach eine neue Verbindung herstellen.
- Rollenwahl, Registrierung/Anmeldung, Partner-Placeholder und Widerruf auf Mobile prüfen; kein horizontaler Überlauf.
- Bestehende alte und neue Auth-Regressionen, TypeScript, gezielte Sicherheitsprüfung, Produktions-Build und Entwicklungsledger-Validierung ausführen.

### Stoppbedingungen

- Stoppe, wenn der alte App-Weg keine sichere, getrennte Speicherung mit eindeutiger Kontozuordnung zulässt. Dokumentiere den Befund, statt Daten zwischen den Wegen zu vermischen.
- Stoppe vor Kalenderfreigabe, Periodendaten, Push, Prognosen, Berechtigungs-Ausweitung oder einer zweiten aktiven Partnerverbindung.
- Stoppe, wenn klare Abmeldung, Widerruf oder atomare Einlösung nicht sicher nachweisbar sind.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergänzen.
- `node scripts/work-package-state.mjs mark-updated WP-004` sowie `node scripts/work-package-state.mjs validate` ausführen.
- Nur auftragsbezogene Dateien committen und pushen. Ein Deploy bleibt eine getrennte Freigabe.

## Ist – von Claude

- umgesetzt:
  - **Datenmodell, getrennt pro App-Variante:**
    - `luma_core`: neue Migration `202609101200_partner_connections.sql` – `new_partner_connection_codes` (gehashter Code, `expires_at`, `consumed_at`) und `new_partner_connections` (`owner_user_id`, `partner_user_id`, `status`, partieller eindeutiger Index `WHERE status = 'active'` auf `owner_user_id`, CHECK gegen Selbstverbindung).
    - `app_luma` (Prisma): drei neue Migrationen – `partner_connections` (gleichwertiges Modell inkl. partiellem eindeutigen Index und CHECKs, per Hand in der generierten SQL-Datei ergänzt, da Prisma partielle Indizes/CHECKs nicht deklarativ erzeugt), `partner_rate_limits` (eigenes Rate-Limit-Modell für die alte App, da dort zuvor keines existierte) und `partner_timestamptz` (Korrektur, siehe Abweichungen). Keine Migration verändert bestehende Spalten von `users`, `profiles`, `user_cycles` oder anderen bestehenden Tabellen – ausschließlich neue Tabellen mit lesenden Fremdschlüsseln auf `users(id)`.
  - **Kernlogik:** `src/lib/new-partner.ts` (neue Luma, raw `pg`) und `src/lib/partner-connections.ts` (alte Luma, Prisma) mit identischer Semantik: `createOrRenewPartnerCode`, `redeemPartnerCode` (atomar: `SELECT ... FOR UPDATE` auf den Code, zwei `pg_advisory_xact_lock`-Sperren auf Owner- und Partner-Konto-ID innerhalb derselben Transaktion, danach Prüfung auf Ablauf/Einmaligkeit/Eigenzuordnung/bereits aktive Verbindung auf beiden Seiten, erst dann `consumed_at` setzen und Verbindung anlegen), `getPartnerConnectionStatusForOwner`/`ForPartner`, `endPartnerConnection`. Codes werden mit `crypto.randomBytes` erzeugt (8 Zeichen, Alphabet ohne verwechselbare Zeichen 0/O/1/I/L), nur als SHA-256-Hash gespeichert, nie im Klartext geloggt oder aus der Datenbank zurückgelesen.
  - **Rate-Limiting und Herkunftsprüfung:** neue Luma nutzt das bestehende `new_auth_rate_limits`/`requestHasAllowedOrigin`-Muster. Alte Luma erhält ein gleichwertiges, getrenntes `src/lib/partner-rate-limit.ts` (eigene Tabelle `partner_rate_limits`) und `src/lib/request-origin.ts` (identische Origin-Prüfung, da die alte App zuvor keine hatte). Beide Seiten: 5 Versuche pro 15 Minuten für Code-Erzeugen und Einlösen.
  - **API-Routen, getrennt pro App-Variante:** `POST/GET .../partner/code`, `.../partner/redeem`, `.../partner/status`, `.../partner/end` unter `/api/neu/partner/*` (neue Luma) und `/api/partner-connections/*` (alte Luma), jeweils sitzungsgebunden über die bestehenden, unveränderten Auth-Wege (`getNewAuthSession` bzw. NextAuth `auth()`). Zusätzlich `POST /api/partner-account/register` (alte Luma) für ein bewusst minimales Partnerkonto (nur E-Mail/Passwort, kein Zyklus-Onboarding, kein `Profile`-Datensatz) – Partner erhalten nie das Datenmodell des Owner-Bereichs.
  - **Rollenwahl und Navigation, getrennt pro App-Variante:** `src/app/rolle/page.tsx` und `src/app/neu/rolle/page.tsx` nach der App-Auswahl (`src/app/page.tsx` verlinkt jetzt auf `/rolle` bzw. `/neu/rolle` statt direkt auf `/login`/`/neu`). „Für mich selbst“ führt unverändert zum bestehenden privaten Login/Registrierung. „Für meinen Partner / meine Partnerin“ führt zu eigenen Partner-Registrierungs-/Login-Seiten (`/partner-registrieren`, `/partner-anmelden`, `/neu/partner-registrieren`, `/neu/partner-anmelden`) und danach zum geschützten Partner-Platzhalter (`/partner-bereich`, `/neu/partner`), der ohne aktive Verbindung die Code-Eingabe zeigt und mit aktiver Verbindung ausschließlich die neutrale Meldung „Verbindung aktiv“ – keine Gesundheits- oder Zyklusdaten. `NewLoginForm`/`NewRegisterForm` erhielten eine optionale `redirectTo`-Prop (Default `/neu`, unverändertes Verhalten für alle bestehenden Aufrufer), damit derselbe Formular-Code für den Partner-Weg zu `/neu/partner` statt `/neu` führt.
  - **Code-Anzeige im eigenen Bereich:** neue Luma erhielt eine minimale, geschützte Einstellungsseite `/neu/einstellungen` (existierte zuvor nicht) mit `NewPartnerCodeCard` (Code erzeugen/erneuern, Verbindung beenden), verlinkt von `/neu`. Die alte Luma nutzt den bestehenden `profile`-Bereich: `PartnerConnectionCard` ersetzt dort das alte Widget.
  - **Ersetzung des alten, unsicheren Partner-Systems (nach Owner-Klärung):** die frühere Route `/partner/[code]` (zeigte Zyklusphase, nächste Periode, Zyklustag und Stimmung offen über einen unauthentifizierten, base64-kodierten URL-Parameter, ganz ohne eigenes Partnerkonto oder Ablauf) sowie `/partner` und `src/components/PartnerCard.tsx` wurden vollständig entfernt. `src/lib/actions/partner.ts` (Server-Action für den alten Klartext-`partnerCode`) wurde gelöscht. `Dashboard.tsx` und `profile/page.tsx` nutzen jetzt `PartnerConnectionCard` statt `PartnerCard`. Das alte, ungenutzte `Profile.partnerCode`-Datenbankfeld (weiterhin bei Registrierung/Onboarding befüllt) wurde bewusst nicht entfernt oder migriert, um den bestehenden Registrierungs-/Onboarding-Code nicht über den Auftragsumfang hinaus anzufassen; es ist nach dieser Änderung nirgends mehr exponiert oder lesbar.
- nicht umgesetzt: Partnerkalender, Periodenanzeige für Partner, Push-Benachrichtigungen, Vorhersagen – wie im Soll ausdrücklich nicht enthalten. Keine Verbindung oder Datenvermischung zwischen alter und neuer Luma.
- Tests:
  - Neue `scripts/verify-partner-new.mts` (20 Prüfungen, raw `pg` gegen `luma_core`) und `scripts/verify-partner-old.mts` (20 Prüfungen, Prisma gegen `app_luma`): Code-Lebenszyklus (erzeugen, einmal einlösen, danach ablehnen), abgelaufener/falscher/eigener Code wird abgelehnt, Kontotrennung für zwei unabhängige Paare, bestehende aktive Verbindung blockiert eine zweite bis zum bewussten Beenden, ein Partnerkonto kann nicht zwei Owner gleichzeitig verbunden sein, **echte parallele Einlöseversuche mit zwei unabhängigen Datenbankverbindungen** (nicht nur `Promise.all` auf einer Verbindung) zeigen, dass von zwei gleichzeitigen Versuchen genau einer gelingt, und dass der gespeicherte Code-Hash nie dem Klartext entspricht. Alle 40 Prüfungen bestanden.
  - `node scripts/verify-luma-core.mjs`: Datenbanktrennung weiterhin bestätigt; der Zähler für neue Auth-Tabellen wurde von 6 auf 8 aktualisiert (zwei neue Partner-Tabellen), Zeilenzahlen um die neuen Tabellen erweitert.
  - Zusätzliche end-to-end-Prüfung per `curl` gegen einen lokalen Produktions-Build (`npm run build && next start`) für die neue Luma: Owner registriert sich, erzeugt Code, ein zweites, unabhängiges Konto meldet sich als Partner an, eigener Code wird abgelehnt (400), korrekter Code wird eingelöst (200), Status stimmt auf beiden Seiten überein, `/neu/partner` zeigt „Verbindung aktiv“, `/neu/einstellungen` zeigt die aktive Verbindung, Beenden funktioniert und der Partner verliert sofort beim nächsten Statusabruf den Zugriff. Alte Route `/partner/ANYCODE` liefert 404. `/neu` ohne Session leitet mit 307 zu `/neu/rolle` um.
  - Sicherheitsgrenzen per `curl` geprüft: alle vier Routen beider App-Varianten liefern ohne Session 401; `code`/`end` liefern bei falscher `Origin` 403; nach 5 Einlöseversuchen liefert die Route 429 (Rate-Limit greift).
  - Mobile Sichtprüfung mit temporär installiertem Playwright (Chromium, 375×812, danach vollständig wieder entfernt): `/rolle`, `/partner-registrieren`, `/partner-anmelden`, `/partner-bereich`, `/neu/rolle`, `/neu/partner-registrieren`, `/neu/partner-anmelden`, `/neu/partner` – kein horizontaler Überlauf, keine Konsolen-/Seitenfehler.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, alle 47 Routen erzeugt (14 neue: Rollenwahl, Partner-Registrierung/-Anmeldung/-Bereich, Einstellungen und die zugehörigen API-Routen beider App-Varianten).
  - Nach jedem Testlauf wurden alle erzeugten Testkonten aus beiden Datenbanken gelöscht; bestehende Datenbestände in `app_luma`/`luma_core` blieben unverändert (Zeilenzahlen bestehender Tabellen vor/nach der Arbeit identisch).
- Abweichungen:
  - **Owner-Rückfrage zum bestehenden, unsicheren Partner-System:** Vor der Umsetzung wurde ein Zielkonflikt festgestellt (siehe Stoppbedingung im Auftrag: „wenn der alte App-Weg keine sichere, getrennte Speicherung mit eindeutiger Kontozuordnung zulässt“) und dem Owner zur Klärung vorgelegt, statt eigenmächtig zu entscheiden. Entscheidung: das alte System wird vollständig ersetzt, nicht parallel weitergeführt. So umgesetzt.
  - **Gefundener und behobener Fehler – Zeitzonen-Diskrepanz bei `@prisma/adapter-pg`:** Die lokale Postgres-Session-Zeitzone ist `Europe/Berlin`. Bei Verwendung von SQL `NOW()` innerhalb einer Prisma-`$transaction`/`$queryRaw`-Kombination über `@prisma/adapter-pg` wich der zurückgegebene Zeitwert um exakt den Sommerzeit-Offset (2 Stunden) vom tatsächlichen UTC-Zeitpunkt ab, wodurch jeder frisch erzeugte, gültige Code fälschlich als bereits abgelaufen galt (`expires_at > NOW()` schlug immer fehl). Reproduziert und isoliert: derselbe Vergleich über den rohen `pg`-Treiber (ohne Prisma-Adapter, für die neue Luma verwendet) war korrekt; nur die Prisma-Adapter-Kombination zeigte den Fehler. Behoben, indem `redeemPartnerConnectionCode` (alte Luma) den Vergleichszeitpunkt als clientseitig erzeugtes `new Date()` statt als SQL `NOW()` an die Query übergibt – das umgeht die Diskrepanz robust, unabhängig von der Postgres-Session-Zeitzone. Die neue Luma (`src/lib/new-partner.ts`) verwendet weiterhin `NOW()`, da dort der rohe `pg`-Treiber nachweislich korrekt arbeitet (durch `verify-partner-new.mts` bestätigt). Zusätzlich wurden die entsprechenden Prisma-Spalten nachträglich von `TIMESTAMP(3)` (ohne Zeitzone, Prisma-Default) auf `TIMESTAMPTZ` umgestellt (Migration `partner_timestamptz`), da der ursprüngliche Typ das Risiko weiterer stiller Zeitzonenfehler erhöht hätte, auch wenn er allein die beobachtete Diskrepanz nicht verursachte.
  - Keine weitere fachliche Abweichung vom Soll.
- offene Punkte:
  - Owner-Prüfschritt für WP-004 steht aus (Rollenwahl nach beiden App-Varianten, Partner-Registrierung/-Anmeldung, Code erzeugen im jeweiligen Profil-/Einstellungsbereich, Code durch ein zweites, unabhängiges Konto einlösen, „Verbindung aktiv“ sehen, Verbindung bewusst beenden, danach sofortigen Zugriffsverlust prüfen; mobile Sichtprüfung).
  - Der bereits aus WP-003 bekannte, unabhängige Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort und war für dieses Paket nicht im Umfang.
  - Kein Deploy ohne gesonderte Owner-Freigabe – wie beauftragt nicht ausgelöst.
- Commit: folgt unmittelbar nach diesem Eintrag.

---

## Version 6 – Lesender Zyklus-Kreis für den Partner

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Der Partner sieht denselben Zyklus-Kreis wie die Nutzerin, aber nur als Ansicht. Er kann nichts ändern.
- **Warum machen wir das?** Der Partner soll auf einen Blick verstehen, in welcher Zyklusphase die Nutzerin gerade ist und wann die laufende Periode voraussichtlich endet.
- **Woher kam die Idee?** Aus dem bestätigten Partnerkalender und dem persönlichen Zyklus-Kreis der neuen Luma.
- **Wo ist es in der App?** Im verbundenen neuen Partnerbereich unter `/neu/partner`. Die Nutzerin schaltet die Freigabe im eigenen Partner-Einstellungsbereich ein oder aus.
- **Was sieht der Partner?** Den farbigen Kreis mit Heute-Marker, die aktuelle Phase und – nur wenn berechenbar – `Voraussichtliches Ende: [Datum]`. Jede Schätzung trägt den Hinweis `Kann abweichen`.
- **Was bleibt privat?** Historie, Profil, Notizen, Bearbeitung, Einstellungen und alle nicht ausdrücklich freigegebenen Daten bleiben privat.
- **Was kann die Nutzerin danach ausprobieren?** Freigabe einschalten, Partneransicht neu laden und den Kreis prüfen. Freigabe ausschalten: Der Kreis verschwindet wieder.

### Entstehungsweg

`Partner ist bereits sicher verbunden und sieht einen eingeschränkten Kalender → Partner braucht eine klare aktuelle Orientierung → derselbe vorsichtige Zyklus-Kreis auf derselben Datenbasis, aber nur nach sichtbarer Freigabe → WP-004 Version 6`

- bestätigtes Problem: Der Partnerbereich zeigt bisher nur Kalenderdaten. Die aktuelle Zyklusphase und ein mögliches Ende einer laufenden Periode sind nicht als einfache Übersicht sichtbar.
- gewünschte Wirkung: Der Partner versteht die aktuelle, ausdrücklich freigegebene Orientierung schnell, ohne private Daten bearbeiten oder weitere Details öffnen zu können.
- gewählte Lösung: Wiederverwendung der bestehenden persönlichen Zykluslogik und Kreis-Darstellung als strikt lesende Partneransicht.
- bestätigte Datenschutzentscheidung: Die Nutzerin schaltet `Zyklus-Kreis für Partner freigeben` bewusst ein und kann die Freigabe jederzeit wieder ausschalten (DEC-121).
- bestätigte Kennzeichnung: Ein erwartetes Ende enthält immer `Kann abweichen` und wird nie als tatsächliches Ende dargestellt (DEC-122).
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-IDEA-014.md`, DEC-121 und DEC-122.

### Soll – von Codex

- Der Umfang gilt ausschließlich für die **Neue Luma** und eine bereits aktive Verbindung unter `/neu/partner`.
- Die Nutzerin erhält im bestehenden eigenen Partner-/Einstellungsbereich einen klaren Schalter `Zyklus-Kreis für Partner freigeben`.
- Standard ist **nicht freigegeben**. Ohne aktive Freigabe werden keine Zyklus-Kreis-Daten an die Partneransicht geliefert.
- Nach Freigabe zeigt der Partner denselben aktuellen Zyklusstand wie die Nutzerin: Periode, mögliche PMS-Phase, mögliche Eisprungphase oder neutraler Zustand; ein roter Heute-Marker zeigt die heutige Position.
- Der Partnerkreis verwendet dieselbe Datenbasis und dieselbe Berechnungslogik wie der persönliche Kreis. Nach einer Änderung durch die Nutzerin zeigt ein Neuöffnen oder Neuladen der Partneransicht den aktuellen Stand.
- Für eine laufende Periode darf der Partner die bisher bestätigten Periodentage sehen und zusätzlich ein mögliches Ende als `Voraussichtliches Ende: [Datum] · Kann abweichen`.
- Bei zu wenigen Daten oder ohne berechenbaren Kreis zeigt der Partner einen neutralen Hinweis. Luma erfindet weder Phase noch Datum.
- Die Partneransicht ist vollständig lesend: kein Eintragen, Ändern, Löschen, Tagesfenster mit Bearbeitungsaktionen oder Zugriff auf die private Historie.

### Nicht enthalten

- Keine neue Push-Benachrichtigung, Gerätefreigabe oder Änderung der vorhandenen Benachrichtigungsauswahl.
- Keine Freigabe von Profil, Historie, Notizen, Symptomen, Stimmung, Zykluslänge als zusätzlichem Detail oder anderen Gesundheitsdaten.
- Keine Echtzeitverbindung, Websocket oder automatische Aktualisierung in einer bereits offen gelassenen Partneransicht; ein Neuöffnen oder Neuladen genügt in dieser Version.
- Keine Änderung an alter Luma, Verbindungscode, Rollenwahl, Anmeldung oder bestehenden Perioden-Editierfunktionen.

### Abnahmekriterien

1. Ohne aktive Verbindung oder ohne Freigabe liefert und zeigt die Partneransicht keine Phase, keinen Marker, kein erwartetes Ende und keine anderen Zyklus-Kreis-Daten.
2. Mit aktiver Freigabe sieht genau der verbundene Partner den lesenden Kreis mit derselben Phase und Heute-Position wie im privaten Bereich der Nutzerin.
3. Ein erwartetes Ende erscheint nur, wenn die bestehende Logik es liefern kann, und immer mit `Kann abweichen`.
4. Zu wenige Daten führen zu einer neutralen, verständlichen Ansicht statt zu einer erfundenen Phase oder Vorhersage.
5. Nach Ausschalten der Freigabe ist der Kreis beim nächsten Laden des Partnerbereichs nicht mehr abrufbar, obwohl die Verbindung bestehen bleibt.
6. Der Partner kann keine Zyklus-, Perioden- oder Freigabedaten ändern. Andere Partnerkonten erhalten nie die Daten eines fremden Paars.

### Technischer Auftrag für Claude – Version 6

#### Bestätigte Ausgangslage im Code

- `src/app/neu/page.tsx` lädt bereits die echten Periodeneinträge, das Zyklusprofil und die Periodenpläne des angemeldeten Owner-Kontos. Dort entstehen `personalCycleView` durch `computePersonalCycleView(...)` aus `src/lib/personal-cycle-view.ts` und die Kreisansicht `NewCycleExample`.
- `src/lib/personal-cycle-view.ts` ist die bestehende fachliche Quelle für die persönliche Zyklusansicht. Sie liefert vorsichtig `personal`, `profile_estimate` oder `no_data`, die heutige Phase, den Zyklustag, die Periodenlänge und den Anker. `src/lib/cycle-ring-geometry.ts` baut daraus die Ringsegmente und die Position des Heute-Markers.
- `src/app/neu/partner/page.tsx` prüft die Partner-Sitzung und aktive Verbindung. Der Bereich lädt ausschließlich über serverseitige Helfer; `NewPartnerCalendar` ist bereits eine lesende Client-Komponente.
- `src/lib/new-partner-calendar.ts` löst die aktive Owner-Zuordnung serverseitig auf und gibt nur die freigegebenen Kalenderdaten zurück. Dieses Muster ist für eine weitere, strikt begrenzte Partneransicht wiederzuverwenden.
- `new_partner_connections` liegt getrennt in `luma_core`; `src/lib/new-partner.ts` enthält den Verbindungskern. `new_partner_notification_preferences` betrifft nur die separate Ja/Nein-Auswahl für spätere Benachrichtigungen und ist nicht für die Kreisfreigabe umzudeuten.

#### Technisches Ziel

- Ergänze eine serverseitig erzwungene, standardmäßig deaktivierte Freigabe für den Zyklus-Kreis der **Neuen Luma**. Die Freigabe gehört zur aktiven Verbindung oder zu einer gleichwertig klar kontogebundenen Berechtigung; Claude wählt den kleinsten sicheren Platz im bestehenden Datenmodell.
- Ergänze im bestehenden Owner-Einstellungs-/Partnerbereich eine verständliche Umschaltmöglichkeit. Ausschalten muss den Zugriff sofort für spätere Partner-Abfragen sperren, ohne die Partnerverbindung zu beenden.
- Ergänze einen serverseitigen Partner-View-Helper, der erst die aktive Verbindung und die Kreisfreigabe prüft, dann ausschließlich die bereits vorhandenen Owner-Perioden, das Owner-Profil und die vorhandene persönliche Berechnung verwendet.
- Teile Berechnung oder Darstellung nur über wiederverwendbare Komponenten/Helfer. Es darf keine zweite, abweichende Berechnung für PMS, Eisprung, Zyklustag, Ring-Geometrie oder erwartetes Ende entstehen.
- Rendere im Partnerbereich eine reine Anzeigevariante des Kreises. Sie enthält keine Owner-IDs, Eintrags-IDs, E-Mail-Adressen, Rohdaten oder Schreibaktionen.
- Wenn die Freigabe aktiv ist, aber `personalCycleView` keine verlässliche Orientierung liefert, rendere eine neutrale Ansicht. Erwartetes Ende nur aus der bestehenden, vorsichtigen Logik ableiten und immer sichtbar als abweichende Erwartung markieren.

#### Daten, Schnittstellen und Migrationen

- **Migration nötig:** voraussichtlich ja, ausschließlich in `luma_core`, um die explizite Kreisfreigabe dauerhaft und kontogebunden zu speichern. Die bestehende WP-004-Migrationsfreigabe gilt für getrennte Änderungen im Partnerbereich der neuen Luma.
- **Datenwirkung:** ein sicherer Boolescher Freigabezustand mit Default `false`; keine Kopie von Perioden, Profilen oder Berechnungsergebnissen.
- **API-Wirkung:** eine geschützte Owner-Route zum Lesen/Ändern der eigenen Freigabe, mit Sitzung und Herkunftsprüfung. Partnerkreis-Daten ausschließlich über den serverseitig geschützten Render-/Helper-Weg oder eine gleichwertig streng geprüfte Lese-Route; nie über einen frei abrufbaren Owner-Endpunkt.
- **Keine Änderung:** `app_luma`, Verbindungscode-Tabellen, Codes, Auth-Daten, vorhandene Partner-Benachrichtigungspräferenz und reale Periodeneinträge bleiben unverändert.

#### Invarianten – müssen unverändert bleiben

- Ohne aktive Verbindung und ausdrückliche Freigabe gelangen keinerlei Kreiswerte in HTML, API-Antworten, Props oder Client-State des Partnerbereichs.
- Die Freigabe ist serverseitig durchzusetzen; ein verstecktes Client-Element oder eine URL darf sie nicht umgehen.
- Der Partner hat nur Lesezugriff. Die Owner-Ansicht und alle bestehenden Periodenfunktionen bleiben unverändert nutzbar.
- `no_data` bleibt ehrlich: keine erfundene Phase, kein erfundener Zyklustag und kein erfundenes Ende.
- Geschätzte Werte bleiben als möglich/abweichend gekennzeichnet. Kein medizinischer Rat und keine Diagnose.
- Konten und Paare bleiben vollständig getrennt. Widerruf der Verbindung sperrt die Kreisansicht ebenfalls.

#### Pflichtprüfungen

- Teste mindestens zwei unabhängige Owner-/Partner-Paare: Freigabe eines Paars darf nie für das andere sichtbar sein.
- Prüfe aktiv verbunden + Freigabe aus, aktiv verbunden + Freigabe an und nachträgliches Ausschalten; serverseitig dürfen im gesperrten Zustand keine Kreiswerte geliefert werden.
- Prüfe gleiche Berechnung mit kontrollierten Daten: Owner- und Partneransicht haben dieselbe Phase, denselben Heute-Marker und denselben vorsichtig gekennzeichneten Erwartungszustand.
- Prüfe `no_data`, Profil-Schätzung, persönliche Berechnung und laufende Periode. Nur tatsächlich bestätigte und klar erwartete Daten dürfen wie im Ownerbereich erscheinen.
- Prüfe Widerruf, fremdes Partnerkonto sowie fehlende Sitzung als Negativfälle.
- Führe bestehende Partnerkalender-, Partnerverbindungs-, Perioden- und persönlicher-Zyklus-Kreis-Regressionen, TypeScript, Produktions-Build und Ledger-/Work-Package-Validierung aus.
- Prüfe den Partnerbereich mobil: Kreis, neutraler Zustand und Freigabewechsel sind ohne horizontalen Überlauf verständlich.

#### Stoppbedingungen

- Stoppe, wenn die Freigabe nicht serverseitig und kontogebunden durchsetzbar ist.
- Stoppe, wenn die Kreisberechnung nur durch eine zweite, abweichende Fachlogik möglich wäre. Extrahiere stattdessen zuerst einen gemeinsamen geprüften Helfer.
- Stoppe vor einer stillen Freigabe, Datenkopie, Echtzeit-/Push-Erweiterung, Freigabe von Historie oder jeder Änderung an alter Luma.
- Stoppe, wenn der erwartete Endtag aus den vorhandenen Daten nicht eindeutig und vorsichtig ableitbar ist; zeige dann keinen Endtag.

#### Abschluss durch Claude

- Ergänze `Ist Version 6`, Tests, Abweichungen und offene Punkte sichtbar.
- Setze den Paketstatus auf `review`.
- Ergänze den Entwicklungsledger, führe `node scripts/work-package-state.mjs mark-updated WP-004` und danach `node scripts/work-package-state.mjs validate` aus.
- Committe und pushe ausschließlich auftragsbezogene Dateien. Ein manuelles Deployment ist nicht Teil dieses Pakets.

### Ist Version 6 – von Claude

- **Umgesetzt:** Der Owner erhält im bestehenden Einstellungsbereich (`/neu/einstellungen`) einen neuen Schalter `Zyklus-Kreis für Partner freigeben` (`NewPartnerCycleRingSharingToggle.tsx`), nur sichtbar bei aktiver Verbindung. Default ist **nicht freigegeben**. Die Freigabe wird als `cycle_ring_shared BOOLEAN NOT NULL DEFAULT FALSE` auf der bestehenden `new_partner_connections`-Zeile gespeichert (`database/luma-core/migrations/202609131000_partner_cycle_ring_sharing.sql`, angewendet) — bewusst kein neues Tabellenkonstrukt, sondern der kleinste sichere Platz auf der bereits kontogebunden eindeutigen aktiven Verbindung. Ein Widerruf der Verbindung (`endPartnerConnection`) macht die Freigabe automatisch mit ungültig, ohne eigene Zusatzlogik.
- Die Owner-Route `POST /api/neu/partner/cycle-ring-sharing` (`src/app/api/neu/partner/cycle-ring-sharing/route.ts`) prüft Herkunft und Sitzung und ändert über `setPartnerCycleRingShared` (`src/lib/new-partner.ts`) ausschließlich die eigene aktive Verbindung des angemeldeten Owners.
- Der neue serverseitige Helper `getPartnerCycleView` (`src/lib/new-partner-cycle-view.ts`) prüft zuerst aktive Verbindung **und** Freigabe in einer einzigen Datenbankabfrage; ohne beides liefert er `null`, und `/neu/partner` (`src/app/neu/partner/page.tsx`) rendert dann keinerlei Kreiswerte. Bei Freigabe lädt er ausschließlich die bereits vorhandenen Owner-Perioden und das Owner-Profil und ruft die bestehende, unveränderte `computePersonalCycleView` aus `src/lib/personal-cycle-view.ts` auf — exakt dieselbe Fachlogik wie die eigene Zyklusansicht des Owners unter `/neu`, keine zweite abweichende Berechnung.
- Der SVG-Kreis selbst wurde aus `NewCycleExample.tsx` in eine gemeinsame, reine Präsentationskomponente `CyclePersonalRing.tsx` extrahiert (Ring-Geometrie, Phasenfarben, Heute-Marker, Statustexte identisch, keine Duplizierung). `NewCycleExample.tsx` (Owner) nutzt sie unverändert weiter; die neue `NewPartnerCycleRing.tsx` (Partner) nutzt dieselbe Komponente, ergänzt aber ausschließlich lesende Elemente: keine Bearbeitungsknöpfe, keine Modals, kein Zugriff auf Historie, Profil oder Notizen.
- Für eine laufende Periode zeigt die Partneransicht zusätzlich `Voraussichtliches Ende: [Datum] · Kann abweichen`, abgeleitet aus dem bereits vorhandenen `expectedEndDate` des laufenden Periodeneintrags (derselbe Wert, den auch der bestehende Partnerkalender für „erwartete“ Tage nutzt) — keine neue Schätzlogik.
- `no_data` bleibt ehrlich: ohne ausreichende Owner-Daten liefert `getPartnerCycleView` den Status `no_data` mit `todayPhase: null`; die Partneransicht zeigt dann nur den neutralen Hinweis „Noch nicht genügend Daten für eine Orientierung.“, nie eine erfundene Phase oder ein erfundenes Datum.
- Keine Push-Benachrichtigung, keine Geräteberechtigung, keine Änderung an der bestehenden Benachrichtigungsauswahl, keine Freigabe von Profil/Historie/Notizen/Stimmung/Zykluslänge als Zusatzdetail, keine Echtzeitverbindung (ein Neuladen genügt) und keine Änderung an alter Luma, Verbindungscode, Rollenwahl oder Anmeldung.

**Tests:**
- Neue `scripts/verify-partner-cycle-ring.mts` (20 Prüfungen) gegen die lokale `luma_core`-Testdatenbank: ohne Verbindung liefert die Ansicht `null`; verbunden ohne Freigabe liefert `null`; nach Einschalten der Freigabe mit vier echten Perioden liefert sie `status: "personal"`, korrekt erkannte laufende Periode, dieselbe heutige Phase wie beim Owner und das erwartete Ende der laufenden Periode; nach Ausschalten liefert sie sofort wieder `null`, während die Verbindung selbst bestehen bleibt; zwei unabhängige Paare beeinflussen sich nie gegenseitig; ein Konto ohne eigene aktive Owner-Verbindung kann keine Freigabe setzen; ein frisch verbundenes Paar ohne Perioden liefert ehrlich `no_data` ohne erfundene Phase; ein Widerruf der Verbindung sperrt die Kreisansicht zusätzlich zur reinen Freigabe. Alle 20 Prüfungen bestanden.
- End-to-end über echten lokalen Dev-Server (`npm run dev`, Port 3000) mit echten HTTP-Requests und Sitzungscookies: Verbindung über Registrierung/Code/Einlösung hergestellt; Partnerseite zeigt vor Freigabe keinen „Zyklus-Kreis“-Text; nach `POST /api/neu/partner/cycle-ring-sharing` mit `shared:true` erscheint der Kreis-Abschnitt; nach `shared:false` verschwindet er beim nächsten Laden wieder; Route lehnt fehlende Sitzung (401) und falsche Herkunft (403) korrekt ab. Testkonten danach aus `luma_core` gelöscht.
- Mobile Sichtprüfung (Playwright temporär installiert, iPhone-Viewport 375×812, danach vollständig entfernt): Screenshot zeigt Kreis mit drei farblich unterscheidbaren Phasen (Periode, PMS, Eisprung), rotem Heute-Marker, „Zyklus: 28 Tage“ und „Voraussichtliches Ende: … · Kann abweichen“ unterhalb des Kreises, ohne Bearbeitungsknöpfe im Kreisbereich. `document.documentElement.scrollWidth > clientWidth` ist `false` — kein horizontaler Überlauf.
- Bestehende Regressionen erneut grün: `scripts/verify-partner-calendar.mts`, `scripts/verify-partner-new.mts`, `scripts/verify-partner-old.mts`, `scripts/verify-my-periods.mts`, `scripts/verify-partner-notification-preference.mts`, `scripts/verify-no-real-push.mts`, `node scripts/verify-luma-core.mjs` (unverändert 12 Tabellen, da diese Version nur eine Spalte ergänzt, keine neue Tabelle).
- `npx tsc --noEmit` fehlerfrei. `npm run build` erfolgreich; die Routenliste zeigt die neue `/api/neu/partner/cycle-ring-sharing`-Route und bestätigt, dass keine sonstigen Routen entfallen sind oder sich geändert haben.

**Abweichungen:**
- Keine. Die Freigabe wurde bewusst als zusätzliche Spalte auf `new_partner_connections` statt als eigene Tabelle umgesetzt, da sie exakt 1:1 an die aktive Verbindung gebunden ist (kleinster sicherer Platz im bestehenden Datenmodell, wie im Auftrag ausdrücklich zur Wahl gestellt) und ein Verbindungswiderruf die Freigabe dadurch automatisch mit beendet, ohne zusätzliche Lösch- oder Kaskadenlogik.

**Offene Punkte:**
- Owner-Prüfschritt im Browser steht aus (Schalter in den Einstellungen bedienen, Partneransicht auf einem zweiten Konto/Browser prüfen).
- Kein Deploy ausgelöst – wie beauftragt.

## Version 5 – Auswahl für spätere Benachrichtigungen

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Nach dem Verbinden sieht der Partner nur eine einfache Frage: `Möchtest du Benachrichtigungen erhalten?`
- **Die zwei Antworten:** `Ja, Benachrichtigungen aktivieren` oder `Nein, später`.
- **Was passiert jetzt wirklich?** Luma speichert nur die Auswahl dauerhaft beim Partnerkonto. Es wird noch keine Gerätefreigabe abgefragt und keine Nachricht versendet.
- **Warum machen wir das?** Die erste Einstellung soll leicht verständlich sein. Die genaue technische Push-Funktion wird erst später separat entschieden und getestet.
- **Was bleibt gleich?** Partnerkalender, Verbindungscode und die privaten Grenzen bleiben unverändert.

### Entstehungsweg

`Partner soll später Hinweise erhalten → vor dem technischen Versand zuerst bewusst entscheiden können → einfache Ja/Nein-Auswahl dauerhaft speichern → WP-004 Version 5`

- Ausgangsidee: Nach Codeeinlösung soll der Partner selbst entscheiden können, ob er später Benachrichtigungen erhalten möchte.
- bestätigte Wirkung: Die Auswahl ist einfach, wird nach dem erneuten Öffnen noch erkannt und löst noch keine echte Nachricht aus.
- gewählte Lösung: Eine kontogebundene Einstellung mit zwei Werten: aktivieren oder später.
- wichtige Entscheidung(en): DEC-115 bis DEC-118.
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-IDEA-014.md`.

### Soll – von Codex

- Nur im bereits verbundenen neuen Partnerbereich erscheint die Frage `Möchtest du Benachrichtigungen erhalten?`.
- Es gibt genau zwei sichtbare Antworten: `Ja, Benachrichtigungen aktivieren` und `Nein, später`.
- Beide Antworten speichern eine eindeutige persönliche Auswahl dauerhaft beim angemeldeten Partnerkonto.
- Nach dem Speichern zeigt Luma nur den einfachen Hinweis `Deine Auswahl wurde gespeichert.` Die Frage erscheint nach einem Neuladen oder erneuten Anmelden nicht wieder.
- Die Auswahl `Ja, Benachrichtigungen aktivieren` bedeutet in dieser Version ausschließlich: Interesse für später gespeichert. Sie fordert **keine** Systemberechtigung an und schickt **keine** Nachricht.

#### Nicht enthalten

- Kein echter Push-Versand, keine Testbenachrichtigung und keine Benachrichtigung bei Periodenstart oder -ende.
- Keine Anfrage an `Notification.requestPermission`, keine `PushManager.subscribe`-Anmeldung, keine VAPID-Schlüssel und keine Dokploy-Änderung.
- Keine neue Anzeige oder Bearbeitung von Gesundheits-, Zyklus- oder Periodendaten.
- Keine Änderung an der alten Luma.

### Abnahmekriterien

1. Ein neuer oder bereits verbundener Partner ohne gespeicherte Auswahl sieht die Frage nach dem Verbindungscode im Partnerbereich.
2. Ein Tipp auf `Ja, Benachrichtigungen aktivieren` oder `Nein, später` speichert genau diese Auswahl und bestätigt sie verständlich.
3. Nach Neuladen und erneutem Anmelden bleibt die Auswahl gespeichert; die Frage wird nicht wiederholt.
4. Die Auswahl löst weder eine Browser-/Geräteberechtigung noch eine Test- oder Periodenbenachrichtigung aus.
5. Ohne aktive eigene Partnerverbindung kann keine Auswahl gelesen oder gespeichert werden.
6. Partnerkalender, Codeeinlösung, Verbindung beenden und Abmeldung funktionieren unverändert.

### Technischer Auftrag für Claude – Version 5

#### Bestätigte Ausgangslage im Code

- `src/app/neu/partner/page.tsx` rendert im verbundenen Zustand den Partnerkalender und derzeit `NewPartnerPushActivation`.
- `src/components/NewPartnerPushActivation.tsx` fragt derzeit Geräteberechtigung an, speichert eine Push-Subscription und kann eine Testnachricht auslösen. Dieses Verhalten ist für Version 5 ausdrücklich nicht mehr erwünscht.
- `src/lib/new-partner-push.ts`, die Routen `/api/neu/partner/push-subscription` und `/api/neu/partner/push-test` sowie die Einhängepunkte in `POST /api/neu/periods` und `PUT /api/neu/periods/[id]` gehören zur bisherigen echten Push-Logik.
- `luma_core` enthält aus Version 4 bereits Push-Tabellen. Diese bereits migrierten Tabellen dürfen nicht zurückgesetzt oder für die neue Ja/Nein-Auswahl missbraucht werden.
- Die neue Luma verwendet kontogebundene Sitzungen, Herkunftsprüfung und `luma_core`.

#### Technisches Ziel

- Ersetze die bisherige sichtbare Push-Aktivierung im verbundenen neuen Partnerbereich durch eine kleine Client-Komponente oder gleichwertige UI für die bestätigte Ja/Nein-Auswahl.
- Speichere die Auswahl mit einer eigenen minimalen kontogebundenen Einstellung in `luma_core`; nutze dafür weder Browser-Subscriptions noch Push-Endpunkte.
- Ein Partner ohne gespeicherte Auswahl sieht die Frage. Ein Partner mit gespeicherter Auswahl sieht nach dem Laden nur den neutralen gespeicherten Status.
- Deaktiviere den gesamten tatsächlichen Versandweg aus Version 4: Keine Periodenroute darf ein Partner-Push-Ereignis auslösen; die UI darf keine Push-Subscription oder Testnachricht anfordern. Entferne oder sperre nicht mehr benötigte Push-Routen und -Komponenten sicher. Bereits migrierte Push-Tabellen dürfen als ungenutzte Altstruktur bestehen bleiben.
- Keine VAPID-Variablen erzeugen, ändern oder voraussetzen. Keine Produktions-, Dokploy- oder Deployment-Aktion ausführen.

#### Daten, Schnittstellen und Migrationen

- **Migration nötig:** ja, ausschließlich `luma_core`, für eine kleine Tabelle oder gleichwertig sichere Speicherung der Partner-Auswahl. Die Ownerin hat die getrennte Datenbankmigration für WP-004 bereits genehmigt.
- Die Einstellung referenziert nur das Partnerkonto, hat eine eindeutige Begrenzung pro Partnerkonto und eine explizit validierte Auswahl. Sie speichert keine Perioden-, Zyklus-, Profil- oder Geräteinformationen.
- Eine geschützte neue-Luma-Route darf die Auswahl nur für die eingeloggte Person mit aktiver eigener Partnerverbindung lesen/speichern. Sie prüft Sitzung und Herkunft und gibt keine fremden Daten aus.
- Die Daten aus der alten Luma und alle bestehenden Push-Tabellen bleiben unberührt.

#### Invarianten – müssen unverändert bleiben

- Die neue Ja/Nein-Auswahl löst niemals eine echte Benachrichtigung oder Geräteberechtigung aus.
- Kein Push-Endpoint, VAPID-Schlüssel, Geräteendpunkt oder Zeitraum wird von der Partnerseite gelesen, erzeugt oder angezeigt.
- Partner sieht weiterhin nur die bisher bestätigte eingeschränkte Kalenderansicht; private Bereiche bleiben geschlossen.
- Verbindungscode, Kontotrennung, Widerruf und Abmeldung bleiben sicher und unverändert.
- Keine Datenübernahme in die alte Luma und keine Dokploy-Aktion.

#### Pflichtprüfungen

- Verbundener Partner ohne Auswahl sieht beide bestätigten Buttons; Auswahl `Ja` und `Nein` speichern jeweils den korrekten Wert.
- Auswahl bleibt über Neuladen, neue Sitzung und erneute Anmeldung erhalten; eine andere Partnerperson kann sie nicht lesen oder überschreiben.
- Ohne aktive Verbindung sowie bei fremder Herkunft wird die Route abgelehnt.
- Prüfe nachweislich, dass kein Klick `Notification.requestPermission`, `PushManager.subscribe`, die alte Subscription-Route oder eine Testnachricht auslöst.
- Prüfe nachweislich, dass die POST-/PUT-Periodenrouten keinen Partner-Push mehr anstoßen.
- Bestehende Partnerkalender-, Verbindungscode-, Perioden- und Auth-Regressionen, TypeScript, Produktions-Build sowie `node scripts/work-package-state.mjs validate` ausführen.
- Entwicklungsledger ergänzen. Testdaten nach den Prüfungen entfernen.

#### Stoppbedingungen

- Stoppe, wenn die dauerhafte Speicherung nicht eindeutig kontogebunden, herkunfts- und sitzungsgeschützt nachweisbar ist.
- Stoppe vor Browser-/Geräteberechtigungen, VAPID-Konfiguration, Testnachrichten, echtem Versand, Dokploy oder einer Änderung der alten Luma.
- Stoppe, wenn das Abschalten der alten Push-Auslösung Partnerkalender oder Periodenspeicherung beeinträchtigt; dokumentiere den Befund statt andere Produktlogik zu verändern.

#### Abschluss durch Claude

- Ergänze `Ist Version 5`, Tests, Abweichungen und offene Punkte sichtbar.
- Lasse den Paketstatus auf `review`.
- Ergänze den Entwicklungsledger, führe `node scripts/work-package-state.mjs mark-updated WP-004` und danach `node scripts/work-package-state.mjs validate` aus.
- Committe und pushe ausschließlich auftragsbezogene Dateien. Keinen manuellen Deploy und keine Produktionskonfiguration ausführen.

### Ist Version 5 – von Claude

- **Umgesetzt:** Der verbundene neue Partnerbereich zeigt jetzt anstelle der echten Push-Aktivierung nur noch die einfache Frage `Möchtest du Benachrichtigungen erhalten?` mit den zwei Buttons `Ja, Benachrichtigungen aktivieren` und `Nein, später` (`src/components/NewPartnerNotificationPreference.tsx`). Beide Antworten speichern die Auswahl über `POST /api/neu/partner/notification-preference` (`src/app/api/neu/partner/notification-preference/route.ts`) kontogebunden in der neuen Tabelle `new_partner_notification_preferences` (`database/luma-core/migrations/202609111800_partner_notification_preference.sql`, angewendet). Nach dem Speichern zeigt die Seite ausschließlich `Deine Auswahl wurde gespeichert.`; ein erneuter Seitenaufruf liest die Auswahl serverseitig (`src/lib/new-partner-notification-preference.ts`) und zeigt die Frage nicht erneut.
- Die Route prüft Herkunft (`requestHasAllowedOrigin`) und Sitzung (`getNewAuthSession`) und lehnt ohne aktive eigene Partnerverbindung mit 403 ab. Die Tabelle hat `partner_user_id` als Primärschlüssel mit Fremdschlüssel auf `new_users` – pro Partnerkonto ist nur eine Zeile möglich, ein fremdes Konto kann sie weder lesen noch überschreiben.
- Der gesamte echte Versandweg aus Version 4 wurde deaktiviert und entfernt: `src/components/NewPartnerPushActivation.tsx`, `src/lib/new-partner-push.ts`, `src/app/api/neu/partner/push-subscription/route.ts`, `src/app/api/neu/partner/push-test/route.ts` sowie das dadurch unbenutzt gewordene `src/lib/berlin-date.ts` wurden gelöscht. Die Auslöse-Blöcke in `POST /api/neu/periods` und `PUT /api/neu/periods/[id]` (Aufruf von `dispatchPartnerPeriodEvent`) wurden entfernt; beide Routen lösen keinen Partner-Push mehr aus.
- Die bereits migrierten Push-Tabellen `new_partner_push_subscriptions` und `new_partner_period_events` (aus Version 4) wurden **nicht** gelöscht oder verändert und bleiben als ungenutzte Altstruktur bestehen, wie im Auftrag ausdrücklich erlaubt. `public/manifest.json`, `public/sw.js` und die Abhängigkeit `web-push` bleiben ebenfalls unverändert bestehen (harmlos, ungenutzt).
- Keine VAPID-Variable wurde erzeugt, geändert oder vorausgesetzt. Kein Dokploy- oder Produktions-Schritt wurde ausgeführt.

**Tests:**
- Neue `scripts/verify-partner-notification-preference.mts` (12 Prüfungen): Speichern ohne aktive Verbindung wird abgelehnt; verbundener Partner ohne Auswahl liefert `null`; `Ja` und `Nein` speichern jeweils den korrekten Wert; erneutes Speichern überschreibt (Update, kein Duplikat); Auswahl bleibt über einen erneuten Lesevorgang erhalten; ein anderes, unabhängiges Partnerkonto hat eine eigene, unbeeinflusste Auswahl; die Tabelle enthält ausschließlich Kontobindung, Auswahl und Zeitstempel – keine Zyklus-/Perioden-/Geräte-/Profildaten. Alle 12 Prüfungen bestanden.
- Neue `scripts/verify-no-real-push.mts` (16 Prüfungen, Quelltext-Nachweis): bestätigt, dass die entfernten Push-Dateien nicht mehr existieren, dass weder die neue Komponente noch die neue Route `Notification.requestPermission`, `PushManager`, `serviceWorker` oder die alten Push-Routen referenzieren, dass beide Periodenrouten `dispatchPartnerPeriodEvent` und das Push-Dispatch-Modul nicht mehr importieren, dass kein VAPID-/web-push-Bezug im neuen Code steckt, und dass die Migration der alten Push-Tabellen nicht entfernt wurde. Alle 16 Prüfungen bestanden.
- End-to-end über echten lokalen Dev-Server (`npm run dev`, Port 3006) mit echten HTTP-Requests und Sitzungscookies: Registrierung, Codeerzeugung, Codeeinlösung, Frage erscheint vor der Auswahl, `Ja` speichert korrekt, Seite zeigt danach nur noch `Deine Auswahl wurde gespeichert.` ohne erneute Frage, Route lehnt fehlende Sitzung (401), falsche Herkunft (403) und ein verbundenes, aber falsches Konto (Owner ohne Partnerrolle, 403) korrekt ab. Testkonten danach aus `luma_core` gelöscht.
- Regressionen erneut grün: `scripts/verify-partner-new.mts`, `scripts/verify-partner-old.mts`, `scripts/verify-partner-calendar.mts`, `scripts/verify-my-periods.mts`.
- `scripts/verify-luma-core.mjs` aktualisiert (Tabellenanzahl 10 → 11 wegen `new_partner_notification_preferences`) und erneut grün.
- `npx tsc --noEmit` fehlerfrei. `npm run build` erfolgreich; die Routenliste bestätigt, dass `push-subscription` und `push-test` nicht mehr existieren und nur noch `notification-preference` vorhanden ist.

**Abweichungen:**
- Die `.env.example`-Dokumentation der VAPID-Variablen aus Version 4 (nur Platzhalter, keine echten Werte) wurde nicht entfernt, da sie reine Dokumentation ohne Funktionswirkung ist und der Auftrag nur das Entfernen des tatsächlichen Versandwegs verlangt.
- `result.previousEntry` im Rückgabetyp von `updateNewPeriodEntry` (`src/lib/new-periods.ts`, aus Version 4) wird von den Periodenrouten nicht mehr gelesen, aber nicht entfernt, da es keine Sicherheits- oder Funktionswirkung hat und der Auftrag keine Bereinigung dieses Felds verlangt.

**Offene Punkte:**
- Owner-Prüfschritt steht aus (Sichtprüfung im Browser: Frage erscheint, Auswahl speichert sichtbar, keine Geräteberechtigung wird angefragt).
- Kein Deploy ausgelöst – wie beauftragt.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: WP-004 ist freigegeben. Die notwendige getrennte Datenbankmigration für alte und neue Luma wurde vom Owner ausdrücklich erlaubt.
- Nachschärfung: keine offene Produktfrage für den Verbindungskern. Partnerkalender und Push sind ausdrücklich spätere, getrennte Arbeitspakete.
- Product-Map aktualisiert: ja.

## Version 3 – Partnerkalender der neuen Luma

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Nach der Verbindung sieht der Partner in der **Neuen App** einen einfachen Monatskalender.
- **Was sieht der Partner?** Tatsächlich bestätigte Periodentage und, bei einer noch laufenden Periode, klar markierte erwartete Tage bis zum erwarteten Ende.
- **Beispiel:** Beginnt die Periode am 7. September und heute ist der 10. September, sind der 7. bis 10. September als `Bestätigt` sichtbar. Ist der 13. September als erwartetes Ende gespeichert, sind der 11. bis 13. September zusätzlich als `Erwartet – kann abweichen` sichtbar.
- **Was sieht der Partner nicht?** Keine PMS- oder Eisprungphase, keine Zykluslänge, keine Vorhersagen für eine neue Periode, keine Historienliste, keine Profilangaben und keine Bearbeitungsfunktionen.
- **Wer behält die Kontrolle?** Nur die Eigentümerin trägt Perioden ein, ändert oder löscht sie und kann die Verbindung beenden.

### Entstehungsweg

`Verbindung ist aktiv, aber der Partner sieht noch keinen Nutzen → sichere und sehr begrenzte Orientierung nötig → nur lesender Kalender mit klarer Trennung zwischen Tatsache und Erwartung → WP-004 Version 3`

- bestätigtes Problem: Die sichere Partnerverbindung funktioniert, zeigt im Moment aber nur `Verbindung aktiv`.
- gewünschte Wirkung: Der Partner erkennt auf einen Blick, welche Tage einer laufenden oder vergangenen Periode tatsächlich bestätigt und welche Tage nur erwartet sind.
- gewählte Lösung: Ein geschützter, nur lesender Monatskalender ausschließlich im neuen Partnerbereich.
- bestätigte Grenzen: Keine weiteren Zyklus- oder Gesundheitsinformationen; keine Eingabe; die alte Luma bleibt in dieser Version unverändert.
- Quellen/Akten: `APP-IDEA-014`, Owner-Beschreibung vom 10. September 2026.

### Soll – von Codex

- `/neu/partner` ersetzt bei aktiver neuer Partnerverbindung den Platzhalter durch einen Monatskalender.
- Der Kalender enthält nur Daten der Eigentümerin, die genau mit diesem aktiven Partnerkonto verbunden ist.
- Tatsächlich bestätigte Periodentage werden aus echten `startDate`/`endDate`-Werten abgeleitet. Bei einer laufenden Periode gelten die Tage vom tatsächlichen Start bis einschließlich heute als `Bestätigt`.
- Erwartete Tage sind nur bei einer laufenden Periode mit `expectedEndDate` sichtbar: ab morgen bis einschließlich erwartetes Ende. Sie tragen sichtbar `Erwartet` und `Kann abweichen`.
- Erwartete Tage werden nie als bestätigt dargestellt und beeinflussen keine Berechnung, Historie oder Datenbank.
- Der Partner kann Monat wechseln und Tagesinformationen nur lesen. Ein Tagesfenster darf nur Datum und Status `Bestätigt`, `Erwartet – kann abweichen` oder `Keine freigegebene Information` zeigen.
- Ohne aktive Verbindung, nach Widerruf oder bei einem fremden Konto werden keinerlei Periodendaten geliefert oder angezeigt.

### Nicht enthalten

- Partnerkalender in der alten Luma.
- Push-Nachrichten, E-Mails, Geräteberechtigungen, PMS, Eisprung, Zykluslänge, Vorhersage einer neuen Periode, Stimmungen, Profilangaben oder Periodenhistorie.
- Jede Eingabe, Änderung oder Löschung durch den Partner.
- Datenbankmigration oder Änderung von Periodendaten.

### Abnahmekriterien

1. Ein aktiv verbundener Partner der neuen Luma sieht einen einfachen Monatskalender.
2. Eine laufende Periode ab 7. September zeigt am 10. September den 7. bis 10. September als bestätigt.
3. Ein erwartetes Ende am 13. September zeigt nur den 11. bis 13. September als erwartet und abweichbar.
4. Eine abgeschlossene Periode zeigt nur echte, bestätigte Tage und keine erwarteten Tage.
5. Der Partner kann keine Periodendaten speichern, ändern oder löschen.
6. Ein anderer Partner, ein nicht verbundenes Konto und ein Partner nach Widerruf erhalten keine Daten – auch nicht direkt über eine API-Anfrage.
7. Mobile Ansicht bleibt ohne horizontalen Überlauf verständlich und bedienbar.

### Technischer Auftrag für Claude – Version 3

#### Bestätigte Ausgangslage im Code

- `src/app/neu/partner` ist der geschützte neue Partnerbereich aus WP-004 und zeigt mit aktiver Verbindung bisher nur den Platzhalter `Verbindung aktiv`.
- `src/lib/new-partner.ts` und die bestehenden `/api/neu/partner/*`-Routen prüfen die neue Sitzung sowie die aktive Verbindung.
- `src/lib/new-periods.ts` und die für `/neu` bereits geladenen `new_period_entries` enthalten nur kontogebundene echte `startDate`, optionales echtes `endDate` und optionales `expectedEndDate`.
- Die Home-Ansicht der neuen Luma besitzt bereits Monats- und Tagesdarstellung. Claude darf passende, reine Anzeige-/Datumslogik wiederverwenden, aber keine Owner-Interaktion oder Vorhersagelogik an den Partner weitergeben.

#### Technisches Ziel

- Ergänze eine serverseitig geschützte, ausschließlich lesende Datenquelle für den neuen Partnerbereich. Sie prüft vor jeder Antwort: neue Sitzung, aktiver Verbindungsstatus, zugehörige Eigentümerin und genau diese App-Variante.
- Gib ausschließlich die minimalen Kalenderdaten zurück, die für bestätigte Tage und erwartete Tage der aktuell verbundenen Eigentümerin erforderlich sind. Keine E-Mail-Adresse, keine Namen, keine IDs, keine vollständige Historie und keine Profil-/Zykluswerte.
- Leite den sichtbaren Tagesstatus ohne Speichern ab: echte abgeschlossene Tage und echte Tage einer laufenden Periode bis heute sind bestätigt; nur die noch kommenden Tage bis `expectedEndDate` sind erwartet.
- Baue eine klare, mobile lesbare Kalenderansicht. Farben oder Symbole müssen zusätzlich mit Text/Legende unterscheidbar sein.
- Tagesdialoge bleiben nur lesend. Sie dürfen keine Aktionen zum Periodenbeginn/-ende, Bearbeiten, Löschen oder Speichern enthalten.
- Die alte Partneransicht und die bestehende Verbindungskernlogik werden nicht umgebaut.

#### Invarianten – müssen unverändert bleiben

- Ohne aktive neue Partnerverbindung keine Antwort mit Periodendaten; nach Widerruf muss der Zugriff sofort scheitern.
- Partnerzugriff ist strikt lesend und nur für die verbundene Eigentümerin gültig.
- Erwartete Enddaten bleiben sichtbar vorläufig und werden nie zu echten Periodendaten oder Vorhersageeingaben.
- Bestehende Owner-Kalender-, Profil-, Verbindungs-, Authentifizierungs- und Datenbanklogik bleiben unverändert.
- Keine Datenbankmigration, keine Datenkopie zwischen alter/neuer Luma und keine Änderung an alten Partnerwegen.

#### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine neue Tabelle und keine Änderung gespeicherter Daten.
- API-Wirkung: nur eine neue oder erweiterte **lesende** neue Partnerroute, falls die vorhandene Statusroute nicht minimal genug ist.
- Migration nötig: nein.

#### Pflichtprüfungen

- Laufende Periode: bestätigte Tage bis heute und erwartete Tage erst ab morgen korrekt getrennt.
- Abgeschlossene Periode: nur echte bestätigte Tage.
- Kein `expectedEndDate`: keine erfundenen erwarteten Tage.
- Kein Zugriff ohne Sitzung, ohne aktive Verbindung, nach Widerruf oder mit einem Partnerkonto eines anderen Paares.
- API-Antwort enthält keine Namen, E-Mail-Adressen, IDs, PMS-, Eisprung-, Profil-, Historien- oder Bearbeitungsdaten.
- Partner-UI bietet keine schreibende Aktion; Tagesinformationen sind lesend.
- Mobile Sichtprüfung, TypeScript, gezielte Sicherheits-/Integrationstests, Produktions-Build und Entwicklungsledger-Validierung.

#### Stoppbedingungen

- Stoppe vor einer Migration, einer neuen Freigabemöglichkeit, Push-Nachricht, Profilweitergabe, Vorhersage oder jeder schreibenden Partneraktion.
- Stoppe, wenn die bestehende Verbindungsprüfung nicht pro Datenabruf sicher nachweisbar ist. Keine Daten auf den Client laden und dort erst filtern.
- Stoppe, wenn erwartete und bestätigte Tage nicht sicher unterscheidbar abgeleitet werden können.

#### Abschluss durch Claude

- Ergänze `Ist Version 3`, Abweichungen und Tests sichtbar.
- Setze den Paketstatus auf `review`.
- Ergänze das Entwicklungsledger, führe `node scripts/work-package-state.mjs mark-updated WP-004` und danach `node scripts/work-package-state.mjs validate` aus.
- Committe und pushe nur auftragsbezogene Dateien. Kein Deploy ohne weitere Owner-Freigabe.

### Ist Version 3 – von Claude

- umgesetzt:
  - Neues, rein lesendes Modul `src/lib/new-partner-calendar.ts` mit `getPartnerCalendarView(partnerUserId)`: eine einzige Query (`resolveActiveOwnerUserId`) prüft in einem Schritt, ob eine aktive Verbindung besteht und zu welcher Eigentümerin – vermeidet eine separate Statusabfrage, die zwischen zwei Aufrufen veralten könnte. Ohne aktive Verbindung liefert die Funktion `null`; Aufrufer dürfen in diesem Fall auf keine andere Datenquelle ausweichen (im UI-Code entsprechend umgesetzt).
  - Bestätigte Tage werden aus den echten `startDate`/`endDate`-Werten der Eigentümerin abgeleitet: bei einer laufenden Periode (kein echtes `endDate`) gelten die Tage vom tatsächlichen Start bis einschließlich heute als bestätigt. Erwartete Tage entstehen ausschließlich bei einer laufenden Periode mit gesetztem `expectedEndDate`: ab morgen bis einschließlich erwartetem Ende. Die Rückgabe enthält ausschließlich zwei Datumslisten (`confirmedDates`, `expectedDates`) als reine `YYYY-MM-DD`-Strings – keine IDs, keine E-Mail-Adressen, keine Namen, keine Profil-/Zykluswerte, keine Historie.
  - `src/app/neu/partner/page.tsx` (Server-Komponente, bereits bestehender geschützter Bereich aus Version 1/2) ruft bei aktiver Verbindung zusätzlich `getPartnerCalendarView` auf und übergibt nur die beiden Datumslisten an die neue Client-Komponente. Keine neue API-Route: die vorhandene, bereits sitzungsgeprüfte Server-Komponente lädt die Daten direkt, wodurch keine zusätzliche Angriffsfläche für einen Netzwerk-Endpunkt entsteht (im Sinne des Auftrags „nur eine neue... Route, falls die vorhandene Statusroute nicht minimal genug ist“ – hier war gar keine zusätzliche Route nötig).
  - Neue Client-Komponente `src/components/NewPartnerCalendar.tsx`: rein lesender Monatskalender (Wiederverwendung von `getCalendarMonthGrid`/`shiftCalendarMonth` aus dem bestehenden Owner-Kalender, aber ohne jede Owner-Interaktions- oder Vorhersagelogik). Jeder Tag ist ein Button, der ein schreibfreies Tagesfenster mit Datum und genau einem von drei Status öffnet: `Bestätigt`, `Erwartet – kann abweichen` oder `Keine freigegebene Information`. Zusätzlich zur Farbe (dunkel für bestätigt, hellgrau für erwartet) trägt jeder Tag ein Textkürzel (`B`/`E`) sowie eine textuelle Legende – Status ist nicht ausschließlich über Farbe erkennbar. Tagesfenster schließt über sichtbaren Button und Escape; der Hintergrund wird währenddessen über `inert` deaktiviert (gleiches Muster wie die bestehenden Owner-Tagesfenster).
  - Monatswechsel über `‹`/`›`-Pfeile ist möglich; alle Berechnungen bleiben rein clientseitige Ableitung aus den bereits geladenen, minimalen Datumslisten – kein weiterer Netzwerkaufruf beim Blättern.
- nicht umgesetzt: nichts aus dem vereinbarten Umfang offen. Kein Partnerkalender in der alten Luma, keine PMS-/Eisprung-/Zykluslängen-/Vorhersage-/Historien-/Profilanzeige, keine schreibende Partneraktion, keine Datenbankmigration.
- Tests:
  - Neues `scripts/verify-partner-calendar.mts` (12 Prüfungen, direkt gegen `luma_core`): kein Zugriff ohne aktive Verbindung; laufende Periode zeigt bestätigte Tage exakt vom echten Start bis einschließlich heute und erwartete Tage exakt ab morgen bis zum erwarteten Ende (mit expliziter Prüfung, dass der heutige Tag nicht als erwartet und der morgige Tag nicht als bestätigt erscheint); eine abgeschlossene Periode zeigt nur echte bestätigte Tage und keine erwarteten; eine laufende Periode ohne `expectedEndDate` erfindet keine erwarteten Tage; nach einem Widerruf sind sofort keine Daten mehr sichtbar; ein fremdes, nicht verbundenes Owner-Konto liefert keine Daten, während die eigenen verbundenen Daten weiterhin korrekt erscheinen. Alle 12 Prüfungen bestanden.
  - `scripts/verify-partner-new.mts` und `verify-partner-old.mts` erneut ausgeführt (Regressionsprüfung für Version 1/2 des Verbindungskerns): weiterhin alle 40 Prüfungen bestanden.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, weiterhin 47 Routen (keine neue Route hinzugekommen).
  - Zusätzliche end-to-end-Prüfung per `curl` gegen einen lokalen Produktions-Build: Owner registriert sich, trägt eine laufende Periode mit echtem Start vor drei Tagen und erwartetem Ende in zwei Tagen ein, erzeugt einen Code; ein zweites, unabhängiges Konto meldet sich als Partner an und löst den Code ein. Die gerenderte Partnerseite enthält die Legenden „Bestätigt“ und „Erwartet“ sowie den korrekten Monatsnamen, aber nachweislich **keine** der verbotenen Begriffe „PMS“, „Eisprung“ oder eine E-Mail-Adresse (per `grep` auf das vollständige gerenderte HTML geprüft). Ein drittes, nicht verbundenes Konto sieht auf derselben Route ausschließlich die Code-Eingabe, keine Kalenderdaten. Nach `POST .../partner/end` durch die Eigentümerin zeigt ein erneuter Abruf der Partnerseite durch das (jetzt getrennte) Partnerkonto sofort wieder nur die Code-Eingabe.
  - Mobile Sichtprüfung mit temporär installiertem Playwright (Chromium, 375×812, mit echter Partner-Session-Cookie gegen den lokalen Produktions-Build, danach vollständig wieder entfernt): kein horizontaler Überlauf, Legende „Bestätigt“ sichtbar, Tagesfenster öffnet und schließt korrekt über Escape, im Tagesfenster keine schreibenden Aktionen (`Speichern`/`Löschen`/`Bearbeiten` kommen nicht vor), keine Konsolen-/Seitenfehler.
  - Alle bei den Prüfungen erzeugten Testkonten und Testperioden wurden danach aus `luma_core` gelöscht; bestehende Datenbestände blieben unverändert.
- Abweichungen: keine fachliche Abweichung. Wie oben erläutert wurde bewusst keine zusätzliche API-Route ergänzt, da die vorhandene, bereits geschützte Server-Komponente die minimalen Daten direkt und sicher laden kann; das entspricht dem Auftrag, eine neue Route nur zu ergänzen, falls die vorhandene Statusroute nicht ausreicht.
- offene Punkte:
  - Owner-Prüfschritt für Version 3 steht aus (aktiv verbundener Partner öffnet `/neu/partner` und sieht den Monatskalender; laufende Periode zeigt bestätigte und erwartete Tage korrekt getrennt; abgeschlossene Periode zeigt nur bestätigte Tage; Tagesfenster ist rein lesend; mobile Sichtprüfung).
  - Der bereits aus früheren Paketen bekannte, unabhängige Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort und war für dieses Paket nicht im Umfang.
  - Kein Deploy ausgelöst – wie beauftragt nicht vorgenommen.
- Commit: folgt unmittelbar nach diesem Eintrag.

## Version 4 – Push-Benachrichtigungen für den neuen Partnerbereich

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Direkt nach dem erfolgreichen Verbindungscode kann der Partner auf seinem eigenen Gerät freiwillig Benachrichtigungen aktivieren.
- **Welche Hinweise kommen an?** Nur `Die Periode deiner Partnerin hat heute begonnen.` und `Die Periode deiner Partnerin ist heute zu Ende.`
- **Wann kommt kein Hinweis?** Bei erwarteten Tagen, Schätzungen, nachträglichen vergangenen Daten, ohne aktive Verbindung, ohne Gerätefreigabe oder nach einem bewussten Widerruf.
- **Wichtig auf iPhone:** Luma erklärt, dass die Web-App zuerst zum Home-Bildschirm hinzugefügt werden muss. Erst danach kann der Partner die Gerätefreigabe erteilen.
- **Was bleibt privat?** Der Partner erhält keine weiteren Zyklus-, Profil- oder Gesundheitsdaten. Er kann keine Daten ändern.

### Entstehungsweg

`Aktive Partnerverbindung und lesender Kalender → Partner soll bei einem tatsächlichen Ereignis sofort aufmerksam werden → freiwillige, gerätegebundene Push-Freigabe → direkte Hinweise nur bei heutigem echten Start oder Ende → WP-004 Version 4`

- bestätigtes Problem: Ohne aktive Benachrichtigung muss der Partner den Kalender selbst öffnen und erkennt den tatsächlichen Beginn oder das Ende nicht rechtzeitig.
- gewünschte Wirkung: Der aktiv verbundene Partner erhält auf seinem freiwillig freigegebenen Gerät einen klaren Hinweis zum heutigen tatsächlichen Beginn oder Ende.
- gewählte Lösung: Standardkonforme Web-Push-Benachrichtigung nach bewusstem Aktivieren direkt nach der Codeverbindung.
- bestätigte Grenzen: Nur neue Luma, nur Start und Ende, keine Schätzungen und keine zusätzlichen Gesundheitsinformationen.
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-IDEA-014.md`, DEC-109, DEC-110, DEC-115 und DEC-116.

### Soll – von Codex

- Der Umfang gilt ausschließlich für die **Neue Luma** und den bestehenden Partnerweg unter `/neu/partner`.
- Direkt nach einer erfolgreichen Codeeinlösung zeigt der Partnerbereich deutlich `Benachrichtigungen aktivieren`. Die Codeverbindung und der Kalender bleiben auch nutzbar, wenn der Partner ablehnt oder später entscheidet.
- Erst der bewusste Tipp des Partners darf die Betriebssystem-Abfrage starten. Benachrichtigungen werden nie still oder standardmäßig aktiviert.
- Auf iPhone/iPad prüft Luma vor der Abfrage, ob die Seite als Home-Bildschirm-Web-App läuft. Falls nicht, erklärt Luma in einfacher Sprache das Hinzufügen zum Home-Bildschirm und zeigt keine irreführende Aktivierungsbestätigung.
- Bei unterstützten Geräten speichert Luma die Push-Anmeldung ausschließlich für das angemeldete, aktiv verbundene Partnerkonto und dieses Gerät.
- Speichert die Eigentümerin einen tatsächlichen Beginn mit dem heutigen Kalenderdatum, erhält der Partner genau den Text `Die Periode deiner Partnerin hat heute begonnen.`
- Speichert die Eigentümerin ein tatsächliches Ende mit dem heutigen Kalenderdatum, erhält der Partner genau den Text `Die Periode deiner Partnerin ist heute zu Ende.`
- `Heute` richtet sich in dieser ersten Version nach `Europe/Berlin`, dem aktuellen Projekt- und Zielmarkt-Zeitraum. Eine spätere persönliche Zeitzone ist nicht Teil dieser Version.
- Eine Benachrichtigung entsteht nur, wenn das Ereignis durch Anlegen oder Ändern eines echten Periodeneintrags **neu** als heutiger Start beziehungsweise heutiges Ende gespeichert wird. Wiederholtes Speichern desselben Zustands darf keinen zweiten Hinweis senden.
- Nachträge vergangener Tage, erwartete Enddaten, geplante oder geschätzte Werte und neutrale Kalenderaktionen senden niemals Push-Nachrichten.
- Wird die Verbindung beendet, löscht oder deaktiviert Luma die zugehörigen Push-Anmeldungen. Danach darf kein weiterer Hinweis versendet werden.

### Nicht enthalten

- Push-Benachrichtigungen für die alte Luma.
- PMS, Eisprung, Zykluslänge, Stimmung, Historie, Profilinformationen oder eine Vorhersage einer neuen Periode.
- E-Mail, SMS, Werbung, wiederkehrende Erinnerungen oder Benachrichtigungen ohne aktive Partnerverbindung.
- Eine native iOS- oder Android-App. Dieser Umfang nutzt sichere Standard-Web-Push-Funktionen.

### Abnahmekriterien

1. Nach dem Einlösen eines gültigen Verbindungscodes sieht der Partner eine verständliche freiwillige Aktivierung.
2. Ohne bewusste Freigabe wird keine Push-Anmeldung gespeichert und der Partnerkalender bleibt dennoch zugänglich.
3. Ein unterstütztes Gerät kann die Freigabe aktivieren; das Ergebnis zeigt Luma klar an. Bei nicht unterstützter Umgebung oder abgelehnter Freigabe erscheint eine einfache, hilfreiche Erklärung.
4. Ein heutiger tatsächlicher Start erzeugt einmalig genau den bestätigten Starttext; ein heutiges tatsächliches Ende erzeugt einmalig genau den bestätigten Endtext.
5. Mehrfaches Speichern, erwartete Enden, Schätzungen und nachträgliche vergangene Daten erzeugen keinen Hinweis.
6. Nur das aktiv verbundene Partnerkonto kann für sein eigenes Gerät eine Anmeldung speichern; andere Konten, fremde Paare und getrennte Partner erhalten keine Nachricht.
7. Nach einem Widerruf werden Push-Anmeldungen entfernt oder wirksam deaktiviert; nachfolgende Ereignisse senden nichts.
8. Push-Daten, VAPID-Schlüssel und Geräte-Endpunkte erscheinen nie im Browser, in Logs, Tests, Fehlerantworten oder dem Repository.

### Technischer Auftrag für Claude – Version 4

#### Bestätigte Ausgangslage im Code

- `src/app/neu/partner/page.tsx` prüft bereits die neue Sitzung und den aktiven Partnerstatus. Erfolgreiche Codeeinlösung erfolgt über `src/components/NewPartnerRedeemForm.tsx` und `POST /api/neu/partner/redeem`.
- `src/lib/new-partner.ts` verwaltet den atomaren Verbindungskern und `endPartnerConnection` beendet eine Verbindung.
- Tatsächliche neue Perioden werden über `POST /api/neu/periods` und `PUT /api/neu/periods/[id]` mit `src/lib/new-periods.ts` gespeichert. Ein echter Start ist `startDate`; ein echtes Ende ist `endDate`; `expectedEndDate` ist ausdrücklich nur vorläufig.
- `public/sw.js` und `src/components/SwRegister.tsx` registrieren bereits einen Service Worker mit einem `push`- und `notificationclick`-Handler. Dieser darf sicher erweitert werden, darf aber keine persönlichen Daten in Logs ausgeben.
- Die neue Datenbasis ist `luma_core`; der Owner hat die notwendige Datenbankmigration für WP-004 bereits am 10. September 2026 ausdrücklich genehmigt.

#### Technisches Ziel

- Ergänze den Web-Push-Weg nur für die neue Luma: Manifest/Home-Screen-fähige Web-App, Service-Worker-Registrierung, Partner-Aktivierungsoberfläche und serverseitigen Versand.
- Nutze den Standard `Push API`/`Notifications API` mit VAPID. Der öffentliche Schlüssel darf nur zur Geräteanmeldung ausgeliefert werden; privater VAPID-Schlüssel und Absender bleiben ausschließlich als Produktionsgeheimnisse in der Laufzeitumgebung.
- Ergänze eine sitzungs-, herkunfts- und verbindungsgeprüfte Partnerroute zum Speichern und Entfernen einer Push-Anmeldung. Die Route akzeptiert nur eine valide Browser-Subscription und gibt nie Endpunkt, Schlüssel oder fremde Daten zurück.
- Speichere Subscriptions verschlüsselt oder so minimal geschützt wie technisch möglich; mindestens Endpoint sowie `p256dh`- und `auth`-Schlüssel nur serverseitig, kontogebunden, ohne Klartext-Ausgabe und mit eindeutiger Begrenzung pro Partnerkonto/Gerät.
- Ergänze eine deduplizierte serverseitige Ereignisaufzeichnung für `period_started` und `period_ended`, damit pro aktiver Verbindung und tatsächlichem heutigen Ereignis höchstens ein Versand entsteht – auch bei Doppelklick, Wiederholung, Aktualisierung oder parallelen Anfragen.
- Prüfe beim Auslösen und unmittelbar vor dem Versand erneut die aktive Verbindung. Beende/Widerruf entfernt die Subscription oder macht sie für den Versand unbrauchbar.
- Verknüpfe den Versand nur mit den beiden bestehenden echten Speicherwegen (POST/PUT). Vergleiche für PUT den bisherigen und neuen tatsächlichen Zustand; nur ein neu hinzugekommener heutiger Start oder ein neu hinzugekommenes heutiges Ende darf ein Ereignis auslösen.
- Sende erst nach erfolgreicher Speicherung. Ein Versandfehler darf niemals den echten Periodeneintrag zurückrollen oder die Nutzerin zu einer erneuten Eingabe zwingen. Permanenter Push-Fehler wie eine ungültige/abgemeldete Subscription entfernt genau diese Subscription sicher; Fehlerantworten bleiben allgemein.
- Nach erfolgreicher Codeeinlösung führt die Oberfläche ohne Umweg zur Aktivierungsaufforderung. Ist die Berechtigung bereits erteilt, zeigt sie den aktiven Status; bei Ablehnung erklärt sie knapp, wie der Partner die Berechtigung später erneut in den Browser-/Geräteeinstellungen erlauben kann.
- Die erste Meldung kann als kurze Test-Benachrichtigung erfolgen, aber nur nach bewusster Freigabe des Partners und ohne Gesundheitsinhalt, zum Beispiel `Luma-Benachrichtigungen sind aktiviert.`

#### Daten, Schnittstellen und Migrationen

- **Migration nötig:** ja, ausschließlich in `luma_core`. Keine Änderung an `app_luma` und keine Datenkopie.
- Lege eine kontogebundene Tabelle für Partner-Push-Anmeldungen an. Sie referenziert das Partnerkonto mit `ON DELETE CASCADE`, schützt doppelte Endpunkte per eindeutiger Begrenzung und speichert keine Zyklus- oder Profildaten.
- Lege eine zweite, minimale Tabelle oder gleichwertig robuste serverseitige Deduplizierung für versendete/auszulösende Partnerereignisse an. Sie verhindert mehrfachen Versand für dieselbe aktive Verbindung, Ereignisart und Ereignisdatum.
- Ergänze ausschließlich geschützte neue-Luma-Partnerendpunkte für Subscription/Abmeldung und eventuell einen lokalen Testversand. Kein frei abrufbarer Versandendpunkt und keine neue Partnerdaten-API.
- Ergänze die benötigten Laufzeitvariablen dokumentiert, aber ohne Werte im Repository: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` und ein zulässiger `VAPID_SUBJECT`. Produktionswerte werden später getrennt in Dokploy gesetzt; sie gehören nie in `.env`-Beispiele mit echten Werten, Commits oder Screenshots.

#### Invarianten – müssen unverändert bleiben

- Der Partner hat weiterhin ausschließlich Lesezugriff auf die bisher freigegebenen Kalenderdaten.
- Nur die aktive neue Partnerverbindung der Eigentümerin darf Hinweise an dieses Partnerkonto auslösen.
- Keine Nachricht bei `expectedEndDate`, Schätzung, Vergangenheit, fremden Konten, fehlender oder widerrufener Verbindung.
- Keine Klartext-Push-Endpunkte, Auth-Schlüssel, VAPID-Geheimnisse, Codes, Namen, E-Mail-Adressen oder Periodendaten in Logs, Fehlern, Ledger, Committexten oder Tests.
- Der direkte Nachrichtentext bleibt exakt auf Start/Ende begrenzt; keine neue medizinische Interpretation.
- Alte Luma, bestehende Auth-, Kalender-, Partnercode- und Periodenlogik bleiben außerhalb der notwendigen Einhängepunkte unverändert.

#### Pflichtprüfungen

- Unit-/Integrationstests für Subscription-Validierung, Partner-/Kontotrennung, fehlende Verbindung, Widerruf und serverseitige Entfernung ungültiger Subscriptions.
- Start/Ende: heutiger neuer tatsächlicher Wert löst je genau ein Ereignis aus; Wiederholung und parallele Anfrage erzeugen kein zweites.
- Negativfälle: erwartetes Ende, Schätzung, vergangenes Datum und neutrales Update lösen nichts aus.
- Versand wird nach Widerruf oder bei fremdem Partnerkonto zuverlässig unterdrückt.
- Teste Service Worker und Partner-Aktivierungsweg mobil. Prüfe iPhone/Home-Screen-Hinweis, Ablehnung, bereits erteilte Freigabe und nicht unterstützte Browser verständlich.
- Prüfe, dass Antworten und gerenderte Partnerseiten weder Push-Endpunkte noch Schlüssel oder verbotene Gesundheitsdaten ausgeben.
- TypeScript, zielgerichtete Sicherheits-/Datenbanktests, bestehende Partner-/Periodenregressionen, Produktions-Build und Entwicklungsledger-Validierung.

#### Stoppbedingungen

- Stoppe vor einem Deployment oder vor dem Setzen echter VAPID-Geheimnisse in Dokploy. Das ist eine getrennte Produktionsfreigabe der Ownerin.
- Stoppe, wenn eine sichere kontogebundene Speicherung, Deduplizierung oder Widerruf nicht nachweisbar ist.
- Stoppe vor einer stillen Standardfreigabe, Push für die alte Luma, einer Profil-/Zyklusdaten-Erweiterung oder dem Versand bei erwarteten/geschätzten Daten.
- Stoppe bei fehlender Browserunterstützung nicht mit einer Fake-Erfolgsmeldung; zeige stattdessen eine klare Hilfe und lasse den Partnerkalender nutzbar.

#### Abschluss durch Claude

- Ergänze `Ist Version 4`, Tests, Abweichungen und offene Punkte sichtbar.
- Setze den Paketstatus auf `review`.
- Ergänze den Entwicklungsledger, führe `node scripts/work-package-state.mjs mark-updated WP-004` und danach `node scripts/work-package-state.mjs validate` aus.
- Committe und pushe ausschließlich auftragsbezogene Dateien. Ein Test von echten Push-Nachrichten in Produktion sowie ein Deploy bleiben eine getrennte Owner-Freigabe.

### Ist Version 4 – von Claude

- umgesetzt:
  - **Datenmodell, ausschließlich `luma_core`:** neue Migration `202609111200_partner_push.sql` – `new_partner_push_subscriptions` (`partner_user_id` mit `ON DELETE CASCADE`, `endpoint` UNIQUE, `p256dh`/`auth`-Schlüssel, keine Zyklus-/Profildaten) und `new_partner_period_events` (Deduplizierungsprotokoll mit `UNIQUE(owner_user_id, event_type, event_date)` – der eigentliche Schutz gegen Mehrfachversand ist dieser Datenbank-Constraint, nicht Anwendungslogik). Keine Änderung an `app_luma`.
  - **Zeitzone:** neues Modul `src/lib/berlin-date.ts` mit `todayBerlinDateOnly()` – ermittelt „heute“ explizit über `Intl.DateTimeFormat` mit der IANA-Zone `Europe/Berlin`, unabhängig von der Server-Prozess-Zeitzone (die in Produktion UTC sein kann – siehe der in WP-004 Version 1 gefundene Prisma/pg-Zeitzonenfehler). Mit einem festen Zeitpunkt getestet, an dem UTC und Europe/Berlin bereits unterschiedliche Kalendertage haben.
  - **Kernlogik `src/lib/new-partner-push.ts`:** `savePartnerPushSubscription`/`removePartnerPushSubscription` (kontogebunden, `ON CONFLICT (endpoint)` verhindert Duplikate bei erneuter Anmeldung desselben Geräts), `parsePushSubscription` (strukturelle Validierung: `https://`-Endpoint, vorhandene `p256dh`/`auth`-Schlüssel), `dispatchPartnerPeriodEvent` (deduplizierter, „best effort“ Versand – schlägt der Insert wegen des UNIQUE-Constraints fehl, ist der Aufruf ein No-op; Versandfehler werden abgefangen und dürfen den Aufrufer nie beeinflussen; eine dauerhaft ungültige Subscription (HTTP 404/410 vom Push-Dienst) wird automatisch entfernt), `sendPartnerTestNotification` für die freiwillige Test-Benachrichtigung nach Aktivierung.
  - **Widerruf:** `endPartnerConnection` (in `src/lib/new-partner.ts`) gibt jetzt die `partner_user_id` der soeben beendeten Verbindung zurück und löscht in derselben Funktion sofort alle Push-Subscriptions dieses Partnerkontos – kein zusätzlicher Aufruf nötig, kein Zeitfenster für einen weiteren Versand nach dem Widerruf.
  - **Auslösung nur bei einem echten heutigen Ereignis:** `POST /api/neu/periods` löst `period_started`/`period_ended` aus, wenn `startDate`/`endDate` des neu gespeicherten Eintrags exakt `todayBerlinDateOnly()` entspricht. `PUT /api/neu/periods/[id]` vergleicht dafür zusätzlich den Zustand vor der Änderung (`updateNewPeriodEntry` in `src/lib/new-periods.ts` liefert jetzt `previousEntry` zurück): nur wenn der heutige Wert **neu hinzugekommen** ist (vorher war `startDate`/`endDate` nicht bereits heute), wird ein Ereignis ausgelöst – wiederholtes Speichern desselben Zustands, ein erwartetes Ende oder ein nachgetragener vergangener Tag lösen nichts aus. Der Versand erfolgt `void` (fire-and-forget) erst nach erfolgreichem Speichern; ein Versandfehler kann die Antwort oder den gespeicherten Eintrag nie beeinflussen.
  - **API-Routen (ausschließlich neue Luma, sitzungs-, herkunfts- und ratenbegrenzt):** `POST/DELETE /api/neu/partner/push-subscription` (Speichern erfordert zusätzlich eine aktive Partnerverbindung; kein Endpunkt gibt je einen gespeicherten Endpunkt oder Schlüssel zurück) und `POST /api/neu/partner/push-test` (freiwillige Testbenachrichtigung, ebenfalls nur mit aktiver Verbindung). Kein frei abrufbarer Versandendpunkt.
  - **UI:** neue Komponente `src/components/NewPartnerPushActivation.tsx` in `/neu/partner`: erkennt iOS-Geräte außerhalb des Home-Bildschirm-Modus und zeigt dafür eine einfache Erklärung statt der Aktivierungsabfrage; prüft Browser-Unterstützung (`serviceWorker`, `PushManager`) und zeigt bei fehlender Unterstützung eine klare, nicht irreführende Meldung; erst ein bewusster Tipp startet `Notification.requestPermission()` und danach `PushManager.subscribe` mit dem öffentlichen VAPID-Schlüssel; bei bereits erteilter Berechtigung wird der aktive Status direkt angezeigt, bei Ablehnung ein knapper Hinweis zum erneuten Erlauben in den Geräteeinstellungen. Nach erfolgreicher Aktivierung steht ein Button für eine kurze, gesundheitsneutrale Test-Benachrichtigung (`Luma-Benachrichtigungen sind aktiviert.`) zur Verfügung. Der Partnerkalender bleibt in jedem Zustand vollständig nutzbar.
  - **Web-App-Voraussetzungen:** neues `public/manifest.json` (Name, `start_url: /neu`, `display: standalone`) im Root-Layout verlinkt, damit die Seite auf iOS zum Home-Bildschirm hinzugefügt werden kann. `public/sw.js` unverändert im Push-/Klick-Verhalten, nur das Ziel eines Notification-Klicks wurde von `/` auf `/neu/partner` präzisiert; keine persönlichen Daten werden im Service Worker geloggt.
  - **Laufzeitvariablen dokumentiert, ohne Werte im Repository:** `.env.example` um `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` als leere Platzhalter mit Erzeugungshinweis (`npx web-push generate-vapid-keys`) ergänzt. Für lokale Entwicklungs-/Testzwecke wurden eigens generierte, ausschließlich lokale Testschlüssel in die nicht versionierte `.env.local` eingetragen (durch `.gitignore`-Muster `.env*` geschützt) – niemals Produktionswerte, niemals committed.
  - **Neue Abhängigkeit:** `web-push` (Produktionsabhängigkeit) und `@types/web-push` (Dev-Abhängigkeit) ergänzt – die Standardbibliothek für VAPID-signierten Web-Push in Node.
- nicht umgesetzt: nichts aus dem vereinbarten Umfang offen. Kein Push für die alte Luma, keine PMS-/Eisprung-/Zykluslängen-/Stimmungs-/Historien-/Profilinformationen im Nachrichtentext, keine native App, kein Setzen echter Produktions-VAPID-Geheimnisse in Dokploy, kein Deploy.
- Tests:
  - Neues `scripts/verify-partner-push.mts` (12 Prüfungen, direkt gegen `luma_core`): Subscription ist kontogebunden; ein doppelt registrierter Endpunkt überschreibt statt zu duplizieren und übernimmt die neuesten Schlüssel; dasselbe Ereignis am selben Tag löst nur einmal aus (UNIQUE-Constraint); verschiedene Ereignisarten/-daten sind unabhängig voneinander; **echte parallele Aufzeichnungsversuche mit zwei unabhängigen Datenbankverbindungen** zeigen, dass von zwei gleichzeitigen Versuchen genau einer gewinnt; nach einem Widerruf werden die Push-Subscriptions des betroffenen Partners sofort entfernt, während die Subscription eines unbeteiligten Partnerkontos unverändert bestehen bleibt (Kontotrennung). Alle 12 Prüfungen bestanden.
  - Neues `scripts/verify-partner-push-triggers.ts` (13 Prüfungen): `todayBerlinDateOnly` liefert das korrekte Format und löst die Europe/Berlin-Zeitzone auch an einem festen Zeitpunkt korrekt auf, an dem UTC und Berlin unterschiedliche Kalendertage haben; die POST-Route nutzt die Berlin-Zeit und löst Start-/Ende-Ereignisse fire-and-forget aus; die PUT-Route vergleicht nachweislich den vorherigen Zustand, bevor sie ein Ereignis auslöst; `updateNewPeriodEntry` liefert den vorherigen Zustand zurück; die Subscription-Route verlangt eine aktive Verbindung, prüft Herkunft und ist ratenbegrenzt, und keine ihrer Fehlermeldungen enthält einen Endpunkt oder Push-Schlüssel im Text. Alle 13 Prüfungen bestanden.
  - `scripts/verify-partner-calendar.mts`, `verify-partner-new.mts`, `verify-partner-old.mts`, `verify-my-periods.mts` erneut ausgeführt (Regressionsprüfung für Version 1–3 sowie den bestehenden Periodenweg): weiterhin alle Prüfungen bestanden.
  - `scripts/verify-luma-core.mjs`: die harten Tabellenzähler wurden von 8 auf 10 aktualisiert (zwei neue Partner-Push-Tabellen); Datenbanktrennung weiterhin bestätigt, alle neun Migrationen korrekt gelistet, keine verbliebenen Testdaten in den neuen Tabellen.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, 49 Routen (zwei neue: `push-subscription`, `push-test`).
  - Zusätzliche end-to-end-Prüfung gegen einen lokalen Produktions-Build mit **echten, lokal generierten Test-VAPID-Schlüsseln** (`npx web-push generate-vapid-keys`, ausschließlich in der nicht versionierten `.env.local`): Owner und Partner registrieren sich, verbinden sich per Code; eine strukturell gültige, aber nicht echte Push-Subscription wird über die neue Route gespeichert (201), eine Subscription mit fehlenden Schlüsseln oder nicht-`https://`-Endpunkt wird abgelehnt (400); eine Periode mit heutigem Start wird gespeichert, der (an einen nicht existierenden Endpunkt gerichtete) Versandversuch läuft asynchron ohne die Server-Antwort zu beeinträchtigen oder einen unbehandelten Fehler zu erzeugen, und erzeugt genau einen Eintrag im Deduplizierungsprotokoll mit dem korrekten Berlin-Datum; ein anschließendes erneutes Speichern desselben heutigen Starts (mit zusätzlich ergänztem `expectedEndDate`) erzeugt nachweislich **kein** zweites Protokoll-Ereignis; nach dem Beenden der Verbindung durch die Eigentümerin ist die zuvor gespeicherte Push-Subscription des Partners sofort aus der Datenbank entfernt.
  - Mobile Sichtprüfung mit temporär installiertem Playwright (Chromium, 375×812, mit echter Partner-Session gegen den lokalen Produktions-Build, danach vollständig wieder entfernt): In Headless-Chromium ist `Notification.permission` systembedingt fest auf `denied` gesetzt (unabhängig von der Playwright-Context-Permission-Einstellung) – die Komponente zeigt dafür korrekt den „Benachrichtigungen sind blockiert“-Hinweis mit Erklärung zum erneuten Erlauben, der Partnerkalender bleibt währenddessen vollständig nutzbar (Kalenderlegende weiterhin sichtbar), kein horizontaler Überlauf, keine Konsolen-/Seitenfehler. Der bewusste Freigabe-Klick selbst sowie eine erfolgreiche `granted`-Aktivierung konnten in dieser automatisierten Headless-Umgebung technisch nicht ausgelöst werden (Browser-Einschränkung, kein Testfehler); die zugehörige Zustandslogik wurde stattdessen durch Quelltext-Prüfung in `verify-partner-push-triggers.ts` sowie durch den erfolgreichen End-to-End-Nachweis des serverseitigen Subscription-Speicherns abgesichert.
  - Alle bei den Prüfungen erzeugten Testkonten, Testperioden, Testverbindungen und Test-Subscriptions wurden danach aus `luma_core` gelöscht (per `ON DELETE CASCADE` inklusive Subscriptions/Events); bestehende Datenbestände blieben unverändert.
- Abweichungen:
  - Der Auftrag lässt offen, ob die Push-Aktivierungsoberfläche als eigene, getrennte Route oder inline im bestehenden `/neu/partner`-Bereich erscheinen soll. Da der Auftrag ausdrücklich „nach erfolgreicher Codeeinlösung führt die Oberfläche ohne Umweg zur Aktivierungsaufforderung“ verlangt, wurde die Komponente direkt und ohne Navigationsumweg in die bestehende, bereits geschützte `/neu/partner`-Seite integriert statt eine neue Route zu ergänzen – das ist die direktere Umsetzung des Solls, keine Abweichung vom Ziel.
  - Kein `favicon.ico`-hochauflösendes App-Icon war im Projekt vorhanden; das minimale `manifest.json` referenziert daher das bestehende `favicon.ico`. Für die funktionale Home-Bildschirm-/Standalone-Erkennung dieser Version ist das ausreichend; ein gestaltetes App-Icon war nicht Teil des Auftrags und wurde nicht ergänzt.
  - Keine weitere fachliche Abweichung vom Soll.
- offene Punkte:
  - Owner-Prüfschritt für Version 4 steht aus (nach Codeeinlösung Aktivierungsaufforderung sehen, auf einem unterstützten Gerät aktivieren, Testbenachrichtigung erhalten, danach eine echte Periode mit heutigem Start/Ende speichern und den bestätigten Text empfangen, Wiederholung prüft aus, Widerruf entfernt die Anmeldung; iPhone-Home-Bildschirm-Hinweis in echter Safari-Umgebung prüfen, da dies in der automatisierten Prüfung nicht nachstellbar war).
  - **Produktions-VAPID-Schlüssel sind noch nicht in Dokploy gesetzt** – ohne sie bleibt Push in Produktion inaktiv (die Aktivierungsoberfläche zeigt dann korrekt den „nicht unterstützt“-Hinweis, da `NEXT_PUBLIC_VAPID_PUBLIC_KEY` fehlt). Das Setzen dieser Geheimnisse ist ausdrücklich eine getrennte Owner-Freigabe.
  - Der bereits aus früheren Paketen bekannte, unabhängige Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort und war für dieses Paket nicht im Umfang.
  - Kein Deploy ausgelöst – wie beauftragt nicht vorgenommen.
- Commit: folgt unmittelbar nach diesem Eintrag.


## Version 11 - Feste Partneransicht nach aktiver Verbindung

### Owner-Ansicht - einfach erklaert

- Kurz gesagt: Sobald der Partner den persoenlichen Code erfolgreich eingeloest hat, sieht er automatisch die fest vereinbarte Partneransicht. Es gibt keine einzelnen Schalter fuer Kalender, Zyklus-Kreis oder Fruchtbarkeitsvorhersage mehr.
- Der Partner sieht nur lesend: echte Periodentage, die geschaetzte naechste Periode, moegliches fruchtbares Zeitfenster, moeglichen Eisprung, moegliche PMS-Phase und den Zyklus-Kreis.
- Schaetzungen sind immer sichtbar als moeglich/geschaetzt und mit Kann abweichen gekennzeichnet. Sie sind keine bestaetigte Fruchtbarkeit oder medizinische Aussage.
- Private Profilangaben, Symptome, Notizen, die vollstaendige Historie sowie alle Bearbeiten- und Loeschfunktionen bleiben privat.
- Wenn die Eigentumerin die gesamte Verbindung in ihren Einstellungen beendet, verschwindet die gesamte Partneransicht sofort.
- Die freiwillige Auswahl fuer spaetere Benachrichtigungen bleibt eine getrennte Geraeteentscheidung und ist kein Freigabe-Schalter fuer Gesundheitsdaten.

### Entstehungsweg

Einzelne Kalender- und Kreisfreigaben erzeugen wiederholte Einstellungen. Die Ownerin moechte eine klare feste Partneransicht nach einmaliger Codeverbindung. Die aktive Verbindung wird zur einmaligen Freigabe fuer genau den vereinbarten begrenzten Inhalt.

- bestaetigtes Problem: Die bisherigen einzelnen Schalter fuer Kalender und Zyklus-Kreis passen nicht zur gewuenschten einfachen festen Partneransicht.
- gewuenschte Wirkung: Nach einer bewussten einmaligen Verbindung sieht der Partner die vereinbarten Kerninformationen ohne weitere Einstellungen.
- gewaehlte Loesung: Einzelne Freigabeoberflaechen und ihre serverseitigen Daten-Gates entfallen. Die aktive Verbindung allein ist die serverseitig gepruefte Voraussetzung fuer die begrenzte lesende Kernansicht.
- bestaetigte Grenzen: Kein Zugang zum privaten Konto, keine Bearbeitung, keine Symptome/Notizen/Profile/Historie und kein neuer Push-Versand.
- Quellen/Akten: APP-IDEA-014, DEC-127, Owner-Entscheidung vom 2026-10-05.

### Soll - von Codex

- Ein aktiv verbundenes Partnerkonto der Neuen Luma sieht ohne weitere einzelne Freigabe: Zyklus-Kreis, bestaetigte Periodentage, geschaetzte naechste Periode, moegliches fruchtbares Zeitfenster, moeglichen Eisprung und moegliche PMS-Phase.
- Die Partneransicht bleibt ausschliesslich lesend. Der Partner kann keine Perioden, Zyklusdaten oder Freigaben speichern, aendern oder loeschen.
- Der Partnerkalender zeigt echte Periodentage vorrangig sowie zusaetzliche Vorhersagemarker fuer geschaetzte Periode, moegliches fruchtbares Zeitfenster, moeglichen Eisprung und moegliche PMS-Phase. Wenn mehrere Angaben auf denselben Tag fallen, bleiben sie gleichzeitig und verstaendlich sichtbar.
- Eisprung ist genau ein vorhergesagter Tag; fruchtbares Zeitfenster, PMS und geschaetzte Periode bleiben als Vorhersage klar beschriftet. Vorhersage unsicher - Kann abweichen erscheint auch in der Partneransicht, wenn die vorhandene Logik die Unsicherheit liefert.
- Die Partneransicht verwendet dieselbe bestehende Zyklus- und Vorhersagelogik wie /neu. Es darf keine zweite fachliche Zyklusberechnung entstehen.
- Alle bisherigen einzelnen UI-Schalter fuer Zyklus-Kreis und Partnerkalender verschwinden aus /neu/einstellungen. Die zugehoerigen alten Routen und Komponenten duerfen keine Wirkung mehr auf die Partneransicht haben.
- Eine aktive Verbindung bleibt die alleinige Voraussetzung. Ohne Verbindung, nach Widerruf oder mit fremdem Partnerkonto werden keine Daten geladen oder angezeigt.
- Profilangaben, Symptome, Notizen, E-Mail-Adressen, IDs, vollstaendige Historie und Bearbeitungsrechte gelangen nicht in die Partneransicht.

### Nicht enthalten

- Keine neue Datenmigration und keine Aenderung bestehender Perioden-, Profil- oder Partnerdaten.
- Keine Erweiterung der alten Luma, der Anmeldung oder von WP-005.
- Keine Speicherung oder Auswertung von Symptomen, keine Personalisierung aus Symptomen und keine medizinische Beratung.
- Keine neue Push-Aktivierung, keine Browserberechtigung, keine VAPID-Konfiguration und kein Versand von Benachrichtigungen.
- Kein Foto, kein Name und keine vollstaendige Periodenhistorie in der Partneransicht.

### Abnahmekriterien

1. Eine aktive Verbindung zeigt beim Partner alle vereinbarten Kerninformationen, auch wenn alte cycle_ring_shared und calendar_shared Werte weiterhin false sind.
2. In den Einstellungen der Eigentumerin gibt es keinen einzelnen Kalender- oder Zyklus-Kreis-Freigabeschalter mehr.
3. Der Partnerkalender zeigt tatsaechliche Perioden sowie klare, zugaengliche zusaetzliche Marker fuer jede vereinbarte Vorhersage. Ueberlappungen verdecken keine Information.
4. Alle Vorhersagen tragen sichtbar Kann abweichen; Eisprung und Fruchtbarkeitsfenster werden nie als bestaetigte biologische Ereignisse dargestellt.
5. Der Partner kann keine Daten bearbeiten; private Inhalte und Rohdaten werden weder in der Seite noch ueber eine direkte Anfrage offengelegt.
6. Nach Beendigung der Verbindung und bei einem fremden/nicht verbundenen Konto liefert die Partneransicht keinerlei Kerninformationen.
7. Mobile und breite Ansicht bleiben ohne horizontalen Ueberlauf und mit gut lesbarer Legende nutzbar.

### Technischer Auftrag fuer Claude - Version 11

#### Bestaetigte Ausgangslage im Code

- new_partner_connections speichert aus WP-004 Version 6/9 die alten Flags cycle_ring_shared und calendar_shared. Die derzeitige Partneransicht nutzt diese Flags noch als Daten-Gates.
- src/lib/new-partner-calendar.ts liefert bei aktiver Kalenderfreigabe bestaetigte Tage und nur bei Kreisfreigabe die geschaetzte naechste Periode. Es nutzt bereits serverseitig getNewPeriodEntries, getNewCycleProfile, predictCycle und todayBerlinDateOnly.
- src/lib/new-partner-cycle-view.ts nutzt bereits serverseitig dieselbe computePersonalCycleView-Logik wie die Eigentumerin, ist aber noch durch cycle_ring_shared begrenzt.
- src/app/neu/partner/page.tsx ist die geschuetzte Server-Komponente; sie entscheidet vor dem Rendern anhand der aktiven Verbindung und uebergibt nur minimale Daten an die rein lesenden Partnerkomponenten.
- src/components/NewPartnerCalendar.tsx zeigt bestaetigte und geschaetzte Periodentage. src/components/NewPartnerCycleRing.tsx rendert den bestehenden gemeinsamen Ring.
- src/app/neu/einstellungen/page.tsx sowie NewPartnerCycleRingSharingToggle, NewPartnerCalendarSharingToggle und die beiden dazugehoerigen Routen bilden die alten Einzel-Schalter.
- WP-007 liefert die zentrale Vorhersagelogik cycle-fertility.ts, predictCycle, phasesForDate und Unsicherheit. Diese Logik ist wiederzuverwenden; es darf keine parallele Berechnung entstehen.

#### Technisches Ziel

- Ersetze die serverseitige Bedingung einzelne Freigabe durch genau eine Bedingung: aktive Verbindung zwischen diesem Partnerkonto und dieser Eigentumerin. Alte Flags duerfen nach dieser Version weder Ring noch Kalender oder Vorhersagen sperren.
- Entferne die zwei Einzel-Schalter aus der Owner-Einstellungsoberflaeche und entferne oder deaktiviere ihre zugehoerigen schreibenden Routen/Komponenten so, dass sie keine verbleibende Freigabewirkung haben. Eine Datenmigration ist nicht erforderlich; bestehende Spalten duerfen als ungenutzte Altstruktur erhalten bleiben.
- Erweitere die bereits minimal serverseitig geladene Partner-Kalenderansicht nur um die benoetigten Datums-/Statuswerte fuer: bestaetigte Periode, geschaetzte naechste Periode, moegliches fruchtbares Zeitfenster, moeglichen einzelnen Eisprungtag und moegliche PMS-Phase sowie die vorhandene Unsicherheitskennzeichnung. Gib weder Rohperioden, IDs, Namen, E-Mails noch Profilwerte an den Client.
- Verwende phasesForDate oder eine gleichwertig wiederverwendete zentrale WP-007-Logik. Bei Ueberlappung muessen mehrere Status gleichzeitig durchgaengig in Kalender, Legende, aria-Label und Tagesfenster sichtbar sein.
- Behalte bestaetigte Periodentage optisch vorrangig. Jede geschaetzte Information braucht einen klaren Text wie Moeglich/Geschaetzt und Kann abweichen; keine Formulierung darf biologische Gewissheit behaupten.
- Der Partner-Zyklus-Kreis und die Kalenderwerte muessen aus derselben bestehenden Daten- und Berlin-Tagesgrundlage wie die Owner-Ansicht stammen. Keine neue Vorhersage- oder Zeitzonenlogik.
- Die Benachrichtigungs-Praeferenz aus Version 5 bleibt unveraendert. Sie darf keine Datenfreigabe steuern und diese Version darf keine Push-Technik wieder aktivieren.

#### Invarianten - muessen unveraendert bleiben

- Die aktive Verbindung wird bei jedem serverseitigen Datenabruf fuer das anfragende Partnerkonto geprueft. Kein Client-Filter als Sicherheitsgrenze.
- Nach Verbindungswiderruf, ohne Sitzung oder bei fremdem Partnerkonto gibt es keine Partnerdaten, auch nicht indirekt ueber Routen oder Server-Props.
- Die Partneransicht bleibt rein lesend. Owner-Kalender, Perioden-CRUD, Historie, Profil, Authentifizierung und Verbindungscode bleiben funktional.
- Partner sehen nie Symptome, Notizen, Profil-/Kontodaten, vollstaendige Historie, Datenbank-IDs oder Bearbeitungsmoeglichkeiten.
- Bestehende Vorhersagegrenzen aus WP-007 bleiben bindend: Periodenstarts als Grundlage, keine Ableitung aus Periodenende, klare Schaetzung, keine medizinische Aussage.
- Alte Luma, Datenmigrationen, Dokploy, Push-Versand und echte Geraeteberechtigungen bleiben ausserhalb dieses Auftrags.

#### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine neue Tabelle und keine Migration. Alte Freigabespalten duerfen bestehen bleiben, aber werden nicht mehr als Zugriffskriterium verwendet.
- API-Wirkung: keine neue Partnerdaten-API. Entferne oder deaktiviere ausschliesslich nicht mehr benoetigte schreibende Einzel-Freigabe-Routen, sofern sie nicht anders verwendet werden.
- Keine neuen gespeicherten Gesundheits-, Profil- oder Geraetedaten.

#### Pflichtpruefungen

- Pruefe aktive Verbindung mit allen vier alten Flag-Kombinationen: Kernansicht ist jeweils sichtbar; alte Flags haben keine Wirkung mehr.
- Pruefe ohne Verbindung, nach Widerruf, mit fremdem Partnerkonto und ohne Sitzung: keine Kalender-, Ring- oder Vorhersagedaten.
- Pruefe bestaetigte Periode, geschaetzte naechste Periode, fruchtbares Zeitfenster, einzelnen Eisprungtag, PMS und mindestens einen Ueberlappungsfall. Alle Vorhersagen muessen sich als Schaetzung erkennen lassen.
- Pruefe stabile und unsichere Vorhersage inklusive sichtbarem Hinweis bei Unsicherheit.
- Pruefe, dass kein Partner-UI und kein Tagesfenster eine schreibende Periodenaktion anbietet und dass keine Profile, Symptome, Namen, E-Mails, IDs oder vollstaendige Historie geliefert werden.
- Pruefe das Entfernen der alten Schalter und dass ihre alten Endpunkte keine Freigabewirkung mehr haben.
- Fuehre betroffene Partner-, Kalender-, Zyklus-, Perioden- und Auth-Regressionen, TypeScript, Produktions-Build und mobile/breite Sichtpruefung aus. Testkonten und temporaere Tools danach entfernen.

#### Stoppbedingungen

- Stoppe vor einer Migration, einer neuen API, einer Erweiterung der Datenfreigabe ueber die hier vereinbarte Kernansicht, einer Symptom-/Profil-/Notizweitergabe, Push-Reaktivierung oder Alter-Luma-Aenderung.
- Stoppe, wenn die Entfernung der Einzel-Gates die aktive Verbindungspruefung nicht weiterhin sicher nachweisbar laesst.
- Stoppe, wenn die minimale Datendarstellung die vereinbarten Vorhersagen nicht ohne Profil- oder Rohhistorienweitergabe liefern kann.
- Stoppe, wenn eine Formulierung eine bestaetigte Fruchtbarkeit, einen bestaetigten Eisprung oder medizinische Gewissheit bedeuten wuerde.

#### Abschluss durch Claude

- Ergaenze Ist Version 11, Tests, Abweichungen und offene Punkte sichtbar.
- Lasse den Paketstatus nach Abschluss auf review.
- Ergaenze den Entwicklungsledger, fuehre node scripts/work-package-state.mjs mark-updated WP-004 und danach node scripts/work-package-state.mjs validate aus.
- Committe und pushe ausschliesslich auftragsbezogene Dateien. Kein manuelles Deployment.

### Ist Version 11 - von Claude

- **umgesetzt:**
  - `src/lib/new-partner-calendar.ts` vollständig umgebaut: `resolveActiveConnectionOwner` prüft jetzt ausschließlich `status = 'active'`, ohne `calendar_shared`/`cycle_ring_shared` zu lesen. `getPartnerCalendarView` liefert weiterhin `confirmedDates` (unverändertes Verhalten: echte bestätigte Tage, laufende Periode bis einschließlich heute) sowie neu `prediction: CyclePrediction | null` – dieselbe, bereits bestehende `predictCycle(entries, profile, today)`-Ausgabe, die auch der Owner-Kalender nutzt (keine zweite Berechnung). Enthält nur Datumsgrenzen und das `isUncertain`-Flag, keine Rohperioden, IDs, Namen, E-Mails oder Profilwerte.
  - `src/lib/new-partner-cycle-view.ts` entsprechend umgebaut: `resolveActiveConnectionOwner` prüft nur noch `status = 'active'`, `cycle_ring_shared` wird nicht mehr gelesen. `computePersonalCycleView` bleibt unverändert die alleinige Berechnungsquelle.
  - `src/lib/new-cycle-prediction.ts`: zwei neue, zentrale, exportierte Darstellungs-Hilfsfunktionen `primaryCalendarPhase` und `showsFertileMarker` ergänzt – extrahiert aus den bisher nur lokal in `NewCycleExample.tsx` definierten gleichnamigen Funktionen, damit Owner- und Partnerkalender exakt dieselbe Phasen-Priorität und denselben Überlappungs-Zusatzmarker-Mechanismus nutzen (keine zweite, abweichende Berechnung). `NewCycleExample.tsx` wurde entsprechend auf den Import dieser zentralen Funktionen umgestellt, die lokalen Duplikate entfernt – funktional unverändert (durch bestehende und neue Regressionen bestätigt).
  - `src/components/NewPartnerCalendar.tsx` komplett neu geschrieben: nutzt jetzt `prediction: CyclePrediction | null` statt der alten, auf `cycle_ring_shared` beschränkten `estimatedNextPeriodDates`-Liste. Zeigt bestätigte Tage (Hauptfarbe, Priorität), geschätzte nächste Periode, möglichen Eisprung (genau ein Tag), mögliche PMS-Phase sowie das mögliche fruchtbare Zeitfenster als zusätzlichen, kleinen Marker – über dieselben zentralen `primaryCalendarPhase`/`showsFertileMarker`/`phasesForDate`-Funktionen wie der Owner-Kalender. Überlappungen (z. B. geschätzte Periode und fruchtbares Zeitfenster am selben Tag) bleiben gleichzeitig sichtbar, ohne dass eine Kennzeichnung die andere verdeckt – im `aria-label`, in der Legende und im Tagesfenster (`DayDetailModal`) konsistent. Ein sichtbarer „Vorhersage unsicher - Kann abweichen“-Hinweis erscheint, wenn `prediction.isUncertain` zutrifft. Keine Formulierung behauptet eine bestätigte Fruchtbarkeit, einen bestätigten Eisprung oder eine medizinische Diagnose – durchgängig „Möglich/Geschätzt“ und „kann abweichen“.
  - `src/app/neu/partner/page.tsx`: `NewPartnerCalendar` erhält jetzt `confirmedDates` und `prediction` statt der alten Props. Keine sonstige Strukturänderung; `calendarView`/`cycleView` können weiterhin `null` sein (z. B. bei einer Race-Bedingung zwischen den beiden serverseitigen Abfragen, falls die Verbindung exakt dazwischen endet) – die bestehende neutrale Meldung bleibt als Sicherheitsnetz erhalten.
  - `src/app/neu/einstellungen/page.tsx`: Die beiden Einzel-Schalter (`NewPartnerCycleRingSharingToggle`, `NewPartnerCalendarSharingToggle`) wurden entfernt. Der Verbindungscode-Bereich (`NewPartnerCodeCard`) bleibt unverändert.
  - Nach ausdrücklicher Owner-Rückfrage zur Behandlung der jetzt wirkungslosen alten Freigabe-Routen (siehe Abweichungen): Die beiden Routen `src/app/api/neu/partner/cycle-ring-sharing/route.ts` und `src/app/api/neu/partner/calendar-sharing/route.ts` sowie die beiden zugehörigen Toggle-Komponenten `NewPartnerCycleRingSharingToggle.tsx`/`NewPartnerCalendarSharingToggle.tsx` wurden vollständig gelöscht. Die zugehörigen Setter-Funktionen `setPartnerCycleRingShared`/`setPartnerCalendarShared` in `src/lib/new-partner.ts` wurden ebenfalls entfernt; `PartnerConnectionStatus` und `getPartnerConnectionStatusForOwner` liefern `cycleRingShared`/`calendarShared` nicht mehr, da sie nirgends mehr gelesen werden.
  - Datenbankwirkung: keine Migration. Die Spalten `cycle_ring_shared` und `calendar_shared` auf `new_partner_connections` bleiben wie im Auftrag vorgesehen als ungenutzte Altstruktur in der Datenbank bestehen.
  - Keine neue API-Route, keine Änderung an Verbindungscode, Sitzung, Widerruf (`endPartnerConnection`), Periodendaten, Authentifizierung, Benachrichtigungs-Präferenz oder alter Luma.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - Drei bestehende Partner-Prüfskripte grundlegend auf das neue Modell umgeschrieben (spiegeln weiterhin die jeweiligen `server-only`-Module serverseitig gegen die echte Datenbank): `scripts/verify-partner-calendar.mts` (aktive Verbindung allein genügt; alle vier alten Flag-Kombinationen haben nachweislich keine Wirkung mehr; bestätigte Tage, laufende Periode, Widerruf, Kontotrennung unverändert korrekt), `scripts/verify-partner-cycle-ring.mts` (aktive Verbindung allein genügt; alte `cycle_ring_shared`-Spalte ohne Wirkung; `no_data`, Kontotrennung, Widerruf unverändert korrekt), `scripts/verify-partner-estimated-period.mts` (die geschätzte nächste Periode erscheint jetzt allein durch die Verbindung, alte Flag-Werte ändern nichts mehr am Ergebnis). Alle drei vollständig grün.
  - Neues `scripts/verify-partner-fixed-view.ts`: gezielte Quelltext-Prüfungen bestätigen, dass `new-partner-calendar.ts`/`new-partner-cycle-view.ts` die alten Freigabe-Spalten nicht mehr per SQL selektieren, dass `new-partner.ts` keine Setter-Funktionen für die alten Schalter mehr enthält, dass die beiden alten Routen-Dateien nicht mehr existieren, dass die Owner-Einstellungen keine Einzel-Schalter mehr referenzieren, dass die Toggle-Komponenten-Dateien gelöscht sind, dass `NewPartnerCalendar.tsx` die zentralen WP-007-Funktionen (`primaryCalendarPhase`, `showsFertileMarker`, `phasesForDate`) wiederverwendet und sichtbar „Vorhersage unsicher“/„kann abweichen“ zeigt, sowie dass die Partnerseite nur abgeleitete Datumslisten und die zentrale Vorhersage weiterreicht, keine E-Mail- oder Profilwerte. Alle Prüfungen bestanden.
  - Bestehendes `scripts/verify-partner-view-no-status-card.ts` (WP-004 Version 10) erneut ausgeführt und unverändert vollständig grün – die Version-10-Struktur (kein Statustext, keine Buttons im verbundenen Zustand) bleibt durch diese Version unberührt.
  - Bestehende Regressionen erneut ausgeführt und grün: `scripts/verify-partner-new.mts`, `scripts/verify-partner-old.mts`, `scripts/verify-partner-notification-preference.mts`, `scripts/verify-my-periods.mts`, `scripts/verify-cycle-today-and-estimate.mts`, `scripts/verify-day-detail.ts`, `scripts/verify-period-history.ts`, `scripts/verify-history-month-jump.ts`, `scripts/verify-period-day-actions.mts`.
  - `node --experimental-strip-types --test tests/new-cycle-prediction.test.ts tests/cycle-fertility.test.ts`: alle 22 Prüfungen weiterhin bestanden (die Extraktion von `primaryCalendarPhase`/`showsFertileMarker` hat die bestehende `phaseForDate`/`phasesForDate`-Logik nicht verändert).
  - `scripts/verify-personal-cycle-view.ts` zeigt weiterhin dieselben, bereits seit mehreren vorherigen Versionen dokumentierten 9 Fehlschläge bei den Farbverlauf-Quelltextprüfungen (Gradient-Fundstelle seit WP-004 Version 6) – unverändert vorbestehend, nicht durch diese Version verursacht.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack, nach vollständigem `.next`-Cache-Neubau wegen der entfernten Routen): erfolgreich. Die beiden alten Routen `/api/neu/partner/cycle-ring-sharing` und `/api/neu/partner/calendar-sharing` erscheinen nicht mehr in der Routenliste; keine neue Route hinzugekommen.
  - Mobile (375×812) und breite (1280×900) Sichtprüfung mit Playwright (temporär installiert, danach vollständig entfernt) gegen den lokalen Dev-Server mit zwei echten, frisch verbundenen Testkonten und einem konstruierten, echten Überlappungsszenario (Zykluslänge 21 Tage, Periodendauer 10 Tage, identisch zur WP-007-Sichtprüfung): Die Partneransicht zeigt **sofort nach der Verbindung, ohne dass je ein alter Schalter betätigt wurde**, die vollständige feste Kernansicht – Zyklus-Kreis, bestätigte Tage, geschätzte nächste Periode, möglichen Eisprung, mögliche PMS-Phase und das mögliche fruchtbare Zeitfenster, jeweils mit vollständiger Legende. Am 22. Oktober 2026 zeigt das `aria-label` nachweislich gleichzeitig „Geschätzte nächste Periode – kann abweichen“ und „mögliches fruchtbares Zeitfenster, kann abweichen“ – die geforderte gleichzeitige Überlappungsdarstellung ist bestätigt. Beide alten Routen liefern `404`. Die Owner-Einstellungen zeigen keine der beiden alten Schalter-Beschriftungen mehr. Kein horizontaler Überlauf in beiden Ansichten. Screenshots geprüft. Playwright und beide Testkonten (inkl. Verbindung, Code und Perioden) danach vollständig entfernt.
- **Abweichungen:**
  - Der Auftrag erlaubte ausdrücklich sowohl „entferne“ als auch „deaktiviere“ für die alten Freigabe-Routen/Komponenten. Da eine inaktive, aber weiterhin aufrufbare Route (die z. B. nur `410`/`404` zurückgibt) keinen Mehrwert gegenüber einer vollständigen Entfernung geboten hätte und tote, verwirrende Schreibpfade in jetzt ungenutzte Spalten vermieden werden sollten, wurde dies dem Owner zur Entscheidung vorgelegt. Entscheidung: vollständiges Entfernen der beiden Routen-Dateien, der beiden Toggle-Komponenten und der beiden zugehörigen Setter-Funktionen. Die Datenbankspalten selbst (`cycle_ring_shared`, `calendar_shared`) bleiben wie im Auftrag gefordert unverändert als Altstruktur bestehen – keine Migration.
  - Der bereits bekannte, vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) sowie der vorbestehende Gradient-Fundstellen-Defekt in `scripts/verify-personal-cycle-view.ts` bestehen unverändert fort und waren für diese Version nicht im Umfang.
- **offene Punkte:**
  - Owner-Prüfschritt steht aus: einen neuen Verbindungscode erzeugen, mit einem zweiten Testkonto einlösen und ohne jede weitere Einstellung sofort die vollständige Kernansicht (Zyklus-Kreis, Kalender mit allen Vorhersagemarkern) beim Partner sehen; einen Monat mit Überlappung von geschätzter Periode und fruchtbarem Zeitfenster ansehen; die Owner-Einstellungen auf das Fehlen der beiden alten Schalter prüfen; mobil auf fehlenden horizontalen Überlauf prüfen.
  - Die beiden oben genannten, vorbestehenden Testdefekte sollten weiterhin in eigenen, dafür vorgesehenen Paketen behoben werden.
  - Kein Deploy ausgelöst – wie beauftragt.
- **Commit:** f2b2704.


### Soll-Ist-Pruefung - von Codex Version 11

- Ergebnis: Soll erfuellt. Die feste, rein lesende Kernansicht erscheint nach aktiver Verbindung ohne die alten Einzel-Schalter.
- Nachschaerfung: keine fachliche. Die vorbestehenden unabh�ngigen Testdefekte bleiben ausserhalb dieses Auftrags.
- Product-Map aktualisiert: ja.


## Version 12 - Einklappbare Kalendererklaerungen in der Partneransicht

### Owner-Ansicht - einfach erklaert

- Kurz gesagt: Auch der Partnerkalender bleibt auf der Startansicht ruhiger. Direkt unter dem Kalender erscheint nur ein kleiner Button: \`Erklaerungen zum Kalender anzeigen\`.
- Nach dem Antippen erklaert die Ansicht die sichtbaren Farben und Markierungen: bestaetigte Periode, geschaetzte naechste Periode, moeglicher Eisprung, moegliche PMS-Phase und moegliches fruchtbares Zeitfenster.
- Die Erklaerungen sind nur Hilfe zum Verstehen. Der Partner kann weiterhin nichts bearbeiten.
- \`Vorhersage unsicher - Kann abweichen\` bleibt, falls vorhanden, immer sichtbar. Es wird nicht im einklappbaren Bereich versteckt.
- Die bereits vereinbarte feste Partneransicht nach aktiver Verbindung bleibt unveraendert. Es entsteht kein neuer Freigabe-Schalter.

### Entstehungsweg

Die Kalenderlegende macht die Partneransicht verstaendlich, nimmt aber in der dauerhaft sichtbaren Form unnoetig Platz ein. Die Ownerin moechte dieselbe ruhige, einklappbare Erklaerung wie im eigenen Kalender auch fuer ihren Partner.

- bestaetigtes Problem: Die dauerhaft sichtbaren Partner-Kalendererklaerungen lassen die Ansicht unruhiger wirken.
- gewuenschte Wirkung: Der Partner sieht zuerst den Kalender klar und kann die Bedeutung der Markierungen bei Bedarf einfach nachlesen.
- gewaehlte Loesung: Die vorhandenen Erklaerungen werden standardmaessig eingeklappt und sind ueber einen klaren Button erreichbar. Der Unsicherheitshinweis bleibt sichtbar.
- bestaetigte Grenzen: Keine Aenderung der Kalender-, Zyklus- oder Datenfreigabelogik und keine neue Einstellung.
- Quellen/Akten: APP-IDEA-014, Owner-Entscheidung vom 2026-10-05.

### Soll - von Codex

- Im verbundenen Partnerkalender sind die vorhandenen Kalendererklaerungen standardmaessig eingeklappt.
- Ein klar beschrifteter, zugaenglicher Button wechselt zwischen \`Erklaerungen zum Kalender anzeigen\` und \`Erklaerungen ausblenden\`.
- Nach dem Oeffnen sind alle vorhandenen Partner-Erklaerungen sichtbar: \`Bestaetigt\`, \`Geschaetzte naechste Periode - kann abweichen\`, \`Moeglicher Eisprung - kann abweichen\`, \`Moegliche PMS-Phase - kann abweichen\` und \`Moegliches fruchtbares Zeitfenster - kann abweichen\`.
- Der Hinweis \`Vorhersage unsicher - Kann abweichen\` bleibt bei unsicherer Vorhersage ausserhalb des einklappbaren Bereichs und immer sichtbar.
- Markierungen, Tagesfenster, Reihenfolge, Ueberlappungen und der rein lesende Charakter des Partnerkalenders bleiben unveraendert.
- Die aktive Verbindung bleibt die alleinige serverseitige Voraussetzung fuer die gesamte Partneransicht. Es entsteht kein einzelner Freigabe-Schalter.

### Nicht enthalten

- Keine Aenderung an Berechnungen, Periodendaten, Vorhersagen, Zeitzonen, Tagesfenstern oder der Darstellung einzelner Kalendertage.
- Keine Datenbankmigration, Route, API, Speicherung, neue Freigabe-Einstellung oder neue Benachrichtigung.
- Keine Aenderung am Owner-Kalender, an alter Luma, Anmeldung, Verbindungscode oder WP-005.
- Keine Erweiterung der Partneransicht um Profile, Symptome, Notizen, Historie oder Bearbeiten.

### Abnahmekriterien

1. Im verbundenen Partnerkalender ist die Legende beim ersten Laden geschlossen und der Button sichtbar.
2. Der Button ist per Tastatur bedienbar und verwendet passende zugaengliche Zustandsangaben; nach Oeffnen und Schliessen stimmen Text und sichtbarer Zustand ueberein.
3. Nach Oeffnen sind alle vereinbarten Erklaerungen lesbar; nach Schliessen nehmen sie keinen sichtbaren Platz ein.
4. Bei unsicherer Vorhersage bleibt der Unsicherheitshinweis vor, waehrend und nach dem Oeffnen sichtbar.
5. Kalenderdaten, Marker, Ueberlappungen, Tagesfenster und die rein lesende Partneransicht bleiben funktional unveraendert.
6. Ohne aktive Verbindung, nach Widerruf oder mit fremdem Konto werden weiterhin keine Partnerdaten angezeigt.
7. Mobile und breite Ansicht bleiben ohne horizontalen Ueberlauf nutzbar.

### Technischer Auftrag fuer Claude - Version 12

#### Bestaetigte Ausgangslage im Code

- WP-004 Version 11 hat \`src/components/NewPartnerCalendar.tsx\` als rein lesenden Kalender der festen Partneransicht umgesetzt.
- Die Komponente rendert die Partnerlegende derzeit dauerhaft unter dem Kalender. Sie nutzt bereits dieselben zentralen Vorhersage- und Darstellungshelfer wie der Owner-Kalender.
- \`src/components/NewCycleExample.tsx\` besitzt aus WP-007 Version 2 bereits das erprobte Muster fuer einklappbare Kalendererklaerungen mit \`isCalendarLegendOpen\`, \`aria-expanded\` und \`aria-controls\`.
- Der Hinweis zu \`prediction.isUncertain\` ist im Partnerkalender bereits separat sichtbar.
- Die Serverpruefung der aktiven Verbindung und die minimale Datenuebergabe erfolgen ausserhalb dieser rein lesenden Client-Komponente und duerfen nicht gelockert werden.

#### Technisches Ziel

- Uebertrage ausschliesslich das bestehende, zugaengliche Ein-/Ausklappmuster fuer Kalendererklaerungen auf \`NewPartnerCalendar.tsx\`.
- Die Partnerlegende startet geschlossen. Verwende klare deutsche Beschriftungen fuer Oeffnen und Schliessen sowie passende \`aria-expanded\`- und \`aria-controls\`-Angaben.
- Verschiebe nur die vorhandenen Legendeninhalte in den bedingten Bereich. Aendere weder deren Bedeutung noch Kalender- oder Vorhersagewerte.
- Lasse den vorhandenen Unsicherheitshinweis ausserhalb des einklappbaren Bereichs, sodass er unabhaengig vom Legendenstatus sichtbar bleibt.
- Wiederverwende vorhandene Stile und das Owner-Muster, ohne eine zweite Darstellungs- oder Vorhersagelogik einzufuehren.

#### Invarianten - muessen unveraendert bleiben

- Aktive Verbindung bleibt die alleinige serverseitige Datenzugriffsgrenze; diese Version aendert keine Sicherheitsabfrage.
- Partneransicht bleibt vollstaendig rein lesend; kein neuer Button darf Daten speichern, aendern, loeschen oder freigeben.
- Partner sehen weiterhin nur die fest vereinbarten abgeleiteten Kalenderdaten, keine Profile, Symptome, Notizen, IDs, E-Mails oder vollstaendige Historie.
- Bestehende WP-007-Regeln bleiben bindend: Vorhersagen sind moeglich/geschaetzt und koennen abweichen; sie sind keine medizinische Aussage.
- Markierungsprioritaet, Mehrfachphasen, Ueberlappungen, Tagesfenster, Berlin-Tagesgrundlage und bestehende Kalenderbeschriftungen bleiben unveraendert.
- Keine Aenderung an Owner-Kalender, alter Luma, Datenbank, API, Push, Verbindungscode, Authentifizierung oder Dokploy.

#### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- API-Wirkung: keine.
- Keine Migration, keine neue Route, keine neue gespeicherte Einstellung und keine neue Client-zu-Server-Anfrage.

#### Pflichtpruefungen

- Pruefe im verbundenen Partnerkalender den geschlossenen Anfangszustand, Oeffnen, Schliessen, Tastaturbedienung und die zugehoerigen aria-Zustaende.
- Pruefe nach Oeffnen alle vorhandenen Partnerlegenden, einschliesslich bestaetigter Periode, geschaetzter Periode, moeglichem Eisprung, moeglicher PMS-Phase und moeglichem fruchtbaren Zeitfenster.
- Pruefe stabile und unsichere Vorhersage: Der Unsicherheitshinweis bleibt bei Unsicherheit in jedem Legendenzustand sichtbar.
- Pruefe bestaetigte Periodentage, Vorhersagemarker, mindestens einen Ueberlappungsfall und das bestehende rein lesende Tagesfenster auf unveraendertes Verhalten.
- Pruefe ohne Verbindung, nach Widerruf, mit fremdem Partnerkonto und ohne Sitzung weiterhin auf fehlende Partnerdaten.
- Fuehre betroffene Partner-, Kalender- und Zyklus-Regressionen, TypeScript, Produktions-Build sowie mobile und breite Sichtpruefung aus. Entferne Testkonten und temporaere Werkzeuge danach.

#### Stoppbedingungen

- Stoppe vor jeder Aenderung der Datenfreigabe, Verbindungspruefung, Kalender-/Zyklusberechnung, Vorhersagelogik, Datenbank, API, Push, Anmeldung oder alter Luma.
- Stoppe, wenn der Unsicherheitshinweis nicht mehr unabhaengig vom einklappbaren Bereich sichtbar bleiben kann.
- Stoppe, wenn die Partneransicht durch die UI-Aenderung eine schreibende oder neue Freigabeaktion erhalten wuerde.

#### Abschluss durch Claude

- Ergaenze Ist Version 12, Tests, Abweichungen und offene Punkte sichtbar.
- Lasse den Paketstatus nach Abschluss auf review.
- Ergaenze den Entwicklungsledger, fuehre \`node scripts/work-package-state.mjs mark-updated WP-004\` und danach \`node scripts/work-package-state.mjs validate\` aus.
- Committe und pushe ausschliesslich auftragsbezogene Dateien. Kein manuelles Deployment.

### Ist Version 12 - von Claude

- **umgesetzt:**
  - `src/components/NewPartnerCalendar.tsx`: neuer Client-State `isCalendarLegendOpen` (Default `false` – geschlossen), 1:1 nach dem in WP-007 Version 2 erprobten Muster aus `NewCycleExample.tsx`. Die bisher dauerhaft sichtbare Legende (`Bestätigt`, `Geschätzte nächste Periode – kann abweichen`, `Möglicher Eisprung – kann abweichen`, `Mögliche PMS-Phase – kann abweichen`, `Mögliches fruchtbares Zeitfenster – kann abweichen`) wurde unverändert in einen bedingt gerenderten Bereich (`id="partner-calendar-legend-panel"`) verschoben.
  - Neuer Steuerbutton direkt darüber: Text „Erklärungen zum Kalender anzeigen“ im geschlossenen und „Erklärungen ausblenden“ im geöffneten Zustand, mit `aria-expanded={isCalendarLegendOpen}` und `aria-controls="partner-calendar-legend-panel"`.
  - Der bestehende „Vorhersage unsicher - Kann abweichen“-Hinweis (`prediction?.isUncertain`) steht bewusst **vor** dem neuen Steuerbutton, außerhalb des Einklappbereichs – er bleibt unabhängig vom Öffnungszustand sichtbar.
  - Keine Änderung an Markierungen, Prioritäten, Überlappungserkennung, Tagesfenster (`DayDetailModal`) oder Berechnungen: `primaryCalendarPhase`, `showsFertileMarker`, `phasesForDate` sowie alle Kalenderzellen, `aria-label`s und die rein lesende `DayDetailModal`-Komponente sind unverändert. Es wurden ausschließlich vorhandene Texte in eine neue, bedingt sichtbare Hülle verschoben.
  - Keine Änderung an der serverseitigen Zugriffsprüfung (`new-partner-calendar.ts`/`new-partner-cycle-view.ts`, aktive Verbindung bleibt alleinige Voraussetzung), an `src/app/neu/partner/page.tsx`, an der Owner-Einstellungsseite, an Verbindungscode, Authentifizierung, Datenbank, API oder alter Luma. Kein neuer Freigabe-Schalter.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - Neues `scripts/verify-partner-calendar-legend-collapsible.ts`: Quelltext-Prüfungen bestätigen den geschlossenen Anfangszustand, `aria-expanded`/`aria-controls` am Steuerbutton samt passender Panel-`id`, beide Button-Textzustände, dass der Unsicherheitshinweis im Quelltext vor dem Einklappbereich steht und unverändert an `prediction?.isUncertain` gebunden bleibt, dass alle fünf vereinbarten Partner-Erklärungen im geöffneten Bereich vollständig enthalten sind, und dass die zentrale WP-007-Marker-Logik (`primaryCalendarPhase`, `showsFertileMarker`, `phasesForDate`) unverändert eingebunden bleibt, keine schreibende Aktion und kein alter/neuer Freigabe-Schalter referenziert wird. Alle Prüfungen bestanden.
  - Bestehende Regressionen erneut ausgeführt und grün: `scripts/verify-partner-calendar.mts`, `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-partner-estimated-period.mts`, `scripts/verify-partner-fixed-view.ts`, `scripts/verify-partner-view-no-status-card.ts`, `scripts/verify-calendar-legend-collapsible.ts` (Owner-Kalender, WP-007 Version 2), `scripts/verify-day-detail.ts`.
  - `scripts/verify-personal-cycle-view.ts` zeigt weiterhin dieselben, bereits seit mehreren vorherigen Versionen dokumentierten 9 Fehlschläge bei den Farbverlauf-Quelltextprüfungen (Gradient-Fundstelle seit WP-004 Version 6) – unverändert vorbestehend, nicht durch diese Version verursacht.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, Routenliste unverändert (keine neue Route).
  - Mobile (375×812) und breite (1280×900) Sichtprüfung mit Playwright (temporär installiert, danach vollständig entfernt) gegen den lokalen Dev-Server mit zwei echten, verbundenen Testkonten und einer stark schwankenden echten Zyklushistorie (löst `isUncertain` aus): Anfangszustand zeigt `aria-expanded="false"`, Panel nicht im DOM, Unsicherheitshinweis bereits sichtbar. Nach dem Öffnen (`aria-expanded="true"`) sind alle fünf Legendentexte vorhanden, der Unsicherheitshinweis bleibt sichtbar. Das Tagesfenster öffnet sich weiterhin korrekt und bleibt nachweislich rein lesend (kein Speichern-/Löschen-/Bearbeiten-Element). Nach dem Schließen ist das Panel aus dem DOM entfernt, der Unsicherheitshinweis bleibt weiterhin sichtbar. Nach Widerruf der Verbindung zeigt die Partneransicht wieder den Code-Eingabeweg, keine Kalender- oder Kreisdaten mehr. Kein horizontaler Überlauf in beiden Ansichten. Screenshots geprüft (geschlossener und geöffneter Zustand). Playwright und beide Testkonten (inkl. Verbindung, Code und Perioden) danach vollständig entfernt.
- **Abweichungen:**
  - Zu Beginn dieser Version zeigte das WP-004-Frontmatter `status: approved` statt `approved` (Stand nach dem Abschluss von Version 11, noch nicht erneut freigegeben). Dies wurde dem Owner transparent gemeldet; die ausdrückliche Anweisung war, Version 12 trotzdem umzusetzen. Keine fachliche Abweichung vom Auftragsinhalt selbst.
  - Der bereits bekannte, vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) sowie der vorbestehende Gradient-Fundstellen-Defekt in `scripts/verify-personal-cycle-view.ts` bestehen unverändert fort und waren für diese Version nicht im Umfang.
- **offene Punkte:**
  - Owner-Prüfschritt steht aus: als verbundener Partner `/neu/partner` öffnen, prüfen dass unter dem Kalender nur der kompakte Button sichtbar ist, öffnen und alle fünf Erklärungen prüfen, bei einem Konto mit unsicherer Vorhersage prüfen, dass der Hinweis unabhängig vom Öffnungszustand sichtbar bleibt, mobil auf fehlenden horizontalen Überlauf prüfen.
  - Die beiden oben genannten, vorbestehenden Testdefekte sollten weiterhin in eigenen, dafür vorgesehenen Paketen behoben werden.
  - Kein Deploy ausgelöst – wie beauftragt.
- **Commit:** e712d12.


### Soll-Ist-Pruefung - von Codex Version 12

- Ergebnis: Soll erfuellt. Der Partnerkalender zeigt die Legende beim Laden eingeklappt; der Unsicherheitshinweis bleibt davon getrennt sichtbar.
- Nachschaerfung: Keine fachliche. Die explizite Owner-Ausnahme fuer die Umsetzung trotz Status review ist als Prozessabweichung dokumentiert.
- Product-Map aktualisiert: ja.


## Version 13 - Einstellungen ruhig gliedern

### Owner-Ansicht - einfach erklaert

- Kurz gesagt: Die Einstellungen erhalten zwei klare Bereiche, damit sofort sichtbar ist, was zu welchem Thema gehoert.
- Unter "Partnerverbindung" bleibt der bestehende persoenliche Verbindungscode mit seinem bisherigen Verhalten.
- Unter "Konto" bleibt die bestehende Abmeldung mit ihrem bisherigen Verhalten.
- Es gibt keine leere Kategorie "App", weil dort derzeit keine vorhandene Einstellung liegt. Dadurch bleibt die Seite kurz und ruhig.
- Es wird nichts an Daten, Verbindung, Abmeldung oder Berechtigungen geaendert. Es ist nur eine sichtbare Ordnung und kann spaeter einfach angepasst werden.

### Entstehungsweg

Die Ownerin moechte die bestehende App schrittweise verbessern, ohne sie mit neuen Funktionen zu ueberladen. Die Einstellungen enthalten bereits zwei unterschiedliche Themen, zeigen sie aber noch ohne klare visuelle Gruppierung.

- bestaetigtes Problem: In den Einstellungen ist die Zugehoerigkeit der vorhandenen Elemente nicht unmittelbar sichtbar.
- gewuenschte Wirkung: Die Nutzerin erkennt sofort Partnerverbindung und Kontoaktion, ohne eine laengere oder vollere Seite zu erhalten.
- gewaehlte Loesung: Zwei sichtbare, ruhige Abschnitte nur fuer bereits vorhandene Inhalte.
- bestaetigte Grenzen: Keine leeren Bereiche, keine neue Einstellung und keine fachliche Aenderung.
- Quellen/Akten: APP-IDEA-014, Owner-Entscheidung vom 2026-10-08.

### Soll - von Codex

- /neu/einstellungen zeigt die vorhandene Verbindungscode-Karte unter der sichtbaren Ueberschrift "Partnerverbindung".
- /neu/einstellungen zeigt den vorhandenen Abmelden-Button unter der sichtbaren Ueberschrift "Konto".
- Ein Abschnitt wird nur gerendert, wenn er bereits einen vorhandenen Inhalt besitzt. Es wird keine leere Kategorie "App" angezeigt.
- Verbindungscode, Verbindungsstatus, Widerruf ueber die vorhandenen Wege und Abmelden behalten exakt ihr bisheriges Verhalten.
- Ruecknavigation, Layout und mobile Darstellung bleiben klar und ohne horizontalen Ueberlauf.

### Nicht enthalten

- Keine neue Konto-, Passwort-, Profil-, Partner-, Benachrichtigungs- oder App-Einstellung.
- Keine Aenderung an Verbindungscode, Partneransicht, Datenfreigabe, Abmeldung, Anmeldung, Authentifizierung oder alter Luma.
- Keine Datenbankmigration, API, Route, Speicherung, Push oder Dokploy.

### Abnahmekriterien

1. Die Einstellungen zeigen deutlich "Partnerverbindung" ueber der bestehenden Code-Karte und "Konto" ueber dem bestehenden Abmelden-Button.
2. Es erscheint keine leere dritte Kategorie.
3. Code erzeugen/anzeigen und Abmelden funktionieren unveraendert.
4. Die Seite bleibt mobil und breit ohne horizontalen Ueberlauf nutzbar.
5. Die Aenderung fuegt keine neue schreibende Aktion oder Datenweitergabe hinzu.

### Technischer Auftrag fuer Claude - Version 13

#### Bestaetigte Ausgangslage im Code

- src/app/neu/einstellungen/page.tsx ist eine geschuetzte Server-Komponente der neuen Luma.
- Sie rendert derzeit NewPartnerCodeCard mit dem bestehenden serverseitig geladenen Verbindungsstatus sowie NewLogoutButton ohne sichtbare Bereichsstruktur.
- NewPartnerCodeCard und NewLogoutButton enthalten ihre bestehende Funktionalitaet; diese Version darf ihren Datenweg nicht veraendern.

#### Technisches Ziel

- Ordne in src/app/neu/einstellungen/page.tsx nur die vorhandenen Komponenten in zwei zugaengliche, visuell ruhige Bereiche ein: Partnerverbindung fuer NewPartnerCodeCard und Konto fuer NewLogoutButton.
- Nutze vorhandene Layout- und Typografieklassen; fuege keine leere Kategorie, keinen neuen Link und keine neue Interaktion hinzu.
- Behalte die bestehende Reihenfolge: Partnerverbindung zuerst, Konto danach.
- Die Aenderung soll leicht rueckgaengig sein und nur die Einstellungen-Seite betreffen.

#### Invarianten - muessen unveraendert bleiben

- Sitzungsschutz, Redirect, getPartnerConnectionStatusForOwner, Verbindungscode und NewPartnerCodeCard bleiben unveraendert.
- NewLogoutButton und sein bestehender Abmeldeweg bleiben unveraendert.
- Partneransicht, Home-Kalender, Historie, Vorhersagen, Einstellungen anderer Bereiche, alte Luma, Datenbank, API und Push bleiben unveraendert.
- Es entstehen keine neuen Daten, Berechtigungen, Profile, Routen oder Client-zu-Server-Anfragen.

#### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine.
- API-Wirkung: keine.
- Keine Migration, keine neue Route und keine neue gespeicherte Einstellung.

#### Pflichtpruefungen

- Pruefe sichtbar beide Ueberschriften und die Reihenfolge Partnerverbindung vor Konto.
- Pruefe Code-Karte in verbundenem und nicht verbundenem Zustand auf unveraendertes Verhalten.
- Pruefe Abmelden weiter auf seinen bestehenden Aufruf und Text.
- Pruefe, dass keine leere Kategorie App und keine neue Interaktion gerendert wird.
- Fuehre eine gezielte Einstellungen-Pruefung, TypeScript, Produktions-Build sowie mobile und breite Sichtpruefung aus. Entferne temporaere Testkonten und Werkzeuge danach.

#### Stoppbedingungen

- Stoppe vor jeder Aenderung an Authentifizierung, Verbindungscode, Abmeldung, Partnerdaten, Datenbank, API, Push, Passwort-Reset oder alter Luma.
- Stoppe, wenn die Gruppierung eine neue Einstellung oder einen neuen Datenabruf erfordern wuerde.

#### Abschluss durch Claude

- Ergaenze Ist Version 13, Tests, Abweichungen und offene Punkte sichtbar.
- Setze den Paketstatus nach Abschluss auf review.
- Ergaenze den Entwicklungsledger, fuehre node scripts/work-package-state.mjs mark-updated WP-004 und danach node scripts/work-package-state.mjs validate aus.
- Committe und pushe ausschliesslich auftragsbezogene Dateien. Kein manuelles Deployment.

### Ist Version 13 - von Claude

- **umgesetzt:**
  - `src/app/neu/einstellungen/page.tsx`: die bestehenden Komponenten `NewPartnerCodeCard` und `NewLogoutButton` sind jetzt jeweils in einen eigenen `<div>`-Abschnitt mit einer sichtbaren, dezenten Rubrik-Überschrift gruppiert: „Partnerverbindung“ direkt über `NewPartnerCodeCard`, „Konto“ direkt über `NewLogoutButton`, in dieser Reihenfolge. Keine dritte, leere Kategorie „App“.
  - Die Rubrik-Überschriften nutzen bewusst einen kleinen, grauen, großgeschriebenen Stil (`text-sm font-semibold uppercase tracking-wide text-neutral-500`) statt eines identischen `<h2>`-Stils wie in `NewPartnerCodeCard` selbst – dort existiert bereits eine eigene, prominente interne Überschrift „Partnerverbindung“. Diese Trennung vermeidet eine optisch verwirrende doppelte Großüberschrift, erfüllt aber wörtlich das Abnahmekriterium „zeigt deutlich 'Partnerverbindung' über der bestehenden Code-Karte“, ohne die Karte selbst zu verändern (die Invariante verlangt genau das).
  - Keine Änderung an `NewPartnerCodeCard`, `NewLogoutButton`, `getPartnerConnectionStatusForOwner`, Sitzungsschutz/Redirect, Verbindungscode, Widerruf oder Abmeldeweg – alle bestehenden Props und Datenflüsse sind unverändert.
  - Keine neue Route, keine Datenbankänderung, keine neue Interaktion.
- **nicht umgesetzt:** nichts aus dem vereinbarten Umfang offen.
- **Tests:**
  - Neues `scripts/verify-settings-grouped.ts`: Quelltext-Prüfungen bestätigen, dass beide Überschriften vorhanden sind und „Partnerverbindung“ im Quelltext vor „Konto“ sowie vor `NewPartnerCodeCard` steht, dass „Konto“ vor `NewLogoutButton` steht und keine Vermischung der Abschnitte entsteht, dass keine Überschrift „App“ existiert, dass die Seite selbst keinen eigenen `fetch`-Aufruf auslöst und `getPartnerConnectionStatusForOwner`/der `isConnected`-Prop unverändert sind, sowie dass `NewPartnerCodeCard` und `NewLogoutButton` weiterhin exakt dieselben bestehenden API-Routen aufrufen. Alle Prüfungen bestanden.
  - Bestehende Regressionen erneut ausgeführt und grün: `scripts/verify-partner-new.mts`, `scripts/verify-partner-old.mts`, `scripts/verify-partner-calendar.mts`, `scripts/verify-partner-cycle-ring.mts`, `scripts/verify-partner-fixed-view.ts`, `scripts/verify-partner-view-no-status-card.ts`, `scripts/verify-partner-calendar-legend-collapsible.ts`.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, Routenliste unverändert (keine neue Route).
  - Mobile (375×812) und breite (1280×900) Sichtprüfung mit Playwright (temporär installiert, danach vollständig entfernt) gegen den lokalen Dev-Server mit zwei echten Testkonten: Im nicht verbundenen Zustand zeigt die Seite klar „Partnerverbindung“ über der Code-Karte und „Konto“ über dem Abmelden-Button, in dieser Reihenfolge, ohne dritte Kategorie. Ein echter Klick auf „Code erzeugen“ zeigt den erzeugten Code weiterhin korrekt an. Nach dem Einlösen des Codes durch ein zweites, echtes Partnerkonto zeigt die Einstellungsseite weiterhin „Eine Partnerverbindung ist aktiv.“ und „Verbindung beenden“ – unverändertes Verhalten. Ein echter Klick auf „Abmelden“ meldet das Konto erfolgreich ab (Weiterleitung zu `/neu/rolle`, anschließende geschützte Anfrage liefert `401`). Kein horizontaler Überlauf in beiden Breiten. Screenshots geprüft (nicht verbunden mobil, verbunden breit). Playwright und beide Testkonten (inkl. Verbindung und Code) danach vollständig entfernt.
- **Abweichungen:** keine fachliche Abweichung.
  - Der bereits bekannte, vorbestehende Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) sowie der vorbestehende Gradient-Fundstellen-Defekt in `scripts/verify-personal-cycle-view.ts` bestehen unverändert fort und waren für diese Version nicht im Umfang.
- **offene Punkte:**
  - Owner-Prüfschritt steht aus: `/neu/einstellungen` öffnen, beide Überschriften und ihre Reihenfolge prüfen, Code erzeugen/anzeigen und Abmelden auf unverändertes Verhalten prüfen, mobil auf fehlenden horizontalen Überlauf prüfen.
  - Die beiden oben genannten, vorbestehenden Testdefekte sollten weiterhin in eigenen, dafür vorgesehenen Paketen behoben werden.
  - Kein Deploy ausgelöst – wie beauftragt.
- **Commit:** e712d12.


### Soll-Ist-Pruefung - von Codex Version 13

- Ergebnis: Soll erfuellt. Die Einstellungen gruppieren die bestehenden Inhalte klar als Partnerverbindung und Konto, ohne eine neue Funktion oder leere Kategorie.
- Nachschaerfung: keine.
- Product-Map aktualisiert: ja.

## Owner-Abnahme (gesamtes Paket)

- Die Ownerin hat WP-004 am 2026-10-09 geprüft und akzeptiert.
- Status: abgeschlossen.
