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

const connectionString = process.env.LUMA_CORE_DATABASE_URL;
if (!connectionString) throw new Error("LUMA_CORE_DATABASE_URL fehlt.");

const client = new Client({ connectionString });
await client.connect();

// Diese Hilfsfunktionen spiegeln die Kernlogik aus src/lib/new-partner.ts
// wider (die "server-only" nutzt und sich daher nicht direkt per Node
// importieren lässt), um denselben serverseitigen Vertrag end-to-end gegen
// die echte Datenbank zu prüfen.

const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function generateCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return code;
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

async function createCode(ownerUserId: string, expiresInMs: number): Promise<string> {
  const code = generateCode();
  await client.query(
    `INSERT INTO new_partner_connection_codes (id, owner_user_id, code_hash, expires_at) VALUES ($1, $2, $3, NOW() + ($4 || ' milliseconds')::interval)`,
    [randomUUID(), ownerUserId, sha256(code), expiresInMs],
  );
  return code;
}

type RedeemResult =
  | { ok: true; ownerUserId: string }
  | { ok: false; reason: "invalid_or_expired" | "own_code" | "owner_already_connected" | "partner_already_connected" };

async function redeemOn(conn: pg.Client, partnerUserId: string, rawCode: string): Promise<RedeemResult> {
  const codeHash = sha256(rawCode);
  await conn.query("BEGIN");
  try {
    const codeRow = await conn.query<{ id: string; owner_user_id: string }>(
      `SELECT id, owner_user_id FROM new_partner_connection_codes WHERE code_hash = $1 AND consumed_at IS NULL AND expires_at > NOW() FOR UPDATE`,
      [codeHash],
    );
    const code = codeRow.rows[0];
    if (!code) {
      await conn.query("COMMIT");
      return { ok: false, reason: "invalid_or_expired" };
    }
    if (code.owner_user_id === partnerUserId) {
      await conn.query("COMMIT");
      return { ok: false, reason: "own_code" };
    }

    await conn.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 1))", [code.owner_user_id]);
    await conn.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 2))", [partnerUserId]);

    const ownerActive = await conn.query(
      `SELECT 1 FROM new_partner_connections WHERE owner_user_id = $1 AND status = 'active' LIMIT 1`,
      [code.owner_user_id],
    );
    if (ownerActive.rowCount) {
      await conn.query("COMMIT");
      return { ok: false, reason: "owner_already_connected" };
    }
    const partnerActive = await conn.query(
      `SELECT 1 FROM new_partner_connections WHERE partner_user_id = $1 AND status = 'active' LIMIT 1`,
      [partnerUserId],
    );
    if (partnerActive.rowCount) {
      await conn.query("COMMIT");
      return { ok: false, reason: "partner_already_connected" };
    }

    await conn.query(`UPDATE new_partner_connection_codes SET consumed_at = NOW() WHERE id = $1`, [code.id]);
    await conn.query(
      `INSERT INTO new_partner_connections (id, owner_user_id, partner_user_id, status) VALUES ($1, $2, $3, 'active')`,
      [randomUUID(), code.owner_user_id, partnerUserId],
    );
    await conn.query("COMMIT");
    return { ok: true, ownerUserId: code.owner_user_id };
  } catch (error) {
    await conn.query("ROLLBACK");
    throw error;
  }
}

async function redeem(partnerUserId: string, rawCode: string): Promise<RedeemResult> {
  return redeemOn(client, partnerUserId, rawCode);
}

async function activeConnectionCount(ownerUserId: string): Promise<number> {
  const result = await client.query("SELECT COUNT(*)::int AS n FROM new_partner_connections WHERE owner_user_id = $1 AND status = 'active'", [ownerUserId]);
  return result.rows[0].n;
}

async function endConnection(ownerUserId: string): Promise<boolean> {
  const result = await client.query(
    `UPDATE new_partner_connections SET status = 'ended', ended_at = NOW() WHERE owner_user_id = $1 AND status = 'active'`,
    [ownerUserId],
  );
  return (result.rowCount ?? 0) > 0;
}

async function deleteUser(id: string): Promise<void> {
  await client.query("DELETE FROM new_users WHERE id = $1", [id]);
}

const suffix = Date.now();
const owner = await createUser(`wp004-owner-${suffix}@example.com`);
const partner = await createUser(`wp004-partner-${suffix}@example.com`);
const otherOwner = await createUser(`wp004-owner2-${suffix}@example.com`);
const otherPartner = await createUser(`wp004-partner2-${suffix}@example.com`);

