# Claude-Startpunkt

1. Lies zuerst `docs/work-packages/STATE.json`.
2. Bearbeite nur ein Paket mit `status: approved`, `owner_approved: yes` und `technical_brief: complete`.
3. Ergänze danach im selben Paket den Ist-Stand und setze `status: review`.
4. Führe `node scripts/work-package-state.mjs mark-updated <WP-ID>` und danach `node scripts/work-package-state.mjs validate` aus.
5. Erweitere den Umfang nicht still und verändere die Product-Map nicht selbst; den Soll-Ist-Abgleich und die Product-Map pflegt Codex.
6. Erkläre bei Fragen wie „Was war WP-001?“ zuerst die einfache `Owner-Ansicht` dieses Pakets. Erfinde kein Warum und lies nicht unnötig andere Pakete.
7. Der Abschnitt `Technischer Auftrag für Claude` ist bindend für Wirkung, Grenzen und Invarianten. Genannte Dateien sind Startpunkte; wenn der echte Code anders aufgebaut ist, dokumentiere die Abweichung und wähle den passenden technischen Ort.

Die vollständigen Repository-Regeln gelten zusätzlich:

@AGENTS.md
