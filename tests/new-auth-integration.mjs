import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import pg from "pg";

const { Client } = pg;
const baseUrl = process.env.NEW_AUTH_TEST_BASE_URL || "http://localhost:3010";
const connectionString = process.env.LUMA_CORE_DATABASE_URL;
if (!connectionString) throw new Error("LUMA_CORE_DATABASE_URL fehlt für den Integrationstest.");

const email = `new-auth-${randomUUID()}@example.test`;
const password = "Test-passwort-123";
const rateLimitEmail = `rate-limit-${randomUUID()}@example.test`;

function cookieFrom(response) {
  const value = response.headers.get("set-cookie");
  return value ? value.split(";", 1)[0] : "";
}

async function post(path, body, cookie = "") {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: baseUrl,
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
    redirect: "manual",
  });
}

const database = new Client({ connectionString });
await database.connect();

try {
  const landing = await fetch(`${baseUrl}/neu`);
  assert.equal(landing.status, 200);
  assert.match(await landing.text(), /Neues Konto erstellen/);

  const registration = await post("/api/neu/auth/register", {
    email,
    password,
    passwordConfirmation: password,
  });
  assert.equal(registration.status, 201);
  const setCookie = registration.headers.get("set-cookie") || "";
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Lax/i);
  const registrationCookie = cookieFrom(registration);
  assert.match(registrationCookie, /^luma_new_session=/);

  const storedUser = await database.query(
    "SELECT password_hash FROM new_users WHERE email = $1",
    [email],
  );
  assert.equal(storedUser.rowCount, 1);
  assert.notEqual(storedUser.rows[0].password_hash, password);
  assert.match(storedUser.rows[0].password_hash, /^\$2[aby]\$12\$/);

  const protectedPage = await fetch(`${baseUrl}/neu`, {
    headers: { cookie: registrationCookie },
  });
  assert.equal(protectedPage.status, 200);
  const protectedHtml = await protectedPage.text();
  assert.match(protectedHtml, /Sicher angemeldet/);
  assert.match(protectedHtml, new RegExp(email));

  const duplicate = await post("/api/neu/auth/register", {
    email,
    password,
    passwordConfirmation: password,
  });
  assert.equal(duplicate.status, 409);

  const mismatch = await post("/api/neu/auth/register", {
    email: `mismatch-${email}`,
    password,
    passwordConfirmation: "anderes-passwort",
  });
  assert.equal(mismatch.status, 400);

  const logout = await post("/api/neu/auth/logout", {}, registrationCookie);
  assert.equal(logout.status, 200);

  const loggedOutPage = await fetch(`${baseUrl}/neu`);
  assert.equal(loggedOutPage.status, 200);
  assert.doesNotMatch(await loggedOutPage.text(), new RegExp(email));

  const wrongPassword = await post("/api/neu/auth/login", {
    email,
    password: "Falsches-passwort-123",
  });
  assert.equal(wrongPassword.status, 401);

  const login = await post("/api/neu/auth/login", { email, password });
  assert.equal(login.status, 200);
  const loginCookie = cookieFrom(login);
  assert.match(loginCookie, /^luma_new_session=/);

  const oldLogin = await fetch(`${baseUrl}/login`);
  const oldRegistration = await fetch(`${baseUrl}/register`);
  assert.equal(oldLogin.status, 200);
  assert.equal(oldRegistration.status, 200);

  const missingOrigin = await fetch(`${baseUrl}/api/neu/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(missingOrigin.status, 403);

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const failed = await post("/api/neu/auth/login", {
      email: rateLimitEmail,
      password,
    });
    assert.equal(failed.status, 401);
  }
  const limited = await post("/api/neu/auth/login", {
    email: rateLimitEmail,
    password,
  });
  assert.equal(limited.status, 429);

  console.log("OK: Registrierung, Sitzung, Abmeldung, Fehlerfälle und alte Auth-Routen geprüft.");
} finally {
  await database.query("DELETE FROM new_users WHERE email = $1", [email]);
  const rateLimitKeys = [
    `unknown|register:${email}`,
    `unknown|login:${email}`,
    `unknown|login:${rateLimitEmail}`,
  ].map((value) => createHash("sha256").update(value).digest("hex"));
  await database.query(
    "DELETE FROM new_auth_rate_limits WHERE key_hash::text = ANY($1::text[])",
    [rateLimitKeys],
  );
  await database.end();
}
