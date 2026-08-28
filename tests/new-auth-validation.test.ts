import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeNewAuthEmail,
  validateNewLoginInput,
  validateNewRegistrationInput,
// Node's built-in TypeScript test runner needs the explicit extension.
// @ts-expect-error TS5097: noEmit is used; the runtime requires the .ts suffix here.
} from "../src/lib/new-auth-validation.ts";

test("normalisiert eine gültige E-Mail-Adresse", () => {
  assert.equal(normalizeNewAuthEmail("  USER@Example.DE "), "user@example.de");
});

test("akzeptiert eine vollständige Registrierung", () => {
  const result = validateNewRegistrationInput({
    email: "neu@example.de",
    password: "sicher123",
    passwordConfirmation: "sicher123",
  });
  assert.deepEqual(result, { ok: true, email: "neu@example.de", password: "sicher123" });
});

test("weist ungleiche Passwörter zurück", () => {
  const result = validateNewRegistrationInput({
    email: "neu@example.de",
    password: "sicher123",
    passwordConfirmation: "anders123",
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.message, "Die Passwörter stimmen nicht überein.");
});

test("weist ungültige Registrierung und Anmeldung zurück", () => {
  assert.equal(validateNewRegistrationInput({ email: "falsch", password: "kurz" }).ok, false);
  assert.equal(validateNewLoginInput({ email: "falsch", password: "kurz" }).ok, false);
});
