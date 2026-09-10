---
id: WP-004
title: "Sichere Partnerverbindung mit persönlichem Code"
package_revision: 3
status: approved
created: 2026-09-10
updated: 2026-09-10
owner_approved: yes
executor: claude
product_area: "Alte und neue Luma – Partnerverbindung"
brief_version: 1
technical_brief: complete
migration_approval: approved_2026-09-10
---

# Aufgabe: Sichere Partnerverbindung mit persönlichem Code

## Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Eine Person kann im eigenen Bereich einen kurzen Verbindungscode erzeugen. Der Partner meldet sich mit einem eigenen Konto an und gibt diesen Code ein. Danach sind genau diese beiden Konten verbunden.
- **Warum machen wir das?** Der Partner soll nur die später ausdrücklich freigegebenen Informationen sehen, niemals den privaten Bereich der anderen Person.
- **Woher kam die Idee?** Aus `APP-IDEA-014` und den Entscheidungen DEC-106 bis DEC-114.
- **Wo ist es in der App?** Nach der Auswahl `Alte App` oder `Neue App` folgt die Rollenwahl `Für mich selbst` oder `Für meinen Partner / meine Partnerin`. Den Code gibt es später im privaten Profil oder in den Einstellungen.
- **Was gehört ausdrücklich nicht dazu?** Noch kein Partnerkalender, keine Anzeige von Periodendaten, keine Push-Nachricht, keine medizinische Vorhersage und keine Vermischung von alter und neuer Luma.
- **Was kann die Nutzerin danach ausprobieren?** Sie kann für ihren eigenen Bereich einen Code erzeugen. Der Partner löst ihn nach der eigenen Anmeldung ein und sieht nur die neutrale Meldung `Verbindung aktiv`.

## Entstehungsweg

`Private Zyklusdaten sollen nicht offen geteilt werden → klar begrenzte Verbindung zwischen zwei eigenen Konten → einmaliger, kurzer und sicher gespeicherter Code → WP-004`

- Ausgangsidee oder Problem: Ein früherer Link-Weg war nur eine Grundidee; eine sichere und eindeutige Partnerverbindung fehlte.
- bestätigte Wirkung: Genau ein Partnerkonto erhält nur nach ausdrücklicher Verbindung Zugriff auf einen späteren begrenzten Partnerbereich. Die Person mit den Zyklusdaten kann die Verbindung bewusst beenden.
- gewählte Lösung: Ein weltweit eindeutiger Code gilt zehn Minuten und kann genau einmal eingelöst werden. Eine aktive Verbindung gehört genau einem Paar.
- wichtige Entscheidung(en): DEC-106 bis DEC-114.
- Quellen/Akten: `C:\coden\CODEX\App-Luma-Assistent\control\records\APP-IDEA-014.md`.

## Soll – von Codex

- Nach `Alte App` und nach `Neue App` erscheint dieselbe einfache Rollenwahl: `Für mich selbst` oder `Für meinen Partner / meine Partnerin`.
- Die Rollenwahl ist geschlechtsneutral. Sie entscheidet nur über den folgenden Weg, nicht über persönliche Eigenschaften.
- Der Selbst-Weg führt wie bisher zum jeweiligen privaten Login und Bereich.
- Der Partner-Weg verlangt ein eigenes Konto. Erst danach kann ein Verbindungscode eingegeben werden.
- Eine Person im Selbst-Weg kann im jeweiligen eigenen Profil oder Einstellungsbereich einen Verbindungscode erzeugen und bewusst erneuern.
- Ein Code ist weltweit eindeutig, nur zehn Minuten gültig und nach der ersten erfolgreichen Einlösung dauerhaft ungültig.
- Eine erfolgreiche Einlösung verbindet genau das eigene Partnerkonto mit genau einem privaten Bereich derselben App-Variante.
- Pro privatem Bereich gibt es höchstens eine aktive Partnerverbindung. Eine neue Verbindung ist erst nach einem bewussten Beenden der bestehenden Verbindung möglich.
- Nach einer aktiven Verbindung zeigt der Partner-Weg nur eine neutrale, eingeschränkte Ansicht `Verbindung aktiv`. Sie enthält noch keine Zyklus- oder Kalenderdaten.
- Nach dem Beenden einer Verbindung ist der bisherige Partner sofort nicht mehr berechtigt und sieht keinen Partnerbereich mehr.

### Nicht enthalten

