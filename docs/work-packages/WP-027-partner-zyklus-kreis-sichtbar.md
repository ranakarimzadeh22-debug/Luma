---
id: WP-027
title: "Partner-Zyklus-Kreis bei aktiver Verbindung sichtbar machen"
status: review
created: 2026-10-23
updated: 2026-10-23
owner_approved: yes
executor: anthropic-claude
product_area: "Neue Luma – Partneransicht /neu/partner"
brief_version: 1
technical_brief: complete
---

# Aufgabe: Partner-Zyklus-Kreis bei aktiver Verbindung sichtbar machen

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Ein verbundener Partner sieht oberhalb des Kalenders wieder dieselbe ruhige Zyklusübersicht mit Kreis und kurzen Informationen.
- **Warum machen wir das?** Auf dem gezeigten Partner-Handy erscheint nur der Kalender. Der Zyklus-Kreis fehlt, obwohl die Verbindung aktiv ist.
- **Woher kam die Idee?** Owner-Screenshot und bestätigte Rückmeldung vom 2026-10-23.
- **Wo ist es in der App?** Ausschließlich in der verbundenen Partneransicht `/neu/partner`.
- **Was gehört ausdrücklich nicht dazu?** Keine Bearbeitung für Partner, keine neue Datenfreigabe, keine Änderung am Owner-Home oder Kalender.
- **Was kann die Ownerin danach ausprobieren?** Der Partner öffnet `/neu/partner`: Oben ist der kompakte Kreis mit den bereits freigegebenen Informationen, darunter bleibt der Kalender rein lesend.

## Entstehungsweg

`Partner verbunden → Screenshot zeigt nur Kalender → Prüfung findet zusätzliche alte Ring-Freigabe im Datenzugriff → aktive Verbindung soll allein genügen → WP-027`

- Ausgangsproblem: Der bestehende Partnerkalender ist sichtbar, der ebenfalls vorgesehene Zyklus-Kreis bleibt aus.
- bestätigte Wirkung: Partner sehen den bereits freigegebenen Kreis und den Kalender als eine zusammengehörige Übersicht.
- gewählte Lösung: Eine aktive Partnerverbindung ist für die bereits bestehende Zyklus-Kreis-Ansicht der einzige Gate; die alte zusätzliche `cycle_ring_shared`-Abfrage wird nicht mehr als zweites, verstecktes Anzeige-Gate verwendet.
- wichtige Entscheidung: Der Partner erhält ausschließlich die bereits auf `/neu/partner` vorgesehenen read-only Daten und keine Eingabeoptionen.
- Quellen/Akten: Owner-Screenshot 2026-10-23, WP-004, WP-017, WP-026.

## Soll – von Codex

- **Problem:** Die Partnerroute rendert den Kreis nur, wenn `getPartnerCycleView` ein Ergebnis liefert. Dort blockiert zusätzlich zur aktiven Verbindung ein historisches `cycle_ring_shared = TRUE`-Kriterium, obwohl der Codekommentar und die aktuelle Produktentscheidung die aktive Verbindung als alleinigen Gate festlegen.
- **gewünschte Wirkung:** Bei einer aktiven Partnerverbindung ist der kompakte Zyklus-Kreis auf `/neu/partner` sichtbar, auch wenn der alte Flag-Wert nicht gesetzt ist.
- **sichtbare Änderung:** Oberhalb des Partnerkalenders steht der bestehende kompakte Zyklus-Kreis mit seinen vorhandenen, freigegebenen Texten. Bei unzureichenden Daten zeigt er die bestehende neutrale Hinweisform, statt vollständig zu fehlen.
- **nicht enthalten:** Keine neue Freigabe, keine neuen Datenfelder, keine Änderung an Kalender, Ringgeometrie, Owner-Home, Eingabemöglichkeiten, API, Datenbank oder Migration.
- **Abnahmekriterien:**
  1. Ein aktiver Partner mit bisher fehlendem Kreis sieht ihn auf `/neu/partner` oberhalb des Kalenders.
  2. Ohne aktive Verbindung liefert die Route weiterhin keine Zyklusdaten und keine zusätzliche Ansicht.
  3. Partneransicht bleibt ohne jede Bearbeitungsmöglichkeit.
  4. Kalender, PMS-/Periodenstatus und Ringdaten entsprechen weiterhin der bestehenden Owner-Ableitung.
  5. Mobil und breit sind Kreis, Text und Kalender ohne horizontalen Überlauf sichtbar.
