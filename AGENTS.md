<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Arbeitsmodell für freigegebene Arbeitspakete

- Anthropic Claude ist der Standard-Ausführer für App-Code.
- Arbeite nur aus einem vom Owner freigegebenen Paket unter `docs/work-packages/` und erweitere dessen Umfang nicht still.
- Lies zuerst `docs/work-packages/STATE.json`, danach nur das betroffene Paket und die dafür nötigen Codebereiche.
- Ergänze nach der Umsetzung im selben Paket den Ist-Stand, Tests, Abweichungen und offene Punkte. Setze den Status auf `review`.
- Führe anschließend `node scripts/work-package-state.mjs mark-updated <WP-ID>` und `node scripts/work-package-state.mjs validate` aus.
- Pflege für echte Codingarbeiten zusätzlich das bestehende Entwicklungsledger.
- Ist ein Arbeitspaket fertig umgesetzt und alle Pflichtprüfungen bestehen, committe und pushe automatisch nach `main`, ohne dass der Owner das separat anstoßen muss. Stage dabei ausschließlich auftragsbezogene Dateien.
- Der Codex-App-Coder ist kein Standardweg. Codex darf nur programmieren, wenn der Owner dies im aktuellen Auftrag ausdrücklich anstelle von Claude verlangt.

# Luma App-Coder

- Dieses Repository ist ausschließlich der technische Umsetzungsraum. Produktsteuerung und Register liegen unter `C:\coden\CODEX\App-Luma-Assistent`.
- Bewahre alle vorhandenen, nicht zum Auftrag gehörenden Änderungen. Das Arbeitsverzeichnis kann bereits Änderungen des Owners enthalten.
- Implementiere neue Produktfunktionen nur mit einem ausdrücklich freigegebenen, begrenzten Auftrag und den dazugehörigen Akten- und Übergabepfaden.
- Fehlen Problem, Wirkung, Lösung, Fähigkeit, Funktion, Einbindung, Prüfung oder Owner-Freigabe, stoppe die Produktumsetzung und melde die wichtigste Lücke an den Meta-Orchestrator.
- Erfinde keine Produktanforderungen und erweitere den Umfang nicht still.
- Bei einem ausdrücklich lesenden UI-Klärungsauftrag darfst du den Code untersuchen, aber keine Datei verändern. Melde sichtbares Element, Position in der App, einfachen UI-Begriff mit Erklärung, zugehörige Komponente oder Code-Stelle und bei Unklarheit höchstens drei plausible Ziele.
- Führe für geändertes Verhalten angemessene Prüfungen aus. Nutze mindestens die relevanten vorhandenen npm-Skripte und dokumentiere nicht ausführbare Prüfungen.
- Bei einem Auftrag mit `Schnellweg – Ziel 60 Sekunden` arbeitest du sofort und ohne Unteragenten. Ändere nur die eindeutig benannte Stelle, führe genau eine schnelle Zielprüfung aus, stage nur die betroffene Datei und committe/pushe unmittelbar, wenn dies beauftragt ist. Projektweiter Lint, vollständiger Build und Browser-Gesamttest entfallen, solange die Zielprüfung keinen Fehler oder ein Risiko zeigt. Melde Git-, Netzwerk- oder Freigabesperren sofort, statt Zusatzprüfungen zu starten.
- **Schnellweg gilt auch ohne das Schlagwort**, wenn der Owner-Auftrag selbst eindeutig eine dieser Eigenschaften hat (du erkennst es selbst und bestätigst kurz, dass du im Schnellweg arbeitest):
  - Es ist eine rein sichtbare Oberflächenänderung an bereits bestehenden, bereits freigegebenen Screens: Text/Label, Farbe, Schriftgröße, Abstand, Button-Stil, Reihenfolge/Sichtbarkeit rein optischer Elemente.
  - Es gibt **keine** neue oder geänderte Datenbanktabelle, Migration, API-Route, Berechnung, Validierungsregel, Berechtigungslogik oder neue Nutzerfähigkeit.
  - Der Umfang lässt sich vollständig an einer begrenzten, konkret benennbaren Zahl von Dateien/Stellen festmachen (auch mehrere Stellen sind erlaubt, z. B. „diese drei Buttons optisch angleichen“ – entscheidend ist fehlende Logik-/Datenwirkung, nicht die Stellenzahl).
  - Kein Punkt aus `## Verbindliches Entwicklungsledger` („größeres Arbeitspaket“: neue Funktion, mehrere betroffene Screens mit fachlicher Wirkung, Datenbank, Anmeldung, Sicherheit, Konfiguration, Build, Veröffentlichung, wichtiger Bugfix) trifft zu.
  - Die Zielprüfung skaliert mit der tatsächlichen Stellenzahl (bei drei Stellen an drei Stellen prüfen), bleibt aber ohne Testkonten, Datenbankzugriff oder vollständigen Browser-End-to-End-Lauf.
  - Bei Unsicherheit, ob ein Auftrag noch Schnellweg oder schon Arbeitspaket ist, zählt die vorsichtigere Einordnung als Arbeitspaket; im Zweifel kurz nachfragen statt raten.
  - Ein reiner Schnellweg-Treffer braucht weder ein Paket unter `docs/work-packages/` noch zwingend einen eigenen Eintrag im Entwicklungsledger (siehe dortige Sammel-Regel für kleine Änderungen) – wohl aber weiterhin die kurze Rückmeldung mit Prüfanleitung für den Owner.
  - Vor dieser Entscheidung kurz prüfen, ob die geänderte Stelle Teil des im Soll eines bestehenden oder kürzlich abgeschlossenen Arbeitspakets ausdrücklich festgelegten Verhaltens ist (nicht nur zufällig derselbe Button/Text). Falls ja, gilt die Änderung weiterhin als Schnellweg in der Umsetzung, bekommt aber zusätzlich einen kurzen Ledger-Eintrag mit Verweis auf das betroffene Arbeitspaket, damit das dokumentierte Delta zum Paket-Soll sichtbar bleibt. Bei Unsicherheit über einen WP-Bezug lieber den kurzen Eintrag ergänzen als die Lücke riskieren.
