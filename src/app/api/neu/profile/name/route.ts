import { NextRequest, NextResponse } from "next/server";
import {
  getNewAuthSession,
  requestHasAllowedOrigin,
  setNewAuthFirstName,
} from "@/lib/new-auth";
import { validateNewFirstNameInput } from "@/lib/new-auth-validation";

export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json(
      { error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." },
      { status: 403 },
    );
  }

  const session = await getNewAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const input = validateNewFirstNameInput(body);
  if (!input.ok) {
    return NextResponse.json({ error: input.message }, { status: 400 });
  }

  if (!(await setNewAuthFirstName(session.userId, input.firstName))) {
    return NextResponse.json(
      { error: "Der Vorname wurde bereits gespeichert." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
