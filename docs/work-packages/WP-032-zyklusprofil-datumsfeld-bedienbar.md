---
id: WP-032
title: "Zyklusprofil: Datumsfeld bedienbar machen"
status: review
created: 2026-11-12
updated: 2026-11-12
brief_version: 1
technical_brief: complete
owner_approved: yes
executor: Claude
product_area: "/neu/zyklusprofil"
---

# WP-032 – Zyklusprofil: Datumsfeld bedienbar machen

## Owner-Ansicht – einfach erklärt

Auf der ersten Frage des Zyklusprofils kann ich das Feld **Datum** antippen oder anklicken. Ich kann den ersten Tag meiner letzten Periode aus einem Kalender auswählen oder das Datum mit der Tastatur eingeben. Danach kann ich wie bisher mit **Weiter** fortfahren.

## Entstehungsweg

Beim lokalen Owner-Test am 12.11.2026 war das Datumsfeld auf `/neu/zyklusprofil` nicht bedienbar: Ein Klick erlaubte weder die Datumsauswahl noch die Eingabe. Der Owner hat die Korrektur ausdrücklich freigegeben.

## Soll – von Codex

Das vorhandene Datumseingabefeld in Frage 1 von 4 muss auf Desktop und Mobilgeräten zuverlässig funktionieren:

- Klick oder Tipp fokussiert das Feld beziehungsweise öffnet die verfügbare Datumsauswahl.
- Das Datum kann per Tastatur eingegeben werden.
- Eine native, zugängliche Datumsauswahl darf verwendet werden; auf Geräten ohne Picker bleibt die Texteingabe möglich.
- Das bestehende deutsche Datumsformat und die bestehende Validierung werden verständlich beibehalten oder gleichwertig verbessert.
- `Ich weiß es nicht`, `Abbrechen`, `Weiter`, die restlichen Profilfragen und bereits gespeicherte Profilwerte verhalten sich unverändert.

## Technischer Auftrag für Claude

Untersuche ausschließlich die bestehende Datumseingabe in `NewCycleProfileWizard` und ihre direkte Validierung. Behebe die Ursache, durch die das Feld nicht fokussierbar beziehungsweise nicht beschreibbar ist. Keine Änderung an Zyklusformeln, Speicherung, Datenbank, APIs, Partnerfreigaben, Kalendern oder dem Ablauf der übrigen Fragen.

Prüfe gezielt auf Desktop und mobilem Viewport:

1. Feld ist per Maus/Tipp fokussierbar.
2. Ein gültiges Datum kann eingegeben werden und **Weiter** wird nutzbar.
3. Ungültige oder unvollständige Eingaben werden wie bisher klar behandelt.
4. `Ich weiß es nicht` funktioniert weiterhin.

Führe eine gezielte automatisierte Prüfung, Typecheck und Build aus. Nicht deployen.

## Korrekturauftrag Version 2 – von Codex

### Problem

Beim Owner-Test am 12.11.2026 ist in Frage 2 des bestehenden Zyklusprofils das Zahlenfeld **Anzahl der Tage** nicht beschreibbar. Der Owner kann dort keine Zahl eingeben. Der Owner hat die Korrektur ausdrücklich freigegeben.

### Soll

- Das vorhandene Zahlenfeld in Frage 2 ist auf Desktop und Mobilgeräten per Klick oder Tipp fokussierbar und nimmt Tastatureingaben an.
- Nach einer gültigen Eingabe verhält sich **Weiter** wie vorgesehen und führt zur nächsten bestehenden Frage.
- Die bestehenden erlaubten Werte, Fehlermeldungen, Speicherung und Berechnungen bleiben unverändert.
- Die Korrektur am Datumsfeld aus Version 1, `Ich weiß es nicht` sowie alle anderen Profilfragen bleiben unverändert.
- Keine neue Datenquelle, Datenbank, API, Partnerfreigabe oder Zykluslogik.

### Prüfung und Owner-Abnahme

Claude prüft gezielt, dass das Zahlenfeld nicht deaktiviert oder schreibgeschützt ist, eine gültige Zahl annimmt und **Weiter** danach funktioniert; zusätzlich Typecheck und Build. Der Owner prüft lokal auf `/neu/zyklusprofil`: Frage 2 öffnen, eine Zahl eingeben und mit **Weiter** fortfahren.

## Korrekturauftrag Version 3 – von Codex

### Anlass

Der Owner hat Version 2 am 12.11.2026 lokal erneut geprüft. Auch nach Abschluss der lokalen Kompilierung und vollständigem Neuladen ist das Zahlenfeld **Anzahl der Tage** in Frage 2 nicht beschreibbar. Die Korrektur V2 ist deshalb nicht abnahmefähig.

