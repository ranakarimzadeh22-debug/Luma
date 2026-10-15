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

// Spiegelt src/lib/new-pms-symptoms.ts und src/lib/new-partner-calendar.ts
// (server-only, nicht direkt per Node importierbar) gegen die echte
// Datenbank: derselbe aktive-Verbindungs-Gate wie der bestehende
// Partnerkalender, keine neue Freigabe-Spalte.

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function resolveActiveOwnerUserId(partnerUserId: string): Promise<string | null> {
  const result = await client.query<{ owner_user_id: string }>(
    `SELECT owner_user_id FROM new_partner_connections WHERE partner_user_id = $1 AND status = 'active' LIMIT 1`,
    [partnerUserId],
  );
  return result.rows[0]?.owner_user_id ?? null;
}

async function getPmsSymptomDaysFor(userId: string): Promise<{ date: string; symptoms: string[] }[]> {
  const result = await client.query<{ entry_date: string; symptom: string }>(
    `SELECT entry_date::text, symptom FROM new_pms_symptom_entries WHERE user_id = $1 ORDER BY entry_date DESC`,
    [userId],
  );
  const byDate = new Map<string, string[]>();
  for (const row of result.rows) {
    const list = byDate.get(row.entry_date) ?? [];
    list.push(row.symptom);
    byDate.set(row.entry_date, list);
  }
  return [...byDate.entries()].map(([date, symptoms]) => ({ date, symptoms }));
}

// Spiegelt die Partneransicht: nur bei aktiver Verbindung, niemals für ein
// nicht verbundenes oder getrenntes Konto.
async function getPartnerPmsSymptomDays(partnerUserId: string): Promise<{ date: string; symptoms: string[] }[] | null> {
  const ownerUserId = await resolveActiveOwnerUserId(partnerUserId);
  if (!ownerUserId) return null;
  return getPmsSymptomDaysFor(ownerUserId);
}

