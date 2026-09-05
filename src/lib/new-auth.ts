import bcrypt from "bcryptjs";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLumaCorePool, withLumaCoreTransaction } from "@/lib/new-auth-db";

const SESSION_COOKIE = "luma_new_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 30;
const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

export class DuplicateNewAuthEmailError extends Error {}

export interface NewAuthSession {
  userId: string;
  email: string;
  firstName: string | null;
  periodHistoryOnboardingSkipped: boolean;
  expiresAt: Date;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function passwordHashLooksValid(value: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

export function getRequestFingerprint(request: NextRequest, email: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unknown";
  return sha256(`${address}|${email}`);
}

export function requestHasAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function consumeNewAuthRateLimit(key: string): Promise<boolean> {
  const result = await getLumaCorePool().query<{ attempts: number }>(
    `INSERT INTO new_auth_rate_limits (key_hash, attempts, window_started_at)
     VALUES ($1, 1, NOW())
     ON CONFLICT (key_hash) DO UPDATE
     SET attempts = CASE
           WHEN new_auth_rate_limits.window_started_at < NOW() - ($2 * INTERVAL '1 minute') THEN 1
           ELSE new_auth_rate_limits.attempts + 1
         END,
         window_started_at = CASE
           WHEN new_auth_rate_limits.window_started_at < NOW() - ($2 * INTERVAL '1 minute') THEN NOW()
           ELSE new_auth_rate_limits.window_started_at
         END
     RETURNING attempts`,
    [key, RATE_LIMIT_WINDOW_MINUTES],
  );

  return result.rows[0].attempts <= RATE_LIMIT_MAX_ATTEMPTS;
}

export async function clearNewAuthRateLimit(key: string): Promise<void> {
  await getLumaCorePool().query("DELETE FROM new_auth_rate_limits WHERE key_hash = $1", [key]);
}

function newSessionToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + SESSION_AGE_SECONDS * 1000),
  };
}

export async function registerNewAuthUser(
  firstName: string,
  email: string,
  password: string,
): Promise<string> {
  const passwordHash = await bcrypt.hash(password, 12);
  const session = newSessionToken();

  try {
    await withLumaCoreTransaction(async (client) => {
      const userId = randomUUID();
      await client.query(
        "INSERT INTO new_users (id, first_name, email, password_hash) VALUES ($1, $2, $3, $4)",
        [userId, firstName, email, passwordHash],
      );
      await client.query(
        "INSERT INTO new_sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)",
        [randomUUID(), userId, session.tokenHash, session.expiresAt],
      );
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      throw new DuplicateNewAuthEmailError();
    }
    throw error;
  }

  return session.token;
}

export async function loginNewAuthUser(
  email: string,
  password: string,
): Promise<string | null> {
  const result = await getLumaCorePool().query<{
    id: string;
    password_hash: string;
  }>("SELECT id, password_hash FROM new_users WHERE email = $1", [email]);
  const user = result.rows[0];

  const fallbackHash = "$2b$12$oL3kVA9RxRzWJjGvMT1l6.8C2yTQGxIOt9kH/Pcp5VBSHujXyCXSe";
  const hash = user && passwordHashLooksValid(user.password_hash) ? user.password_hash : fallbackHash;
  const valid = await bcrypt.compare(password, hash);
  if (!user || !valid) return null;

  const session = newSessionToken();
  await getLumaCorePool().query(
    "INSERT INTO new_sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)",
    [randomUUID(), user.id, session.tokenHash, session.expiresAt],
  );
  return session.token;
}

export function setNewAuthSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_AGE_SECONDS,
  });
}

export async function getNewAuthSession(): Promise<NewAuthSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const result = await getLumaCorePool().query<{
    user_id: string;
    email: string;
    first_name: string | null;
    period_history_onboarding_skipped: boolean;
    expires_at: Date;
  }>(
    `SELECT s.user_id, u.email, u.first_name, u.period_history_onboarding_skipped, s.expires_at
     FROM new_sessions s
     JOIN new_users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
    [sha256(token)],
  );
  const row = result.rows[0];
  if (!row) return null;

  return {
    userId: row.user_id,
    email: row.email,
    firstName: row.first_name,
    periodHistoryOnboardingSkipped: row.period_history_onboarding_skipped,
    expiresAt: row.expires_at,
  };
}

export async function setNewAuthPeriodHistoryOnboardingSkipped(userId: string): Promise<void> {
  await getLumaCorePool().query(
    `UPDATE new_users SET period_history_onboarding_skipped = TRUE, updated_at = NOW() WHERE id = $1`,
    [userId],
  );
}

export async function setNewAuthFirstName(userId: string, firstName: string): Promise<boolean> {
  const result = await getLumaCorePool().query(
    `UPDATE new_users
     SET first_name = $1, updated_at = NOW()
     WHERE id = $2 AND first_name IS NULL`,
    [firstName, userId],
  );
  return result.rowCount === 1;
}

export async function deleteNewAuthSession(token: string | undefined): Promise<void> {
  if (!token) return;
  await getLumaCorePool().query("DELETE FROM new_sessions WHERE token_hash = $1", [sha256(token)]);
}

export function clearNewAuthSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function getNewAuthSessionToken(request: NextRequest): string | undefined {
  return request.cookies.get(SESSION_COOKIE)?.value;
}