- Partnerkalender und jede Anzeige echter Periodenstarts oder -enden.
- Push-Benachrichtigungen, Geräteberechtigung oder E-Mail-Erinnerungen.
- Vorhersagen, PMS, Eisprung, Zykluslänge, Historie, Profilangaben oder Bearbeitungsrechte für Partner.
- Verbindung zwischen alter und neuer App, Kopieren von Daten oder gemeinsamer Datenbankzugriff.

### Abnahmekriterien

1. Die Rollenwahl ist nach beiden App-Varianten sichtbar und verständlich.
2. Ein Partner kann ohne eigenes Konto und ohne gültigen Code keinen Partnerbereich öffnen.
3. Ein Code funktioniert genau einmal innerhalb von zehn Minuten; abgelaufene, verbrauchte, falsche oder eigene Codes verbinden nichts.
4. Ein Paar bleibt strikt von allen anderen Paaren getrennt.
5. Eine bestehende Verbindung muss bewusst beendet werden, bevor ein neuer Partner verbunden werden kann.
6. Nach dem Beenden verliert das alte Partnerkonto beim nächsten Zugriff sofort den Zugriff.
7. Die Partneransicht zeigt in diesem Paket keine Gesundheits- oder Zyklusdaten.

## Technischer Auftrag für Claude

Dieser Abschnitt beschreibt die benötigten Sicherheitsgrenzen und Startpunkte. Er schreibt keine unnötige interne Umsetzungsschrittfolge vor.

### Bestätigte Ausgangslage im Code

- `src/app/page.tsx` zeigt derzeit die Auswahl `Alte App` (`/login`) und `Neue App` (`/neu`).
- Der neue Weg besitzt eigene E-Mail/Passwort-Authentifizierung unter `src/app/api/neu/auth/` und serverseitige Sitzungen in `src/lib/new-auth.ts`.
- `database/luma-core/migrations/202608261700_new_auth.sql` sowie spätere Migrationen definieren die getrennten neuen Tabellen, insbesondere `new_users` und `new_sessions`.
- `src/components/AppProviders.tsx` trennt `/neu` bereits von den alten Auth-Providern. Alte Luma nutzt ihren bestehenden, getrennten Auth- und Datenweg.
- Für die neue App existiert noch kein eigener Profil-/Einstellungsweg und keine Partnerverbindungslogik. Claude muss für die alte Luma den passenden bestehenden Auth- und Datenstartpunkt vor einer Änderung lesend bestimmen.

### Technisches Ziel

- Ergänze nach der App-Auswahl in beiden Varianten eine klare Rollenroute oder gleichwertige Navigation. Sie darf nicht die bestehende Anmeldung umgehen.
- Baue den sicheren Verbindungskern für alte und neue Luma **getrennt**: Ein Code und eine Verbindung gelten nur für dieselbe App-Variante und deren eigene Datenbasis.
- Codes werden kryptografisch zufällig erzeugt, nur gehasht gespeichert und niemals im Klartext geloggt oder später aus der Datenbank abgelesen.
- Das Erzeugen, Einlösen, Erneuern und Beenden erfolgt ausschließlich serverseitig, sitzungsgebunden, mit Herkunftsprüfung sowie Rate-Limit gegen wiederholtes Raten.
- Das Einlösen muss atomar sein: Ablauf, Einmaligkeit, Eigentümer, App-Variante und bereits vorhandene aktive Verbindungen sind gemeinsam zu prüfen. Zwei parallele Einlösungen dürfen nie denselben Code oder Bereich doppelt verbinden.
- Ein Partner darf den eigenen Code nicht einlösen. Eine aktive Verbindung darf nur die dafür bestimmte eingeschränkte Partnerroute öffnen.
- Die anfängliche Partnerroute ist ein geschützter Platzhalter ohne Gesundheitsdaten. Sie muss bei fehlender, widerrufener oder fremder Verbindung schließen oder zu einem neutralen, nicht verräterischen Hinweis führen.
- Der Code wird im klar bezeichneten eigenen Profil-/Einstellungsbereich gezeigt. Falls ein solcher Weg fehlt, darf Claude eine minimale geschützte Einstellung nur für Code erzeugen; keine allgemeine Profilfunktion erweitern.

### Daten, Schnittstellen und Migrationen

