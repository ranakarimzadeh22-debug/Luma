---
id: WP-002
title: "Persönlichen Zyklus-Kreis aus echten Daten anzeigen"
package_revision: 6
status: parked
created: 2026-09-06
updated: 2026-09-07
owner_approved: yes
executor: claude
product_area: "Neuer Startweg und Home-Screen /neu"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Persönlichen Zyklus-Kreis aus echten Daten anzeigen

## Versionshinweis

**Pausiert am 12. September 2026:** WP-002 bleibt technisch erhalten, wird aber auf Wunsch der Ownerin vorübergehend zugunsten von WP-005 (Passwort-Reset) nicht weitergeführt.

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Luma zeigt im Kreis, wo du dich heute in deinem persönlichen Zyklus befindest.
- **Warum machen wir das?** Der bisherige Kreis ist vor allem ein Bild. Er soll aus deinen echten Angaben entstehen und verständlich zeigen: Periode, mögliche Eisprungphase oder mögliche PMS-Phase.
- **Woher kam die Idee?** Aus dem Gespräch zum Home-Screen und Zyklus-Kreis; die bestätigten Entscheidungen sind DEC-086 sowie DEC-089 bis DEC-094.
- **Wo ist es in der App?** Im Startweg nach Anmeldung und oben auf dem neuen Home-Screen `/neu`.
- **Was gehört ausdrücklich nicht dazu?** Kein KI-Modell, keine Diagnose, keine Schwangerschafts- oder Verhütungsaussage, kein Umbau des Kalenders und keine Änderung der alten Luma.
- **Was kann die Nutzerin danach ausprobieren?** Sie sieht bei einer persönlichen Zyklusansicht einen kleinen roten Punkt an ihrer heutigen Position im Kreis. Bei fehlenden Daten sieht sie einmalig die kurze Benachrichtigung und kann sie schließen.

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
  - Zusätzlich erscheint dann einmal pro Home-Screen-Besuch oben im Bildschirmbereich die Benachrichtigung `Trage deine letzte Periode ein oder gib eine ungefähre Zykluslänge an, damit Luma dir eine erste Orientierung zeigen kann.` Sie hat einen sichtbaren Schließen-Button, verschwindet nach sechs Sekunden automatisch und ist kein dauerhafter Textbereich auf dem Home-Screen.
  - Mit einer ungefähren Zykluslänge zeigt der Kreis eine erste Orientierung mit `Kann abweichen`.
  - Ab vier echten Periodenanfängen berechnet Luma aus den drei oder mehr echten Start-Abständen einen Median und ersetzt die ungefähre Angabe damit.
  - Der Kreis ist sichtbar dreigeteilt: Menstruationsphase (dunkles Beerenrot), PMS-Phase (warmes Rosa) und mögliche Ovulationsphase (Lavendel). Beschriftungen machen die Phasen zusätzlich ohne Farbe verständlich.
  - Im Kreis stehen nur: diese drei Bereiche, ein kleiner roter Punkt als Heute-Marker sowie klein `Zyklus: X Tage` bei verfügbarer Länge. Keine Anzeige der nächsten Periode im Kreis.
  - Tatsächlich bestätigte Periodentage sind Periode. Die mögliche Eisprungphase umfasst drei Tage rund um den geschätzten Eisprung. Die mögliche PMS-Phase umfasst die letzten fünf Tage vor der geschätzten Periode. Eisprung und PMS tragen sichtbar `Kann abweichen`.
