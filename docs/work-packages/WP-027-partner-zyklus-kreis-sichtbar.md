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
- Korrekturentscheidung (Owner, 2026-10-23): Der alte Einstellungs-Schalter `Zyklus-Kreis für Partner freigeben` darf nicht weiter angezeigt werden, weil eine aktive Verbindung den Kreis unabhängig von diesem historischen Flag zeigt. Stattdessen zeigt die Einstellungsseite nur den tatsächlichen Verbindungsstatus verständlich an.
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

## Korrekturauftrag – Partner-Einstellung verständlich machen

### Soll – von Codex

- Auf `/neu/einstellungen` wird der alte interaktive Schalter `Zyklus-Kreis für Partner freigeben` vollständig entfernt.
- Bei aktiver Verbindung erscheint an derselben passenden Stelle eine nicht anklickbare, kurze Statuskarte: Titel `Aktive Partnerverbindung`; Text `Dein Partner sieht Kalender und Zyklus-Kreis.`
- Ohne aktive Verbindung darf kein positiver Freigabe-Text erscheinen. Nutze den bereits vorhandenen Verbindungsstatus für eine passende neutrale Darstellung oder den bestehenden Nicht-verbunden-Zustand.
- Die Darstellung erklärt ausschließlich den schon geltenden Zustand. Sie verändert weder, welche Daten Partner sehen, noch die aktive Verbindung selbst.

### Technischer Auftrag für Claude

- Finde die bestehende Owner-Einstellung und ihren API-/State-Weg für `cycle_ring_shared`. Entferne den sichtbaren Schalter samt ausschließlich dazugehörigem Client-Verhalten und ungenutzten UI-Code.
- Ersetze ihn durch eine rein lesende Statusdarstellung, die ausschließlich aus dem bereits auf der Einstellungsseite verfügbaren aktiven Verbindungszustand abgeleitet wird. Keine neue Datenabfrage, keine neue API-Route und keine Berechnung.
- Die Legacy-Datenbankspalte und bestehende API dürfen unverändert bleiben, wenn sie außerhalb des entfernten UI-Wegs noch für Kompatibilität vorhanden sind; keine Migration.
- Partnerroute `/neu/partner`, das serverseitige aktive Verbindungs-Gate, Kalender, Zyklus-Kreis, Owner-Home und Partnerrechte bleiben unverändert.

### Pflichtprüfungen

- Gezielte Prüfung: Der alte sichtbare Schalter und sein auslösender Schreibweg kommen auf `/neu/einstellungen` nicht mehr vor; bei aktiver Verbindung ist der verständliche reine Status sichtbar.
- Bestehende Einstellungen-, Partner-Gate- und read-only-Regressionen; TypeScript und Build.
- Sichtprüfung mobil und breit: aktiver Verbindungsstatus verständlich, kein Toggle, kein horizontaler Überlauf; Partneransicht unverändert rein lesend.

### Stoppbedingungen

- Stoppe vor einer Änderung am aktiven Verbindungs-Gate, an Partnerdaten, Datenbank, Migration, API-Vertrag oder Zugriffsschutz.
- Stoppe, falls der echte Verbindungsstatus auf der Einstellungsseite nicht ohne neue Abfrage verfügbar ist; dann die vorhandene Datenquelle dokumentieren und Rückfrage stellen.

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
- offene Punkte: Die Korrektur zur Entfernung des alten Einstellungs-Schalters ist umgesetzt (siehe „Ist Korrektur Partner-Einstellung“). Kein Deployment ausgelöst.
- Commit: siehe Git-Verlauf (`fix(wp-027)`).

## Ist Korrektur Partner-Einstellung – von Claude

- umgesetzt:
  - `src/app/neu/einstellungen/page.tsx`: Der Schalter `NewPartnerCycleRingSharingToggle` (samt Import und der Übergabe des Freigabewerts) ist entfernt. An derselben Stelle steht bei aktiver Verbindung (`status.connected && status.role === "owner"`) eine rein lesende, nicht anklickbare Info-Karte: Titel „Aktive Partnerverbindung“, Text „Dein Partner sieht Kalender und Zyklus-Kreis.“ Die Karte nutzt nur den schon auf der Seite vorhandenen Verbindungsstatus (`getPartnerConnectionStatusForOwner`), keine neue Abfrage, keine neue Route, keine Berechnung. Ohne aktive Verbindung erscheint die Karte nicht und es steht kein positiver Freigabe-Text auf der Seite.
  - `src/components/NewPartnerCycleRingSharingToggle.tsx` gelöscht: Sie war der einzige UI-Schreibweg zum Flag (`fetch` auf `cycle-ring-sharing`) und ist nach der Änderung ungenutzt.
  - Unverändert: Partnerrechte, Partnerdaten, `/neu/partner`, aktives Verbindungs-Gate, Kalender, Zyklus-Kreis, Owner-Home, Verbindungscode-Bereich (`NewPartnerCodeCard`), Datenbank, Migration. Die API-Route `src/app/api/neu/partner/cycle-ring-sharing/route.ts`, `setPartnerCycleRingShared` und das Feld `cycleRingShared` im Owner-Status blieben laut Auftrag (keine API-Änderung, Legacy-Kompatibilität) unangetastet; sie haben jetzt keinen Aufrufer mehr in der UI.
- Tests:
  - Neues Skript `scripts/verify-settings-partner-info-wp027.ts` (bestanden): keine Schalter-Komponente, keine Schalter-Texte, kein `cycle-ring-sharing`-Aufruf im UI-Code; Titel und Text exakt, nur hinter der Bedingung „aktive Verbindung“, Text genau einmal; Karte ohne Button/Link/Formular/Aktion; nur vorhandener Verbindungsstatus; Gate, Route und Setter unverändert.
  - Angepasst (fachlich überholt): `verify-partner-fixed-view.ts` erwartete den Schalter und die Komponente; sie prüft jetzt das Gegenteil und die Info-Karte. Bestehende Regressionen bestehen: `verify-partner-ring-gate-wp027`, `verify-cycle-overview-wp024`, `verify-owner-mobile-nav`, `verify-settings-grouped`, `verify-partner-view-no-status-card`. `npx tsc --noEmit` und `npm run build` bestehen.
  - Sichtprüfung (lokale Testkonten, Dev-Modus): Owner ohne Verbindung: keine Karte, kein positiver Text, kein Schalter. Owner mit aktiver Verbindung bei 360, 390 und 1280 px: Karte „Aktive Partnerverbindung“ mit dem Text sichtbar, nicht anklickbar, kein Schalter/aria-pressed-Button, kein horizontaler Überlauf. Nach „Verbindung beenden“ verschwindet die Karte. Partneransicht unverändert (Kreis oberhalb des Kalenders, keine Eingabe im Kreisbereich). Testkonten und Playwright entfernt, `package.json`/`package-lock.json` ohne Diff.
- Abweichungen: keine.
- offene Punkte: Route `cycle-ring-sharing` und `setPartnerCycleRingShared` sind jetzt ungenutzt, aber absichtlich nicht entfernt (Auftrag: keine API-Änderung); sie könnten in einem eigenen Aufräumpaket gelöscht werden. Kein Deployment ausgelöst.
- Commit: siehe Git-Verlauf (`fix(wp-027)` Einstellungen).

## Soll-Ist-Prüfung – von Codex

- Ergebnis: ausstehend.
- Nachschärfung: ausstehend.
- Product-Map aktualisiert: nein.
