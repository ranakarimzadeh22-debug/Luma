"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export interface PregnancyShareData {
  share_token: string;
  partner_name: string;
  created_at: string;
  updated_at: string;
}

async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Create or update a pregnancy share link for the logged-in user. */
export async function createPregnancyShare(
  _userId: string | undefined,
  partnerName: string = ""
): Promise<{ share_token: string } | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  try {
    const row = await prisma.pregnancyShare.upsert({
      where: { userId },
      create: { userId, partnerName },
      update: { partnerName },
    });
    return { share_token: row.shareToken };
  } catch (err) {
    console.error("createPregnancyShare error:", err);
    return null;
  }
}

/** Get existing share data for the logged-in user (or null if none). */
export async function getPregnancyShare(_userId?: string): Promise<PregnancyShareData | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  const row = await prisma.pregnancyShare.findUnique({ where: { userId } });
  if (!row) return null;

  return {
    share_token: row.shareToken,
    partner_name: row.partnerName,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

/** Regenerate the share token (invalidates old link). */
export async function regeneratePregnancyShare(
  _userId: string | undefined,
  partnerName?: string
): Promise<{ share_token: string } | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  try {
    const row = await prisma.pregnancyShare.update({
      where: { userId },
      data: {
        shareToken: crypto.randomUUID(),
        ...(partnerName !== undefined ? { partnerName } : {}),
      },
    });
    return { share_token: row.shareToken };
  } catch (err) {
    console.error("regeneratePregnancyShare error:", err);
    return null;
  }
}

/** Fetch pregnancy data for a partner via share token (public, no auth). */
export async function getPregnancyDataByShareToken(
  shareToken: string
): Promise<{
  last_period_start: string | null;
  due_date: string | null;
  is_pregnant: boolean;
  mother_name: string;
} | null> {
  const share = await prisma.pregnancyShare.findUnique({ where: { shareToken } });
  if (!share) {
    console.error("getPregnancyDataByShareToken: share not found");
    return null;
  }

  const pregnancy = await prisma.pregnancy.findUnique({ where: { userId: share.userId } });
  if (!pregnancy) {
    console.error("getPregnancyDataByShareToken: pregnancy not found");
    return null;
  }

  const profile = await prisma.profile.findUnique({ where: { id: share.userId } });

  return {
    last_period_start: pregnancy.lastPeriodStart ? pregnancy.lastPeriodStart.toISOString().split("T")[0] : null,
    due_date: pregnancy.dueDate ? pregnancy.dueDate.toISOString().split("T")[0] : null,
    is_pregnant: pregnancy.isPregnant ?? false,
    mother_name: profile?.name ?? "",
  };
}