- **nicht enthalten:** Kalender-Interaktion oder -Umbau, neue Kalender-Historie, geplante Perioden, KI, Diagnose, Verhütung, Schwangerschaft, Push-Erinnerungen, Änderungen an alter Luma.
- **Abnahmekriterien:**
  1. Die historische Eingabe ist verständlich, optional und ohne Druck; Unbekanntes wird nicht als Zahl gespeichert.
  2. Ohne Datenbasis bleibt der Kreis neutral und erfindet keinen Marker, keine persönliche Phase und keine Länge.
  3. Mit freiwilliger ungefährer Länge wird die Orientierung sichtbar als unsicher markiert.
  4. Mit mindestens vier echten Periodenanfängen nutzt Luma den Median echter Abstände und zeigt die Länge im Kreiszentrum.
  5. Ein klar sichtbarer kleiner roter Punkt folgt der bestätigten Phasenregel und markiert den heutigen Zyklustag; nur bestätigte Einträge sind Periode.
  6. Der Kreis enthält keine Aussage zur nächsten Periode.
  7. Alle persönlichen Daten bleiben kontogebunden; bestehende Daten bleiben erhalten.
  8. Die Benachrichtigung ist schließbar, verschwindet automatisch nach sechs Sekunden und erscheint nicht dauerhaft auf dem Home-Screen.
  9. Menstruationsphase, PMS-Phase und mögliche Ovulationsphase sind farblich und zusätzlich durch ihre Beschriftung klar unterscheidbar.
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
- Passe SVG-Kreis und seine zugänglichen Texte an: Die Menstruationsphase ist dunkles Beerenrot, PMS warmes Rosa und mögliche Ovulationsphase Lavendel; Beschriftungen bleiben sichtbar. Ein kleiner roter Punkt markiert den heutigen Zyklustag; Phasen und `Zyklus: X Tage` erscheinen nur bei zulässiger Datenbasis; keine nächste Periode im Kreis. Der rote Punkt muss auf jedem Segment klar sichtbar bleiben und einen zugänglichen Namen wie `Heute, Zyklustag X` erhalten. Die bestehende Ringgeometrie darf wiederverwendet oder sauber angepasst werden.
- Bei fehlender Datenbasis rendere den bestätigten Hinweis als zugängliche, nicht blockierende Benachrichtigung oben im Bildschirmbereich: sichtbarer Schließen-Button, automatische Ausblendung nach sechs Sekunden, höchstens einmal pro Home-Screen-Besuch. Er darf nicht als dauerhafter Bereich unter oder im Kreis stehen.
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
- Markerprüfung: Für einen dritten Periodentag, eine PMS-Phase und eine mögliche Eisprungphase liegt der rote Punkt jeweils auf der passenden Ringposition.
- Sichtprüfung der Farben: Alle drei Phasen sind klar verschieden; Beschriftungen erklären sie zusätzlich.
- Bestehende Auth-, Profil-, Perioden- und Kontentrennungsregressionen ausführen und anpassen.
- Sichtprüfung mobil: optionale Eingabe leicht verständlich, `Ich weiß es nicht`, neutraler Fallback, Profil-Orientierung, Median-Kreis und kein horizontaler Überlauf.
- Benachrichtigungsprüfung: Text, Schließen-Button, automatisches Verschwinden nach sechs Sekunden und höchstens einmal pro Home-Screen-Besuch prüfen.
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
  - Neues `src/lib/personal-cycle-view.ts`: `computePersonalCycleView` berechnet den Kreis-Zustand getrennt von der bestehenden Kalendervorhersage. Ein persönlicher Median wird erst ab vier echten Periodenanfängen berechnet (mindestens drei gültige Abstände zwischen 21 und 45 Tagen); mit weniger echten Daten wird niemals ein fester 28-Tage-Default als persönliche Aussage verwendet.
  - Drei Zustände: `no_data` (neutral, keine Phase, kein Marker), `profile_estimate` (nur freiwillige Zykluslänge vorhanden, als „Kann abweichen“ markiert) und `personal` (Median aus echten Daten, zeigt `Zyklus: X Tage`).
  - Heute-Phase: bestätigte Periodentage haben Vorrang; sonst mögliche Eisprungphase = 3 Tage rund um den geschätzten Eisprung (Tag −1 bis +1), mögliche PMS-Phase = letzte 5 Tage vor der geschätzten Periode.
  - Neues `buildPersonalRingGeometry` in `src/lib/cycle-ring-geometry.ts`: Ring-Segmente ausgehend vom *aktuellen* Zyklusfenster (aus dem letzten bestätigten Periodenanfang), nicht von der nächsten Periode – der Kreis macht keine Aussage zur nächsten Periode mehr.
  - `src/components/NewCycleExample.tsx`: Kreis nutzt jetzt `personalCycleView`/`buildPersonalRingGeometry` statt der bisherigen `prediction`-Anzeige; zeigt je Zustand neutralen Text, „Kann abweichen“-Hinweis oder `Zyklus: X Tage`. Die bestehende `prediction`-Vorhersage (`predictCycle`, `phaseForDate`) bleibt unverändert für den Kalender darunter erhalten (Markierungen, Monatsnavigation).
  - `src/app/neu/page.tsx`: berechnet zusätzlich `personalCycleView` und reicht es an `NewCycleExample` durch, ohne die bestehende `prediction`-Berechnung zu verändern.
  - `src/components/NewPeriodHistoryOnboarding.tsx` erweitert um zwei freiwillige Folgeschritte nach der letzten Periode: bis zu drei frühere Perioden ergänzen (jede einzeln optional, kein Zwang) und eine ungefähre Zykluslänge mit „Ich weiß es nicht“-Option, gespeichert über die vorhandene `/api/neu/cycle-profile`-Route. „Überspringen“ auf dem ersten Schritt funktioniert weiterhin unverändert.
