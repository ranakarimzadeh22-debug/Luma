# Luma-Core-Datenbank

Die neue Registrierung und Anmeldung verwendet ausschließlich die getrennte PostgreSQL-Datenbank `luma_core`.

## Lokale Verbindung

Die App erwartet eine eigene, nicht in Git gespeicherte Umgebungsvariable:

```text
LUMA_CORE_DATABASE_URL=postgresql://BENUTZER:PASSWORT@HOST:PORT/luma_core
```

Die Anwendung startet keine neue Auth-Abfrage, wenn diese Variable fehlt oder auf eine andere Datenbank zeigt. Die bestehende Variable `DATABASE_URL` bleibt unverändert für die alte Luma.

## Migration und Prüfung

```text
node scripts/apply-luma-core-migrations.mjs
node scripts/verify-luma-core.mjs
```

Beide Befehle benötigen `LUMA_CORE_DATABASE_URL`. Die Prüfung benötigt zusätzlich die alte `DATABASE_URL`, vergleicht aber nur Datenbanknamen und Tabellennamen und gibt keine Zugangsdaten aus.