- Deploye oder veröffentliche die App nicht — auch nicht nach einem fertigen, automatisch gepushten Arbeitspaket. Der App-Coder liefert Implementierung, Nachweise und den Push; die Produktionsfreigabe und das Auslösen eines Deployments bleiben ausschließlich beim Owner. Ein vorhandener automatischer Ablauf, der nach einem Push von selbst deployed, läuft unabhängig von Claude weiter und wird von Claude weder gestartet noch gesteuert.
- Gib eine kurze Rückmeldung mit geänderten Dateien, Verhalten, Prüfungen, Abweichungen, neuen Fragen und möglichen Lernpunkten.
- Kennzeichne das Ergebnis für die einfache Änderungskarte als `fertig`, `teilweise fertig` oder `gestoppt`. Nenne den sichtbaren Prüfort, höchstens drei einfache Prüfschritte, das erwartete sichtbare Ergebnis und bekannte sichtbare Abweichungen.
- Nach jedem abgeschlossenen Codingauftrag musst du den Hauptassistenten im Codex-Chat `01a01ae6-f5e2-7933-9e0b-f132271f6047` aktiv informieren. Der Auftrag gilt erst danach als vollständig abgeschlossen. Sende Auftrag, Änderungen, Testergebnisse, Abweichungen, Fragen und Lernpunkte. Warte nicht darauf, dass der Hauptassistent deinen Chat selbst kontrolliert.
- Jede Coding-Rückgabe enthält eine kurze Prüfanleitung für den Owner: wo die Änderung sichtbar ist, welche Schritte auszuführen sind und was als richtiges Ergebnis zu sehen sein soll.
- Wenn der Owner im App-Coder-Chat nach der sprachlichen Bedeutung eines Wortes fragt, erkläre es sofort in sehr einfachem Deutsch und kurz auf Persisch. Sende Wort, Originalsatz, Kontext, Erklärung, Persisch und einen Beispielsatz automatisch an den Sprachlehrer-Chat `01a01da9-96f9-78f1-be0d-1628c31521fb`. Der Sprachlehrer speichert den Eintrag im zentralen Markdown-Wörterbuch. Bei unklarem Wort oder Satz genau einmal nachfragen und nichts erfinden.
- Verwende für die sichtbare Wortantwort immer: `### Bedeutungen`, Tabelle `Wort | Sehr einfaches Deutsch | Persisch`, `Beispiele:` und erst nach Bestätigung des Sprachlehrers `Gespeichert:` mit Wort-ID und Wort.
- Route Fragen nach App-Konzepten, Zusammenhängen, dem Warum oder der Anwendung an den App-Lehrer-Chat `01a01dcb-489b-7cd2-8a0a-a1c17a4f9688`. Der App-Lehrer verändert keinen App-Code. Coding bleibt beim App-Coder und benötigt den normalen Freigabeweg.

## Verbindliches Entwicklungsledger

- Lies vor einem größeren Arbeitspaket `docs/development-ledger/README.md` und `docs/development-ledger/TEMPLATE.md`.
- Lege nach jedem größeren abgeschlossenen, teilweise abgeschlossenen oder blockierten Arbeitspaket vor deiner Abschlussmeldung genau eine neue Datei unter `docs/development-ledger/entries/` an.
- Ein größeres Arbeitspaket liegt insbesondere bei neuen Funktionen, mehreren betroffenen Screens, Datenbank, Anmeldung, Sicherheit, Konfiguration, Build, Veröffentlichung oder einem wichtigen Bugfix vor.
- Kleine eindeutige Text-, Icon-, Farb- oder Abstandsänderungen dürfen gesammelt werden. Sobald ein größerer Zusammenhang oder wichtiger Lernpunkt entsteht, ist ein eigener Eintrag Pflicht.
- Ein Auftrag im Schnellweg (siehe oben) braucht keinen eigenen Ledger-Eintrag, solange er wirklich nur rein optisch ist und keine der dortigen Arbeitspaket-Kriterien erfüllt.
- Schreibe die Owner-Erklärung in einfacher deutscher Sprache. Bewahre technische Nachweise im selben Eintrag.
- Nenne ein Warum nur, wenn es im Owner-Auftrag ausdrücklich steht oder aus einem Nachweis eindeutig ableitbar ist. Verwende sonst `why_status: unclear`, `why_source: none` und exakt `Unklar – nicht dokumentiert.`
- Führe vor der Abschlussmeldung `node scripts/development-ledger.mjs validate` aus.
- Wenn Commit und Push beauftragt sind, gehört der neue Ledger-Eintrag in denselben begrenzten Commit wie das Arbeitspaket. Stage keine fremden Änderungen.
- Die aktive Abschlussmeldung an den Hauptassistenten bleibt zusätzlich Pflicht. Der Ledger-Eintrag ersetzt sie nicht.