- **Migration nötig:** ja, getrennt für die Datenbasis der neuen und der alten Luma. Der Owner hat diese Migration am 10. September 2026 ausdrücklich freigegeben.
- **Neue Luma (`luma_core`):** Ergänze getrennte, kontogebundene Daten für kurzlebige Code-Ausgaben und aktive Partnerverbindungen. Die Verbindung braucht mindestens Eigentümerkonto, Partnerkonto, App-Variante, aktiven/beendeten Zustand sowie sichere Zeitstempel. Datenbank-Constraints und eindeutige Indizes müssen eine doppelte aktive Zuordnung verhindern.
- **Alte Luma:** Erst den vorhandenen Auth- und Migrationsweg lesend feststellen. Dann ein gleichwertiges, aber von `luma_core` getrenntes Modell ergänzen. Niemals neue Luma-Konten oder Daten in die alte Datenbasis schreiben oder umgekehrt.
- **API-Wirkung:** geschützte Endpunkte für Code erzeugen/erneuern, einlösen, Verbindungsstatus lesen und Verbindung beenden. Keine Perioden-, Zyklus- oder Profil-API darf in diesem Paket für Partner geöffnet werden.

### Invarianten – müssen unverändert bleiben

- Bestehende Nutzerkonten, Sitzungen, Passwörter, Perioden und Zyklusdaten werden nicht umgeschrieben oder kopiert.
- Alte und neue Luma bleiben auth-, routen- und datengetrennt.
- Ohne aktive Verbindung gibt es keinen Partnerzugriff. Eine Verbindung gibt nie Zugang zum privaten Owner-Bereich.
- Ein Partner kann keine Daten bearbeiten und sieht in WP-004 keine Gesundheitsdaten.
- Keine Klartextcodes in Datenbank, Logs, Entwicklungsledger, Tests, Screenshots oder Fehlermeldungen.
- Kein Push und keine Benachrichtigung in diesem Paket.

### Pflichtprüfungen

- Code-Lebenszyklus: erzeugen, innerhalb von zehn Minuten genau einmal einlösen; danach erneuter Versuch ablehnen.
- Abgelaufenen, falschen, fremden und eigenen Code ablehnen, ohne Details über fremde Konten preiszugeben.
- Parallele Einlöseversuche testen: höchstens eine Verbindung entsteht.
- Eindeutigkeit und Kontotrennung für mindestens zwei verschiedene Paare prüfen.
- Bestehende aktive Verbindung blockiert eine zweite Verbindung, bis die Owner-Person sie bewusst beendet.
- Nach dem Beenden blockiert die Partnerroute sofort; ein neuer Code kann erst danach eine neue Verbindung herstellen.
- Rollenwahl, Registrierung/Anmeldung, Partner-Placeholder und Widerruf auf Mobile prüfen; kein horizontaler Überlauf.
- Bestehende alte und neue Auth-Regressionen, TypeScript, gezielte Sicherheitsprüfung, Produktions-Build und Entwicklungsledger-Validierung ausführen.

### Stoppbedingungen

- Stoppe, wenn der alte App-Weg keine sichere, getrennte Speicherung mit eindeutiger Kontozuordnung zulässt. Dokumentiere den Befund, statt Daten zwischen den Wegen zu vermischen.
- Stoppe vor Kalenderfreigabe, Periodendaten, Push, Prognosen, Berechtigungs-Ausweitung oder einer zweiten aktiven Partnerverbindung.
- Stoppe, wenn klare Abmeldung, Widerruf oder atomare Einlösung nicht sicher nachweisbar sind.

### Abschluss durch Claude

- `Ist` vollständig ergänzen und Abweichungen sichtbar nennen.
- Status auf `review` setzen.
- Entwicklungsledger ergänzen.
- `node scripts/work-package-state.mjs mark-updated WP-004` sowie `node scripts/work-package-state.mjs validate` ausführen.
- Nur auftragsbezogene Dateien committen und pushen. Ein Deploy bleibt eine getrennte Freigabe.

## Ist – von Claude

