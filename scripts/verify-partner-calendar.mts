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
  expectedDates: string[];
}

async function resolveActiveOwnerUserId(partnerUserId: string): Promise<string | null> {
  const result = await client.query<{ owner_user_id: string }>(
    `SELECT owner_user_id FROM new_partner_connections WHERE partner_user_id = $1 AND status = 'active' LIMIT 1`,
    [partnerUserId],
  );
  return result.rows[0]?.owner_user_id ?? null;
}

async function getEntries(userId: string): Promise<PeriodEntry[]> {
  const result = await client.query<{ start_date: string; end_date: string | null; expected_end_date: string | null }>(
    `SELECT start_date::text, end_date::text, expected_end_date::text FROM new_period_entries WHERE user_id = $1`,
    [userId],
  );
  return result.rows.map((row) => ({ startDate: row.start_date, endDate: row.end_date, expectedEndDate: row.expected_end_date }));
}

async function getPartnerCalendarView(partnerUserId: string, today: string): Promise<CalendarView | null> {
  const ownerUserId = await resolveActiveOwnerUserId(partnerUserId);
  if (!ownerUserId) return null;

  const entries = await getEntries(ownerUserId);
  const confirmedDates = new Set<string>();
  const expectedDates = new Set<string>();

  for (const entry of entries) {
    if (entry.endDate !== null) {
      for (const date of datesBetweenInclusive(entry.startDate, entry.endDate)) confirmedDates.add(date);
      continue;
    }
    if (entry.startDate <= today) {
      for (const date of datesBetweenInclusive(entry.startDate, today)) confirmedDates.add(date);
    }
    if (entry.expectedEndDate !== null) {
      const expectedStart = addDays(today, 1);
      if (expectedStart <= entry.expectedEndDate) {
        for (const date of datesBetweenInclusive(expectedStart, entry.expectedEndDate)) expectedDates.add(date);
      }
    }
  }

  return { confirmedDates: [...confirmedDates].sort(), expectedDates: [...expectedDates].sort() };
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
const owner = await createUser(`wp004-v3-owner-${suffix}@example.com`);
const partner = await createUser(`wp004-v3-partner-${suffix}@example.com`);
const otherOwner = await createUser(`wp004-v3-owner2-${suffix}@example.com`);
const unconnectedPartner = await createUser(`wp004-v3-unconnected-${suffix}@example.com`);

const today = "2026-09-10";

try {
  console.log("\n== Kein Zugriff ohne aktive Verbindung ==");
  {
    const view = await getPartnerCalendarView(unconnectedPartner, today);
    assertEqual(view, null, "ein nicht verbundenes Konto erhält keine Kalenderdaten");
  }

  console.log("\n== Laufende Periode: bestätigt bis heute, erwartet erst ab morgen ==");
  {
    await createEntry(owner, "2026-09-07", null, "2026-09-13");
    await connect(owner, partner);
    const view = await getPartnerCalendarView(partner, today);
    assertEqual(view?.confirmedDates, ["2026-09-07", "2026-09-08", "2026-09-09", "2026-09-10"], "bestätigte Tage reichen vom echten Start bis einschließlich heute");
    assertEqual(view?.expectedDates, ["2026-09-11", "2026-09-12", "2026-09-13"], "erwartete Tage beginnen erst morgen und reichen bis zum erwarteten Ende");
    assert(!view?.confirmedDates.includes("2026-09-11"), "der morgige Tag zählt nicht als bestätigt");
    assert(!view?.expectedDates.includes("2026-09-10"), "der heutige Tag zählt nicht als erwartet");
    await endConnection(owner);
    await client.query("DELETE FROM new_period_entries WHERE user_id = $1", [owner]);
  }

  console.log("\n== Abgeschlossene Periode: nur echte bestätigte Tage, keine erwarteten ==");
  {
    await createEntry(owner, "2026-08-01", "2026-08-05");
    await connect(owner, partner);
    const view = await getPartnerCalendarView(partner, today);
    assertEqual(view?.confirmedDates, ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04", "2026-08-05"], "abgeschlossene Periode zeigt genau die echten Tage als bestätigt");
    assertEqual(view?.expectedDates, [], "eine abgeschlossene Periode hat keine erwarteten Tage");
    await endConnection(owner);
    await client.query("DELETE FROM new_period_entries WHERE user_id = $1", [owner]);
  }

  console.log("\n== Laufende Periode ohne expectedEndDate: keine erfundenen erwarteten Tage ==");
  {
    await createEntry(owner, "2026-09-09", null, null);
    await connect(owner, partner);
    const view = await getPartnerCalendarView(partner, today);
    assertEqual(view?.confirmedDates, ["2026-09-09", "2026-09-10"], "laufende Periode ohne expectedEndDate zeigt bestätigte Tage bis heute");
    assertEqual(view?.expectedDates, [], "ohne expectedEndDate gibt es keine erwarteten Tage");
    await endConnection(owner);
    await client.query("DELETE FROM new_period_entries WHERE user_id = $1", [owner]);
  }

  console.log("\n== Nach Widerruf: sofort keine Daten mehr ==");
  {
    await createEntry(owner, "2026-08-01", "2026-08-05");
    await connect(owner, partner);
    const before = await getPartnerCalendarView(partner, today);
    assert(before !== null, "vor dem Widerruf sind Daten sichtbar");
    await endConnection(owner);
    const after = await getPartnerCalendarView(partner, today);
    assertEqual(after, null, "nach dem Widerruf sind sofort keine Daten mehr sichtbar");
    await client.query("DELETE FROM new_period_entries WHERE user_id = $1", [owner]);
  }

  console.log("\n== Kontotrennung: ein fremdes Partnerkonto eines anderen Paares erhält keine Daten ==");
  {
    await createEntry(owner, "2026-08-01", "2026-08-05");
    await connect(owner, partner);
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
