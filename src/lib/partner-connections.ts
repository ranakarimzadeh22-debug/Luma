import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";

const CODE_TTL_MINUTES = 10;
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LENGTH = 8;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

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

export async function createOrRenewPartnerConnectionCode(ownerUserId: string): Promise<string> {
  const code = generateConnectionCode();
  const codeHash = sha256(code);
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  await prisma.partnerConnectionCode.create({
    data: { id: randomUUID(), ownerUserId, codeHash, expiresAt },
  });

  return code;
}

export type RedeemPartnerConnectionCodeResult =
  | { ok: true; ownerUserId: string }
  | { ok: false; reason: "invalid_or_expired" | "own_code" | "owner_already_connected" | "partner_already_connected" };

/**
 * Atomically redeems a connection code. All checks (expiry, single use,
 * self-redemption, existing active connections on either side) happen
 * inside one serializable transaction with row locks so two concurrent
 * redemptions of the same code, or two codes racing to connect the same
 * owner, can never both succeed.
 */
export async function redeemPartnerConnectionCode(
  partnerUserId: string,
  rawCode: string,
): Promise<RedeemPartnerConnectionCodeResult> {
  const codeHash = sha256(rawCode);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    // Compares against a JS-computed timestamp rather than SQL NOW(): the
    // pg driver session timezone (Europe/Berlin) otherwise shifts NOW()'s
    // apparent instant by the DST offset relative to the UTC value Prisma
    // writes for expiresAt, silently treating every code as expired.
    const codeRows = await tx.$queryRaw<{ id: string; owner_user_id: string }[]>`
      SELECT id, owner_user_id FROM partner_connection_codes
      WHERE code_hash = ${codeHash} AND consumed_at IS NULL AND expires_at > ${now}
      FOR UPDATE
    `;
    const code = codeRows[0];
    if (!code) return { ok: false, reason: "invalid_or_expired" as const };

    if (code.owner_user_id === partnerUserId) {
      return { ok: false, reason: "own_code" as const };
    }

    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${code.owner_user_id}, 1))`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${partnerUserId}, 2))`;

    const ownerActive = await tx.partnerConnection.findFirst({
      where: { ownerUserId: code.owner_user_id, status: "active" },
    });
    if (ownerActive) return { ok: false, reason: "owner_already_connected" as const };

    const partnerActive = await tx.partnerConnection.findFirst({
      where: { partnerUserId, status: "active" },
    });
    if (partnerActive) return { ok: false, reason: "partner_already_connected" as const };

    await tx.partnerConnectionCode.update({
      where: { id: code.id },
      data: { consumedAt: new Date() },
    });
    await tx.partnerConnection.create({
      data: {
        id: randomUUID(),
        ownerUserId: code.owner_user_id,
        partnerUserId,
        status: "active",
      },
    });

    return { ok: true, ownerUserId: code.owner_user_id };
  });
}

export async function getPartnerConnectionStatusForOwner(ownerUserId: string): Promise<PartnerConnectionStatus> {
  const connection = await prisma.partnerConnection.findFirst({
    where: { ownerUserId, status: "active" },
  });
  if (!connection) return { role: "owner", connected: false };
  return { role: "owner", connected: true, connectionId: connection.id, connectedAt: connection.createdAt };
}

export async function getPartnerConnectionStatusForPartner(partnerUserId: string): Promise<PartnerConnectionStatus> {
  const connection = await prisma.partnerConnection.findFirst({
    where: { partnerUserId, status: "active" },
  });
  if (!connection) return { role: "partner", connected: false };
  return { role: "partner", connected: true, connectionId: connection.id, connectedAt: connection.createdAt };
}

export async function endPartnerConnection(ownerUserId: string): Promise<boolean> {
  const result = await prisma.partnerConnection.updateMany({
    where: { ownerUserId, status: "active" },
    data: { status: "ended", endedAt: new Date() },
  });
  return result.count > 0;
}
