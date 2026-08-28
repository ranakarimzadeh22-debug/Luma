import { NextRequest, NextResponse } from "next/server";
import {
  consumeNewAuthRateLimit,
  DuplicateNewAuthEmailError,
  getRequestFingerprint,
  registerNewAuthUser,
  requestHasAllowedOrigin,
  setNewAuthSessionCookie,
} from "@/lib/new-auth";
import { validateNewRegistrationInput } from "@/lib/new-auth-validation";

export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const input = validateNewRegistrationInput(body);
  if (!input.ok) {
    return NextResponse.json({ error: input.message }, { status: 400 });
  }

  const rateLimitKey = getRequestFingerprint(request, `register:${input.email}`);
  if (!(await consumeNewAuthRateLimit(rateLimitKey))) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte warte 15 Minuten und versuche es erneut." },
      { status: 429 },
    );
  }

  try {
    const token = await registerNewAuthUser(input.email, input.password);
    const response = NextResponse.json({ ok: true }, { status: 201 });
    setNewAuthSessionCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof DuplicateNewAuthEmailError) {
      return NextResponse.json(
        { error: "Diese E-Mail-Adresse wird bereits verwendet." },
        { status: 409 },
      );
    }
    console.error("Neue Registrierung fehlgeschlagen.");
    return NextResponse.json(
      { error: "Registrierung ist gerade nicht möglich. Bitte versuche es später erneut." },
      { status: 500 },
    );
  }
}
