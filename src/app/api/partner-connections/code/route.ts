import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requestHasAllowedOrigin } from "@/lib/request-origin";
import { consumePartnerRateLimit } from "@/lib/partner-rate-limit";
import { createOrRenewPartnerConnectionCode, getPartnerConnectionStatusForOwner } from "@/lib/partner-connections";

export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const rateLimitOk = await consumePartnerRateLimit(`partner-code:${session.user.id}`);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte warte 15 Minuten und versuche es erneut." },
      { status: 429 },
    );
  }

  const status = await getPartnerConnectionStatusForOwner(session.user.id);
  if (status.connected) {
    return NextResponse.json(
      { error: "Es besteht bereits eine aktive Partnerverbindung. Beende sie zuerst." },
      { status: 409 },
    );
  }

  const code = await createOrRenewPartnerConnectionCode(session.user.id);
  return NextResponse.json({ code, expiresInMinutes: 10 }, { status: 201 });
}
