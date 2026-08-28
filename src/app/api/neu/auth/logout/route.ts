import { NextRequest, NextResponse } from "next/server";
import {
  clearNewAuthSessionCookie,
  deleteNewAuthSession,
  getNewAuthSessionToken,
  requestHasAllowedOrigin,
} from "@/lib/new-auth";

export async function POST(request: NextRequest) {
  if (!requestHasAllowedOrigin(request)) {
    return NextResponse.json({ error: "Die Anfrage wurde aus Sicherheitsgründen abgelehnt." }, { status: 403 });
  }

  await deleteNewAuthSession(getNewAuthSessionToken(request));
  const response = NextResponse.json({ ok: true });
  clearNewAuthSessionCookie(response);
  return response;
}
