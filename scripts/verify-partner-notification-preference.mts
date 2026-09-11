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

// Spiegelt src/lib/new-partner-notification-preference.ts wider
// (server-only, nicht direkt per Node importierbar) gegen die echte
// Datenbank.

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
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

type Preference = "yes" | "no" | null;

async function getPreference(partnerUserId: string): Promise<Preference> {
  const result = await client.query<{ wants_notifications: boolean }>(
    "SELECT wants_notifications FROM new_partner_notification_preferences WHERE partner_user_id = $1",
    [partnerUserId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return row.wants_notifications ? "yes" : "no";
}

async function isConnected(partnerUserId: string): Promise<boolean> {
  const result = await client.query(
    "SELECT 1 FROM new_partner_connections WHERE partner_user_id = $1 AND status = 'active' LIMIT 1",
    [partnerUserId],
  );
  return (result.rowCount ?? 0) > 0;
}

async function savePreference(partnerUserId: string, wantsNotifications: boolean): Promise<{ ok: boolean }> {
  if (!(await isConnected(partnerUserId))) return { ok: false };
  await client.query(
    `INSERT INTO new_partner_notification_preferences (partner_user_id, wants_notifications)
     VALUES ($1, $2)
     ON CONFLICT (partner_user_id) DO UPDATE SET wants_notifications = EXCLUDED.wants_notifications`,
    [partnerUserId, wantsNotifications],
  );
  return { ok: true };
}

async function deleteUser(id: string): Promise<void> {
  await client.query("DELETE FROM new_users WHERE id = $1", [id]);
}

const suffix = Date.now();
const owner = await createUser(`wp004-v5-owner-${suffix}@example.com`);
const partner = await createUser(`wp004-v5-partner-${suffix}@example.com`);
const otherOwner = await createUser(`wp004-v5-owner2-${suffix}@example.com`);
const unconnectedPartner = await createUser(`wp004-v5-unconnected-${suffix}@example.com`);

try {
  console.log("\n== Ohne aktive Verbindung kann keine Auswahl gespeichert werden ==");
  {
    const result = await savePreference(unconnectedPartner, true);
    assert(!result.ok, "das Speichern wird ohne aktive Verbindung abgelehnt");
    assertEqual(await getPreference(unconnectedPartner), null, "es ist keine Auswahl gespeichert");
  }

  console.log("\n== Verbundener Partner ohne Auswahl sieht null (Frage erscheint) ==");
  {
    await connect(owner, partner);
    assertEqual(await getPreference(partner), null, "ohne gespeicherte Auswahl liefert die Abfrage null");
  }

  console.log("\n== 'Ja' speichert genau diesen Wert ==");
  {
    const result = await savePreference(partner, true);
    assert(result.ok, "das Speichern gelingt mit aktiver Verbindung");
    assertEqual(await getPreference(partner), "yes", "die gespeicherte Auswahl ist 'yes'");
  }

  console.log("\n== Erneutes Speichern überschreibt den Wert (kein Duplikat) ==");
  {
    const before = await client.query("SELECT COUNT(*)::int AS n FROM new_partner_notification_preferences WHERE partner_user_id = $1", [partner]);
    const result = await savePreference(partner, false);
    const after = await client.query("SELECT COUNT(*)::int AS n FROM new_partner_notification_preferences WHERE partner_user_id = $1", [partner]);
    assert(result.ok, "das erneute Speichern gelingt");
    assertEqual(before.rows[0].n, 1, "vor dem erneuten Speichern existiert genau eine Zeile");
    assertEqual(after.rows[0].n, 1, "nach dem erneuten Speichern existiert weiterhin genau eine Zeile (Update, kein Duplikat)");
    assertEqual(await getPreference(partner), "no", "die Auswahl wurde auf 'no' aktualisiert");
  }

  console.log("\n== Auswahl bleibt über eine neue 'Sitzung' (erneuten Lesevorgang) erhalten ==");
  {
    assertEqual(await getPreference(partner), "no", "ein erneuter Lesevorgang liefert weiterhin den gespeicherten Wert");
  }

  console.log("\n== Kontotrennung: ein anderes Partnerkonto sieht/überschreibt die Auswahl nicht ==");
  {
    await connect(otherOwner, unconnectedPartner);
    assertEqual(await getPreference(unconnectedPartner), null, "ein anderes, gerade erst verbundenes Partnerkonto hat eine eigene, unabhängige (leere) Auswahl");
    await savePreference(unconnectedPartner, true);
    assertEqual(await getPreference(partner), "no", "die Auswahl des ersten Partnerkontos bleibt von der Aktion eines anderen Kontos unberührt");
  }

  console.log("\n== Keine Zyklus-/Perioden-/Geräteinformationen in der Tabelle ==");
  {
    const columns = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'new_partner_notification_preferences'`,
    );
    const columnNames = columns.rows.map((r) => r.column_name);
    assertEqual(
      columnNames.sort(),
      ["created_at", "partner_user_id", "wants_notifications"].sort(),
      "die Tabelle enthält ausschließlich Kontobindung, Auswahl und Zeitstempel — keine Perioden-/Zyklus-/Geräte-/Profildaten",
    );
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
