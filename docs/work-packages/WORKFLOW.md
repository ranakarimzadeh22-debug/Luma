# Einfacher Aufgabenablauf

`Codex plant → Owner gibt frei → Claude setzt um → Claude dokumentiert Ist → Codex prüft Soll/Ist → abgeschlossen oder Nachschärfung`

## Status

- `draft`: Entwurf, noch nicht freigegeben
- `approved`: freigegeben, noch nicht begonnen
- `in_progress`: Claude arbeitet daran
- `on_hold`: wartet auf eine Voraussetzung
- `review`: Claude ist fertig, Codex muss prüfen
- `completed`: Soll und Ist stimmen ausreichend überein
- `parked`: bewusst aus dem aktiven Ablauf genommen

`approved`, `in_progress`, `on_hold` und `review` zählen als offen. Mehr als drei offene Aufgaben sind verboten.

## Pflicht für Claude

Claude bearbeitet nur ein freigegebenes Paket und erweitert den Umfang nicht still. Danach ergänzt Claude den Abschnitt `Ist`, setzt den Status auf `review`, aktualisiert das Entwicklungsledger und führt aus:

`node scripts/work-package-state.mjs mark-updated <WP-ID>`

Anschließend muss `node scripts/work-package-state.mjs validate` bestehen.

## Pflicht für Codex

Codex liest zu Beginn einer relevanten Sitzung, vor einem neuen Paket, bei `Prüfe Updates` und vor einem Projektstatus zuerst nur:

`node scripts/work-package-state.mjs status`

Ohne neue Revision werden keine Pakete gelesen. Bei einem Update liest Codex nur die IDs aus `changedPackages`, prüft Soll und Ist und aktualisiert bei Bedarf `docs/product-state/PRODUCT-MAP.md`. Danach:

`node scripts/work-package-state.mjs acknowledge`

