import { NextRequest, NextResponse } from "next/server";
import { getNewAuthSession, requestHasAllowedOrigin, consumeNewAuthRateLimit } from "@/lib/new-auth";
import { redeemPartnerCode } from "@/lib/new-partner";

const GENERIC_ERROR = "Dieser Code ist ungültig oder kann nicht eingelöst werden.";

export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }
  const session = await getNewAuthSession();
  if (!session) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });

  const rateLimitOk = await consumeNewAuthRateLimit(`partner-redeem:${session.userId}`);
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

  const result = await redeemPartnerCode(session.userId, rawCode.trim().toUpperCase());
  if (!result.ok) {
    // Deliberately generic: never reveal which failure reason applied, to
    // avoid leaking information about another account's state.
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
