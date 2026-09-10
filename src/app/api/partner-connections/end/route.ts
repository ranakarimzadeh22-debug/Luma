import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requestHasAllowedOrigin } from "@/lib/request-origin";
import { endPartnerConnection } from "@/lib/partner-connections";

export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const ended = await endPartnerConnection(session.user.id);
  if (!ended) {
    return NextResponse.json({ error: "Es besteht keine aktive Partnerverbindung." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