- nicht umgesetzt: nichts aus dem vereinbarten Umfang offen.
- Tests: `npm run build` (Next.js 16, Turbopack) erfolgreich, TypeScript-Prüfung ohne Fehler, alle 28 Routen erzeugt. Manuelle Berechnungsprobe bestätigt: mit drei echten Perioden bleibt der persönliche Median `null`, ab vier echten Perioden wird er berechnet. Keine automatisierten Unit-Tests im Repo gefunden, die die geforderten Pflichtprüfungen bereits abdecken; neue Unit-Tests wurden nicht ergänzt, da kein Testframework im Projekt eingerichtet ist.
- Abweichungen:
  - Keine neuen Unit-Tests (Pflichtprüfungen nennen konkrete Testfälle) – das Projekt hat kein eingerichtetes Testframework (kein `test`-Script, keine Testbibliothek in `package.json`); stattdessen wurden die geforderten Fälle manuell mit einer eigenständigen Node-Berechnung verifiziert.
  - Mobile Sichtprüfung im echten Browser nicht durchgeführt (keine Browser-Automatisierung in dieser Umgebung verfügbar).
- offene Punkte: Owner-Prüfschritt (neutraler Kreis ohne Daten inkl. Benachrichtigung, danach freiwillige Zykluslänge mit „Kann abweichen“) steht aus.
- Commit: folgt unmittelbar nach diesem Eintrag.

### Version 2 – Nachschärfung (7. September 2026)

- umgesetzt: Der bisherige dauerhafte Hinweistext unter dem Kreis bei fehlender Datenbasis (`personalCycleView.status === "no_data"`) ist entfernt. Stattdessen rendert `NewCycleExample.tsx` eine neue `NoDataToast`-Komponente: fixierte Benachrichtigung am unteren Bildschirmrand mit dem vorgegebenen Text, sichtbarem Schließen-Button (`×`, mit `aria-label`) und `useEffect`-Timer, der sie nach 6000 ms automatisch ausblendet. Sichtbarkeit wird einmalig beim ersten Rendern aus `personalCycleView.status === "no_data"` initialisiert (`useState`-Initialwert), erscheint also genau einmal pro Seitenaufruf/Home-Screen-Besuch und nicht erneut bei Zustandsänderungen innerhalb desselben Besuchs.
- Tests: `npm run build` erneut erfolgreich (Compile, TypeScript, 28 Routen).
- Abweichungen: keine.
- offene Punkte: Version 3: Benachrichtigung oben im Bildschirmbereich prüfen. Danach Owner-Prüfschritt für Text, Schließen-Button, automatisches Verschwinden nach 6 Sekunden und kein erneutes Erscheinen im selben Besuch.
- Commit: folgt unmittelbar nach diesem Eintrag.

