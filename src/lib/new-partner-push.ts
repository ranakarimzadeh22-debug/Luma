import "server-only";

import { randomUUID } from "node:crypto";
import webpush from "web-push";
import { getLumaCorePool } from "@/lib/new-auth-db";

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

function isValidSubscription(value: unknown): value is PushSubscriptionInput {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.endpoint !== "string" || !candidate.endpoint.startsWith("https://")) return false;
  if (!candidate.keys || typeof candidate.keys !== "object") return false;
  const keys = candidate.keys as Record<string, unknown>;
  return typeof keys.p256dh === "string" && keys.p256dh.length > 0 && typeof keys.auth === "string" && keys.auth.length > 0;
}

export function parsePushSubscription(body: unknown): PushSubscriptionInput | null {
  return isValidSubscription(body) ? body : null;
}

export async function savePartnerPushSubscription(
  partnerUserId: string,
  subscription: PushSubscriptionInput,
): Promise<void> {
  await getLumaCorePool().query(
    `INSERT INTO new_partner_push_subscriptions (id, partner_user_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (endpoint) DO UPDATE
     SET partner_user_id = EXCLUDED.partner_user_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth`,
    [randomUUID(), partnerUserId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth],
  );
}

export async function removePartnerPushSubscription(partnerUserId: string, endpoint: string): Promise<void> {
  await getLumaCorePool().query(
    "DELETE FROM new_partner_push_subscriptions WHERE partner_user_id = $1 AND endpoint = $2",
    [partnerUserId, endpoint],
  );
}

function vapidConfigured(): boolean {
  return Boolean(process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_SUBJECT);
}

function configureWebPush(): void {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT as string,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string,
  );
}

export type PartnerPeriodEventType = "period_started" | "period_ended";

const EVENT_MESSAGES: Record<PartnerPeriodEventType, string> = {
  period_started: "Die Periode deiner Partnerin hat heute begonnen.",
  period_ended: "Die Periode deiner Partnerin ist heute zu Ende.",
};

/**
 * Deduplicated, best-effort push dispatch for a real, newly-saved today
 * event. The UNIQUE constraint on new_partner_period_events(owner_user_id,
 * event_type, event_date) is the actual deduplication guarantee — the
 * INSERT either succeeds exactly once (this call proceeds to send) or
 * conflicts (this call is a no-op), safely across concurrent requests.
 * Never throws: a push failure must not affect the caller's period save.
 */
export async function dispatchPartnerPeriodEvent(
  ownerUserId: string,
  eventType: PartnerPeriodEventType,
  eventDate: string,
): Promise<void> {
  try {
    const inserted = await getLumaCorePool().query(
      `INSERT INTO new_partner_period_events (id, owner_user_id, event_type, event_date)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (owner_user_id, event_type, event_date) DO NOTHING
       RETURNING id`,
      [randomUUID(), ownerUserId, eventType, eventDate],
    );
    if (inserted.rowCount === 0) return;

    if (!vapidConfigured()) return;

    const activeConnection = await getLumaCorePool().query<{ partner_user_id: string }>(
      `SELECT partner_user_id FROM new_partner_connections WHERE owner_user_id = $1 AND status = 'active' LIMIT 1`,
      [ownerUserId],
    );
    const partnerUserId = activeConnection.rows[0]?.partner_user_id;
    if (!partnerUserId) return;

    const subscriptions = await getLumaCorePool().query<{ endpoint: string; p256dh: string; auth: string }>(
      `SELECT endpoint, p256dh, auth FROM new_partner_push_subscriptions WHERE partner_user_id = $1`,
      [partnerUserId],
    );
    if (subscriptions.rowCount === 0) return;

    configureWebPush();
    const payload = JSON.stringify({ title: "Luma", body: EVENT_MESSAGES[eventType] });

    await Promise.all(
      subscriptions.rows.map(async (row) => {
        try {
          await webpush.sendNotification(
            { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
            payload,
          );
        } catch (error) {
          const statusCode = (error as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await getLumaCorePool().query("DELETE FROM new_partner_push_subscriptions WHERE endpoint = $1", [row.endpoint]);
          }
        }
      }),
    );
  } catch {
    // Push dispatch is always best-effort; the caller's period save must
    // never fail or roll back because of a notification problem.
  }
}

export async function sendPartnerTestNotification(partnerUserId: string): Promise<boolean> {
  if (!vapidConfigured()) return false;

  const subscriptions = await getLumaCorePool().query<{ endpoint: string; p256dh: string; auth: string }>(
    `SELECT endpoint, p256dh, auth FROM new_partner_push_subscriptions WHERE partner_user_id = $1`,
    [partnerUserId],
  );
  if (subscriptions.rowCount === 0) return false;

  configureWebPush();
  const payload = JSON.stringify({ title: "Luma", body: "Luma-Benachrichtigungen sind aktiviert." });

  let sentAny = false;
  await Promise.all(
    subscriptions.rows.map(async (row) => {
      try {
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
          payload,
        );
        sentAny = true;
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await getLumaCorePool().query("DELETE FROM new_partner_push_subscriptions WHERE endpoint = $1", [row.endpoint]);
        }
      }
    }),
  );
  return sentAny;
}