- **ein Prüfschritt für den Owner:** Als aktiv verbundener Partner `/neu/partner` öffnen: Kreis oben prüfen, Kalender darunter prüfen, keine Eingabemöglichkeit sehen.

## Technischer Auftrag für Claude

### Bestätigte Ausgangslage im Code

- `src/app/neu/partner/page.tsx` lädt bei `status.connected` sowohl `getPartnerCalendarView` als auch `getPartnerCycleView`; `NewPartnerCycleRing` wird nur bei einem vorhandenen `cycleView` oberhalb des Kalenders gerendert.
- `src/lib/new-partner-cycle-view.ts` leitet den Ring aus denselben Owner-Perioden, Profil- und PMS-Daten ab wie die Owner-Ansicht und dokumentiert bereits, dass eine aktive Verbindung der alleinige Gate sein soll.
- `resolveActiveConnectionOwner` prüft derzeit zusätzlich `cycle_ring_shared = TRUE`; das ist der konkrete, mit dem Soll widersprüchliche Anzeige-Gate.
- `NewPartnerCycleRing.tsx` und `CycleOverviewPanel.tsx` sind reine Darstellung; der Partner erhält dort keine Eingabe.

### Technisches Ziel

- Entferne ausschließlich das veraltete zweite Gate `cycle_ring_shared = TRUE` aus der Auflösung der aktiven Partnerverbindung für die bestehende Ringansicht.
- Behalte die aktive Verbindung (`partner_user_id`, `status = 'active'`) als zwingenden serverseitigen Gate.
- Nutze weiter dieselbe bestehende Datenableitung und Darstellungskomponenten. Keine neue Abfragequelle oder Ersatzberechnung.

### Invarianten – müssen unverändert bleiben

- Partnerkalender, Owner-Home, Kalenderfarben, PMS-/Periodenlogik, Ringgeometrie, Tagesfenster, Benachrichtigungen und Navigation.
- Partnerrechte: Ohne aktive Verbindung keine Daten; mit Verbindung nur die bisher bereits freigegebene read-only Übersicht. Keine Schreiboperation, keine Mutation und keine zusätzlichen persönlichen Daten.
- Datenbank-Schema, API-Routen, Migrationen und Legacy-Spalte selbst bleiben unverändert.

### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine Schema- oder Datenänderung; nur vorhandene aktive Verbindung serverseitig als Gate verwenden.
- betroffene API-Routen: keine.
- Migration nötig: nein.

### Pflichtprüfungen

- Neuer gezielter Server-/Integrationsnachweis: aktive Verbindung mit `cycle_ring_shared = false` liefert die bestehende Partner-Zyklusansicht; keine Verbindung liefert `null`.
- Bestehende Partner-Gate-, Kalender-, Ring- und read-only-Regressionen.
- `npx tsc --noEmit` und `npm run build`.
- Sichtprüfung mit aktivem Partnerkonto mobil und breit: kompakter Kreis oberhalb des Kalenders, keine Eingabeelemente, kein horizontaler Überlauf.

### Stoppbedingungen

- Stoppe vor jeder Erweiterung der Partnerfreigabe über die bestehende Zyklusübersicht und den Kalender hinaus.
- Stoppe vor einer Änderung an API, Datenbank, Migration, Owneransicht oder Datenableitung.
- Stoppe und melde es, falls eine aktive Verbindung nicht sicher serverseitig von einer alten/inaktiven Verbindung getrennt werden kann.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergänzen.
- `node scripts/work-package-state.mjs mark-updated WP-027` und `node scripts/work-package-state.mjs validate` ausführen.
- Nur auftragsbezogene Dateien committen und nach `main` pushen; kein Deployment auslösen.