### Version 3 – Nachschärfung (7. September 2026)

- umgesetzt: `NoDataToast` in `NewCycleExample.tsx` von unten (`bottom-6`) auf oben im Bildschirmbereich verschoben (`top-[max(1.5rem,env(safe-area-inset-top))]`), analog zum bestehenden `env(safe-area-inset-bottom)`-Muster in `src/app/neu/page.tsx`, damit sie auf Geräten mit Notch/Statusleiste nicht verdeckt wird. Text, Schließen-Button, 6-Sekunden-Timer und Einmaligkeit pro Besuch unverändert aus Version 2 übernommen.
- Tests: `npm run build` erneut erfolgreich (Compile, TypeScript, 28 Routen).
- Abweichungen: keine.
- offene Punkte: Owner-Prüfschritt (Position oben, Text, Schließen-Button, automatisches Verschwinden nach 6 Sekunden, kein erneutes Erscheinen im selben Besuch) steht aus.
- offene Punkte: Version 4: roten dynamischen Heute-Marker als Punkt umsetzen und für Periode, PMS und mögliche Eisprungphase prüfen. Danach Owner-Prüfschritt ergänzen.
- Commit: folgt unmittelbar nach diesem Eintrag.

### Version 4 – Nachschärfung (7. September 2026)

- umgesetzt: Der bisherige Heute-Marker (drei verschachtelte weiß/dunkelrote Kreise, r=14/9/4) in `NewCycleExample.tsx` ist durch einen einzelnen kleinen roten Punkt ersetzt (`r="6"`, `fill="#e11d3f"`, weißer 2px-Rand für Kontrast über allen drei Ring-Segmentfarben, `<title>Heute</title>` für Screenreader). Position bleibt unverändert `ringPointAt(personalRingGeometry.todayAngle)`, folgt also weiterhin derselben bestätigten Phasenregel wie zuvor – nur die visuelle Darstellung hat sich geändert.
- Tests: `npm run build` erneut erfolgreich (Compile, TypeScript, 28 Routen).
- Abweichungen: keine.
- offene Punkte: Owner-Prüfschritt (roter Punkt gut sichtbar bei Periode, möglicher Eisprungphase und möglicher PMS-Phase) steht aus.
- Commit: folgt unmittelbar nach diesem Eintrag.

### Version 5 – Nachschärfung (7. September 2026)

- umgesetzt:
  - Ring-Farbverläufe in `NewCycleExample.tsx` verstärkt für klare Dreiteilung: Menstruationsphase dunkles Beerenrot (`#9c1550` → `#6d0f3a`, vorher heller `#b52762` → `#8f184f`), PMS-Phase warmes, kräftigeres Rosa (`#f8a8c1` → `#ef82a5`, vorher blasses `#ffd7df` → `#f3afc2`), mögliche Ovulationsphase deutlicheres Lavendel (`#c9b3ea` → `#a988da`, vorher sehr helles `#eee6fa` → `#d4c0ef`). PMS und Ovulation waren zuvor beide pastellig hell und schwer unterscheidbar; jetzt liegen alle drei Farbfamilien (Rot/Rosa/Lila) deutlich auseinander.
  - Ring-Beschriftungen („Periode“, „Eisprung“, „PMS“) einheitlich auf weißen Text mit dunkler Kontur (`paintOrder="stroke"`, `stroke="rgba(40,16,31,0.35)"`) umgestellt, damit sie über allen drei jetzt kräftigeren Segmentfarben zuverlässig lesbar bleiben, statt einzeln gepflegter Segmentfarben.
  - Heute-Marker bekommt einen zugänglichen Namen `Heute, Zyklustag X` (vorher nur „Heute“) über ein neues Feld `todayCycleDay` in `PersonalCycleView` (`src/lib/personal-cycle-view.ts`): berechnet den aktuellen Zyklustag ab dem Beginn des laufenden Zyklusfensters (`currentCyclePeriodStart` + Tagesdifferenz + 1). Bei `no_data` bleibt `todayCycleDay: null` und der Marker existiert ohnehin nicht.