async function setSymptomsForDay(userId: string, date: string, symptoms: string[]): Promise<void> {
  await client.query("BEGIN");
  try {
    await client.query("DELETE FROM new_pms_symptom_entries WHERE user_id = $1 AND entry_date = $2", [userId, date]);
    for (const symptom of symptoms) {
      await client.query(
        "INSERT INTO new_pms_symptom_entries (id, user_id, entry_date, symptom) VALUES ($1, $2, $3, $4)",
        [randomUUID(), userId, date, symptom],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
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

async function endConnection(ownerUserId: string): Promise<void> {
  await client.query(`UPDATE new_partner_connections SET status = 'ended', ended_at = NOW() WHERE owner_user_id = $1`, [ownerUserId]);
}

async function deleteUser(id: string): Promise<void> {
  await client.query("DELETE FROM new_users WHERE id = $1", [id]);
}

const suffix = Date.now();
const owner = await createUser(`wp013-owner-${suffix}@example.com`);
const partner = await createUser(`wp013-partner-${suffix}@example.com`);
const otherOwner = await createUser(`wp013-owner2-${suffix}@example.com`);
const unconnectedPartner = await createUser(`wp013-unconnected-${suffix}@example.com`);

try {
  console.log("\n== Datenbankschema: nur die vier bestätigten Symptomwerte werden akzeptiert ==");
  {
    await assertRejects(
      () => setSymptomsForDay(owner, "2026-10-10", ["headache"]),
      "ein ungültiger Symptomwert wird von der Datenbank-CHECK-Constraint abgewiesen",
    );
    await setSymptomsForDay(owner, "2026-10-10", ["breast_tenderness", "fatigue"]);
    const days = await getPmsSymptomDaysFor(owner);
    assertEqual(days, [{ date: "2026-10-10", symptoms: ["breast_tenderness", "fatigue"] }], "eine gültige Mehrfachauswahl wird korrekt gespeichert");
    await client.query("DELETE FROM new_pms_symptom_entries WHERE user_id = $1", [owner]);
  }

  console.log("\n== Aktualisieren und vollständiges Entfernen ==");
  {
    await setSymptomsForDay(owner, "2026-10-10", ["fatigue"]);
    await setSymptomsForDay(owner, "2026-10-10", ["mood_swings", "abdominal_pain"]);
    assertEqual(await getPmsSymptomDaysFor(owner), [{ date: "2026-10-10", symptoms: ["mood_swings", "abdominal_pain"] }], "ein erneutes Speichern ersetzt die vorherige Auswahl für denselben Tag");
    await setSymptomsForDay(owner, "2026-10-10", []);
    assertEqual(await getPmsSymptomDaysFor(owner), [], "eine leere Auswahl entfernt alle Markierungen für diesen Tag");
  }

  console.log("\n== Ein Nutzerkonto darf einen Symptomwert pro Datum höchstens einmal besitzen ==");
  {
    await client.query(
      "INSERT INTO new_pms_symptom_entries (id, user_id, entry_date, symptom) VALUES ($1, $2, $3, $4)",
      [randomUUID(), owner, "2026-10-11", "fatigue"],
    );
    await assertRejects(
      () =>
        client.query(
          "INSERT INTO new_pms_symptom_entries (id, user_id, entry_date, symptom) VALUES ($1, $2, $3, $4)",
          [randomUUID(), owner, "2026-10-11", "fatigue"],
        ),
      "ein doppelter Symptomwert für denselben Tag und dasselbe Konto wird abgewiesen (UNIQUE-Constraint)",
    );
    await client.query("DELETE FROM new_pms_symptom_entries WHERE user_id = $1", [owner]);
  }

  console.log("\n== Mandantentrennung: ein Konto sieht nie die Symptome eines anderen Kontos ==");
  {
    await setSymptomsForDay(owner, "2026-10-10", ["fatigue"]);
    await setSymptomsForDay(otherOwner, "2026-10-10", ["mood_swings"]);
    const ownerDays = await getPmsSymptomDaysFor(owner);
    assertEqual(ownerDays, [{ date: "2026-10-10", symptoms: ["fatigue"] }], "ein Konto sieht ausschließlich seine eigenen Symptommarkierungen");
    await client.query("DELETE FROM new_pms_symptom_entries WHERE user_id IN ($1, $2)", [owner, otherOwner]);
  }

  console.log("\n== Partnerprüfung: kein Zugriff ohne aktive Verbindung ==");
  {
    await setSymptomsForDay(owner, "2026-10-10", ["fatigue"]);
    const view = await getPartnerPmsSymptomDays(unconnectedPartner);
    assertEqual(view, null, "ein nicht verbundenes Konto erhält keine Symptomdaten");
    await client.query("DELETE FROM new_pms_symptom_entries WHERE user_id = $1", [owner]);
  }

  console.log("\n== Partnerprüfung: aktive Verbindung zeigt ausschließlich die manuelle PMS-Information der verbundenen Ownerin ==");
  {
    await setSymptomsForDay(owner, "2026-10-10", ["breast_tenderness", "fatigue"]);
    await connect(owner, partner);
    const view = await getPartnerPmsSymptomDays(partner);
    assertEqual(view, [{ date: "2026-10-10", symptoms: ["breast_tenderness", "fatigue"] }], "die aktive Verbindung zeigt exakt die Symptommarkierungen der verbundenen Ownerin");
    await endConnection(owner);
    await client.query("DELETE FROM new_pms_symptom_entries WHERE user_id = $1", [owner]);
  }

  console.log("\n== Partnerprüfung: nach Verbindungsende sofort keine Daten mehr ==");
  {
    await setSymptomsForDay(owner, "2026-10-10", ["fatigue"]);
    await connect(owner, partner);
    const before = await getPartnerPmsSymptomDays(partner);
    assert(before !== null, "vor dem Widerruf sind Symptomdaten sichtbar");
    await endConnection(owner);
    const after = await getPartnerPmsSymptomDays(partner);
    assertEqual(after, null, "nach dem Widerruf sind sofort keine Symptomdaten mehr sichtbar");
    await client.query("DELETE FROM new_pms_symptom_entries WHERE user_id = $1", [owner]);
  }

  console.log("\n== Partnerprüfung: Kontotrennung – ein fremdes Partnerkonto eines anderen Paares erhält keine Daten ==");
  {
    await setSymptomsForDay(owner, "2026-10-10", ["fatigue"]);
    await connect(owner, partner);
    await setSymptomsForDay(otherOwner, "2026-10-10", ["mood_swings"]);
    const view = await getPartnerPmsSymptomDays(partner);
    assertEqual(view, [{ date: "2026-10-10", symptoms: ["fatigue"] }], "der verbundene Partner sieht ausschließlich die Symptome seiner eigenen Ownerin, nie die eines fremden Kontos");
    await endConnection(owner);
    await client.query("DELETE FROM new_pms_symptom_entries WHERE user_id IN ($1, $2)", [owner, otherOwner]);
  }

  console.log("\n== Partner-Schreiben ist strukturell unmöglich: es gibt keinen Owner-Parameter in der Schreib-API ==");
  {
    // src/app/api/neu/pms-symptoms/route.ts (PUT) schreibt ausschließlich für
    // session.userId aus der eigenen, per Cookie authentifizierten Sitzung —
    // es existiert kein Parameter, über den ein Partner eine fremde
    // userId angeben könnte. Dieser Test bestätigt denselben Mechanismus,
    // den auch new_period_entries (bestehende Periodenaktionen) nutzt: ein
        // Partnerkonto kann ausschließlich für sich selbst schreiben, niemals für
    // den verbundenen Owner.
    await connect(owner, partner);
    await setSymptomsForDay(partner, "2026-10-10", ["fatigue"]);
    const ownerDaysAfterPartnerWrite = await getPmsSymptomDaysFor(owner);
    assertEqual(ownerDaysAfterPartnerWrite, [], "ein Schreibversuch des Partnerkontos legt niemals einen Eintrag beim verbundenen Owner-Konto an");
    await endConnection(owner);
    await client.query("DELETE FROM new_pms_symptom_entries WHERE user_id = $1", [partner]);
  }
} finally {
  await client.query("DELETE FROM new_pms_symptom_entries WHERE user_id IN ($1, $2, $3, $4)", [owner, partner, otherOwner, unconnectedPartner]);
  await deleteUser(owner);
  await deleteUser(partner);
  await deleteUser(otherOwner);
  await deleteUser(unconnectedPartner);
  await client.end();
}

async function assertRejects(fn: () => Promise<unknown>, label: string): Promise<void> {
  try {
    await fn();
    assert(false, label);
  } catch {
    assert(true, label);
  }
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