try {
  console.log("\n== Code-Lebenszyklus: erzeugen, einmal einlösen, danach ablehnen ==");
  {
    const code = await createCode(owner, 10 * 60 * 1000);
    const first = await redeem(partner, code);
    assert(first.ok, "gültiger Code wird beim ersten Versuch eingelöst");
    const second = await redeem(partner, code);
    assert(!second.ok && second.reason === "invalid_or_expired", "derselbe Code kann kein zweites Mal eingelöst werden");
    await endConnection(owner);
  }

  console.log("\n== Abgelaufener Code wird abgelehnt ==");
  {
    const code = await createCode(owner, -1000);
    const result = await redeem(partner, code);
    assert(!result.ok && result.reason === "invalid_or_expired", "ein abgelaufener Code wird abgelehnt");
  }

  console.log("\n== Falscher Code wird abgelehnt ==");
  {
    const result = await redeem(partner, "NOTAREALCODE");
    assert(!result.ok && result.reason === "invalid_or_expired", "ein nicht existierender Code wird abgelehnt");
  }

  console.log("\n== Eigener Code kann nicht eingelöst werden ==");
  {
    const code = await createCode(owner, 10 * 60 * 1000);
    const result = await redeem(owner, code);
    assert(!result.ok && result.reason === "own_code", "der Owner kann den eigenen Code nicht einlösen");
  }

  console.log("\n== Kontotrennung: zwei verschiedene Paare bleiben unabhängig ==");
  {
    const codeA = await createCode(owner, 10 * 60 * 1000);
    const codeB = await createCode(otherOwner, 10 * 60 * 1000);
    const resultA = await redeem(partner, codeA);
    const resultB = await redeem(otherPartner, codeB);
    assert(resultA.ok && resultA.ownerUserId === owner, "Paar A verbindet sich korrekt mit Owner A");
    assert(resultB.ok && resultB.ownerUserId === otherOwner, "Paar B verbindet sich korrekt mit Owner B");
    assert((await activeConnectionCount(owner)) === 1, "Owner A hat genau eine aktive Verbindung");
    assert((await activeConnectionCount(otherOwner)) === 1, "Owner B hat genau eine aktive Verbindung");
    await endConnection(owner);
    await endConnection(otherOwner);
  }

  console.log("\n== Bestehende aktive Verbindung blockiert eine zweite ==");
  {
    const codeA = await createCode(owner, 10 * 60 * 1000);
    const first = await redeem(partner, codeA);
    assert(first.ok, "erste Verbindung wird hergestellt");

    const codeB = await createCode(owner, 10 * 60 * 1000);
    const second = await redeem(otherPartner, codeB);
    assert(!second.ok && second.reason === "owner_already_connected", "eine zweite Verbindung für denselben Owner wird abgelehnt, solange die erste aktiv ist");

    const ended = await endConnection(owner);
    assert(ended, "die aktive Verbindung kann bewusst beendet werden");
    assert((await activeConnectionCount(owner)) === 0, "nach dem Beenden gibt es keine aktive Verbindung mehr");

    const codeC = await createCode(owner, 10 * 60 * 1000);
    const third = await redeem(otherPartner, codeC);
    assert(third.ok, "nach dem Beenden kann eine neue Verbindung hergestellt werden");
    await endConnection(owner);
  }

  console.log("\n== Ein Partnerkonto kann nicht zwei Owner gleichzeitig verbunden sein ==");
  {
    const codeA = await createCode(owner, 10 * 60 * 1000);
    const first = await redeem(partner, codeA);
    assert(first.ok, "erste Verbindung des Partners wird hergestellt");

    const codeB = await createCode(otherOwner, 10 * 60 * 1000);
    const second = await redeem(partner, codeB);
    assert(!second.ok && second.reason === "partner_already_connected", "derselbe Partner kann sich nicht mit einem zweiten Owner verbinden, solange die erste Verbindung aktiv ist");
    await endConnection(owner);
  }

  console.log("\n== Parallele Einlöseversuche (zwei echte DB-Verbindungen): höchstens eine Verbindung entsteht ==");
  {
    const code = await createCode(owner, 10 * 60 * 1000);
    const clientA = new Client({ connectionString });
    const clientB = new Client({ connectionString });
    await clientA.connect();
    await clientB.connect();
    try {
      const [resultA, resultB] = await Promise.all([
        redeemOn(clientA, partner, code),
        redeemOn(clientB, otherPartner, code),
      ]);
      const successes = [resultA, resultB].filter((r) => r.ok);
      assert(successes.length === 1, "von zwei echten parallelen Einlöseversuchen desselben Codes gelingt genau einer");
      assert((await activeConnectionCount(owner)) === 1, "es entsteht genau eine aktive Verbindung, keine doppelte");
    } finally {
      await clientA.end();
      await clientB.end();
    }
    await endConnection(owner);
  }

  console.log("\n== Klartext-Code wird nicht in der Datenbank gespeichert ==");
  {
    const code = await createCode(owner, 10 * 60 * 1000);
    const row = await client.query("SELECT code_hash FROM new_partner_connection_codes WHERE owner_user_id = $1 ORDER BY created_at DESC LIMIT 1", [owner]);
    const storedHash = row.rows[0].code_hash as string;
    assert(storedHash !== code, "die gespeicherte Spalte enthält nicht den Klartext-Code");
    assert(storedHash === sha256(code), "die gespeicherte Spalte enthält den erwarteten SHA-256-Hash des Codes");
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
