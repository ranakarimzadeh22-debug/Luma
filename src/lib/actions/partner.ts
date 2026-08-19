"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generatePartnerCode } from "@/lib/partner";

async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Returns the user's partner_code, generating and persisting one if missing. */
export async function getOrCreatePartnerCode(): Promise<string | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  if (profile?.partnerCode) return profile.partnerCode;

  const code = generatePartnerCode(profile?.name || "Luma");
  await prisma.profile.update({ where: { id: userId }, data: { partnerCode: code } });
  return code;
}
