import { NextRequest, NextResponse } from "next/server";
import { getNewAuthSession, requestHasAllowedOrigin, consumeNewAuthRateLimit } from "@/lib/new-auth";
import { getPartnerConnectionStatusForPartner } from "@/lib/new-partner";
import { sendPartnerTestNotification } from "@/lib/new-partner-push";

export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }
  const session = await getNewAuthSession();
  if (!session) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });

  const rateLimitOk = await consumeNewAuthRateLimit(`partner-push-test:${session.userId}`);
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

  const sent = await sendPartnerTestNotification(session.userId);
  return NextResponse.json({ ok: sent });
}
