import { config } from "dotenv";
config({ path: ".env.local" });

import { randomUUID } from "node:crypto";
import pg from "pg";
import { validateNewPeriodInput } from "../src/lib/new-period-validation";

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

// Diese Hilfsfunktionen spiegeln absichtlich exakt die Query-Logik aus
// src/lib/new-periods.ts wider (die dort per "server-only" gegen den
// direkten Node-Aufruf dieses Skripts abgeschottet ist), um denselben
// serverseitigen Vertrag (Kontotrennung, Überschneidung) end-to-end gegen
// die echte Datenbank zu prüfen, ohne den Produktionscode zu verändern.

interface PeriodEntry {
  id: string;
  startDate: string;
  endDate: string;
}

async function getEntries(userId: string): Promise<PeriodEntry[]> {
  const result = await client.query<{ id: string; start_date: string; end_date: string }>(
    `SELECT id, start_date::text, end_date::text FROM new_period_entries WHERE user_id = $1 ORDER BY start_date DESC`,
    [userId],
  );
  return result.rows.map((row) => ({ id: row.id, startDate: row.start_date, endDate: row.end_date }));
}

async function createEntry(userId: string, startDate: string, endDate: string): Promise<PeriodEntry> {
  const id = randomUUID();
  const result = await client.query<{ id: string; start_date: string; end_date: string }>(
    `INSERT INTO new_period_entries (id, user_id, start_date, end_date) VALUES ($1, $2, $3, $4)
     RETURNING id, start_date::text, end_date::text`,
    [id, userId, startDate, endDate],
  );
  const row = result.rows[0];
  return { id: row.id, startDate: row.start_date, endDate: row.end_date };
}

type UpdateResult =
  | { ok: true; entry: PeriodEntry }
  | { ok: false; reason: "overlap" | "not_found" };

async function updateEntry(userId: string, entryId: string, startDate: string, endDate: string): Promise<UpdateResult> {
  const existing = await client.query("SELECT 1 FROM new_period_entries WHERE id = $1 AND user_id = $2", [entryId, userId]);
  if (!existing.rowCount) return { ok: false, reason: "not_found" };

  const overlap = await client.query(
    `SELECT 1 FROM new_period_entries WHERE user_id = $1 AND id <> $2 AND start_date <= $4 AND end_date >= $3 LIMIT 1`,
    [userId, entryId, startDate, endDate],
  );
  if (overlap.rowCount) return { ok: false, reason: "overlap" };

  const result = await client.query<{ id: string; start_date: string; end_date: string }>(
    `UPDATE new_period_entries SET start_date = $1, end_date = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4
     RETURNING id, start_date::text, end_date::text`,
    [startDate, endDate, entryId, userId],
  );
  const row = result.rows[0];
  return { ok: true, entry: { id: row.id, startDate: row.start_date, endDate: row.end_date } };
}

async function deleteEntry(userId: string, entryId: string): Promise<boolean> {
  const result = await client.query("DELETE FROM new_period_entries WHERE id = $1 AND user_id = $2", [entryId, userId]);
  return result.rowCount === 1;
}

async function createTestUser(email: string): Promise<string> {
  const id = randomUUID();
  await client.query(
    "INSERT INTO new_users (id, email, password_hash) VALUES ($1, $2, $3)",
    [id, email, "$2b$12$oL3kVA9RxRzWJjGvMT1l6.8C2yTQGxIOt9kH/Pcp5VBSHujXyCXSe"],
  );
  return id;
}

async function deleteTestUser(id: string): Promise<void> {
  await client.query("DELETE FROM new_users WHERE id = $1", [id]);
}

console.log("\n== Ungültige Reihenfolge und Zukunft werden von der Eingabevalidierung abgelehnt ==");
{
  const today = "2026-09-07";
  const reversedOrder = validateNewPeriodInput({ startDate: "2026-06-10", endDate: "2026-06-01" }, today);
  assert(!reversedOrder.ok, "Ende vor Beginn wird abgelehnt");

  const future = validateNewPeriodInput({ startDate: "2026-09-10", endDate: "2026-09-12" }, today);
  assert(!future.ok, "zukünftiger Zeitraum wird abgelehnt");

  const valid = validateNewPeriodInput({ startDate: "2026-06-01", endDate: "2026-06-05" }, today);
  assert(valid.ok, "gültiger vergangener Zeitraum wird akzeptiert (Gegenprobe)");
}

const userA = await createTestUser(`wp003-verify-a-${Date.now()}@example.com`);
const userB = await createTestUser(`wp003-verify-b-${Date.now()}@example.com`);

