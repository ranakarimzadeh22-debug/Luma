import { NextResponse } from "next/server";
import { getNewAuthSession } from "@/lib/new-auth";
import { getPartnerConnectionStatusForOwner, getPartnerConnectionStatusForPartner } from "@/lib/new-partner";

export async function GET() {
  const session = await getNewAuthSession();
  if (!session) return NextResponse.json({ error: "Bitte melde dich erneut an." }, { status: 401 });

  const [ownerStatus, partnerStatus] = await Promise.all([
    getPartnerConnectionStatusForOwner(session.userId),
    getPartnerConnectionStatusForPartner(session.userId),
  ]);

  return NextResponse.json({ asOwner: ownerStatus, asPartner: partnerStatus });
}
