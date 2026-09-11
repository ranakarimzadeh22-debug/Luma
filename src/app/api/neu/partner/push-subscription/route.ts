import { NextRequest, NextResponse } from "next/server";
import { getNewAuthSession, requestHasAllowedOrigin, consumeNewAuthRateLimit } from "@/lib/new-auth";
import { getPartnerConnectionStatusForPartner } from "@/lib/new-partner";
import { parsePushSubscription, savePartnerPushSubscription, removePartnerPushSubscription } from "@/lib/new-partner-push";

export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }
  const session = await getNewAuthSession();
  if (!session) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });

  const rateLimitOk = await consumeNewAuthRateLimit(`partner-push-subscribe:${session.userId}`);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte warte 15 Minuten und versuche es erneut." },
      { status: 429 },
    );
  }

  const status = await getPartnerConnectionStatusForPartner(session.userId);
  if (!status.connected) {
    return NextResponse.json({ error: "Keine aktive Partnerverbindung." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const subscription = parsePushSubscription(body);
  if (!subscription) {
    return NextResponse.json({ error: "Ungültige Benachrichtigungsanmeldung." }, { status: 400 });
  }

  await savePartnerPushSubscription(session.userId, subscription);
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }
  const session = await getNewAuthSession();
  if (!session) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const endpoint = body && typeof body === "object" ? (body as Record<string, unknown>).endpoint : null;
  if (typeof endpoint !== "string" || !endpoint) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  await removePartnerPushSubscription(session.userId, endpoint);
  return NextResponse.json({ ok: true });
}
