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

// Spiegelt die Deduplizierungs- und Widerrufslogik aus
// src/lib/new-partner-push.ts wider (server-only, nicht direkt per Node
// importierbar), gegen die echte Datenbank. Der VAPID-Versand selbst wird
// hier nicht ausgeführt (keine echten Push-Endpunkte in Tests) — geprüft
// wird ausschließlich der serverseitige Datenvertrag: Deduplizierung per
// UNIQUE-Constraint, Kontobindung, Entfernen bei Widerruf.

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

async function addSubscription(partnerUserId: string, endpoint: string): Promise<void> {
  await client.query(
    "INSERT INTO new_partner_push_subscriptions (id, partner_user_id, endpoint, p256dh, auth) VALUES ($1, $2, $3, 'p256dh-test', 'auth-test')",
    [randomUUID(), partnerUserId, endpoint],
  );
}

async function subscriptionCount(partnerUserId: string): Promise<number> {
  const result = await client.query("SELECT COUNT(*)::int AS n FROM new_partner_push_subscriptions WHERE partner_user_id = $1", [partnerUserId]);
  return result.rows[0].n;
}

// Spiegelt dispatchPartnerPeriodEvent's dedup-insert (INSERT ... ON CONFLICT
// DO NOTHING ... RETURNING id) wider, ohne den tatsächlichen Push-Versand.
async function tryRecordEvent(ownerUserId: string, eventType: string, eventDate: string): Promise<boolean> {
  const result = await client.query(
    `INSERT INTO new_partner_period_events (id, owner_user_id, event_type, event_date)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (owner_user_id, event_type, event_date) DO NOTHING
     RETURNING id`,
    [randomUUID(), ownerUserId, eventType, eventDate],
  );
  return (result.rowCount ?? 0) > 0;
}

// Spiegelt endPartnerConnection's Widerrufs-Erweiterung wider.
async function endConnectionAndRevokePush(ownerUserId: string): Promise<string | null> {
  const result = await client.query<{ partner_user_id: string }>(
    `UPDATE new_partner_connections SET status = 'ended', ended_at = NOW()
     WHERE owner_user_id = $1 AND status = 'active'
     RETURNING partner_user_id`,
    [ownerUserId],
  );
  const endedPartnerUserId = result.rows[0]?.partner_user_id ?? null;
  if (endedPartnerUserId) {
    await client.query("DELETE FROM new_partner_push_subscriptions WHERE partner_user_id = $1", [endedPartnerUserId]);
  }
  return endedPartnerUserId;
}

async function deleteUser(id: string): Promise<void> {
  await client.query("DELETE FROM new_users WHERE id = $1", [id]);
}

const suffix = Date.now();
const owner = await createUser(`wp004-v4-owner-${suffix}@example.com`);
const partner = await createUser(`wp004-v4-partner-${suffix}@example.com`);
const otherOwner = await createUser(`wp004-v4-owner2-${suffix}@example.com`);
const otherPartner = await createUser(`wp004-v4-partner2-${suffix}@example.com`);

