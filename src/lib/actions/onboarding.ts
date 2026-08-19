"use server";

import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generatePartnerCode } from "@/lib/partner";
import type { LifeStage, Goal, Interest } from "@/lib/profile-types";
import { getRecommendedTheme } from "@/lib/profile-types";

function getAgeGroup(birthYear: number): string {
  const age = new Date().getFullYear() - birthYear;
  if (age <= 17) return "13-17";
  if (age <= 24) return "18-24";
  if (age <= 34) return "25-34";
  if (age <= 44) return "35-44";
  return "45+";
}

export async function saveOnboarding(data: {
  name: string;
  email: string;
  birthYear: string;
  avatar: string;
  lifeStage: LifeStage | "";
  goals: Goal[];
  interests: Interest[];
  takesSupplements: boolean;
  selectedSupplements: Record<string, string>;
  lastPeriod: string;
  cycleLength: number;
  periodLength: number;
  weightKg: string;
  heightCm: string;
}): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const partnerCode = generatePartnerCode(data.name || session.user.email || "Luma");

      await tx.profile.upsert({
        where: { id: userId },
        create: {
          id: userId,
          name: data.name,
          email: data.email || session.user.email || "",
          birthYear: data.birthYear ? parseInt(data.birthYear) : null,
          avatar: data.avatar,
          takesSupplements: data.takesSupplements,
          lifeStage: data.lifeStage || undefined,
          ageGroup: data.birthYear ? getAgeGroup(parseInt(data.birthYear)) : undefined,
          goals: data.goals.length > 0 ? data.goals : [],
          interests: data.interests.length > 0 ? data.interests : [],
          onboardingCompleted: true,
          onboardingStep: 0,
          partnerCode,
        },
        update: {
          name: data.name,
          email: data.email || session.user.email || undefined,
          birthYear: data.birthYear ? parseInt(data.birthYear) : null,
          avatar: data.avatar,
          takesSupplements: data.takesSupplements,
          lifeStage: data.lifeStage || undefined,
          ageGroup: data.birthYear ? getAgeGroup(parseInt(data.birthYear)) : undefined,
          goals: data.goals.length > 0 ? data.goals : undefined,
          interests: data.interests.length > 0 ? data.interests : undefined,
          onboardingCompleted: true,
          onboardingStep: 0,
          partnerCode,
        },
      });

      await tx.userCycle.upsert({
        where: { userId },
        create: {
          userId,
          lastPeriodStart: new Date(data.lastPeriod),
          cycleLength: data.cycleLength,
          periodLength: data.periodLength,
        },
        update: {
          lastPeriodStart: new Date(data.lastPeriod),
          cycleLength: data.cycleLength,
          periodLength: data.periodLength,
        },
      });

      if (data.weightKg) {
        await tx.userBodyMetrics.upsert({
          where: { userId },
          create: {
            userId,
            weightKg: parseFloat(data.weightKg),
            heightCm: data.heightCm ? parseFloat(data.heightCm) : null,
          },
          update: {
            weightKg: parseFloat(data.weightKg),
            heightCm: data.heightCm ? parseFloat(data.heightCm) : null,
          },
        });
      }

      if (data.takesSupplements) {
        for (const [name, dose] of Object.entries(data.selectedSupplements)) {
          await tx.userSupplement.create({
            data: { userId, name, dose, time: "" },
          });
        }
      }

      const showFertility = data.lifeStage !== "teen";
      await tx.userPreferences.upsert({
        where: { userId },
        create: {
          userId,
          theme: data.lifeStage ? getRecommendedTheme(data.lifeStage as LifeStage) : "rose",
          notificationsEnabled: true,
          reminderTime: "08:00",
          showFertility,
          showEducationalContent: true,
        },
        update: {
          theme: data.lifeStage ? getRecommendedTheme(data.lifeStage as LifeStage) : "rose",
          notificationsEnabled: true,
          reminderTime: "08:00",
          showFertility,
          showEducationalContent: true,
        },
      });
    });

    return true;
  } catch (err) {
    console.error("saveOnboarding error:", err);
    return false;
  }
}