- umgesetzt:
  - **Datenmodell, getrennt pro App-Variante:**
    - `luma_core`: neue Migration `202609101200_partner_connections.sql` – `new_partner_connection_codes` (gehashter Code, `expires_at`, `consumed_at`) und `new_partner_connections` (`owner_user_id`, `partner_user_id`, `status`, partieller eindeutiger Index `WHERE status = 'active'` auf `owner_user_id`, CHECK gegen Selbstverbindung).
    - `app_luma` (Prisma): drei neue Migrationen – `partner_connections` (gleichwertiges Modell inkl. partiellem eindeutigen Index und CHECKs, per Hand in der generierten SQL-Datei ergänzt, da Prisma partielle Indizes/CHECKs nicht deklarativ erzeugt), `partner_rate_limits` (eigenes Rate-Limit-Modell für die alte App, da dort zuvor keines existierte) und `partner_timestamptz` (Korrektur, siehe Abweichungen). Keine Migration verändert bestehende Spalten von `users`, `profiles`, `user_cycles` oder anderen bestehenden Tabellen – ausschließlich neue Tabellen mit lesenden Fremdschlüsseln auf `users(id)`.
  - **Kernlogik:** `src/lib/new-partner.ts` (neue Luma, raw `pg`) und `src/lib/partner-connections.ts` (alte Luma, Prisma) mit identischer Semantik: `createOrRenewPartnerCode`, `redeemPartnerCode` (atomar: `SELECT ... FOR UPDATE` auf den Code, zwei `pg_advisory_xact_lock`-Sperren auf Owner- und Partner-Konto-ID innerhalb derselben Transaktion, danach Prüfung auf Ablauf/Einmaligkeit/Eigenzuordnung/bereits aktive Verbindung auf beiden Seiten, erst dann `consumed_at` setzen und Verbindung anlegen), `getPartnerConnectionStatusForOwner`/`ForPartner`, `endPartnerConnection`. Codes werden mit `crypto.randomBytes` erzeugt (8 Zeichen, Alphabet ohne verwechselbare Zeichen 0/O/1/I/L), nur als SHA-256-Hash gespeichert, nie im Klartext geloggt oder aus der Datenbank zurückgelesen.
  - **Rate-Limiting und Herkunftsprüfung:** neue Luma nutzt das bestehende `new_auth_rate_limits`/`requestHasAllowedOrigin`-Muster. Alte Luma erhält ein gleichwertiges, getrenntes `src/lib/partner-rate-limit.ts` (eigene Tabelle `partner_rate_limits`) und `src/lib/request-origin.ts` (identische Origin-Prüfung, da die alte App zuvor keine hatte). Beide Seiten: 5 Versuche pro 15 Minuten für Code-Erzeugen und Einlösen.
  - **API-Routen, getrennt pro App-Variante:** `POST/GET .../partner/code`, `.../partner/redeem`, `.../partner/status`, `.../partner/end` unter `/api/neu/partner/*` (neue Luma) und `/api/partner-connections/*` (alte Luma), jeweils sitzungsgebunden über die bestehenden, unveränderten Auth-Wege (`getNewAuthSession` bzw. NextAuth `auth()`). Zusätzlich `POST /api/partner-account/register` (alte Luma) für ein bewusst minimales Partnerkonto (nur E-Mail/Passwort, kein Zyklus-Onboarding, kein `Profile`-Datensatz) – Partner erhalten nie das Datenmodell des Owner-Bereichs.
  - **Rollenwahl und Navigation, getrennt pro App-Variante:** `src/app/rolle/page.tsx` und `src/app/neu/rolle/page.tsx` nach der App-Auswahl (`src/app/page.tsx` verlinkt jetzt auf `/rolle` bzw. `/neu/rolle` statt direkt auf `/login`/`/neu`). „Für mich selbst“ führt unverändert zum bestehenden privaten Login/Registrierung. „Für meinen Partner / meine Partnerin“ führt zu eigenen Partner-Registrierungs-/Login-Seiten (`/partner-registrieren`, `/partner-anmelden`, `/neu/partner-registrieren`, `/neu/partner-anmelden`) und danach zum geschützten Partner-Platzhalter (`/partner-bereich`, `/neu/partner`), der ohne aktive Verbindung die Code-Eingabe zeigt und mit aktiver Verbindung ausschließlich die neutrale Meldung „Verbindung aktiv“ – keine Gesundheits- oder Zyklusdaten. `NewLoginForm`/`NewRegisterForm` erhielten eine optionale `redirectTo`-Prop (Default `/neu`, unverändertes Verhalten für alle bestehenden Aufrufer), damit derselbe Formular-Code für den Partner-Weg zu `/neu/partner` statt `/neu` führt.
  - **Code-Anzeige im eigenen Bereich:** neue Luma erhielt eine minimale, geschützte Einstellungsseite `/neu/einstellungen` (existierte zuvor nicht) mit `NewPartnerCodeCard` (Code erzeugen/erneuern, Verbindung beenden), verlinkt von `/neu`. Die alte Luma nutzt den bestehenden `profile`-Bereich: `PartnerConnectionCard` ersetzt dort das alte Widget.
  - **Ersetzung des alten, unsicheren Partner-Systems (nach Owner-Klärung):** die frühere Route `/partner/[code]` (zeigte Zyklusphase, nächste Periode, Zyklustag und Stimmung offen über einen unauthentifizierten, base64-kodierten URL-Parameter, ganz ohne eigenes Partnerkonto oder Ablauf) sowie `/partner` und `src/components/PartnerCard.tsx` wurden vollständig entfernt. `src/lib/actions/partner.ts` (Server-Action für den alten Klartext-`partnerCode`) wurde gelöscht. `Dashboard.tsx` und `profile/page.tsx` nutzen jetzt `PartnerConnectionCard` statt `PartnerCard`. Das alte, ungenutzte `Profile.partnerCode`-Datenbankfeld (weiterhin bei Registrierung/Onboarding befüllt) wurde bewusst nicht entfernt oder migriert, um den bestehenden Registrierungs-/Onboarding-Code nicht über den Auftragsumfang hinaus anzufassen; es ist nach dieser Änderung nirgends mehr exponiert oder lesbar.