## Ist – von Claude

- umgesetzt:
  - `src/lib/new-partner-cycle-view.ts`: In `resolveActiveConnectionOwner` wurde ausschließlich das alte Zusatz-Gate `AND cycle_ring_shared = TRUE` entfernt. Die Abfrage prüft weiter `partner_user_id = $1 AND status = 'active'`; ohne aktive Verbindung liefert `getPartnerCycleView` weiterhin sofort `null`, bevor irgendwelche Owner-Daten geladen werden. Datenableitung (`computePersonalCycleView`, `predictCycle`, `deriveManualPmsSection`, `isWithinManualPmsSection`) unverändert.
  - Keine weitere Änderung an Produktcode: `/neu/partner` (`page.tsx`), `NewPartnerCycleRing`, `CycleOverviewPanel`, Kalender, Owner-Seite, API-Routen, Datenbank und Migrationen sind unverändert. Die Seite rendert den Kreis wie bisher bei vorhandenem `cycleView` oberhalb des Kalenders.
- nicht umgesetzt: nichts offen.
- Tests:
  - Neues Skript `scripts/verify-partner-ring-gate-wp027.ts` (12 Prüfungen, bestanden): Abfrage prüft Partner-Konto und aktive Verbindung, `cycle_ring_shared` kommt im View nicht mehr vor, `null` vor dem Laden der Owner-Daten, bestehende Datenableitung, keine Schreiboperation, Kreis steht im Quelltext vor dem Kalender und hängt nur am View, Partner-Darstellungskomponenten ohne Eingabe/Aktion/Netzwerkaufruf.
  - Integrationsnachweis gegen die lokale Testdatenbank `scripts/verify-partner-cycle-ring.mts` (bestanden): aktive Verbindung mit `cycle_ring_shared = FALSE` liefert die Partner-Zyklusansicht, Flag an/aus liefert ein identisches Ergebnis, ohne Verbindung und nach beendeter Verbindung `null`, Kontotrennung zwischen Paaren, `no_data` bleibt ehrlich. Die SQL-Kopie im Skript wurde mit angepasst; die echte Quelldatei wird zusätzlich statisch geprüft. `verify-partner-estimated-period.mts` und `verify-partner-calendar.mts` bestehen unverändert.
  - Fachlich überholte Assertions angepasst (alte Erwartung „Verbindung und Freigabe gemeinsam“): `verify-cycle-overview-wp024.ts`, `verify-partner-fixed-view.ts` (Überschrift und Erwartung auf „aktive Verbindung allein“).
  - `npx tsc --noEmit` und `npm run build` bestehen.
  - Sichtprüfung (lokale Testkonten, Dev-Modus; verbundener Partner mit Flag `cycle_ring_shared = false`, per DB belegt; 360, 390 und 1280 px): Der Kreis mit Infotext und Legende steht oberhalb des Kalenders, ohne Button, Link, Formular oder Eingabefeld im Kreisbereich, kein horizontaler Überlauf. Ein Partner-Konto ohne Verbindung sieht nur das Code-Eingabeformular, weder Kreis noch Kalender. Die lokalen Testkonten wurden entfernt, Playwright wieder entfernt, `package.json`/`package-lock.json` ohne Diff.
- Abweichungen: keine.
- offene Punkte: Der Schalter „Zyklus-Kreis für Partner freigeben“ auf `/neu/einstellungen` (aus WP-024) steuert das Flag weiter, hat aber jetzt keine Wirkung mehr auf die Partneransicht. Das ist laut Auftrag (keine Änderung an Owner-Seite/API) nicht verändert worden; der Schalter sollte in einem eigenen Paket entfernt oder neu entschieden werden, damit er nichts Falsches verspricht. Kein Deployment ausgelöst.
- Commit: siehe Git-Verlauf (`fix(wp-027)`).

## Soll-Ist-Prüfung – von Codex

- Ergebnis: ausstehend.
- Nachschärfung: ausstehend.
- Product-Map aktualisiert: nein.
