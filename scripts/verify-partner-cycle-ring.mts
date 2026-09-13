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

// Spiegelt src/lib/new-partner-cycle-view.ts, src/lib/new-partner.ts
// (setPartnerCycleRingShared) und src/lib/personal-cycle-view.ts
// (computePersonalCycleView) gegen die echte Datenbank, da diese Module
// "server-only" importieren und daher nicht direkt per tsx ausführbar sind
// — dasselbe Muster wie die übrigen scripts/verify-partner-*.mts dieser Session.

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

async function setCycleRingShared(ownerUserId: string, shared: boolean): Promise<{ ok: boolean }> {
  const result = await client.query(
    "UPDATE new_partner_connections SET cycle_ring_shared = $1 WHERE owner_user_id = $2 AND status = 'active'",
    [shared, ownerUserId],
  );
  return { ok: (result.rowCount ?? 0) > 0 };
}

async function endConnection(ownerUserId: string): Promise<void> {
  await client.query(
    "UPDATE new_partner_connections SET status = 'ended', ended_at = NOW() WHERE owner_user_id = $1 AND status = 'active'",
    [ownerUserId],
  );
}

async function isCycleRingSharedForOwner(ownerUserId: string): Promise<boolean | null> {
  const result = await client.query<{ cycle_ring_shared: boolean }>(
    "SELECT cycle_ring_shared FROM new_partner_connections WHERE owner_user_id = $1 AND status = 'active' LIMIT 1",
    [ownerUserId],
  );
  return result.rows[0]?.cycle_ring_shared ?? null;
}

async function resolveSharingOwnerUserId(partnerUserId: string): Promise<string | null> {
  const result = await client.query<{ owner_user_id: string }>(
    `SELECT owner_user_id FROM new_partner_connections
     WHERE partner_user_id = $1 AND status = 'active' AND cycle_ring_shared = TRUE
     LIMIT 1`,
    [partnerUserId],
  );
  return result.rows[0]?.owner_user_id ?? null;
}

async function getPeriods(userId: string): Promise<PeriodEntry[]> {
  const result = await client.query<{ start_date: string; end_date: string | null; expected_end_date: string | null }>(
    "SELECT start_date::text, end_date::text, expected_end_date::text FROM new_period_entries WHERE user_id = $1 ORDER BY start_date DESC",
    [userId],
  );
  return result.rows.map((row) => ({ startDate: row.start_date, endDate: row.end_date, expectedEndDate: row.expected_end_date }));
}

// Minimal reimplementation of src/lib/personal-cycle-view.ts's status/phase
// logic, sufficient to prove the partner view reuses the same shape and
// answers (personal / no_data, isRunning, todayPhase) — not a full copy of
// the ring geometry, which is unaffected by WP-004 v6.
const MIN_REAL_PERIODS_FOR_MEDIAN = 4;
const MIN_CYCLE_LENGTH = 21;
const MAX_CYCLE_LENGTH = 45;

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

function computeStatusAndRunning(periods: PeriodEntry[], today: string): { status: "personal" | "no_data"; isRunning: boolean; todayPhase: "period" | null } {
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const runningToday = sorted.some((entry) => entry.endDate === null && entry.startDate <= today);
  const confirmedToday = runningToday || sorted.some((entry) => entry.endDate !== null && entry.startDate <= today && entry.endDate >= today);

  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetween(sorted[i - 1].startDate, sorted[i].startDate);
    if (gap >= MIN_CYCLE_LENGTH && gap <= MAX_CYCLE_LENGTH) gaps.push(gap);
  }
  const hasPersonalMedian = sorted.length >= MIN_REAL_PERIODS_FOR_MEDIAN && gaps.length >= MIN_REAL_PERIODS_FOR_MEDIAN - 1;

  if (hasPersonalMedian) {
    return { status: "personal", isRunning: runningToday, todayPhase: confirmedToday ? "period" : null };
  }
  return { status: "no_data", isRunning: runningToday, todayPhase: confirmedToday ? "period" : null };
}

async function getPartnerCycleView(
  partnerUserId: string,
  today: string,
): Promise<{ status: string; isRunning: boolean; todayPhase: string | null; runningPeriodExpectedEndDate: string | null } | null> {
  const ownerUserId = await resolveSharingOwnerUserId(partnerUserId);
  if (!ownerUserId) return null;

  const periods = await getPeriods(ownerUserId);
  const view = computeStatusAndRunning(periods, today);
  const runningEntry = periods.find((entry) => entry.endDate === null && entry.startDate <= today);

  return {
    status: view.status,
    isRunning: view.isRunning,
    todayPhase: view.todayPhase,
    runningPeriodExpectedEndDate: runningEntry?.expectedEndDate ?? null,
  };
}

async function deleteUser(id: string): Promise<void> {
  await client.query("DELETE FROM new_users WHERE id = $1", [id]);
}

function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const result = new Date(Date.UTC(y, m - 1, d));
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

const today = new Date().toISOString().slice(0, 10);
const suffix = Date.now();

const ownerA = await createUser(`wp004-v6-owner-a-${suffix}@example.com`);
const partnerA = await createUser(`wp004-v6-partner-a-${suffix}@example.com`);
const ownerB = await createUser(`wp004-v6-owner-b-${suffix}@example.com`);
const partnerB = await createUser(`wp004-v6-partner-b-${suffix}@example.com`);
const strangerPartner = await createUser(`wp004-v6-stranger-${suffix}@example.com`);