- nicht umgesetzt: Partnerkalender, Periodenanzeige für Partner, Push-Benachrichtigungen, Vorhersagen – wie im Soll ausdrücklich nicht enthalten. Keine Verbindung oder Datenvermischung zwischen alter und neuer Luma.
- Tests:
  - Neue `scripts/verify-partner-new.mts` (20 Prüfungen, raw `pg` gegen `luma_core`) und `scripts/verify-partner-old.mts` (20 Prüfungen, Prisma gegen `app_luma`): Code-Lebenszyklus (erzeugen, einmal einlösen, danach ablehnen), abgelaufener/falscher/eigener Code wird abgelehnt, Kontotrennung für zwei unabhängige Paare, bestehende aktive Verbindung blockiert eine zweite bis zum bewussten Beenden, ein Partnerkonto kann nicht zwei Owner gleichzeitig verbunden sein, **echte parallele Einlöseversuche mit zwei unabhängigen Datenbankverbindungen** (nicht nur `Promise.all` auf einer Verbindung) zeigen, dass von zwei gleichzeitigen Versuchen genau einer gelingt, und dass der gespeicherte Code-Hash nie dem Klartext entspricht. Alle 40 Prüfungen bestanden.
  - `node scripts/verify-luma-core.mjs`: Datenbanktrennung weiterhin bestätigt; der Zähler für neue Auth-Tabellen wurde von 6 auf 8 aktualisiert (zwei neue Partner-Tabellen), Zeilenzahlen um die neuen Tabellen erweitert.
  - Zusätzliche end-to-end-Prüfung per `curl` gegen einen lokalen Produktions-Build (`npm run build && next start`) für die neue Luma: Owner registriert sich, erzeugt Code, ein zweites, unabhängiges Konto meldet sich als Partner an, eigener Code wird abgelehnt (400), korrekter Code wird eingelöst (200), Status stimmt auf beiden Seiten überein, `/neu/partner` zeigt „Verbindung aktiv“, `/neu/einstellungen` zeigt die aktive Verbindung, Beenden funktioniert und der Partner verliert sofort beim nächsten Statusabruf den Zugriff. Alte Route `/partner/ANYCODE` liefert 404. `/neu` ohne Session leitet mit 307 zu `/neu/rolle` um.
  - Sicherheitsgrenzen per `curl` geprüft: alle vier Routen beider App-Varianten liefern ohne Session 401; `code`/`end` liefern bei falscher `Origin` 403; nach 5 Einlöseversuchen liefert die Route 429 (Rate-Limit greift).
  - Mobile Sichtprüfung mit temporär installiertem Playwright (Chromium, 375×812, danach vollständig wieder entfernt): `/rolle`, `/partner-registrieren`, `/partner-anmelden`, `/partner-bereich`, `/neu/rolle`, `/neu/partner-registrieren`, `/neu/partner-anmelden`, `/neu/partner` – kein horizontaler Überlauf, keine Konsolen-/Seitenfehler.
  - `npx tsc --noEmit`: keine Fehler. `npm run build` (Next.js 16.2.6, Turbopack): erfolgreich, alle 47 Routen erzeugt (14 neue: Rollenwahl, Partner-Registrierung/-Anmeldung/-Bereich, Einstellungen und die zugehörigen API-Routen beider App-Varianten).
  - Nach jedem Testlauf wurden alle erzeugten Testkonten aus beiden Datenbanken gelöscht; bestehende Datenbestände in `app_luma`/`luma_core` blieben unverändert (Zeilenzahlen bestehender Tabellen vor/nach der Arbeit identisch).