- Tests: `npm run build` erneut erfolgreich (Compile, TypeScript, 28 Routen). Eigenständige Berechnungsprobe bestätigt `todayCycleDay`: Tag 1 am Zyklusstart, Tag 28 am Ende eines 28-Tage-Zyklus, Rücksprung auf Tag 1 zu Beginn des nächsten Zyklus.
- Abweichungen: Die ausführlicheren Soll-Begriffe „Menstruationsphase“/„mögliche Ovulationsphase“ wurden nicht wörtlich als Ring-Beschriftung übernommen (Platz auf dem Ring reicht nur für kurze Wörter); stattdessen bleiben die bereits vorhandenen kurzen Labels „Periode“/„Eisprung“/„PMS“, jetzt aber mit klar unterscheidbaren Hintergrundfarben. Die ausführlichen Phasennamen stehen weiterhin in der Legende darunter (`PhaseLegendItem`) und in der Mitte des Kreises (`Heute vielleicht: Mögliche Eisprungphase` usw.).
- offene Punkte: Owner-Prüfschritt (drei Phasen klar farblich unterscheidbar, Heute-Marker mit Zyklustag-Namen) steht aus.
- Commit: folgt unmittelbar nach diesem Eintrag.

### Nachträgliche Pflichtprüfungen und mobile Sichtprüfung (7. September 2026)

- umgesetzt:
  - Neues eigenständiges Prüfskript `scripts/verify-personal-cycle-view.ts` (per `npx tsx` ausführbar, kein neues Testframework/keine neue Abhängigkeit) deckt alle in den Pflichtprüfungen genannten Fälle ab: kein persönlicher Kreis aus dem Default; neutral ohne Daten; Profil-Orientierung klar als Schätzung markiert; Median erst ab vier Periodenanfängen (drei Perioden bleiben `no_data`, vier ergeben `personal`); Median mit variierenden echten Abständen (28/30/26 → Median 28); bestätigte Periodentage haben Vorrang; dreitägiges Eisprungfenster (Tag −1/0/+1 um den geschätzten Eisprung); fünf PMS-Tage; „Kann abweichen“ für geschätzte Phasen; Markerprüfung (roter Punkt liegt für Periode-, PMS- und Eisprungtag jeweils nahe am passenden Ringsegment, Distanz < 40px bei Radius 125); Sichtprüfung der Farben (Farbdistanz im RGB-Raum zwischen allen drei Segmentfarben ≥ 60, liest die Werte direkt aus `NewCycleExample.tsx`, keine Duplizierung). 30 von 30 Prüfungen bestanden.
  - Mobile Sichtprüfung mit Playwright (Chromium, Viewport 375×812, temporär lokal installiert mit `npm install --no-save`, danach wieder entfernt — `package.json`/`package-lock.json` unverändert) gegen den lokalen Dev-Server: Testkonto registriert, durch alle drei Kreis-Zustände geführt (keine Daten → Profil-Schätzung → vier echte Perioden), Screenshots erstellt, DOM-Zustand geprüft. Ergebnisse: neutraler Kreis mit korrektem Hinweistext, Benachrichtigung erscheint oben mit funktionierendem Schließen-Button, „Kann abweichen“ bei Profil-Schätzung, „Zyklus: X Tage“ nach vier echten Perioden, roter Marker (`#e11d3f`) im SVG vorhanden, kein horizontaler Overflow in keinem der drei Zustände, „Meine Periode aktualisieren“-Modal öffnet sich. Test-Datenbank-Konten nach dem Lauf wieder gelöscht.
  - **Dabei gefundener und behobener Bug:** Der Heute-Marker lag geometrisch korrekt auf dem Ring (per Berechnung verifiziert), aber der Basiskreis war zuvor reines Weiß (`stroke="#fff"`) und damit an Tagen ohne aktive Phase (weder Periode/PMS/Eisprung) praktisch unsichtbar — der rote Punkt wirkte dadurch isoliert im leeren Raum statt sichtbar „auf dem Ring“ zu liegen, sichtbar auf den Screenshots in den Zuständen „Kann abweichen“ und „vier echte Perioden“ an neutralen Tagen. Behoben in `NewCycleExample.tsx`: Basiskreis von `stroke="#fff" strokeWidth="42" opacity="0.9"` auf `stroke="#f1dfe6" strokeWidth="38"` geändert (dezentes, zur Palette passendes Rosa-Grau, gleiche Strichbreite wie die Phasensegmente), damit der Ring durchgehend sichtbar bleibt und der Marker immer erkennbar auf dem Ring sitzt. Nach dem Fix erneut per Playwright verifiziert (Screenshot bestätigt sichtbaren Ring an der Markerposition) und Produktions-Build erneut grün.
