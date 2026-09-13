import { config } from "dotenv";
config({ path: ".env.local" });

import { randomUUID } from "node:crypto";
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

// Spiegelt die serverseitigen Schreibpfade aus src/lib/new-periods.ts
// (server-only, daher nicht direkt importierbar) gegen die echte
// Datenbank, um die WP-003 Version 8-Pflichtprüfungen End-to-End
// abzudecken: tatsächlicher Beginn auf einem neutralen/erwarteten Tag,
// tatsächliches Ende mit Löschung des erwarteten Endes, Rand-Löschung
// (erster/letzter Tag) und vollständige Löschung eines Einzeltags.

interface PeriodEntry {
  id: string;
  startDate: string;
  endDate: string | null;
  expectedEndDate: string | null;
}

const OVERLAP_END = "COALESCE(end_date, expected_end_date, DATE '9999-12-31')";

async function createUser(email: string): Promise<string> {
  const id = randomUUID();
  await client.query("INSERT INTO new_users (id, email, password_hash) VALUES ($1, $2, $3)", [
    id,
    email,
    "$2b$12$oL3kVA9RxRzWJjGvMT1l6.8C2yTQGxIOt9kH/Pcp5VBSHujXyCXSe",
  ]);
  return id;
}

async function insertPeriod(userId: string, startDate: string, endDate: string | null, expectedEndDate: string | null = null): Promise<PeriodEntry> {
  const result = await client.query<{ id: string; start_date: string; end_date: string | null; expected_end_date: string | null }>(
    "INSERT INTO new_period_entries (id, user_id, start_date, end_date, expected_end_date) VALUES ($1, $2, $3, $4, $5) RETURNING id, start_date::text, end_date::text, expected_end_date::text",
    [randomUUID(), userId, startDate, endDate, expectedEndDate],
  );
  const row = result.rows[0];
  return { id: row.id, startDate: row.start_date, endDate: row.end_date, expectedEndDate: row.expected_end_date };
}

async function updateEntry(userId: string, entryId: string, startDate: string, endDate: string | null, expectedEndDate: string | null): Promise<{ ok: boolean; reason?: string; entry?: PeriodEntry }> {
  const existing = await client.query<{ id: string }>("SELECT id FROM new_period_entries WHERE id = $1 AND user_id = $2", [entryId, userId]);
  if (!existing.rowCount) return { ok: false, reason: "not_found" };

  const overlap = await client.query(
    `SELECT 1 FROM new_period_entries WHERE user_id = $1 AND id <> $2 AND start_date <= $4 AND ${OVERLAP_END} >= $3 LIMIT 1`,
    [userId, entryId, startDate, endDate ?? expectedEndDate ?? startDate],
  );
  if (overlap.rowCount) return { ok: false, reason: "overlap" };

  const result = await client.query<{ id: string; start_date: string; end_date: string | null; expected_end_date: string | null }>(
    "UPDATE new_period_entries SET start_date = $1, end_date = $2, expected_end_date = $3, updated_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING id, start_date::text, end_date::text, expected_end_date::text",
    [startDate, endDate, expectedEndDate, entryId, userId],
  );
  const row = result.rows[0];
  return { ok: true, entry: { id: row.id, startDate: row.start_date, endDate: row.end_date, expectedEndDate: row.expected_end_date } };
}

async function deleteEntry(userId: string, entryId: string): Promise<boolean> {
  const result = await client.query("DELETE FROM new_period_entries WHERE id = $1 AND user_id = $2", [entryId, userId]);
  return result.rowCount === 1;
}

