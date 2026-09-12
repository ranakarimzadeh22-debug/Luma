import { config } from "dotenv";
config({ path: ".env.local" });

import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import pg from "pg";
import {
  resetNewLumaPassword,
  normalizeEmailForReset,
  validatePasswordForReset,
  ResetAbortedError,
} from "./reset-new-luma-password.mjs";

const { Pool } = pg;

let failures = 0;

function assert(condition: boolean, label: string): void {
  console.log(`${condition ? "OK  " : "FAIL"} ${label}`);
  if (!condition) failures += 1;
}

const connectionString = process.env.LUMA_CORE_DATABASE_URL;
if (!connectionString) throw new Error("LUMA_CORE_DATABASE_URL fehlt.");

const pool = new Pool({ connectionString, max: 3 });

async function createUser(email: string, password: string): Promise<string> {
  const id = randomUUID();
  const passwordHash = await bcrypt.hash(password, 12);
  await pool.query("INSERT INTO new_users (id, email, password_hash) VALUES ($1, $2, $3)", [id, email, passwordHash]);
  return id;
}

async function createSession(userId: string): Promise<void> {
  await pool.query(
    "INSERT INTO new_sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, NOW() + interval '1 day')",
    [randomUUID(), userId, randomUUID()],
  );
}

async function sessionCount(userId: string): Promise<number> {
  const result = await pool.query("SELECT COUNT(*)::int AS n FROM new_sessions WHERE user_id = $1", [userId]);
  return result.rows[0].n;
}

async function passwordHashOf(userId: string): Promise<string> {
  const result = await pool.query("SELECT password_hash FROM new_users WHERE id = $1", [userId]);
  return result.rows[0].password_hash;
}

async function deleteUser(id: string): Promise<void> {
  await pool.query("DELETE FROM new_users WHERE id = $1", [id]);
}

const suffix = Date.now();
const email = `wp005-v2-reset-${suffix}@example.com`;
const oldPassword = "OldPass123!";
const newPassword = "NewSecurePass456!";
const userId = await createUser(email, oldPassword);
await createSession(userId);
await createSession(userId);

try {
  console.log("== Reine Validierungsfunktionen ==");
  {
    assert(normalizeEmailForReset("  Test@Example.COM ") === "test@example.com", "E-Mail wird normalisiert (trim + lowercase)");
    assert(normalizeEmailForReset("ungueltig") === null, "ungültiges E-Mail-Format wird abgelehnt");
    assert(validatePasswordForReset("1234567") === null, "zu kurzes Passwort wird abgelehnt");
    assert(validatePasswordForReset("gültiges-passwort") === "gültiges-passwort", "gültiges Passwort wird akzeptiert");
  }

  console.log("\n== Unbekannte E-Mail ändert nichts ==");
  {
    const before = await passwordHashOf(userId);
    let threw = false;
    try {
      await resetNewLumaPassword(pool, {
        email: `unbekannt-${suffix}@example.com`,
        confirmationEmail: `unbekannt-${suffix}@example.com`,
        newPassword,
      });
    } catch (error) {
      threw = error instanceof ResetAbortedError;
    }
    assert(threw, "unbekannte E-Mail wird mit ResetAbortedError abgelehnt");
    assert((await passwordHashOf(userId)) === before, "Passwort-Hash bleibt unverändert");
    assert((await sessionCount(userId)) === 2, "Sitzungen bleiben unverändert (2)");
  }

  console.log("\n== Abweichende Bestätigungs-E-Mail bricht ab, ändert nichts ==");
  {
    const before = await passwordHashOf(userId);
    let threw = false;
    try {
      await resetNewLumaPassword(pool, {
        email,
        confirmationEmail: `anders-${suffix}@example.com`,
        newPassword,
      });
    } catch (error) {
      threw = error instanceof ResetAbortedError;
    }
    assert(threw, "abweichende Bestätigung wird abgelehnt");
    assert((await passwordHashOf(userId)) === before, "Passwort-Hash bleibt unverändert");
    assert((await sessionCount(userId)) === 2, "Sitzungen bleiben unverändert (2)");
  }

  console.log("\n== Ungültiges (zu kurzes) Passwort bricht ab, ändert nichts ==");
  {
    const before = await passwordHashOf(userId);
    let threw = false;
    try {
      await resetNewLumaPassword(pool, { email, confirmationEmail: email, newPassword: "kurz" });
    } catch (error) {
      threw = error instanceof ResetAbortedError;
    }
    assert(threw, "zu kurzes Passwort wird abgelehnt");
    assert((await passwordHashOf(userId)) === before, "Passwort-Hash bleibt unverändert");
    assert((await sessionCount(userId)) === 2, "Sitzungen bleiben unverändert (2)");
  }

  console.log("\n== Gültiger Reset: Passwort ändert sich, alte Sitzungen werden widerrufen ==");
  {
    const result = await resetNewLumaPassword(pool, { email, confirmationEmail: email, newPassword });
    assert(result.revokedSessions === 2, "genau 2 alte Sitzungen wurden widerrufen");

    const newHash = await passwordHashOf(userId);
    assert(await bcrypt.compare(newPassword, newHash), "neues Passwort stimmt mit dem gespeicherten Hash überein");
    assert(!(await bcrypt.compare(oldPassword, newHash)), "altes Passwort funktioniert nicht mehr");
    assert(/^\$2[aby]\$12\$/.test(newHash), "Hash verwendet bcrypt-Kostenfaktor 12 wie new-auth.ts");
    assert((await sessionCount(userId)) === 0, "keine Sitzungen des Kontos sind mehr vorhanden");
  }

  console.log("\n== Zweiter Reset direkt danach funktioniert unabhängig erneut ==");
  {
    const secondPassword = "AnotherPass789!";
    const result = await resetNewLumaPassword(pool, { email, confirmationEmail: email, newPassword: secondPassword });
    assert(result.revokedSessions === 0, "keine Sitzungen vorhanden, also 0 widerrufen (kein Fehler)");
    const newHash = await passwordHashOf(userId);
    assert(await bcrypt.compare(secondPassword, newHash), "zweites neues Passwort wurde übernommen");
  }
} finally {
  await deleteUser(userId);
  await pool.end();
}

console.log(`\n${failures === 0 ? "ALLE PRÜFUNGEN BESTANDEN" : `${failures} PRÜFUNG(EN) FEHLGESCHLAGEN`}`);
process.exit(failures === 0 ? 0 : 1);
