import { NextRequest, NextResponse } from "next/server";
import { getNewAuthSession, requestHasAllowedOrigin } from "@/lib/new-auth";
import { savePartnerNotificationPreference } from "@/lib/new-partner-notification-preference";

export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }
  const session = await getNewAuthSession();
  if (!session) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const wantsNotifications = body && typeof body === "object" ? (body as Record<string, unknown>).wantsNotifications : null;
  if (typeof wantsNotifications !== "boolean") {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const result = await savePartnerNotificationPreference(session.userId, wantsNotifications);
  if (!result.ok) {
    return NextResponse.json({ error: "Keine aktive Partnerverbindung." }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
