import { config } from "dotenv";
config({ path: ".env.local" });

import { createHash, randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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
  const user = await prisma.user.create({
    data: { email, passwordHash: "$2b$12$oL3kVA9RxRzWJjGvMT1l6.8C2yTQGxIOt9kH/Pcp5VBSHujXyCXSe" },
  });
  return user.id;
}

async function createCode(ownerUserId: string, expiresInMs: number): Promise<string> {
  const code = generateCode();
  await prisma.partnerConnectionCode.create({
    data: {
      id: randomUUID(),
      ownerUserId,
      codeHash: sha256(code),
      expiresAt: new Date(Date.now() + expiresInMs),
    },
  });
  return code;
}

type RedeemResult =
  | { ok: true; ownerUserId: string }
  | { ok: false; reason: "invalid_or_expired" | "own_code" | "owner_already_connected" | "partner_already_connected" };

// Spiegelt src/lib/partner-connections.ts wider (server-only, nicht direkt
// per Node importierbar) gegen einen zweiten eigenständigen PrismaClient,
// um echte parallele DB-Verbindungen für den Race-Test zu ermöglichen.
async function redeemOn(client: PrismaClient, partnerUserId: string, rawCode: string): Promise<RedeemResult> {
  const codeHash = sha256(rawCode);
  const now = new Date();
  return client.$transaction(async (tx) => {
    const codeRows = await tx.$queryRaw<{ id: string; owner_user_id: string }[]>`
      SELECT id, owner_user_id FROM partner_connection_codes
      WHERE code_hash = ${codeHash} AND consumed_at IS NULL AND expires_at > ${now}
      FOR UPDATE
    `;
    const code = codeRows[0];
    if (!code) return { ok: false, reason: "invalid_or_expired" as const };
    if (code.owner_user_id === partnerUserId) return { ok: false, reason: "own_code" as const };

    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${code.owner_user_id}, 1))`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${partnerUserId}, 2))`;

    const ownerActive = await tx.partnerConnection.findFirst({ where: { ownerUserId: code.owner_user_id, status: "active" } });
    if (ownerActive) return { ok: false, reason: "owner_already_connected" as const };
    const partnerActive = await tx.partnerConnection.findFirst({ where: { partnerUserId, status: "active" } });
    if (partnerActive) return { ok: false, reason: "partner_already_connected" as const };

    await tx.partnerConnectionCode.update({ where: { id: code.id }, data: { consumedAt: new Date() } });
    await tx.partnerConnection.create({
      data: { id: randomUUID(), ownerUserId: code.owner_user_id, partnerUserId, status: "active" },
    });
    return { ok: true, ownerUserId: code.owner_user_id };
  });
}

async function redeem(partnerUserId: string, rawCode: string): Promise<RedeemResult> {
  return redeemOn(prisma, partnerUserId, rawCode);
}

async function activeConnectionCount(ownerUserId: string): Promise<number> {
  return prisma.partnerConnection.count({ where: { ownerUserId, status: "active" } });
}

async function endConnection(ownerUserId: string): Promise<boolean> {
  const result = await prisma.partnerConnection.updateMany({
    where: { ownerUserId, status: "active" },
    data: { status: "ended", endedAt: new Date() },
  });
  return result.count > 0;
}

const suffix = Date.now();
const owner = await createUser(`wp004-old-owner-${suffix}@example.com`);
const partner = await createUser(`wp004-old-partner-${suffix}@example.com`);
const otherOwner = await createUser(`wp004-old-owner2-${suffix}@example.com`);
const otherPartner = await createUser(`wp004-old-partner2-${suffix}@example.com`);

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
    const adapterB = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    const prismaB = new PrismaClient({ adapter: adapterB });
    try {
      const [resultA, resultB] = await Promise.all([
        redeemOn(prisma, partner, code),
        redeemOn(prismaB, otherPartner, code),
      ]);
      const successes = [resultA, resultB].filter((r) => r.ok);
      assert(successes.length === 1, "von zwei echten parallelen Einlöseversuchen desselben Codes gelingt genau einer");
      assert((await activeConnectionCount(owner)) === 1, "es entsteht genau eine aktive Verbindung, keine doppelte");
    } finally {
      await prismaB.$disconnect();
    }
    await endConnection(owner);
  }

  console.log("\n== Klartext-Code wird nicht in der Datenbank gespeichert ==");
  {
    const code = await createCode(owner, 10 * 60 * 1000);
    const row = await prisma.partnerConnectionCode.findFirst({
      where: { ownerUserId: owner },
      orderBy: { createdAt: "desc" },
    });
    assert(row!.codeHash !== code, "die gespeicherte Spalte enthält nicht den Klartext-Code");
    assert(row!.codeHash === sha256(code), "die gespeicherte Spalte enthält den erwarteten SHA-256-Hash des Codes");
  }
} finally {
  await prisma.user.delete({ where: { id: owner } }).catch(() => {});
  await prisma.user.delete({ where: { id: partner } }).catch(() => {});
  await prisma.user.delete({ where: { id: otherOwner } }).catch(() => {});
  await prisma.user.delete({ where: { id: otherPartner } }).catch(() => {});
  await prisma.$disconnect();
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
