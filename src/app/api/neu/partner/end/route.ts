import { NextRequest, NextResponse } from "next/server";
import { getNewAuthSession, requestHasAllowedOrigin } from "@/lib/new-auth";
import { endPartnerConnection } from "@/lib/new-partner";

export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }
  const session = await getNewAuthSession();
  if (!session) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });

  const ended = await endPartnerConnection(session.userId);
  if (!ended) {
    return NextResponse.json({ error: "Es besteht keine aktive Partnerverbindung." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
