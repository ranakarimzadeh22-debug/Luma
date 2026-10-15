import { NextRequest, NextResponse } from "next/server";
import { getNewAuthSession, requestHasAllowedOrigin } from "@/lib/new-auth";
import { getPmsSymptomDays, setPmsSymptomsForDay } from "@/lib/new-pms-symptoms";
import { validatePmsSymptomDayInput } from "@/lib/new-pms-symptom-validation";

export async function GET() {
  const session = await getNewAuthSession();
  if (!session) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });
  return NextResponse.json({ days: await getPmsSymptomDays(session.userId) });
}

export async function PUT(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }
  const session = await getNewAuthSession();
  if (!session) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });

  const input = validatePmsSymptomDayInput(await request.json().catch(() => null));
  if (!input.ok) return NextResponse.json({ error: input.message }, { status: 400 });

  const day = await setPmsSymptomsForDay(session.userId, input.value.date, input.value.symptoms);
  return NextResponse.json({ day });
}
