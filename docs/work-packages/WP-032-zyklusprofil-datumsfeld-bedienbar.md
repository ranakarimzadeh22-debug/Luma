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

## Ist – von Claude

**Ursache:** In `NewCycleProfileWizard` war das Datumsfeld mit `disabled={draft.lastPeriodUnknown}` gesperrt. War `lastPeriodUnknown` gesetzt (nach „Ich weiß es nicht“ oder bei einem gespeicherten Profil ohne Datum), nahm das Feld weder Klick noch Eingabe an, und `onChange` konnte das Flag nie zurücksetzen. Das Feld war damit dauerhaft gesperrt.

**Änderung:** Das `disabled`-Attribut samt zugehöriger Stilklasse ist am Datumsfeld entfernt. Das native `type="date"`-Feld (Picker oder Tastatureingabe, Maximum heute) ist immer bedienbar; eine Eingabe setzt „unbekannt“ weiter zurück. „Ich weiß es nicht“, Weiter-Bedingung, Fehlerhinweis, Payload, Validierung und die übrigen Fragen sind unverändert.

**Dateien:** `src/components/NewCycleProfileWizard.tsx`, `scripts/verify-cycle-profile-date-wp032.ts` (neu).

**Prüfungen:** gezieltes Prüfskript, `tsc --noEmit` und `npm run build` bestehen. **Abweichung:** Kein Browserlauf auf Desktop/Mobil (nur Quellcode-Prüfung); die Owner-Abnahme prüft das Verhalten im Browser. Nicht deployed.

## Soll-Ist-Prüfung – von Codex

Noch offen. Nach der Claude-Meldung wird nur dieses Paket gegen den Auftrag geprüft.

## Abnahme durch Owner

1. Lokal `/neu/zyklusprofil` öffnen.
2. In Frage 1 das Datumsfeld anklicken oder antippen.
3. Ein Datum wählen oder tippen, zum Beispiel `05.11.2026`.
4. **Weiter** muss funktionieren; `Ich weiß es nicht` ebenfalls.