- Abweichungen:
  - **Owner-Rückfrage zum bestehenden, unsicheren Partner-System:** Vor der Umsetzung wurde ein Zielkonflikt festgestellt (siehe Stoppbedingung im Auftrag: „wenn der alte App-Weg keine sichere, getrennte Speicherung mit eindeutiger Kontozuordnung zulässt“) und dem Owner zur Klärung vorgelegt, statt eigenmächtig zu entscheiden. Entscheidung: das alte System wird vollständig ersetzt, nicht parallel weitergeführt. So umgesetzt.
  - **Gefundener und behobener Fehler – Zeitzonen-Diskrepanz bei `@prisma/adapter-pg`:** Die lokale Postgres-Session-Zeitzone ist `Europe/Berlin`. Bei Verwendung von SQL `NOW()` innerhalb einer Prisma-`$transaction`/`$queryRaw`-Kombination über `@prisma/adapter-pg` wich der zurückgegebene Zeitwert um exakt den Sommerzeit-Offset (2 Stunden) vom tatsächlichen UTC-Zeitpunkt ab, wodurch jeder frisch erzeugte, gültige Code fälschlich als bereits abgelaufen galt (`expires_at > NOW()` schlug immer fehl). Reproduziert und isoliert: derselbe Vergleich über den rohen `pg`-Treiber (ohne Prisma-Adapter, für die neue Luma verwendet) war korrekt; nur die Prisma-Adapter-Kombination zeigte den Fehler. Behoben, indem `redeemPartnerConnectionCode` (alte Luma) den Vergleichszeitpunkt als clientseitig erzeugtes `new Date()` statt als SQL `NOW()` an die Query übergibt – das umgeht die Diskrepanz robust, unabhängig von der Postgres-Session-Zeitzone. Die neue Luma (`src/lib/new-partner.ts`) verwendet weiterhin `NOW()`, da dort der rohe `pg`-Treiber nachweislich korrekt arbeitet (durch `verify-partner-new.mts` bestätigt). Zusätzlich wurden die entsprechenden Prisma-Spalten nachträglich von `TIMESTAMP(3)` (ohne Zeitzone, Prisma-Default) auf `TIMESTAMPTZ` umgestellt (Migration `partner_timestamptz`), da der ursprüngliche Typ das Risiko weiterer stiller Zeitzonenfehler erhöht hätte, auch wenn er allein die beobachtete Diskrepanz nicht verursachte.
  - Keine weitere fachliche Abweichung vom Soll.
- offene Punkte:
  - Owner-Prüfschritt für WP-004 steht aus (Rollenwahl nach beiden App-Varianten, Partner-Registrierung/-Anmeldung, Code erzeugen im jeweiligen Profil-/Einstellungsbereich, Code durch ein zweites, unabhängiges Konto einlösen, „Verbindung aktiv“ sehen, Verbindung bewusst beenden, danach sofortigen Zugriffsverlust prüfen; mobile Sichtprüfung).
  - Der bereits aus WP-003 bekannte, unabhängige Testdefekt in `tests/calendar-day-info.test.ts` (fehlende Funktion `applyPeriodDayAction`) besteht unverändert fort und war für dieses Paket nicht im Umfang.
  - Kein Deploy ohne gesonderte Owner-Freigabe – wie beauftragt nicht ausgelöst.
- Commit: folgt unmittelbar nach diesem Eintrag.

## Soll-Ist-Prüfung – von Codex

- Ergebnis: WP-004 ist freigegeben. Die notwendige getrennte Datenbankmigration für alte und neue Luma wurde vom Owner ausdrücklich erlaubt.
- Nachschärfung: keine offene Produktfrage für den Verbindungskern. Partnerkalender und Push sind ausdrücklich spätere, getrennte Arbeitspakete.
- Product-Map aktualisiert: ja.

## Version 3 – Partnerkalender der neuen Luma

### Owner-Ansicht – einfach erklärt

- **Kurz gesagt:** Nach der Verbindung sieht der Partner in der **Neuen App** einen einfachen Monatskalender.
- **Was sieht der Partner?** Tatsächlich bestätigte Periodentage und, bei einer noch laufenden Periode, klar markierte erwartete Tage bis zum erwarteten Ende.
- **Beispiel:** Beginnt die Periode am 7. September und heute ist der 10. September, sind der 7. bis 10. September als `Bestätigt` sichtbar. Ist der 13. September als erwartetes Ende gespeichert, sind der 11. bis 13. September zusätzlich als `Erwartet – kann abweichen` sichtbar.
- **Was sieht der Partner nicht?** Keine PMS- oder Eisprungphase, keine Zykluslänge, keine Vorhersagen für eine neue Periode, keine Historienliste, keine Profilangaben und keine Bearbeitungsfunktionen.
- **Wer behält die Kontrolle?** Nur die Eigentümerin trägt Perioden ein, ändert oder löscht sie und kann die Verbindung beenden.