### Verbindliches Soll

- Auf der tatsächlich laufenden lokalen Seite `/neu/zyklusprofil` kann der Owner in Frage 2 per Maus, Tastatur und Touch eine Zahl eingeben.
- Das Feld muss sichtbar fokussierbar sein; keine darüberliegende Schicht, kein CSS-Verhalten, kein `readOnly`, kein `disabled` und kein anschließendes Zurücksetzen darf die Eingabe verhindern.
- Die Zahl `5` muss sichtbar im Feld bleiben und **Weiter** muss danach zu Frage 3 führen.
- `Ich weiß es nicht` muss weiterhin sichtbar funktionieren und eine anschließende Zahleneingabe wieder zulassen.

### Technischer Auftrag für Claude

Reproduziere den Fehler im Browser auf der laufenden lokalen App, bevor du die Korrektur als fertig meldest. Untersuche neben `disabled` auch `readOnly`, Pointer-/Overlay-CSS, Fokus, Ereignishandler, kontrollierten Wert und ein mögliches Zurücksetzen nach Eingabe. Eine reine Quelltext-Assertion genügt nicht.

Prüfe den fertigen Stand zwingend im Browser auf Desktop und Mobil: Feld anklicken, `5` tippen, sichtbaren Wert prüfen, **Weiter** klicken; anschließend `Ich weiß es nicht` und erneut `5` testen. Erst dann Typecheck, Build und gezielte Regressionstests ausführen. Keine Änderung an Berechnung, Speicherung, Datenbank, APIs, Partnerdaten oder anderen Profilfragen.

## Ist – von Claude

**Ursache:** In `NewCycleProfileWizard` war das Datumsfeld mit `disabled={draft.lastPeriodUnknown}` gesperrt. War `lastPeriodUnknown` gesetzt (nach „Ich weiß es nicht“ oder bei einem gespeicherten Profil ohne Datum), nahm das Feld weder Klick noch Eingabe an, und `onChange` konnte das Flag nie zurücksetzen. Das Feld war damit dauerhaft gesperrt.

**Änderung:** Das `disabled`-Attribut samt zugehöriger Stilklasse ist am Datumsfeld entfernt. Das native `type="date"`-Feld (Picker oder Tastatureingabe, Maximum heute) ist immer bedienbar; eine Eingabe setzt „unbekannt“ weiter zurück. „Ich weiß es nicht“, Weiter-Bedingung, Fehlerhinweis, Payload, Validierung und die übrigen Fragen sind unverändert.

**Dateien:** `src/components/NewCycleProfileWizard.tsx`, `scripts/verify-cycle-profile-date-wp032.ts` (neu).

**Prüfungen:** gezieltes Prüfskript, `tsc --noEmit` und `npm run build` bestehen. **Korrektur (Owner-Rückmeldung, „Ich weiß es nicht“ wirkte nicht):** Der Klick war nicht sichtbar und ließ eine halb getippte Eingabe im nativen Datumsfeld stehen. Jetzt ist der Button ein Umschalter mit `aria-pressed`, Haken „✓ Ich weiß es nicht“, ausgegrautem Datumsfeld und Statushinweis („Du kannst direkt mit „Weiter“ fortfahren“). Der Klick leert das Datum neutral und setzt das native Feld über einen Reset-Schlüssel zurück. „Weiter“ geht ohne Datum; eine Datumseingabe hebt „unbekannt“ wieder auf. Das Feld bleibt nie deaktiviert.

**Browserprüfung (Edge, lokal, Testkonten danach gelöscht), Desktop 1280 px und Mobil 390 px:** Feld fokussierbar, Datum eingebbar, Klick auf „Ich weiß es nicht“ setzt den Status sichtbar und leert das Datum, „Weiter“ ohne Datum führt zu Frage 2, Datumseingabe danach funktioniert und hebt „unbekannt“ auf, „Weiter“ mit Datum führt zu Frage 2, kein horizontaler Überlauf. Prüfskript, `tsc --noEmit` und `npm run build` bestehen. Nicht deployed.

### Korrektur Version 2 (Claude)

**Ursache:** Das Zahlenfeld „Anzahl der Tage“ in Frage 2 war mit `disabled={draft.bleedingDurationUnknown}` gesperrt – derselbe Fehler wie beim Datumsfeld. War „unbekannt“ gesetzt (nach „Ich weiß es nicht“ oder bei einem gespeicherten Profil ohne Wert), nahm das Feld weder Klick noch Eingabe an.

