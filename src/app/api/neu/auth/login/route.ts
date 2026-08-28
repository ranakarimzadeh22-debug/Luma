import { NextRequest, NextResponse } from "next/server";
import {
  clearNewAuthRateLimit,
  consumeNewAuthRateLimit,
  getRequestFingerprint,
  loginNewAuthUser,
  requestHasAllowedOrigin,
  setNewAuthSessionCookie,
} from "@/lib/new-auth";
import { validateNewLoginInput } from "@/lib/new-auth-validation";

export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const input = validateNewLoginInput(body);
  if (!input.ok) {
    return NextResponse.json({ error: input.message }, { status: 401 });
  }

  const rateLimitKey = getRequestFingerprint(request, `login:${input.email}`);
  if (!(await consumeNewAuthRateLimit(rateLimitKey))) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte warte 15 Minuten und versuche es erneut." },
      { status: 429 },
    );
  }

  try {
    const token = await loginNewAuthUser(input.email, input.password);
    if (!token) {
      return NextResponse.json({ error: "E-Mail oder Passwort ist falsch." }, { status: 401 });
    }

    await clearNewAuthRateLimit(rateLimitKey);
    const response = NextResponse.json({ ok: true });
    setNewAuthSessionCookie(response, token);
    return response;
  } catch {
    console.error("Neue Anmeldung fehlgeschlagen.");
    return NextResponse.json(
      { error: "Anmeldung ist gerade nicht möglich. Bitte versuche es später erneut." },
      { status: 500 },
    );
  }
}
