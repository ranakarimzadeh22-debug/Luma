import "server-only";

import { getLumaCorePool } from "@/lib/new-auth-db";
import { getPartnerConnectionStatusForPartner } from "@/lib/new-partner";

export type NotificationPreference = "yes" | "no" | null;

/**
 * WP-004 Version 5: a purely informational yes/no choice, stored per
 * partner account. Never triggers a device permission prompt or any real
 * notification — see src/app/neu/partner/page.tsx and
 * NewPartnerNotificationPreference.tsx for the UI, which intentionally has
 * no calls to Notification.requestPermission or PushManager.subscribe.
 */
export async function getPartnerNotificationPreference(partnerUserId: string): Promise<NotificationPreference> {
  const result = await getLumaCorePool().query<{ wants_notifications: boolean }>(
    "SELECT wants_notifications FROM new_partner_notification_preferences WHERE partner_user_id = $1",
    [partnerUserId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return row.wants_notifications ? "yes" : "no";
}

export type SavePreferenceResult = { ok: true } | { ok: false; reason: "not_connected" };

export async function savePartnerNotificationPreference(
  partnerUserId: string,
  wantsNotifications: boolean,
): Promise<SavePreferenceResult> {
  const status = await getPartnerConnectionStatusForPartner(partnerUserId);
  if (!status.connected) return { ok: false, reason: "not_connected" };

  await getLumaCorePool().query(
    `INSERT INTO new_partner_notification_preferences (partner_user_id, wants_notifications)
     VALUES ($1, $2)
     ON CONFLICT (partner_user_id) DO UPDATE SET wants_notifications = EXCLUDED.wants_notifications`,
    [partnerUserId, wantsNotifications],
  );
  return { ok: true };
}