try {
  console.log("\n== Subscription ist kontogebunden und per ON DELETE CASCADE begrenzt ==");
  {
    await addSubscription(partner, `https://push.example.com/${suffix}-1`);
    assertEqual(await subscriptionCount(partner), 1, "eine gespeicherte Subscription gehört genau dem Partnerkonto");
  }

  console.log("\n== Doppelter Endpunkt (ON CONFLICT) überschreibt statt zu duplizieren ==");
  {
    const endpoint = `https://push.example.com/${suffix}-dup`;
    await client.query(
      `INSERT INTO new_partner_push_subscriptions (id, partner_user_id, endpoint, p256dh, auth) VALUES ($1, $2, $3, 'a', 'b')
       ON CONFLICT (endpoint) DO UPDATE SET partner_user_id = EXCLUDED.partner_user_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth`,
      [randomUUID(), partner, endpoint],
    );
    await client.query(
      `INSERT INTO new_partner_push_subscriptions (id, partner_user_id, endpoint, p256dh, auth) VALUES ($1, $2, $3, 'c', 'd')
       ON CONFLICT (endpoint) DO UPDATE SET partner_user_id = EXCLUDED.partner_user_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth`,
      [randomUUID(), partner, endpoint],
    );
    const result = await client.query("SELECT p256dh FROM new_partner_push_subscriptions WHERE endpoint = $1", [endpoint]);
    assertEqual(result.rowCount, 1, "derselbe Endpunkt existiert nach erneuter Anmeldung nur einmal (kein Duplikat)");
    assertEqual(result.rows[0].p256dh, "c", "der Eintrag wurde auf die neuesten Schlüssel aktualisiert");
  }

  console.log("\n== Deduplizierung: dasselbe Ereignis am selben Tag löst nur einmal aus ==");
  {
    const first = await tryRecordEvent(owner, "period_started", "2026-09-11");
    const second = await tryRecordEvent(owner, "period_started", "2026-09-11");
    assert(first, "das erste Aufzeichnen eines heutigen Starts gelingt");
    assert(!second, "ein wiederholtes Aufzeichnen desselben Ereignisses am selben Tag wird durch den UNIQUE-Constraint verhindert");
  }

  console.log("\n== Verschiedene Ereignisarten/-daten sind unabhängig ==");
  {
    const started = await tryRecordEvent(owner, "period_started", "2026-09-12");
    const ended = await tryRecordEvent(owner, "period_ended", "2026-09-12");
    const startedNextDay = await tryRecordEvent(owner, "period_started", "2026-09-13");
    assert(started, "ein Start-Ereignis an einem neuen Datum gelingt");
    assert(ended, "ein Ende-Ereignis am selben Datum ist unabhängig vom Start-Ereignis und gelingt ebenfalls");
    assert(startedNextDay, "ein Start-Ereignis an einem späteren Datum ist unabhängig und gelingt");
  }

  console.log("\n== Parallele Aufzeichnungsversuche (zwei echte DB-Verbindungen): höchstens einer gewinnt ==");
  {
    const clientA = new Client({ connectionString });
    const clientB = new Client({ connectionString });
    await clientA.connect();
    await clientB.connect();
    try {
      async function tryOn(conn: pg.Client, ownerUserId: string, eventType: string, eventDate: string): Promise<boolean> {
        const result = await conn.query(
          `INSERT INTO new_partner_period_events (id, owner_user_id, event_type, event_date)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (owner_user_id, event_type, event_date) DO NOTHING
           RETURNING id`,
          [randomUUID(), ownerUserId, eventType, eventDate],
        );
        return (result.rowCount ?? 0) > 0;
      }
      const [resultA, resultB] = await Promise.all([
        tryOn(clientA, owner, "period_started", "2026-09-14"),
        tryOn(clientB, owner, "period_started", "2026-09-14"),
      ]);
      const successes = [resultA, resultB].filter(Boolean);
      assertEqual(successes.length, 1, "von zwei echten parallelen Aufzeichnungsversuchen desselben Ereignisses gelingt genau einer");
    } finally {
      await clientA.end();
      await clientB.end();
    }
  }

  console.log("\n== Nach Widerruf: Push-Subscriptions des Partners werden sofort entfernt ==");
  {
    await connect(otherOwner, otherPartner);
    await addSubscription(otherPartner, `https://push.example.com/${suffix}-revoke`);
    assertEqual(await subscriptionCount(otherPartner), 1, "vor dem Widerruf ist eine Subscription gespeichert");
    const endedPartnerUserId = await endConnectionAndRevokePush(otherOwner);
    assertEqual(endedPartnerUserId, otherPartner, "der Widerruf identifiziert korrekt das betroffene Partnerkonto");
    assertEqual(await subscriptionCount(otherPartner), 0, "nach dem Widerruf sind keine Push-Subscriptions dieses Partners mehr gespeichert");
  }

  console.log("\n== Kontotrennung: eine Subscription eines fremden Partnerkontos bleibt unberührt ==");
  {
    assertEqual(await subscriptionCount(partner), 2, "die Subscriptions des unbeteiligten Partnerkontos aus früheren Prüfungen bleiben unverändert bestehen");
  }
} finally {
  await deleteUser(owner);
  await deleteUser(partner);
  await deleteUser(otherOwner);
  await deleteUser(otherPartner);
  await client.end();
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
