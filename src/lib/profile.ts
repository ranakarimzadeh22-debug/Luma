"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { upsertBodyMetrics } from "./health";
import { getRecommendedTheme } from "./profile-types";
import type {
  LifeStage,
  AgeGroup,
  ExperienceLevel,
  Goal,
  Interest,
  UserProfile,
  UserPreferences,
  FullUserData,
} from "./profile-types";

export type {
  LifeStage,
  AgeGroup,
  ExperienceLevel,
  Goal,
  Interest,
  UserProfile,
  UserPreferences,
  FullUserData,
};

function toProfile(row: {
  id: string;
  name: string;
  email: string;
  birthYear: number | null;
  avatar: string;
  takesSupplements: boolean;
  partnerCode: string | null;
  lifeStage: string | null;
  ageGroup: string | null;
  experienceLevel: string | null;
  goals: string[];
  interests: string[];
  onboardingCompleted: boolean;
  onboardingStep: number;
}): UserProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    birth_year: row.birthYear,
    avatar: row.avatar,
    takes_supplements: row.takesSupplements,
    partner_code: row.partnerCode ?? undefined,
    life_stage: row.lifeStage as LifeStage | null,
    age_group: row.ageGroup as AgeGroup | null,
    experience_level: row.experienceLevel as ExperienceLevel | null,
    goals: row.goals as Goal[],
    interests: row.interests as Interest[],
    onboarding_completed: row.onboardingCompleted,
    onboarding_step: row.onboardingStep,
  };
}

// ============================================
// Profil laden
// ============================================

export async function getProfile(_userId?: string): Promise<UserProfile | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const row = await prisma.profile.findUnique({ where: { id: session.user.id } });
  if (!row) return null;
  return toProfile(row);
}

export async function getFullUserData(_userId?: string): Promise<FullUserData> {
  const session = await auth();
  if (!session?.user?.id) {
    return { profile: null, bodyMetrics: null, cycleData: null, preferences: null };
  }
  const userId = session.user.id;

  const [profileRow, bodyMetricsRow, cycleRow, preferencesRow] = await Promise.all([
    prisma.profile.findUnique({ where: { id: userId } }),
    prisma.userBodyMetrics.findUnique({ where: { userId } }),
    prisma.userCycle.findUnique({ where: { userId } }),
    prisma.userPreferences.findUnique({ where: { userId } }),
  ]);

  return {
    profile: profileRow ? toProfile(profileRow) : null,
    bodyMetrics: bodyMetricsRow
      ? { weight_kg: bodyMetricsRow.weightKg, height_cm: bodyMetricsRow.heightCm }
      : null,
    cycleData: cycleRow
      ? {
          last_period_start: cycleRow.lastPeriodStart.toISOString().split("T")[0],
          cycle_length: cycleRow.cycleLength,
          period_length: cycleRow.periodLength,
        }
      : null,
    preferences: preferencesRow
      ? {
          id: Number(preferencesRow.id),
          user_id: preferencesRow.userId,
          theme: preferencesRow.theme as UserPreferences["theme"],
          notifications_enabled: preferencesRow.notificationsEnabled,
          reminder_time: preferencesRow.reminderTime,
          show_fertility: preferencesRow.showFertility,
          show_educational_content: preferencesRow.showEducationalContent,
        }
      : null,
  };
}

// ============================================
// Profil speichern
// ============================================

export async function saveProfile(params: {
  userId?: string;
  name: string;
  email: string;
  birthYear: number | null;
  avatar: string;
  takesSupplements: boolean;
  lifeStage?: LifeStage | null;
  ageGroup?: AgeGroup | null;
  experienceLevel?: ExperienceLevel | null;
  goals?: Goal[] | null;
  interests?: Interest[] | null;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
}): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const userId = session.user.id;

  try {
    await prisma.profile.upsert({
      where: { id: userId },
      create: {
        id: userId,
        name: params.name,
        email: params.email,
        birthYear: params.birthYear,
        avatar: params.avatar,
        takesSupplements: params.takesSupplements,
        lifeStage: params.lifeStage ?? undefined,
        ageGroup: params.ageGroup ?? undefined,
        experienceLevel: params.experienceLevel ?? undefined,
        goals: params.goals ?? [],
        interests: params.interests ?? [],
        onboardingCompleted: params.onboardingCompleted ?? false,
        onboardingStep: params.onboardingStep ?? 0,
      },
      update: {
        name: params.name,
        email: params.email,
        birthYear: params.birthYear,
        avatar: params.avatar,
        takesSupplements: params.takesSupplements,
        lifeStage: params.lifeStage ?? undefined,
        ageGroup: params.ageGroup ?? undefined,
        experienceLevel: params.experienceLevel ?? undefined,
        goals: params.goals ?? undefined,
        interests: params.interests ?? undefined,
        onboardingCompleted: params.onboardingCompleted ?? undefined,
        onboardingStep: params.onboardingStep ?? undefined,
      },
    });
    return true;
  } catch (err) {
    console.error("saveProfile error:", err);
    return false;
  }
}

