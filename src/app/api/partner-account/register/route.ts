import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requestHasAllowedOrigin } from "@/lib/request-origin";
import { consumePartnerRateLimit } from "@/lib/partner-rate-limit";

/**
 * Minimal account creation for the partner role: email + password only, no
 * cycle onboarding, no Profile row. A partner account must never carry the
 * owner's health/cycle data model.
 */
export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const email = body && typeof body === "object" ? (body as Record<string, unknown>).email : null;
  const password = body && typeof body === "object" ? (body as Record<string, unknown>).password : null;

  if (typeof email !== "string" || !email.includes("@") || email.length > 254) {
    return NextResponse.json({ error: "Ungültige E-Mail-Adresse." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "Passwort muss mindestens 8 Zeichen haben." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const rateLimitOk = await consumePartnerRateLimit(`partner-register:${normalizedEmail}`);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte warte 15 Minuten und versuche es erneut." },
      { status: 429 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "Diese E-Mail ist bereits registriert." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email: normalizedEmail, passwordHash },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
