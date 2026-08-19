import { NextRequest, NextResponse } from "next/server";
import { getPregnancyDataByShareToken } from "@/lib/pregnancy-share";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { error: "Invalid share token" },
      { status: 400 }
    );
  }

  const data = await getPregnancyDataByShareToken(token);

  if (!data) {
    return NextResponse.json(
      { error: "Share link not found or pregnancy data unavailable" },
      { status: 404 }
    );
  }

  // Only return data if the mother is actually pregnant
  if (!data.is_pregnant) {
    return NextResponse.json(
      { error: "Pregnancy is not active" },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}