// ============================================
// User Preferences
// ============================================

export async function getUserPreferences(_userId?: string): Promise<UserPreferences | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const row = await prisma.userPreferences.findUnique({ where: { userId: session.user.id } });
  if (!row) return null;
  return {
    id: Number(row.id),
    user_id: row.userId,
    theme: row.theme as UserPreferences["theme"],
    notifications_enabled: row.notificationsEnabled,
    reminder_time: row.reminderTime,
    show_fertility: row.showFertility,
    show_educational_content: row.showEducationalContent,
  };
}

export async function saveUserPreferences(params: {
  userId?: string;
  theme?: string;
  notificationsEnabled?: boolean;
  reminderTime?: string;
  showFertility?: boolean;
  showEducationalContent?: boolean;
}): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const userId = session.user.id;

  try {
    await prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        theme: params.theme ?? undefined,
        notificationsEnabled: params.notificationsEnabled ?? undefined,
        reminderTime: params.reminderTime ?? undefined,
        showFertility: params.showFertility ?? undefined,
        showEducationalContent: params.showEducationalContent ?? undefined,
      },
      update: {
        theme: params.theme ?? undefined,
        notificationsEnabled: params.notificationsEnabled ?? undefined,
        reminderTime: params.reminderTime ?? undefined,
        showFertility: params.showFertility ?? undefined,
        showEducationalContent: params.showEducationalContent ?? undefined,
      },
    });
    return true;
  } catch (err) {
    console.error("saveUserPreferences error:", err);
    return false;
  }
}

// ============================================
// Komplettes Onboarding speichern (ein Aufruf)
// ============================================

export async function saveOnboardingData(params: {
  userId?: string;
  name: string;
  email: string;
  birthYear: number | null;
  avatar: string;
  takesSupplements: boolean;
  weightKg: number | null;
  heightCm: number | null;
  lastPeriodStart: string;
  cycleLength: number;
  periodLength: number;
  lifeStage?: LifeStage;
  ageGroup?: AgeGroup;
  experienceLevel?: ExperienceLevel;
  goals?: Goal[];
  interests?: Interest[];
}): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const userId = session.user.id;

  try {
    await prisma.profile.upsert({
      where: { id: userId },
      create: {
        id: userId,
        name: params.name,
        email: params.email,
        birthYear: params.birthYear,
        avatar: params.avatar,
        takesSupplements: params.takesSupplements,
        lifeStage: params.lifeStage ?? undefined,
        ageGroup: params.ageGroup ?? undefined,
        experienceLevel: params.experienceLevel ?? undefined,
        goals: params.goals ?? [],
        interests: params.interests ?? [],
        onboardingCompleted: true,
        onboardingStep: 0,
      },
      update: {
        name: params.name,
        email: params.email,
        birthYear: params.birthYear,
        avatar: params.avatar,
        takesSupplements: params.takesSupplements,
        lifeStage: params.lifeStage ?? undefined,
        ageGroup: params.ageGroup ?? undefined,
        experienceLevel: params.experienceLevel ?? undefined,
        goals: params.goals ?? undefined,
        interests: params.interests ?? undefined,
        onboardingCompleted: true,
        onboardingStep: 0,
      },
    });

    await prisma.userCycle.upsert({
      where: { userId },
      create: {
        userId,
        lastPeriodStart: new Date(params.lastPeriodStart),
        cycleLength: params.cycleLength,
        periodLength: params.periodLength,
      },
      update: {
        lastPeriodStart: new Date(params.lastPeriodStart),
        cycleLength: params.cycleLength,
        periodLength: params.periodLength,
      },
    });

    const bodyOk = await upsertBodyMetrics(userId, params.weightKg, params.heightCm);
    if (!bodyOk) throw new Error("Failed to save body metrics");

    const recommendedTheme = params.lifeStage ? getRecommendedTheme(params.lifeStage) : 'rose';
    await saveUserPreferences({
      theme: recommendedTheme,
      notificationsEnabled: true,
      reminderTime: "08:00",
      showFertility: params.lifeStage !== 'teen',
      showEducationalContent: true,
    });

    return true;
  } catch (err) {
    console.error("saveOnboardingData error:", err);
    return false;
  }
}