### Entstehungsweg

`Verbindung ist aktiv, aber der Partner sieht noch keinen Nutzen → sichere und sehr begrenzte Orientierung nötig → nur lesender Kalender mit klarer Trennung zwischen Tatsache und Erwartung → WP-004 Version 3`

- bestätigtes Problem: Die sichere Partnerverbindung funktioniert, zeigt im Moment aber nur `Verbindung aktiv`.
- gewünschte Wirkung: Der Partner erkennt auf einen Blick, welche Tage einer laufenden oder vergangenen Periode tatsächlich bestätigt und welche Tage nur erwartet sind.
- gewählte Lösung: Ein geschützter, nur lesender Monatskalender ausschließlich im neuen Partnerbereich.
- bestätigte Grenzen: Keine weiteren Zyklus- oder Gesundheitsinformationen; keine Eingabe; die alte Luma bleibt in dieser Version unverändert.
- Quellen/Akten: `APP-IDEA-014`, Owner-Beschreibung vom 10. September 2026.

### Soll – von Codex

- `/neu/partner` ersetzt bei aktiver neuer Partnerverbindung den Platzhalter durch einen Monatskalender.
- Der Kalender enthält nur Daten der Eigentümerin, die genau mit diesem aktiven Partnerkonto verbunden ist.
- Tatsächlich bestätigte Periodentage werden aus echten `startDate`/`endDate`-Werten abgeleitet. Bei einer laufenden Periode gelten die Tage vom tatsächlichen Start bis einschließlich heute als `Bestätigt`.
- Erwartete Tage sind nur bei einer laufenden Periode mit `expectedEndDate` sichtbar: ab morgen bis einschließlich erwartetes Ende. Sie tragen sichtbar `Erwartet` und `Kann abweichen`.
- Erwartete Tage werden nie als bestätigt dargestellt und beeinflussen keine Berechnung, Historie oder Datenbank.
- Der Partner kann Monat wechseln und Tagesinformationen nur lesen. Ein Tagesfenster darf nur Datum und Status `Bestätigt`, `Erwartet – kann abweichen` oder `Keine freigegebene Information` zeigen.
- Ohne aktive Verbindung, nach Widerruf oder bei einem fremden Konto werden keinerlei Periodendaten geliefert oder angezeigt.

### Nicht enthalten

- Partnerkalender in der alten Luma.
- Push-Nachrichten, E-Mails, Geräteberechtigungen, PMS, Eisprung, Zykluslänge, Vorhersage einer neuen Periode, Stimmungen, Profilangaben oder Periodenhistorie.
- Jede Eingabe, Änderung oder Löschung durch den Partner.
- Datenbankmigration oder Änderung von Periodendaten.

### Abnahmekriterien

1. Ein aktiv verbundener Partner der neuen Luma sieht einen einfachen Monatskalender.
2. Eine laufende Periode ab 7. September zeigt am 10. September den 7. bis 10. September als bestätigt.
3. Ein erwartetes Ende am 13. September zeigt nur den 11. bis 13. September als erwartet und abweichbar.
4. Eine abgeschlossene Periode zeigt nur echte, bestätigte Tage und keine erwarteten Tage.
5. Der Partner kann keine Periodendaten speichern, ändern oder löschen.
6. Ein anderer Partner, ein nicht verbundenes Konto und ein Partner nach Widerruf erhalten keine Daten – auch nicht direkt über eine API-Anfrage.
7. Mobile Ansicht bleibt ohne horizontalen Überlauf verständlich und bedienbar.

### Technischer Auftrag für Claude – Version 3

#### Bestätigte Ausgangslage im Code

- `src/app/neu/partner` ist der geschützte neue Partnerbereich aus WP-004 und zeigt mit aktiver Verbindung bisher nur den Platzhalter `Verbindung aktiv`.
- `src/lib/new-partner.ts` und die bestehenden `/api/neu/partner/*`-Routen prüfen die neue Sitzung sowie die aktive Verbindung.
- `src/lib/new-periods.ts` und die für `/neu` bereits geladenen `new_period_entries` enthalten nur kontogebundene echte `startDate`, optionales echtes `endDate` und optionales `expectedEndDate`.
- Die Home-Ansicht der neuen Luma besitzt bereits Monats- und Tagesdarstellung. Claude darf passende, reine Anzeige-/Datumslogik wiederverwenden, aber keine Owner-Interaktion oder Vorhersagelogik an den Partner weitergeben.

