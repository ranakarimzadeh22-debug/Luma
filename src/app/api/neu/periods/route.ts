import { NextRequest, NextResponse } from "next/server";
import { getNewAuthSession, requestHasAllowedOrigin } from "@/lib/new-auth";
import { createNewPeriodEntry, getNewPeriodEntries } from "@/lib/new-periods";
import { validateNewPeriodInput } from "@/lib/new-period-validation";

export async function GET() {
  const session = await getNewAuthSession();
  if (!session) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });
  return NextResponse.json({ entries: await getNewPeriodEntries(session.userId) });
}

export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }
  const session = await getNewAuthSession();
  if (!session) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });

  const input = validateNewPeriodInput(await request.json().catch(() => null));
  if (!input.ok) return NextResponse.json({ error: input.message }, { status: 400 });
  const result = await createNewPeriodEntry(session.userId, input.value);
  if (!result.ok) {
    return NextResponse.json(
      { error: "Dieser Zeitraum überschneidet sich mit einer bereits gespeicherten Periode." },
      { status: 409 },
    );
  }
  return NextResponse.json({ entry: result.entry }, { status: 201 });
}