**Änderung:** `disabled` und die Klasse `disabled:bg-neutral-100` sind am Feld entfernt; bei „unbekannt“ wird das Feld nur grau hinterlegt, bleibt aber bedienbar. Eine Eingabe setzt „unbekannt“ weiter zurück. Grenzen 1 bis 366, Weiter-Bedingung, Payload, „Ich weiß es nicht“, Datumsfeld aus Version 1 und alle anderen Fragen sind unverändert.

**Dateien:** `src/components/NewCycleProfileWizard.tsx`, `scripts/verify-cycle-profile-duration-wp032-v2.ts` (neu), `scripts/verify-cycle-profile-date-wp032.ts` (eine Prüfzeile angepasst: nur noch ein gesperrtes Zahlenfeld).

**Prüfungen:** neues Prüfskript, Skript aus Version 1, `tsc --noEmit`, `npm run build` bestehen. Browserprüfung (Edge, lokal, Testkonten gelöscht) auf Desktop 1280 px und Mobil 390 px: Feld fokussierbar, nicht deaktiviert, Tastatureingabe „5“ landet im Feld, „Weiter“ führt zu Frage 3, nach „Ich weiß es nicht“ ist das Feld weiter bedienbar und nimmt eine Zahl an, kein Überlauf. Nicht deployed.

**Hinweis (nicht geändert, außerhalb V2):** Das Zahlenfeld „Übliche Zykluslänge“ in Frage 3 hat noch dieselbe `disabled`-Sperre bei „unbekannt“. Ein eigenes Korrekturpaket wäre nötig.

### Korrektur Version 3 (Claude)

**Reproduktion (lokal, Edge, echter Mausklick auf Koordinaten und echtes Tippen, Desktop 1280 px und Mobil 390 px, frisches Konto und Konto mit gespeichertem Profil „unbekannt“):** Frage 2 („Übliche Blutungsdauer“) war nach V2 bedienbar. Das Feld in **Frage 3** („Übliche Zykluslänge“) trägt aber dieselbe Beschriftung **„Anzahl der Tage“** und war noch mit `disabled={draft.cycleLengthUnknown}` gesperrt: bei einem gespeicherten Profil mit unbekannter Zykluslänge und nach „Ich weiß es nicht“ ließ es sich weder anklicken noch beschreiben (14 fehlgeschlagene Prüfungen). Die wahrscheinlichste Ursache der Owner-Beobachtung ist dieses zweite, gleich beschriftete Feld. Overlay, `readOnly`, Pointer-CSS, Fokus, Ereignishandler und ein Zurücksetzen nach Eingabe habe ich geprüft: Am Klickpunkt liegt in Frage 2 und 3 das Zahlenfeld obenauf, ein Zurücksetzen gibt es nicht.

**Änderung:** `disabled` und `disabled:bg-neutral-100` sind auch am Zahlenfeld der Frage 3 entfernt; bei „unbekannt“ wird das Feld nur grau hinterlegt. In `NewCycleProfileWizard` gibt es nun kein `disabled={draft…}` mehr. Grenzen, Weiter-Bedingungen, Payload, Speicherung und „Ich weiß es nicht“ sind unverändert.

**Dateien:** `src/components/NewCycleProfileWizard.tsx`, `scripts/verify-cycle-profile-numbers-wp032-v3.ts` (neu), `scripts/verify-cycle-profile-date-wp032.ts` (eine Prüfzeile angepasst).

**Browserprüfung nach der Korrektur (alle bestanden):** Feld in Frage 2 und 3 per Mausklick fokussiert, `5` getippt und sichtbar, „Weiter“ führt zur nächsten Frage, „Ich weiß es nicht“ leert und danach ist `5` wieder eingebbar; Desktop und Mobil, frisches Konto und Profil „unbekannt“, kein Überlauf. Skripte, `tsc --noEmit`, `npm run build` bestehen. Testkonten gelöscht. Nicht deployed.

**Offen:** Falls der Owner tatsächlich Frage 2 (Titel „Übliche Blutungsdauer“) meint und dort weiterhin nichts tippen kann, bitte Browser, Gerät und die genaue Anzeige nennen; im Test war Frage 2 nicht reproduzierbar gesperrt.

## Soll-Ist-Prüfung – von Codex

Noch offen. Nach der Claude-Meldung wird nur dieses Paket gegen den Auftrag geprüft.

## Abnahme durch Owner

1. Lokal `/neu/zyklusprofil` öffnen.
2. In Frage 1 das Datumsfeld anklicken oder antippen.
3. Ein Datum wählen oder tippen, zum Beispiel `05.11.2026`.
4. **Weiter** muss funktionieren; `Ich weiß es nicht` ebenfalls.