try {
  console.log("\n== Zwei Einträge laden, einen bearbeiten, nur dieser ändert sich ==");
  const entryOne = await createEntry(userA, "2026-06-01", "2026-06-05");
  const entryTwo = await createEntry(userA, "2026-07-01", "2026-07-05");

  const beforeEdit = await getEntries(userA);
  assertEqual(beforeEdit.length, 2, "zwei gespeicherte Perioden sind getrennt sichtbar");

  const updated = await updateEntry(userA, entryOne.id, "2026-06-02", "2026-06-06");
  assert(updated.ok, "Änderung des ersten Eintrags war erfolgreich");

  const afterEdit = await getEntries(userA);
  const changed = afterEdit.find((entry) => entry.id === entryOne.id);
  const untouched = afterEdit.find((entry) => entry.id === entryTwo.id);
  assertEqual(changed?.startDate, "2026-06-02", "geänderter Eintrag hat den neuen Beginn");
  assertEqual(changed?.endDate, "2026-06-06", "geänderter Eintrag hat das neue Ende");
  assertEqual(untouched?.startDate, "2026-07-01", "nicht ausgewählter Eintrag bleibt unverändert (Beginn)");
  assertEqual(untouched?.endDate, "2026-07-05", "nicht ausgewählter Eintrag bleibt unverändert (Ende)");

  console.log("\n== Überschneidung wird abgelehnt, Eintrag bleibt unverändert ==");
  const overlapping = await updateEntry(userA, entryTwo.id, "2026-06-03", "2026-06-04");
  assert(!overlapping.ok && overlapping.reason === "overlap", "Überschneidung mit dem anderen Eintrag wird abgelehnt");
  const afterOverlapAttempt = await getEntries(userA);
  const stillOriginal = afterOverlapAttempt.find((entry) => entry.id === entryTwo.id);
  assertEqual(stillOriginal?.startDate, "2026-07-01", "abgelehnte Überschneidung lässt den Eintrag unverändert");

  console.log("\n== Kontotrennung: fremde ID wird serverseitig abgelehnt ==");
  const foreignAttempt = await updateEntry(userB, entryOne.id, "2026-01-01", "2026-01-02");
  assert(!foreignAttempt.ok && foreignAttempt.reason === "not_found", "fremdes Konto kann den Eintrag nicht ändern (not_found)");
  const untouchedByForeignAttempt = await getEntries(userA);
  const stillOwnedByA = untouchedByForeignAttempt.find((entry) => entry.id === entryOne.id);
  assertEqual(stillOwnedByA?.startDate, "2026-06-02", "Eintrag bleibt nach fremdem Zugriffsversuch unverändert");

  console.log("\n== Kontotrennung: anderes Konto sieht die Einträge nicht ==");
  const userBEntries = await getEntries(userB);
  assertEqual(userBEntries.length, 0, "Konto B sieht keine Perioden von Konto A");

  console.log("\n== Nicht vorhandene ID wird abgelehnt ==");
  const missingIdAttempt = await updateEntry(userA, randomUUID(), "2026-01-01", "2026-01-02");
  assert(!missingIdAttempt.ok && missingIdAttempt.reason === "not_found", "nicht vorhandene ID liefert not_found");

  console.log("\n== Löschen: fremde ID kann nicht gelöscht werden ==");
  const foreignDelete = await deleteEntry(userB, entryOne.id);
  assert(!foreignDelete, "fremdes Konto kann den Eintrag nicht löschen");
  const stillThereAfterForeignDelete = await getEntries(userA);
  assert(
    stillThereAfterForeignDelete.some((entry) => entry.id === entryOne.id),
    "Eintrag bleibt nach fremdem Löschversuch vorhanden",
  );

  console.log("\n== Löschen: ungültige/nicht vorhandene ID kann nicht gelöscht werden ==");
  const missingDelete = await deleteEntry(userA, randomUUID());
  assert(!missingDelete, "nicht vorhandene ID liefert beim Löschen false");

  console.log("\n== Löschen: 'Abbrechen' hat keine Datenwirkung, 'Endgültig löschen' entfernt genau diesen Eintrag ==");
  const beforeDeleteAttempt = await getEntries(userA);
  assertEqual(beforeDeleteAttempt.length, 2, "beide Einträge sind vor dem Löschversuch vorhanden (Abbrechen-Ausgangslage)");
  // "Abbrechen" in der UI führt zu keinem DELETE-Request; die Simulation davon ist schlicht:
  // kein Aufruf von deleteEntry. Die eigentliche Prüfung gilt der bestätigten Löschung.
  const confirmedDelete = await deleteEntry(userA, entryTwo.id);
  assert(confirmedDelete, "bestätigtes Löschen des zweiten Eintrags war erfolgreich");
  const afterDelete = await getEntries(userA);
  assertEqual(afterDelete.length, 1, "nach dem Löschen ist genau ein Eintrag übrig");
  assert(
    !afterDelete.some((entry) => entry.id === entryTwo.id),
    "der gelöschte Eintrag ist nach dem Löschen nicht mehr vorhanden",
  );
  assert(
    afterDelete.some((entry) => entry.id === entryOne.id),
    "der nicht gelöschte Eintrag bleibt weiterhin vorhanden",
  );
} finally {
  await deleteTestUser(userA);
  await deleteTestUser(userB);
  await client.end();
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
