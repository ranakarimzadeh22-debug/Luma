import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getLumaCorePool, withLumaCoreTransaction } from "@/lib/new-auth-db";

const CODE_TTL_MINUTES = 10;
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LENGTH = 8;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Human-typeable code: uppercase letters/digits with visually ambiguous
 * characters (0/O, 1/I/L) removed. Generated with crypto randomness, never
 * derived from user or account data.
 */
function generateConnectionCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return code;
}

export type PartnerConnectionStatus =
  | { role: "owner"; connected: true; connectionId: string; connectedAt: Date }
  | { role: "owner"; connected: false }
  | { role: "partner"; connected: true; connectionId: string; connectedAt: Date }
  | { role: "partner"; connected: false };

export async function createOrRenewPartnerCode(ownerUserId: string): Promise<string> {
  const code = generateConnectionCode();
  const codeHash = sha256(code);
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  await getLumaCorePool().query(
    `INSERT INTO new_partner_connection_codes (id, owner_user_id, code_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [randomUUID(), ownerUserId, codeHash, expiresAt],
  );

  return code;
}

export type RedeemPartnerCodeResult =
  | { ok: true; ownerUserId: string }
  | { ok: false; reason: "invalid_or_expired" | "own_code" | "owner_already_connected" | "partner_already_connected" };

/**
 * Atomically redeems a connection code. All checks (expiry, single use,
 * self-redemption, existing active connections on either side) happen
 * inside one row-locked transaction so two concurrent redemptions of the
 * same code, or two codes racing to connect the same owner, can never both
 * succeed.
 */
export async function redeemPartnerCode(
  partnerUserId: string,
  rawCode: string,
): Promise<RedeemPartnerCodeResult> {
  const codeHash = sha256(rawCode);

  return withLumaCoreTransaction(async (client) => {
    const codeRow = await client.query<{ id: string; owner_user_id: string }>(
      `SELECT id, owner_user_id
       FROM new_partner_connection_codes
       WHERE code_hash = $1 AND consumed_at IS NULL AND expires_at > NOW()
       FOR UPDATE`,
      [codeHash],
    );
    const code = codeRow.rows[0];
    if (!code) return { ok: false, reason: "invalid_or_expired" };

    if (code.owner_user_id === partnerUserId) {
      return { ok: false, reason: "own_code" };
    }

    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 1))", [code.owner_user_id]);
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 2))", [partnerUserId]);

    const ownerActive = await client.query(
      `SELECT 1 FROM new_partner_connections WHERE owner_user_id = $1 AND status = 'active' LIMIT 1`,
      [code.owner_user_id],
    );
    if (ownerActive.rowCount) return { ok: false, reason: "owner_already_connected" };

    const partnerActive = await client.query(
      `SELECT 1 FROM new_partner_connections WHERE partner_user_id = $1 AND status = 'active' LIMIT 1`,
      [partnerUserId],
    );
    if (partnerActive.rowCount) return { ok: false, reason: "partner_already_connected" };

    await client.query(
      `UPDATE new_partner_connection_codes SET consumed_at = NOW() WHERE id = $1`,
      [code.id],
    );
    await client.query(
      `INSERT INTO new_partner_connections (id, owner_user_id, partner_user_id, status)
       VALUES ($1, $2, $3, 'active')`,
      [randomUUID(), code.owner_user_id, partnerUserId],
    );

    return { ok: true, ownerUserId: code.owner_user_id };
  });
}

export async function getPartnerConnectionStatusForOwner(ownerUserId: string): Promise<PartnerConnectionStatus> {
  const result = await getLumaCorePool().query<{ id: string; created_at: Date }>(
    `SELECT id, created_at FROM new_partner_connections WHERE owner_user_id = $1 AND status = 'active' LIMIT 1`,
    [ownerUserId],
  );
  const row = result.rows[0];
  if (!row) return { role: "owner", connected: false };
  return { role: "owner", connected: true, connectionId: row.id, connectedAt: row.created_at };
}

export async function getPartnerConnectionStatusForPartner(partnerUserId: string): Promise<PartnerConnectionStatus> {
  const result = await getLumaCorePool().query<{ id: string; created_at: Date }>(
    `SELECT id, created_at FROM new_partner_connections WHERE partner_user_id = $1 AND status = 'active' LIMIT 1`,
    [partnerUserId],
  );
  const row = result.rows[0];
  if (!row) return { role: "partner", connected: false };
  return { role: "partner", connected: true, connectionId: row.id, connectedAt: row.created_at };
}

export async function endPartnerConnection(ownerUserId: string): Promise<boolean> {
  const result = await getLumaCorePool().query(
    `UPDATE new_partner_connections SET status = 'ended', ended_at = NOW() WHERE owner_user_id = $1 AND status = 'active'`,
    [ownerUserId],
  );
  return (result.rowCount ?? 0) > 0;
}