#### Technisches Ziel

- Ergänze eine serverseitig geschützte, ausschließlich lesende Datenquelle für den neuen Partnerbereich. Sie prüft vor jeder Antwort: neue Sitzung, aktiver Verbindungsstatus, zugehörige Eigentümerin und genau diese App-Variante.
- Gib ausschließlich die minimalen Kalenderdaten zurück, die für bestätigte Tage und erwartete Tage der aktuell verbundenen Eigentümerin erforderlich sind. Keine E-Mail-Adresse, keine Namen, keine IDs, keine vollständige Historie und keine Profil-/Zykluswerte.
- Leite den sichtbaren Tagesstatus ohne Speichern ab: echte abgeschlossene Tage und echte Tage einer laufenden Periode bis heute sind bestätigt; nur die noch kommenden Tage bis `expectedEndDate` sind erwartet.
- Baue eine klare, mobile lesbare Kalenderansicht. Farben oder Symbole müssen zusätzlich mit Text/Legende unterscheidbar sein.
- Tagesdialoge bleiben nur lesend. Sie dürfen keine Aktionen zum Periodenbeginn/-ende, Bearbeiten, Löschen oder Speichern enthalten.
- Die alte Partneransicht und die bestehende Verbindungskernlogik werden nicht umgebaut.

#### Invarianten – müssen unverändert bleiben

- Ohne aktive neue Partnerverbindung keine Antwort mit Periodendaten; nach Widerruf muss der Zugriff sofort scheitern.
- Partnerzugriff ist strikt lesend und nur für die verbundene Eigentümerin gültig.
- Erwartete Enddaten bleiben sichtbar vorläufig und werden nie zu echten Periodendaten oder Vorhersageeingaben.
- Bestehende Owner-Kalender-, Profil-, Verbindungs-, Authentifizierungs- und Datenbanklogik bleiben unverändert.
- Keine Datenbankmigration, keine Datenkopie zwischen alter/neuer Luma und keine Änderung an alten Partnerwegen.

#### Daten, Schnittstellen und Migrationen

- Datenbankwirkung: keine neue Tabelle und keine Änderung gespeicherter Daten.
- API-Wirkung: nur eine neue oder erweiterte **lesende** neue Partnerroute, falls die vorhandene Statusroute nicht minimal genug ist.
- Migration nötig: nein.

#### Pflichtprüfungen

- Laufende Periode: bestätigte Tage bis heute und erwartete Tage erst ab morgen korrekt getrennt.
- Abgeschlossene Periode: nur echte bestätigte Tage.
- Kein `expectedEndDate`: keine erfundenen erwarteten Tage.
- Kein Zugriff ohne Sitzung, ohne aktive Verbindung, nach Widerruf oder mit einem Partnerkonto eines anderen Paares.
- API-Antwort enthält keine Namen, E-Mail-Adressen, IDs, PMS-, Eisprung-, Profil-, Historien- oder Bearbeitungsdaten.
- Partner-UI bietet keine schreibende Aktion; Tagesinformationen sind lesend.
- Mobile Sichtprüfung, TypeScript, gezielte Sicherheits-/Integrationstests, Produktions-Build und Entwicklungsledger-Validierung.

#### Stoppbedingungen

- Stoppe vor einer Migration, einer neuen Freigabemöglichkeit, Push-Nachricht, Profilweitergabe, Vorhersage oder jeder schreibenden Partneraktion.
- Stoppe, wenn die bestehende Verbindungsprüfung nicht pro Datenabruf sicher nachweisbar ist. Keine Daten auf den Client laden und dort erst filtern.
- Stoppe, wenn erwartete und bestätigte Tage nicht sicher unterscheidbar abgeleitet werden können.

#### Abschluss durch Claude

- Ergänze `Ist Version 3`, Abweichungen und Tests sichtbar.
- Setze den Paketstatus auf `review`.
- Ergänze das Entwicklungsledger, führe `node scripts/work-package-state.mjs mark-updated WP-004` und danach `node scripts/work-package-state.mjs validate` aus.
- Committe und pushe nur auftragsbezogene Dateien. Kein Deploy ohne weitere Owner-Freigabe.

### Ist Version 3 – von Claude

- umgesetzt: noch nicht gestartet.
- nicht umgesetzt: gesamter Umfang dieser Version.
- Tests: noch keine.
- Abweichungen: keine.
- offene Punkte: keine vor der Umsetzung.
- Commit: keiner.