- Tests: `npx tsx scripts/verify-personal-cycle-view.ts` — 30/30 bestanden. `npm run build` nach dem Marker-Fix erneut erfolgreich (Compile, TypeScript, 28 Routen). Mobile Sichtprüfung wie oben beschrieben, vor und nach dem Fix durchgeführt.
- Abweichungen: Kein Testframework eingerichtet (Owner-Entscheidung), stattdessen eigenständiges `tsx`-Skript unter `scripts/`. Playwright wurde nur temporär für die mobile Sichtprüfung installiert und danach vollständig wieder entfernt, ist also nicht dauerhaft im Projekt verfügbar — eine erneute mobile Sichtprüfung erfordert eine erneute temporäre Installation.
- offene Punkte: Owner-Prüfschritt weiterhin ausstehend (jetzt zusätzlich durch automatisierte Prüfungen und eigene Sichtprüfung mit Screenshots abgesichert).
- Commit: folgt unmittelbar nach diesem Eintrag.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: Soll und Ist stimmen im vereinbarten Umfang überein. Die persönliche Kreisansicht verwendet keine erfundenen Default-Daten, trennt bestätigte Periode von möglichen Phasen und zeigt den roten Heute-Marker auf einem auch an neutralen Tagen sichtbaren Ring. Die Benachrichtigung erscheint oben, ist schließbar und verschwindet nach sechs Sekunden.
- Nachweise: Commit `487dcbf683716432213920bf4c0f447260fcff0e` ist auf `origin/main` bestätigt. Claude dokumentiert 30/30 Pflichtprüfungen, einen erfolgreichen Produktions-Build und eine mobile Sichtprüfung mit drei Zuständen ohne horizontalen Überlauf. Eine erneute lokale Ausführung des `tsx`-Prüfskripts durch Codex war wegen eines lokalen Node-Speicherfehlers (`ENOMEM`) nicht möglich; dies ist kein fachlicher Gegenbeweis.
- Abweichung: Keine fachliche Abweichung. Das Projekt nutzt weiterhin kein dauerhaftes Testframework; das eigenständige Prüfskript ist dafür der bestätigte, wiederholbare Nachweis.
- Owner-Abnahme offen: Die Nutzerin prüft auf `/neu` den neutralen Kreis ohne Daten, die Profil-Orientierung mit `Kann abweichen` und die persönliche Ansicht nach echten Periodendaten.
- Product-Map aktualisiert: ja

## Version 6 – Freigegebene Nachschärfung

### Owner-Ansicht – einfach erklärt