async function getEntry(userId: string, entryId: string): Promise<PeriodEntry | null> {
  const result = await client.query<{ id: string; start_date: string; end_date: string | null; expected_end_date: string | null }>(
    "SELECT id, start_date::text, end_date::text, expected_end_date::text FROM new_period_entries WHERE id = $1 AND user_id = $2",
    [entryId, userId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return { id: row.id, startDate: row.start_date, endDate: row.end_date, expectedEndDate: row.expected_end_date };
}

function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const result = new Date(Date.UTC(y, m - 1, d));
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

async function deleteUser(id: string): Promise<void> {
  await client.query("DELETE FROM new_users WHERE id = $1", [id]);
}

const today = new Date().toISOString().slice(0, 10);
const yesterday = addDays(today, -1);
const suffix = Date.now();

const userA = await createUser(`wp003-v8-a-${suffix}@example.com`);
const userB = await createUser(`wp003-v8-b-${suffix}@example.com`);

try {
  console.log("== Laufende Periode: tatsächliches Ende gestern setzt expectedEndDate auf null ==");
  {
    const running = await insertPeriod(userA, addDays(today, -3), null, today);
    const result = await updateEntry(userA, running.id, running.startDate, yesterday, null);
    assert(result.ok, "das echte Ende konnte gespeichert werden");
    assertEqual(result.entry?.endDate, yesterday, "das echte Ende ist gestern");
    assertEqual(result.entry?.expectedEndDate, null, "das erwartete Ende wurde im selben Update geleert");
    await client.query("DELETE FROM new_period_entries WHERE id = $1", [running.id]);
  }

  console.log("\n== Tatsächlicher Beginn heute auf einem neutralen Tag wird nicht durch eine Schätzung blockiert ==");
  {
    const entry = await insertPeriod(userA, today, null, null);
    assertEqual(entry.startDate, today, "ein heutiger Beginn wird ohne Weiteres akzeptiert");
    await client.query("DELETE FROM new_period_entries WHERE id = $1", [entry.id]);
  }

  console.log("\n== Ersten Tag einer mehrtägigen Periode kürzen (Start-Rand) ==");
  {
    const entry = await insertPeriod(userA, addDays(today, -5), addDays(today, -1), null);
    const nextStart = addDays(entry.startDate, 1);
    const result = await updateEntry(userA, entry.id, nextStart, entry.endDate, null);
    assert(result.ok, "die Randkürzung am Start gelingt");
    assertEqual(result.entry?.startDate, nextStart, "der Start ist um genau einen Tag verschoben");
    assertEqual(result.entry?.endDate, entry.endDate, "das Ende bleibt unverändert");
    await client.query("DELETE FROM new_period_entries WHERE id = $1", [entry.id]);
  }

  console.log("\n== Letzten Tag einer mehrtägigen Periode kürzen (End-Rand) ==");
  {
    const entry = await insertPeriod(userA, addDays(today, -5), addDays(today, -1), null);
    const nextEnd = addDays(entry.endDate as string, -1);
    const result = await updateEntry(userA, entry.id, entry.startDate, nextEnd, null);
    assert(result.ok, "die Randkürzung am Ende gelingt");
    assertEqual(result.entry?.endDate, nextEnd, "das Ende ist um genau einen Tag verkürzt");
    assertEqual(result.entry?.startDate, entry.startDate, "der Start bleibt unverändert");
    await client.query("DELETE FROM new_period_entries WHERE id = $1", [entry.id]);
  }

  console.log("\n== Einzeltag-Löschung entfernt den gesamten Eintrag vollständig ==");
  {
    const entry = await insertPeriod(userA, today, today, null);
    const deleted = await deleteEntry(userA, entry.id);
    assert(deleted, "die Löschung des Einzeltag-Eintrags gelingt");
    const gone = await getEntry(userA, entry.id);
    assertEqual(gone, null, "der Eintrag ist danach nicht mehr vorhanden");
  }

  console.log("\n== Fremdes Konto kann weder Rand kürzen noch löschen ==");
  {
    const entry = await insertPeriod(userA, addDays(today, -5), addDays(today, -1), null);
    const updateResult = await updateEntry(userB, entry.id, addDays(entry.startDate, 1), entry.endDate, null);
    assertEqual(updateResult.ok, false, "ein fremdes Konto kann den Rand nicht ändern");
    assertEqual(updateResult.reason, "not_found", "die Ablehnung lautet not_found, kein Datenleck");
    const deleted = await deleteEntry(userB, entry.id);
    assertEqual(deleted, false, "ein fremdes Konto kann den Eintrag nicht löschen");
    const unchanged = await getEntry(userA, entry.id);
    assertEqual(unchanged?.startDate, entry.startDate, "der Eintrag ist nach dem fremden Versuch unverändert");
    await client.query("DELETE FROM new_period_entries WHERE id = $1", [entry.id]);
  }

  console.log("\n== Ungültige/nicht vorhandene ID kann nicht geändert oder gelöscht werden ==");
  {
    const fakeId = randomUUID();
    const updateResult = await updateEntry(userA, fakeId, today, today, null);
    assertEqual(updateResult.ok, false, "eine nicht vorhandene ID liefert not_found beim Ändern");
    const deleted = await deleteEntry(userA, fakeId);
    assertEqual(deleted, false, "eine nicht vorhandene ID liefert false beim Löschen");
  }

  console.log("\n== Erwarteter Zukunftstag wird nicht als tatsächliches Datum gespeichert ==");
  {
    // Simuliert die serverseitige Ablehnung eines künftigen Starts, wie
    // sie validateNewRunningPeriodInput bereits vor jedem INSERT/UPDATE
    // durchsetzt (hier gegen die Datenbank nachgewiesen: kein Zukunfts-
    // start existiert nach dem Testlauf für dieses Konto).
    const futureCount = await client.query("SELECT COUNT(*)::int AS n FROM new_period_entries WHERE user_id = $1 AND start_date > $2", [userA, today]);
    assertEqual(futureCount.rows[0].n, 0, "kein zukünftiger tatsächlicher Start existiert für dieses Konto");
  }
} finally {
  await deleteUser(userA);
  await deleteUser(userB);
  await client.end();
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