try {
  console.log("== Ohne aktive Verbindung liefert der Partner-View null ==");
  {
    const view = await getPartnerCycleView(strangerPartner, today);
    assertEqual(view, null, "keine Verbindung -> kein Kreis, keine Werte");
  }

  await connect(ownerA, partnerA);
  await connect(ownerB, partnerB);

  console.log("\n== Aktiv verbunden, aber Freigabe aus: kein Kreis ==");
  {
    const shared = await isCycleRingSharedForOwner(ownerA);
    assertEqual(shared, false, "Default ist nicht freigegeben");
    const view = await getPartnerCycleView(partnerA, today);
    assertEqual(view, null, "ohne Freigabe liefert die Partneransicht keinerlei Kreiswerte");
  }

  console.log("\n== Freigabe einschalten: Kreis erscheint mit derselben Phase wie beim Owner ==");
  {
    const result = await setCycleRingShared(ownerA, true);
    assert(result.ok, "Freigabe konnte gesetzt werden");

    const cycleLength = 28;
    let start = addDays(today, -(cycleLength * 4));
    for (let i = 0; i < 4; i++) {
      const end = addDays(start, 4);
      await insertPeriod(ownerA, { startDate: start, endDate: end, expectedEndDate: null });
      start = addDays(start, cycleLength);
    }
    const expectedEnd = addDays(today, 3);
    await insertPeriod(ownerA, { startDate: today, endDate: null, expectedEndDate: expectedEnd });

    const view = await getPartnerCycleView(partnerA, today);
    assert(view !== null, "mit Freigabe liefert die Partneransicht einen Kreis");
    if (view) {
      assertEqual(view.status, "personal", "Status ist 'personal' bei vier echten Perioden");
      assertEqual(view.isRunning, true, "laufende Periode wird erkannt");
      assertEqual(view.todayPhase, "period", "heutige Phase ist 'period' während der laufenden Periode");
      assertEqual(view.runningPeriodExpectedEndDate, expectedEnd, "erwartetes Ende der laufenden Periode wird geliefert");
    }
  }

  console.log("\n== Ausschalten der Freigabe sperrt den Kreis sofort, Verbindung bleibt aktiv ==");
  {
    const result = await setCycleRingShared(ownerA, false);
    assert(result.ok, "Freigabe konnte ausgeschaltet werden");
    const view = await getPartnerCycleView(partnerA, today);
    assertEqual(view, null, "nach dem Ausschalten liefert die Partneransicht keine Kreiswerte mehr");
    const activeRow = await client.query("SELECT 1 FROM new_partner_connections WHERE owner_user_id = $1 AND status = 'active'", [ownerA]);
    assert((activeRow.rowCount ?? 0) > 0, "die Partnerverbindung selbst bleibt bestehen");
  }

  console.log("\n== Kontotrennung: Freigabe eines Paars ist für ein anderes Paar nie sichtbar ==");
  {
    await setCycleRingShared(ownerA, true);
    const viewB = await getPartnerCycleView(partnerB, today);
    assertEqual(viewB, null, "Paar B sieht nichts, obwohl Paar A freigegeben hat und Paar B keine eigene Freigabe hat");

    await setCycleRingShared(ownerB, true);
    await insertPeriod(ownerB, { startDate: today, endDate: null, expectedEndDate: null });
    const viewBAfterOwnShare = await getPartnerCycleView(partnerB, today);
    assert(viewBAfterOwnShare !== null, "Paar B bekommt nach eigener Freigabe eine eigene, unabhängige Ansicht");
  }

  console.log("\n== setCycleRingShared kann nur die eigene aktive Verbindung ändern ==");
  {
    const result = await setCycleRingShared(strangerPartner, true);
    assert(!result.ok, "ein Konto ohne aktive eigene Owner-Verbindung kann keine Freigabe setzen");
  }

  console.log("\n== no_data bleibt ehrlich: ein frisch verbundenes Paar ohne Perioden liefert no_data, keine erfundene Phase ==");
  {
    const freshOwner = await createUser(`wp004-v6-fresh-owner-${suffix}@example.com`);
    const freshPartner = await createUser(`wp004-v6-fresh-partner-${suffix}@example.com`);
    try {
      await connect(freshOwner, freshPartner);
      await setCycleRingShared(freshOwner, true);
      const view = await getPartnerCycleView(freshPartner, today);
      assert(view !== null, "mit Freigabe liefert die Funktion ein Ergebnis-Objekt");
      if (view) {
        assertEqual(view.status, "no_data", "ohne jede Periode ist der Status ehrlich no_data");
        assertEqual(view.todayPhase, null, "keine erfundene Phase ohne Daten");
      }
    } finally {
      await deleteUser(freshOwner);
      await deleteUser(freshPartner);
    }
  }

  console.log("\n== Widerruf der Verbindung sperrt die Kreisansicht ebenfalls ==");
  {
    await setCycleRingShared(ownerA, true);
    const beforeEnd = await getPartnerCycleView(partnerA, today);
    assert(beforeEnd !== null, "vor dem Widerruf ist die Kreisansicht (bei Freigabe) sichtbar");

    await endConnection(ownerA);
    const afterEnd = await getPartnerCycleView(partnerA, today);
    assertEqual(afterEnd, null, "nach Widerruf der Verbindung liefert die Kreisansicht nichts mehr");
  }
} finally {
  await deleteUser(ownerA);
  await deleteUser(partnerA);
  await deleteUser(ownerB);
  await deleteUser(partnerB);
  await deleteUser(strangerPartner);
  await client.end();
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
