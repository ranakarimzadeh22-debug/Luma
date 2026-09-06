# Claude-Startpunkt

1. Lies zuerst `docs/work-packages/STATE.json`.
2. Bearbeite nur ein Paket mit `status: approved` und `owner_approved: yes`.
3. Ergänze danach im selben Paket den Ist-Stand und setze `status: review`.
4. Führe `node scripts/work-package-state.mjs mark-updated <WP-ID>` und danach `node scripts/work-package-state.mjs validate` aus.
5. Erweitere den Umfang nicht still und verändere die Product-Map nicht selbst; den Soll-Ist-Abgleich und die Product-Map pflegt Codex.

Die vollständigen Repository-Regeln gelten zusätzlich:

@AGENTS.md
