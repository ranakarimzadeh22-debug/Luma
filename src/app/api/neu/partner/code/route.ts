import { NextRequest, NextResponse } from "next/server";
import { getNewAuthSession, requestHasAllowedOrigin, consumeNewAuthRateLimit } from "@/lib/new-auth";
import { createOrRenewPartnerCode, getPartnerConnectionStatusForOwner } from "@/lib/new-partner";

export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }
  const session = await getNewAuthSession();
  if (!session) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });

  const rateLimitOk = await consumeNewAuthRateLimit(`partner-code:${session.userId}`);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte warte 15 Minuten und versuche es erneut." },
      { status: 429 },
    );
  }

  const status = await getPartnerConnectionStatusForOwner(session.userId);
  if (status.connected) {
    return NextResponse.json(
      { error: "Es besteht bereits eine aktive Partnerverbindung. Beende sie zuerst." },
      { status: 409 },
    );
  }

  const code = await createOrRenewPartnerCode(session.userId);
  return NextResponse.json({ code, expiresInMinutes: 10 }, { status: 201 });
}
