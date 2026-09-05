import { NextRequest, NextResponse } from "next/server";
import { getNewAuthSession, requestHasAllowedOrigin } from "@/lib/new-auth";
import { confirmNewPeriodPlan } from "@/lib/new-period-plans";
import { isValidPeriodId } from "@/lib/new-period-validation";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }
  const session = await getNewAuthSession();
  if (!session) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });

  const { id } = await context.params;
  if (!isValidPeriodId(id)) return NextResponse.json({ error: "Die Planung wurde nicht gefunden." }, { status: 404 });
  const result = await confirmNewPeriodPlan(session.userId, id);
  if (!result.ok) {
    const status = result.reason === "not_found" ? 404 : result.reason === "not_due" ? 400 : 409;
    const error =
      result.reason === "not_found"
        ? "Die Planung wurde nicht gefunden."
        : result.reason === "not_due"
          ? "Die Planung kann erst nach dem geplanten Ende bestätigt werden."
          : "Dieser Zeitraum überschneidet sich mit einer bestätigten Periode.";
    return NextResponse.json({ error }, { status });
  }
  return NextResponse.json({ entry: result.entry });
}
