import { config } from "dotenv";
config({ path: ".env.local" });

import { randomUUID, createHash } from "node:crypto";
import pg from "pg";

const { Client } = pg;

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${pass ? "OK  " : "FAIL"} ${label}${pass ? "" : ` — erwartet ${JSON.stringify(expected)}, erhalten ${JSON.stringify(actual)}`}`);
  if (!pass) failures += 1;
}

const connectionString = process.env.LUMA_CORE_DATABASE_URL;
if (!connectionString) throw new Error("LUMA_CORE_DATABASE_URL fehlt.");

const client = new Client({ connectionString });
await client.connect();

// Spiegelt src/lib/new-partner-calendar.ts wider (server-only, nicht direkt
// per Node importierbar) gegen die echte Datenbank, um denselben
// serverseitigen Vertrag zu prüfen: keine Daten ohne aktive Verbindung,
// korrekte Trennung bestätigt/erwartet.

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day));
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function datesBetweenInclusive(start: string, end: string): string[] {
  const dates: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return dates;
}

interface PeriodEntry {
  startDate: string;
  endDate: string | null;
  expectedEndDate: string | null;
}

interface CalendarView {
  confirmedDates: string[];
}

async function resolveActiveOwnerUserId(partnerUserId: string): Promise<{ ownerUserId: string; calendarShared: boolean } | null> {
  const result = await client.query<{ owner_user_id: string; calendar_shared: boolean }>(
    `SELECT owner_user_id, calendar_shared FROM new_partner_connections WHERE partner_user_id = $1 AND status = 'active' LIMIT 1`,
    [partnerUserId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return { ownerUserId: row.owner_user_id, calendarShared: row.calendar_shared };
}

async function getEntries(userId: string): Promise<PeriodEntry[]> {
  const result = await client.query<{ start_date: string; end_date: string | null; expected_end_date: string | null }>(
    `SELECT start_date::text, end_date::text, expected_end_date::text FROM new_period_entries WHERE user_id = $1`,
    [userId],
  );
  return result.rows.map((row) => ({ startDate: row.start_date, endDate: row.end_date, expectedEndDate: row.expected_end_date }));
}

// WP-004 Version 9: ohne aktive calendar_shared-Freigabe liefert der View
// keine Kalenderdaten, unabhängig von der Verbindung. Der Grundkalender
// zeigt nur echte bestätigte Tage; expectedEndDate fließt nicht mehr ein.
async function getPartnerCalendarView(partnerUserId: string, today: string): Promise<CalendarView | null> {
  const connection = await resolveActiveOwnerUserId(partnerUserId);
  if (!connection || !connection.calendarShared) return null;

  const entries = await getEntries(connection.ownerUserId);
  const confirmedDates = new Set<string>();

  for (const entry of entries) {
    if (entry.endDate !== null) {
      for (const date of datesBetweenInclusive(entry.startDate, entry.endDate)) confirmedDates.add(date);
      continue;
    }
    if (entry.startDate <= today) {
      for (const date of datesBetweenInclusive(entry.startDate, today)) confirmedDates.add(date);
    }
  }

  return { confirmedDates: [...confirmedDates].sort() };
}

async function setCalendarShared(ownerUserId: string, shared: boolean): Promise<void> {
  await client.query(`UPDATE new_partner_connections SET calendar_shared = $1 WHERE owner_user_id = $2 AND status = 'active'`, [shared, ownerUserId]);
}

async function createUser(email: string): Promise<string> {
  const id = randomUUID();
  await client.query("INSERT INTO new_users (id, email, password_hash) VALUES ($1, $2, $3)", [
    id,
    email,
    "$2b$12$oL3kVA9RxRzWJjGvMT1l6.8C2yTQGxIOt9kH/Pcp5VBSHujXyCXSe",
  ]);
  return id;
}

async function createEntry(userId: string, startDate: string, endDate: string | null, expectedEndDate: string | null = null): Promise<void> {
  await client.query(
    "INSERT INTO new_period_entries (id, user_id, start_date, end_date, expected_end_date) VALUES ($1, $2, $3, $4, $5)",
    [randomUUID(), userId, startDate, endDate, expectedEndDate],
  );
}

async function connect(ownerUserId: string, partnerUserId: string): Promise<void> {
  const code = "TESTCODE" + Math.random().toString(36).slice(2, 6);
  await client.query(
    "INSERT INTO new_partner_connection_codes (id, owner_user_id, code_hash, expires_at) VALUES ($1, $2, $3, NOW() + interval '10 minutes')",
    [randomUUID(), ownerUserId, sha256(code)],
  );
  await client.query(
    "INSERT INTO new_partner_connections (id, owner_user_id, partner_user_id, status) VALUES ($1, $2, $3, 'active')",
    [randomUUID(), ownerUserId, partnerUserId],
  );
}

async function endConnection(ownerUserId: string): Promise<void> {
  await client.query(`UPDATE new_partner_connections SET status = 'ended', ended_at = NOW() WHERE owner_user_id = $1`, [ownerUserId]);
}

async function deleteUser(id: string): Promise<void> {
  await client.query("DELETE FROM new_users WHERE id = $1", [id]);
}

const suffix = Date.now();
const owner = await createUser(`wp004-v9-owner-${suffix}@example.com`);
const partner = await createUser(`wp004-v9-partner-${suffix}@example.com`);
const otherOwner = await createUser(`wp004-v9-owner2-${suffix}@example.com`);
const unconnectedPartner = await createUser(`wp004-v9-unconnected-${suffix}@example.com`);

const today = "2026-09-10";

try {
  console.log("\n== Kein Zugriff ohne aktive Verbindung ==");
  {
    const view = await getPartnerCalendarView(unconnectedPartner, today);
    assertEqual(view, null, "ein nicht verbundenes Konto erhält keine Kalenderdaten");
  }

  console.log("\n== WP-004 V9: Standard ist aus – aktive Verbindung ohne Freigabe liefert keine Kalenderdaten ==");
  {
    await createEntry(owner, "2026-08-01", "2026-08-05");
    await connect(owner, partner);
    const view = await getPartnerCalendarView(partner, today);
    assertEqual(view, null, "eine neue Verbindung hat calendar_shared standardmäßig aus, keine Kalenderdaten sichtbar");
    await endConnection(owner);
    await client.query("DELETE FROM new_period_entries WHERE user_id = $1", [owner]);
  }

  console.log("\n== WP-004 V9: nach bewusster Freigabe sieht der Partner nur echte bestätigte Tage ==");
  {
    await createEntry(owner, "2026-09-07", null, "2026-09-13");
    await connect(owner, partner);
    await setCalendarShared(owner, true);
    const view = await getPartnerCalendarView(partner, today);
    assertEqual(view?.confirmedDates, ["2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10"], "bestätigte Tage reichen vom echten Start bis einschließlich heute");
    assert(!view?.confirmedDates.includes("2026-09-11"), "der morgige, nur erwartete Tag zählt nicht als bestätigt");
    assertEqual(Object.keys(view ?? {}), ["confirmedDates"], "der Grundkalender liefert ausschließlich bestätigte Tage, kein expectedDates-Feld mehr (WP-004 V9)");
    await endConnection(owner);
    await client.query("DELETE FROM new_period_entries WHERE user_id = $1", [owner]);
  }

  console.log("\n== Abgeschlossene Periode: nur echte bestätigte Tage ==");
  {
    await createEntry(owner, "2026-08-01", "2026-08-05");
    await connect(owner, partner);
    await setCalendarShared(owner, true);
    const view = await getPartnerCalendarView(partner, today);
    assertEqual(view?.confirmedDates, ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04", "2026-08-05"], "abgeschlossene Periode zeigt genau die echten Tage als bestätigt");
    await endConnection(owner);
    await client.query("DELETE FROM new_period_entries WHERE user_id = $1", [owner]);
  }

  console.log("\n== Laufende Periode ohne expectedEndDate: keine erfundenen Tage ==");
  {
    await createEntry(owner, "2026-09-09", null, null);
    await connect(owner, partner);
    await setCalendarShared(owner, true);
    const view = await getPartnerCalendarView(partner, today);
    assertEqual(view?.confirmedDates, ["2026-09-09", "2026-09-10"], "laufende Periode ohne expectedEndDate zeigt bestätigte Tage bis heute");
    await endConnection(owner);
    await client.query("DELETE FROM new_period_entries WHERE user_id = $1", [owner]);
  }

  console.log("\n== WP-004 V9: Ausschalten der Kalenderfreigabe sperrt sofort ==");
  {
    await createEntry(owner, "2026-08-01", "2026-08-05");
    await connect(owner, partner);
    await setCalendarShared(owner, true);
    const before = await getPartnerCalendarView(partner, today);
    assert(before !== null, "bei aktiver Freigabe sind Daten sichtbar");
    await setCalendarShared(owner, false);
    const after = await getPartnerCalendarView(partner, today);
    assertEqual(after, null, "nach dem Ausschalten sind sofort keine Kalenderdaten mehr sichtbar");
    await endConnection(owner);
    await client.query("DELETE FROM new_period_entries WHERE user_id = $1", [owner]);
  }

  console.log("\n== Nach Widerruf: sofort keine Daten mehr ==");
  {
    await createEntry(owner, "2026-08-01", "2026-08-05");
    await connect(owner, partner);
    await setCalendarShared(owner, true);
    const before = await getPartnerCalendarView(partner, today);
    assert(before !== null, "vor dem Widerruf sind Daten sichtbar");
    await endConnection(owner);
    const after = await getPartnerCalendarView(partner, today);
    assertEqual(after, null, "nach dem Widerruf sind sofort keine Daten mehr sichtbar");
    await client.query("DELETE FROM new_period_entries WHERE user_id = $1", [owner]);
  }

  console.log("\n== WP-004 V9: Kalenderfreigabe und Kreisfreigabe sind unabhängig (alle vier Kombinationen) ==");
  {
    await createEntry(owner, "2026-08-01", "2026-08-05");
    await connect(owner, partner);

    await client.query(`UPDATE new_partner_connections SET calendar_shared = FALSE, cycle_ring_shared = FALSE WHERE owner_user_id = $1`, [owner]);
    assertEqual(await getPartnerCalendarView(partner, today), null, "Kalender aus, Kreis aus -> keine Kalenderdaten");

    await client.query(`UPDATE new_partner_connections SET calendar_shared = FALSE, cycle_ring_shared = TRUE WHERE owner_user_id = $1`, [owner]);
    assertEqual(await getPartnerCalendarView(partner, today), null, "Kalender aus, Kreis an -> Kreisfreigabe schaltet den Kalender nicht automatisch mit ein");

    await client.query(`UPDATE new_partner_connections SET calendar_shared = TRUE, cycle_ring_shared = FALSE WHERE owner_user_id = $1`, [owner]);
    const calendarOnly = await getPartnerCalendarView(partner, today);
    assert(calendarOnly !== null, "Kalender an, Kreis aus -> Kalenderdaten sichtbar, obwohl die Kreisfreigabe getrennt aus ist");

    await client.query(`UPDATE new_partner_connections SET calendar_shared = TRUE, cycle_ring_shared = TRUE WHERE owner_user_id = $1`, [owner]);
    const both = await getPartnerCalendarView(partner, today);
    assert(both !== null, "Kalender an, Kreis an -> Kalenderdaten weiterhin sichtbar");

    await endConnection(owner);
    await client.query("DELETE FROM new_period_entries WHERE user_id = $1", [owner]);
  }

  console.log("\n== Kontotrennung: ein fremdes Partnerkonto eines anderen Paares erhält keine Daten ==");
  {
    await createEntry(owner, "2026-08-01", "2026-08-05");
    await connect(owner, partner);
    await setCalendarShared(owner, true);
    await createEntry(otherOwner, "2026-07-01", "2026-07-05");
    // otherOwner hat keine Verbindung zu partner -> partner darf nur die eigenen (owner) Daten sehen
    const view = await getPartnerCalendarView(partner, today);
    assert(!view?.confirmedDates.includes("2026-07-01"), "Daten eines fremden, nicht verbundenen Owners erscheinen nicht");
    assert(view?.confirmedDates.includes("2026-08-01") ?? false, "die eigenen verbundenen Owner-Daten erscheinen weiterhin korrekt");
    await endConnection(owner);
    await client.query("DELETE FROM new_period_entries WHERE user_id IN ($1, $2)", [owner, otherOwner]);
  }
} finally {
  await deleteUser(owner);
  await deleteUser(partner);
  await deleteUser(otherOwner);
  await deleteUser(unconnectedPartner);
  await client.end();
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
