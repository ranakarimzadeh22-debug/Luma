import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requestHasAllowedOrigin } from "@/lib/request-origin";
import { consumePartnerRateLimit } from "@/lib/partner-rate-limit";
import { redeemPartnerConnectionCode } from "@/lib/partner-connections";

const GENERIC_ERROR = "Dieser Code ist ungültig oder kann nicht eingelöst werden.";

export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const rateLimitOk = await consumePartnerRateLimit(`partner-redeem:${session.user.id}`);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte warte 15 Minuten und versuche es erneut." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const rawCode = body && typeof body === "object" ? (body as Record<string, unknown>).code : null;
  if (typeof rawCode !== "string" || !rawCode.trim()) {
    return NextResponse.json({ error: "Bitte gib einen Verbindungscode ein." }, { status: 400 });
  }

  const result = await redeemPartnerConnectionCode(session.user.id, rawCode.trim().toUpperCase());
  if (!result.ok) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
