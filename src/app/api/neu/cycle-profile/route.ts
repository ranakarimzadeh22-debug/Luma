import { NextRequest, NextResponse } from "next/server";
import { getNewAuthSession, requestHasAllowedOrigin } from "@/lib/new-auth";
import { saveNewCycleProfile } from "@/lib/new-cycle-profile";
import { validateNewCycleProfileInput } from "@/lib/new-cycle-profile-validation";

export async function PUT(request: NextRequest) {
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

  const input = validateNewCycleProfileInput(await request.json().catch(() => null));
  if (!input.ok) {
    return NextResponse.json({ error: input.message }, { status: 400 });
  }

  await saveNewCycleProfile(session.userId, input.value);
  return NextResponse.json({ ok: true });
}