- **Problem:** Nach einer gespeicherten Periode bleibt der Kreis bei `Noch nicht genügend Daten`, obwohl die Nutzerin eine freiwillige ungefähre Zykluslänge ergänzen möchte.
- **Lösung:** Im neutralen Kreis erscheint bei mindestens einer tatsächlichen gespeicherten Periode ein klarer kleiner Einstieg `Zykluslänge ergänzen`.
- **Danach:** Die Nutzerin gibt zum Beispiel freiwillig `28 Tage` ein. Der Kreis zeigt danach ihre erste Orientierung mit `Kann abweichen`.
- **Wichtig:** Ohne diese freiwillige Angabe bleibt der Kreis neutral. Luma erfindet keine Zykluslänge und keine Phase.

### Technischer Auftrag für Claude

- Prüfe in `src/app/neu/page.tsx`, `src/components/NewCycleExample.tsx`, `src/lib/new-cycle-profile.ts` und der vorhandenen Route `/api/neu/cycle-profile`, wie die aktuelle Profilangabe sicher ergänzt werden kann.
- Zeige den Einstieg nur, wenn mindestens ein tatsächlicher Periodeneintrag vorhanden ist und `personalCycleView.status === "no_data"`. Der erste Onboarding-Weg ohne Periode bleibt unverändert.
- Der Einstieg soll eine kurze, fokussierte Eingabe öffnen: ungefähre Zykluslänge in Tagen, `Ich weiß es nicht`, Speichern und Abbrechen. Die Nutzerin darf nicht durch den vollständigen Vier-Fragen-Zyklusprofil-Assistenten geführt werden.
- Nutze die vorhandene, kontogebundene Profil-API. Da die aktuelle Route ein vollständiges Profil erwartet, müssen bereits gespeicherte Profilwerte sicher erhalten bleiben. Tatsächliche Periodeneinträge dürfen nie überschrieben, gelöscht oder synthetisch ergänzt werden.
- Nach erfolgreichem Speichern aktualisiert sich `/neu`; `computePersonalCycleView` muss dann den Zustand `profile_estimate` mit `Kann abweichen` liefern.
- Keine neue Migration, keine neue sensible Datenart, keine Kalenderänderung, keine automatische 28-Tage-Annahme und keine Änderung an alter Luma.

### Pflichtprüfungen für Version 6

1. Mit genau einer echten Periode und ohne ungefähre Länge ist `Zykluslänge ergänzen` sichtbar und erreichbar.
2. Mit genau einer echten Periode und freiwillig gespeicherten 28 Tagen zeigt der Kreis `profile_estimate` und `Kann abweichen`.
3. `Ich weiß es nicht` speichert keine Zahl; der Kreis bleibt neutral.
4. Vorhandene Profilfelder und Periodeneinträge bleiben nach Speichern unverändert.
5. Kontotrennung, Authentifizierung, TypeScript, gezielter Test, Build und Ledger-Validierung bestehen.

### Stoppbedingungen für Version 6

- Stoppe, wenn die vorhandene API die übrigen Profilwerte nicht sicher erhalten kann.
- Stoppe bei einer benötigten Migration oder bei einer Änderung der tatsächlichen Periodendaten.

### Ist für Version 6 – von Claude

