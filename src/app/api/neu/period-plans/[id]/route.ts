import { NextRequest, NextResponse } from "next/server";
import { getNewAuthSession, requestHasAllowedOrigin } from "@/lib/new-auth";
import { deleteNewPeriodPlan, updateNewPeriodPlan } from "@/lib/new-period-plans";
import { isValidPeriodId } from "@/lib/new-period-validation";
import { validateNewPeriodPlanInput } from "@/lib/new-period-plan-validation";

async function authorizeMutation(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return { response: NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 }) };
  }
  const session = await getNewAuthSession();
  if (!session) {
    return { response: NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 }) };
  }
  return { session };
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await authorizeMutation(request);
  if ("response" in auth) return auth.response;
  const input = validateNewPeriodPlanInput(await request.json().catch(() => null));
  if (!input.ok) return NextResponse.json({ error: input.message }, { status: 400 });

  const { id } = await context.params;
  if (!isValidPeriodId(id)) {
    return NextResponse.json({ error: "Die Planung wurde nicht gefunden." }, { status: 404 });
  }
  const result = await updateNewPeriodPlan(auth.session.userId, id, input.value);
  if (!result.ok) return NextResponse.json({ error: "Die Planung wurde nicht gefunden." }, { status: 404 });
  return NextResponse.json({ entry: result.entry });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await authorizeMutation(request);
  if ("response" in auth) return auth.response;
  const { id } = await context.params;
  if (!isValidPeriodId(id)) {
    return NextResponse.json({ error: "Die Planung wurde nicht gefunden." }, { status: 404 });
  }
  const deleted = await deleteNewPeriodPlan(auth.session.userId, id);
  if (!deleted) return NextResponse.json({ error: "Die Planung wurde nicht gefunden." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
