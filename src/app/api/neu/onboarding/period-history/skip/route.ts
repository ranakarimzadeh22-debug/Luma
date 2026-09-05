import { NextRequest, NextResponse } from "next/server";
import {
  getNewAuthSession,
  requestHasAllowedOrigin,
  setNewAuthPeriodHistoryOnboardingSkipped,
} from "@/lib/new-auth";

export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }

  const session = await getNewAuthSession();
  if (!session) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });

  await setNewAuthPeriodHistoryOnboardingSkipped(session.userId);
  return NextResponse.json({ ok: true });
}