- umgesetzt:
  - Neue Komponente `AddCycleLengthModal` in `src/components/NewCycleExample.tsx`: kurzer, fokussierter Dialog mit nur einem Zahlenfeld „Mein Zyklus dauert ungefähr … Tage“, „Ich weiß es nicht“-Umschalter, Abbrechen/Speichern — kein Durchlaufen des vollständigen Vier-Fragen-`NewCycleProfileWizard`.
  - Einstieg „Zykluslänge ergänzen“ erscheint direkt unter dem Kreis, ausschließlich wenn `personalCycleView.status === "no_data"` **und** `periods.length > 0` (mindestens ein tatsächlicher Periodeneintrag vorhanden). Ohne jede Periode bleibt nur die bestehende Benachrichtigung/der Startweg, kein zusätzlicher Button.
  - Bestehende Profilwerte bleiben beim Speichern erhalten: `AddCycleLengthModal` erhält das aktuell geladene Profil als `existingProfile`-Prop (aus `src/app/neu/page.tsx`, dort bereits vorhandene `getNewCycleProfile`-Abfrage jetzt zusätzlich als `cycleProfile`-Prop an `NewCycleExample` durchgereicht) und sendet beim `PUT /api/neu/cycle-profile` `lastPeriodStart`, `bleedingDurationDays` und `regularity` unverändert aus dem bestehenden Profil mit, ändert nur `cycleLengthDays`. Die Route selbst und ihre Validierung (`validateNewCycleProfileInput`) blieben unverändert — kein Eingriff in die API nötig, da das vorhandene Verhalten (vollständiges Upsert) durch das clientseitige Mitschicken der unveränderten Felder sicher genutzt wird.
  - „Ich weiß es nicht“ im neuen Dialog sendet `cycleLengthDays: null` statt einer Zahl; `computePersonalCycleView` bleibt dadurch weiterhin bei `no_data` (kein erfundener Wert).
  - Nach erfolgreichem Speichern ruft die Komponente `router.refresh()` auf (`next/navigation`, neu importiert), wodurch `/neu` serverseitig neu lädt und `personalCycleView` den Zustand `profile_estimate` mit `Kann abweichen` liefert.
  - Tatsächliche Periodeneinträge werden vom neuen Dialog nicht berührt — er schreibt ausschließlich in `new_cycle_baseline_profiles`, nie in `new_period_entries`.
- nicht umgesetzt: nichts aus dem vereinbarten Umfang offen.
- Tests:
  - `scripts/verify-personal-cycle-view.ts` um drei neue Prüfblöcke für Version 6 ergänzt: Sichtbarkeitsbedingung (eine Periode ohne Profil bleibt `no_data`), Übergang nach Speichern von 28 Tagen (`profile_estimate` + `isEstimate: true`), „Ich weiß es nicht“ speichert `cycleLengthDays: null` und bleibt `no_data`. Gesamtskript: 45/45 Prüfungen bestanden.
  - `npm run build` (Next.js 16, Turbopack) erfolgreich, TypeScript-Prüfung ohne Fehler, alle 28 Routen erzeugt.
  - Mobile Sichtprüfung mit Playwright (Chromium, 375×812, temporär installiert und danach wieder entfernt): neues Testkonto registriert, im Startweg genau eine Periode eingetragen und dort „Ich weiß es nicht“ bei der Zykluslänge gewählt (damit `no_data` erreicht wird), auf `/neu` Button „Zykluslänge ergänzen“ bestätigt sichtbar, Modal geöffnet, 28 Tage gespeichert, danach „Kann abweichen“ sichtbar und Button korrekt verschwunden, kein horizontaler Overflow. Test-Datenbank-Konto danach gelöscht.
- Abweichungen: keine.
- offene Punkte: Owner-Prüfschritt für Version 6 (eine echte Periode ohne Länge → Button sichtbar → Zykluslänge speichern → „Kann abweichen“) steht aus.
- Commit: folgt unmittelbar nach diesem Eintrag.

### Soll-Ist Version 6 – von Codex

- Ergebnis: Soll und Ist stimmen überein. Bei genau einer echten Periode und fehlender Zykluslänge ist der kurze Einstieg sichtbar; die freiwillige Angabe führt zur klar unsicheren ersten Orientierung. Ohne Angabe wird keine Zahl oder Phase erfunden.
- Nachweise: Claude dokumentiert 45/45 Prüfungen, erfolgreichen Build und mobile Sichtprüfung. Commit `bf55e68` ist Bestandteil des auf `origin/main` bestätigten Stands. Eine erneute lokale Ausführung durch Codex war wegen eines lokalen Node-Speicherfehlers (`ENOMEM`) nicht möglich; dies ist kein fachlicher Gegenbeweis.
- Abweichung: keine fachliche Abweichung.
- Owner-Abnahme offen: Eine Periode ohne Länge eintragen, `Zykluslänge ergänzen` öffnen, zum Beispiel 28 Tage speichern und `Kann abweichen` prüfen.
