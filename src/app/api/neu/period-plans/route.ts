import { NextRequest, NextResponse } from "next/server";
import { getNewAuthSession, requestHasAllowedOrigin } from "@/lib/new-auth";
import { createNewPeriodPlan, getNewPeriodPlans } from "@/lib/new-period-plans";
import { validateNewPeriodPlanInput } from "@/lib/new-period-plan-validation";

export async function GET() {
  const session = await getNewAuthSession();
  if (!session) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });
  return NextResponse.json({ entries: await getNewPeriodPlans(session.userId) });
}

export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }
  const session = await getNewAuthSession();
  if (!session) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });

  const input = validateNewPeriodPlanInput(await request.json().catch(() => null));
  if (!input.ok) return NextResponse.json({ error: input.message }, { status: 400 });
  const result = await createNewPeriodPlan(session.userId, input.value);
  if (!result.ok) return NextResponse.json({ error: "Die Planung konnte nicht gespeichert werden." }, { status: 500 });
  return NextResponse.json({ entry: result.entry }, { status: 201 });
}
