#!/usr/bin/env node
// WP-005 Version 2: nicht öffentliches Notfall-Skript für die NEUE Luma.
//
// Setzt das Passwort genau eines bestehenden new_users-Kontos neu und
// widerruft alle new_sessions dieses Kontos. Nur für einen autorisierten
// Notfall-Reset durch die Ownerin im eigenen geschützten Server-Terminal.
// Keine öffentliche Route, kein E-Mail-Versand, kein Produktions-Autolauf.
//
// Aufruf: node scripts/reset-new-luma-password.mjs
// Voraussetzung: LUMA_CORE_DATABASE_URL zeigt auf die Datenbank luma_core.
// E-Mail und neues Passwort werden ausschließlich interaktiv im Terminal
// abgefragt — niemals als Argument, Umgebungsvariable oder Log-Ausgabe.

import bcrypt from "bcryptjs";
import pg from "pg";
import readline from "node:readline";

const { Pool } = pg;

const NEW_AUTH_PASSWORD_MIN_LENGTH = 8;
const NEW_AUTH_PASSWORD_MAX_LENGTH = 128;
const BCRYPT_COST_FACTOR = 12;

const CHAR_CODE_ETX = 3;
const CHAR_CODE_BACKSPACE = 8;
const CHAR_CODE_LF = 10;
const CHAR_CODE_CR = 13;
const CHAR_CODE_DEL = 127;

export function normalizeEmailForReset(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length === 0 || email.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function validatePasswordForReset(value) {
  if (typeof value !== "string") return null;
  if (value.length < NEW_AUTH_PASSWORD_MIN_LENGTH || value.length > NEW_AUTH_PASSWORD_MAX_LENGTH) {
    return null;
  }
  return value;
}

function maskEmail(email) {
  const [local, domain] = email.split("@");
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(local.length - visible.length, 1))}@${domain}`;
}

export class ResetAbortedError extends Error {}

/**
 * Kernoperation, getrennt vom Terminal-I/O, damit sie ohne echte
 * Tastatureingabe automatisiert geprüft werden kann. `pool` ist bewusst
 * injizierbar für Tests gegen eine echte lokale Testdatenbank.
 */
export async function resetNewLumaPassword(pool, { email, confirmationEmail, newPassword }) {
  const normalizedEmail = normalizeEmailForReset(email);
  const normalizedConfirmation = normalizeEmailForReset(confirmationEmail);
  const password = validatePasswordForReset(newPassword);

  if (!normalizedEmail) throw new ResetAbortedError("Ungültige E-Mail-Adresse.");
  if (normalizedConfirmation !== normalizedEmail) {
    throw new ResetAbortedError("Bestätigung stimmt nicht mit der eingegebenen E-Mail überein.");
  }
  if (!password) {
    throw new ResetAbortedError(
      `Das Passwort muss ${NEW_AUTH_PASSWORD_MIN_LENGTH} bis ${NEW_AUTH_PASSWORD_MAX_LENGTH} Zeichen haben.`,
    );
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST_FACTOR);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      "SELECT id FROM new_users WHERE email = $1 FOR UPDATE",
      [normalizedEmail],
    );
    if (userResult.rowCount !== 1) {
      await client.query("ROLLBACK");
      throw new ResetAbortedError("Kein eindeutiges Konto für diese E-Mail-Adresse gefunden.");
    }
    const userId = userResult.rows[0].id;

    await client.query(
      "UPDATE new_users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [passwordHash, userId],
    );
    const sessionResult = await client.query("DELETE FROM new_sessions WHERE user_id = $1", [userId]);

    await client.query("COMMIT");
    return { revokedSessions: sessionResult.rowCount ?? 0 };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

function askVisible(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer);
  }));
}

function askMasked(question) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
      reject(new Error(
        "Keine sichere maskierte Eingabe in diesem Terminal möglich (kein interaktives TTY). Abbruch ohne Änderung.",
      ));
      return;
    }

    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    let value = "";
    const onData = (char) => {
      const code = char.charCodeAt(0);
      if (code === CHAR_CODE_ETX) {
        cleanup();
        reject(new Error("Abgebrochen (Strg+C)."));
        return;
      }
      if (code === CHAR_CODE_CR || code === CHAR_CODE_LF) {
        cleanup();
        process.stdout.write("\n");
        resolve(value);
        return;
      }
      if (code === CHAR_CODE_BACKSPACE || code === CHAR_CODE_DEL) {
        value = value.slice(0, -1);
        return;
      }
      value += char;
    };
    const cleanup = () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.removeListener("data", onData);
    };
    process.stdin.on("data", onData);
  });
}

async function main() {
  console.log("WP-005 Version 2 — Notfall-Passwort-Reset (nur neue Luma, nicht öffentlich).");
  console.log("Dieses Skript ändert genau ein Konto und beendet alle seine Sitzungen.\n");

  const connectionString = process.env.LUMA_CORE_DATABASE_URL;
  if (!connectionString) {
    console.error("Abbruch: LUMA_CORE_DATABASE_URL ist nicht gesetzt.");
    process.exitCode = 1;
    return;
  }
  let databaseName;
  try {
    databaseName = new URL(connectionString).pathname.replace(/^\//, "");
  } catch {
    console.error("Abbruch: LUMA_CORE_DATABASE_URL ist ungültig.");
    process.exitCode = 1;
    return;
  }
  if (databaseName !== "luma_core") {
    console.error("Abbruch: LUMA_CORE_DATABASE_URL muss auf die Datenbank luma_core zeigen.");
    process.exitCode = 1;
    return;
  }

  const email = await askVisible("E-Mail-Adresse des Kontos: ");
  const normalizedEmail = normalizeEmailForReset(email);
  if (!normalizedEmail) {
    console.error("Abbruch: ungültige E-Mail-Adresse.");
    process.exitCode = 1;
    return;
  }

  console.log(`Ziel-Konto: ${maskEmail(normalizedEmail)}`);
  const confirmation = await askVisible("Zur Bestätigung dieselbe E-Mail-Adresse erneut eingeben: ");

  let newPassword;
  let repeatPassword;
  try {
    newPassword = await askMasked("Neues Passwort (wird nicht angezeigt): ");
    repeatPassword = await askMasked("Neues Passwort wiederholen: ");
  } catch (error) {
    console.error(`Abbruch: ${error instanceof Error ? error.message : "Eingabe fehlgeschlagen."}`);
    process.exitCode = 1;
    return;
  }

  if (newPassword !== repeatPassword) {
    console.error("Abbruch: die beiden Passwort-Eingaben stimmen nicht überein.");
    process.exitCode = 1;
    return;
  }

  const pool = new Pool({ connectionString, max: 1 });
  try {
    const identity = await pool.query("SELECT current_database() AS database");
    if (identity.rows[0]?.database !== "luma_core") {
      console.error("Abbruch: verbundene Datenbank ist nicht luma_core.");
      process.exitCode = 1;
      return;
    }

    const result = await resetNewLumaPassword(pool, {
      email,
      confirmationEmail: confirmation,
      newPassword,
    });
    console.log(`\nErfolgreich. Sitzungen widerrufen: ${result.revokedSessions}.`);
    console.log("Das Konto kann sich jetzt mit dem neuen Passwort normal anmelden.");
  } catch (error) {
    if (error instanceof ResetAbortedError) {
      console.error(`Abbruch: ${error.message}`);
    } else {
      console.error("Abbruch: Datenbankfehler bei der Passwort-Änderung.");
    }
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`;
if (isMainModule) {
  main();
}
