"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import {
  getFullUserData,
  saveProfile,
  getUserPreferences,
  saveUserPreferences,
  getPersonalizedTip,
  type UserProfile,
  type UserPreferences,
  type LifeStage,
  type AgeGroup,
  type Goal,
  type Interest,
} from "@/lib/profile";

// ============================================
// Theme-Farben basierend auf Lebensphase
// ============================================

export const THEME_COLORS: Record<string, { bg: string; surface: string; primary: string; primaryLight: string; primaryMid: string; primaryDark: string; dark: string; mid: string; muted: string; border: string; gradient: string }> = {
  rose: {
    bg: "#fef6f8",
    surface: "#ffffff",
    primary: "#f4c7d7",
    primaryLight: "#fce4ed",
    primaryMid: "#e8a0b4",
    primaryDark: "#c47a9a",
    dark: "#3a2d3f",
    mid: "#6b5a7a",
    muted: "#a094a8",
    border: "#f0e0e8",
    gradient: "linear-gradient(160deg, #fce4f0 0%, #fdf0f4 55%, #fef6f8 100%)",
  },
  lavender: {
    bg: "#f8f4fe",
    surface: "#ffffff",
    primary: "#d4c4f0",
    primaryLight: "#ede4f8",
    primaryMid: "#b799e5",
    primaryDark: "#8b6fc7",
    dark: "#2d1f35",
    mid: "#6b5a7a",
    muted: "#a094a8",
    border: "#e8e0f0",
    gradient: "linear-gradient(160deg, #ede4f8 0%, #f4eefc 55%, #f8f4fe 100%)",
  },
  peach: {
    bg: "#fef8f4",
    surface: "#ffffff",
    primary: "#ffd9c7",
    primaryLight: "#ffede3",
    primaryMid: "#f4b89a",
    primaryDark: "#d48a6a",
    dark: "#3a2d3f",
    mid: "#6b5a7a",
    muted: "#a094a8",
    border: "#f0e4dc",
    gradient: "linear-gradient(160deg, #ffede3 0%, #fef4ec 55%, #fef8f4 100%)",
  },
  sage: {
    bg: "#f4f8f4",
    surface: "#ffffff",
    primary: "#cfe8d5",
    primaryLight: "#e4f0e8",
    primaryMid: "#a0c4a8",
    primaryDark: "#6a9a7a",
    dark: "#2d3a30",
    mid: "#5a7a62",
    muted: "#8aa090",
    border: "#dce8de",
    gradient: "linear-gradient(160deg, #e4f0e8 0%, #eef4ec 55%, #f4f8f4 100%)",
  },
};

// ============================================
// Context Type
// ============================================

interface ProfileContextType {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<boolean>;
  personalizedTip: { tip: string; category: string };
  refreshTip: () => void;
  theme: typeof THEME_COLORS.rose;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  preferences: null,
  loading: true,
  refreshProfile: async () => {},
  updateProfile: async () => false,
  updatePreferences: async () => false,
  personalizedTip: { tip: "", category: "general" },
  refreshTip: () => {},
  theme: THEME_COLORS.rose,
});

// ============================================
// Provider
// ============================================

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [personalizedTip, setPersonalizedTip] = useState<{ tip: string; category: string }>({ tip: "", category: "general" });
  const [locale, setLocaleState] = useState("de");

  // Get locale from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("luma-locale");
    if (saved) setLocaleState(saved);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setPreferences(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getFullUserData(user.id);
      setProfile(data.profile);
      setPreferences(data.preferences);
    } catch (err) {
      console.error("refreshProfile error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfileFn = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user || !profile) return false;

    const success = await saveProfile({
      userId: user.id,
      name: updates.name ?? profile.name,
      email: updates.email ?? profile.email,
      birthYear: updates.birth_year ?? profile.birth_year,
      avatar: updates.avatar ?? profile.avatar,
      takesSupplements: updates.takes_supplements ?? profile.takes_supplements,
      lifeStage: updates.life_stage as LifeStage | undefined ?? profile.life_stage as LifeStage | undefined,
      ageGroup: updates.age_group as AgeGroup | undefined ?? profile.age_group as AgeGroup | undefined,
      goals: updates.goals as Goal[] | undefined ?? profile.goals as Goal[] | undefined,
      interests: updates.interests as Interest[] | undefined ?? profile.interests as Interest[] | undefined,
      onboardingCompleted: updates.onboarding_completed ?? profile.onboarding_completed,
      onboardingStep: updates.onboarding_step ?? profile.onboarding_step,
    });

    if (success) {
      await refreshProfile();
    }

    return success;
  }, [user, profile, refreshProfile]);

  const updatePreferencesFn = useCallback(async (updates: Partial<UserPreferences>): Promise<boolean> => {
    if (!user) return false;

    const success = await saveUserPreferences({
      userId: user.id,
      theme: updates.theme,
      notificationsEnabled: updates.notifications_enabled,
      reminderTime: updates.reminder_time,
      showFertility: updates.show_fertility,
      showEducationalContent: updates.show_educational_content,
    });

    if (success) {
      await refreshProfile();
    }

    return success;
  }, [user, refreshProfile]);

  const refreshTip = useCallback(() => {
    const tip = getPersonalizedTip(
      profile?.life_stage as LifeStage | undefined | null,
      profile?.goals as Goal[] | undefined | null,
      locale
    );
    setPersonalizedTip(tip);
  }, [profile, locale]);

  // Load profile on mount / user change
  useEffect(() => {
    setLoading(true);
    refreshProfile();
  }, [refreshProfile]);

  // Refresh tip when profile or locale changes
  useEffect(() => {
    if (profile) {
      refreshTip();
    }
  }, [profile, locale, refreshTip]);

  // Determine theme
  const themeKey = preferences?.theme === 'auto'
    ? (profile?.life_stage ? getThemeForLifeStage(profile.life_stage as LifeStage) : 'rose')
    : (preferences?.theme && preferences.theme in THEME_COLORS ? preferences.theme : 'rose');

  const theme = THEME_COLORS[themeKey] || THEME_COLORS.rose;

  return (
    <ProfileContext.Provider value={{
      profile,
      preferences,
      loading,
      refreshProfile,
      updateProfile: updateProfileFn,
      updatePreferences: updatePreferencesFn,
      personalizedTip,
      refreshTip,
      theme,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

function getThemeForLifeStage(lifeStage: LifeStage): string {
  switch (lifeStage) {
    case 'teen': return 'lavender';
    case 'trying_to_conceive':
    case 'pregnant':
    case 'postpartum': return 'peach';
    case 'perimenopause':
    case 'menopause': return 'sage';
    default: return 'rose';
  }
}

// ============================================
// Hook
// ============================================

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}