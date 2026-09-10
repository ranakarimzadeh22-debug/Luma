import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPartnerConnectionStatusForOwner, getPartnerConnectionStatusForPartner } from "@/lib/partner-connections";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const [ownerStatus, partnerStatus] = await Promise.all([
    getPartnerConnectionStatusForOwner(session.user.id),
    getPartnerConnectionStatusForPartner(session.user.id),
  ]);

  return NextResponse.json({ asOwner: ownerStatus, asPartner: partnerStatus });
}
