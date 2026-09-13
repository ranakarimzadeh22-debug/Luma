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

// Spiegelt src/lib/new-partner-calendar.ts (getPartnerCalendarView, der
// estimatedNextPeriodDates-Teil) gegen die echte Datenbank, da das Modul
// "server-only" importiert und daher nicht direkt per tsx ausführbar ist.

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

interface PeriodEntry {
  startDate: string;
  endDate: string | null;
  expectedEndDate: string | null;
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

async function insertPeriod(userId: string, entry: PeriodEntry): Promise<void> {
  await client.query(
    "INSERT INTO new_period_entries (id, user_id, start_date, end_date, expected_end_date) VALUES ($1, $2, $3, $4, $5)",
    [randomUUID(), userId, entry.startDate, entry.endDate, entry.expectedEndDate],
  );
}

async function setCycleRingShared(ownerUserId: string, shared: boolean): Promise<void> {
  await client.query(
    "UPDATE new_partner_connections SET cycle_ring_shared = $1 WHERE owner_user_id = $2 AND status = 'active'",
    [shared, ownerUserId],
  );
}

async function endConnection(ownerUserId: string): Promise<void> {
  await client.query(
    "UPDATE new_partner_connections SET status = 'ended', ended_at = NOW() WHERE owner_user_id = $1 AND status = 'active'",
    [ownerUserId],
  );
}

function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const result = new Date(Date.UTC(y, m - 1, d));
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// Minimal reimplementation of predictCycle's "history" branch (>=2 periods),
// sufficient to compute the expected nextPeriodStart/nextPeriodEnd the same
// way src/lib/new-cycle-prediction.ts does.
function predictNextPeriod(periods: PeriodEntry[], today: string): { start: string; end: string } | null {
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const completed = sorted.filter((e): e is PeriodEntry & { endDate: string } => e.endDate !== null);
  if (sorted.length < 2 || completed.length === 0) return null;

  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetween(sorted[i - 1].startDate, sorted[i].startDate);
    if (gap >= 21 && gap <= 45) gaps.push(gap);
  }
  if (gaps.length === 0) return null;

  const cycleLengthDays = Math.round(median(gaps));
  const periodLengthDays = Math.round(median(completed.map((e) => daysBetween(e.startDate, e.endDate) + 1)));
  let nextStart = sorted[sorted.length - 1].startDate;
  while (nextStart <= today) nextStart = addDays(nextStart, cycleLengthDays);
  return { start: nextStart, end: addDays(nextStart, periodLengthDays - 1) };
}

async function getPartnerEstimatedDates(partnerUserId: string, today: string): Promise<string[] | null> {
  const conn = await client.query<{ owner_user_id: string; cycle_ring_shared: boolean }>(
    "SELECT owner_user_id, cycle_ring_shared FROM new_partner_connections WHERE partner_user_id = $1 AND status = 'active' LIMIT 1",
    [partnerUserId],
  );
  const row = conn.rows[0];
  if (!row) return null;
  if (!row.cycle_ring_shared) return [];

  const periodsResult = await client.query<{ start_date: string; end_date: string | null; expected_end_date: string | null }>(
    "SELECT start_date::text, end_date::text, expected_end_date::text FROM new_period_entries WHERE user_id = $1 ORDER BY start_date DESC",
    [row.owner_user_id],
  );
  const periods = periodsResult.rows.map((r) => ({ startDate: r.start_date, endDate: r.end_date, expectedEndDate: r.expected_end_date }));
  const prediction = predictNextPeriod(periods, today);
  if (!prediction) return [];

  const dates: string[] = [];
  let cursor = prediction.start;
  while (cursor <= prediction.end) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return dates;
}

async function deleteUser(id: string): Promise<void> {
  await client.query("DELETE FROM new_users WHERE id = $1", [id]);
}

const today = new Date().toISOString().slice(0, 10);
const suffix = Date.now();

const ownerA = await createUser(`wp004-v8-owner-a-${suffix}@example.com`);
const partnerA = await createUser(`wp004-v8-partner-a-${suffix}@example.com`);
const ownerB = await createUser(`wp004-v8-owner-b-${suffix}@example.com`);
const partnerB = await createUser(`wp004-v8-partner-b-${suffix}@example.com`);

try {
  await connect(ownerA, partnerA);
  await connect(ownerB, partnerB);

  const cycleLength = 28;
  let start = addDays(today, -(cycleLength * 3));
  for (let i = 0; i < 3; i++) {
    await insertPeriod(ownerA, { startDate: start, endDate: addDays(start, 4), expectedEndDate: null });
    start = addDays(start, cycleLength);
  }

  console.log("== Ohne Freigabe: keine geschätzte nächste Periode, auch nicht versteckt ==");
  {
    const dates = await getPartnerEstimatedDates(partnerA, today);
    assertEqual(dates, [], "ohne cycle_ring_shared liefert die Funktion eine leere Liste, nie die echte Schätzung");
  }

  console.log("\n== Mit Freigabe: Schätzung erscheint und stimmt mit predictCycle-Logik überein ==");
  {
    await setCycleRingShared(ownerA, true);
    const dates = await getPartnerEstimatedDates(partnerA, today);
    assert(dates !== null && dates.length > 0, "mit Freigabe liefert die Funktion eine nicht-leere Schätzung");
    const expected = predictNextPeriod(
      [
        { startDate: addDays(today, -(cycleLength * 3)), endDate: addDays(addDays(today, -(cycleLength * 3)), 4), expectedEndDate: null },
        { startDate: addDays(today, -(cycleLength * 2)), endDate: addDays(addDays(today, -(cycleLength * 2)), 4), expectedEndDate: null },
        { startDate: addDays(today, -cycleLength), endDate: addDays(addDays(today, -cycleLength), 4), expectedEndDate: null },
      ],
      today,
    );
    assert(expected !== null, "Testaufbau liefert eine gültige erwartete Vorhersage zum Vergleich");
    if (expected && dates) {
      assertEqual(dates[0], expected.start, "erster geschätzter Tag stimmt mit der Vorhersage überein");
      assertEqual(dates[dates.length - 1], expected.end, "letzter geschätzter Tag stimmt mit der Vorhersage überein");
    }
  }

  console.log("\n== Ausschalten der Freigabe entfernt die Schätzung sofort wieder ==");
  {
    await setCycleRingShared(ownerA, false);
    const dates = await getPartnerEstimatedDates(partnerA, today);
    assertEqual(dates, [], "nach dem Ausschalten liefert die Funktion wieder eine leere Liste");
  }

  console.log("\n== Kontotrennung: Paar B sieht nie die Schätzung von Paar A ==");
  {
    await setCycleRingShared(ownerA, true);
    const datesB = await getPartnerEstimatedDates(partnerB, today);
    assertEqual(datesB, [], "Paar B ohne eigene Freigabe und ohne eigene Perioden bekommt keine Schätzung von Paar A");
  }

  console.log("\n== Widerruf der Verbindung entfernt die Schätzung ebenfalls ==");
  {
    const beforeEnd = await getPartnerEstimatedDates(partnerA, today);
    assert(beforeEnd !== null && beforeEnd.length > 0, "vor dem Widerruf ist die Schätzung sichtbar (Freigabe aktiv)");
    await endConnection(ownerA);
    const afterEnd = await getPartnerEstimatedDates(partnerA, today);
    assertEqual(afterEnd, null, "nach Widerruf liefert die Funktion null (keine aktive Verbindung mehr)");
  }
} finally {
  await deleteUser(ownerA);
  await deleteUser(partnerA);
  await deleteUser(ownerB);
  await deleteUser(partnerB);
  await client.end();
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
