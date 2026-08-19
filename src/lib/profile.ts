import { createClient } from "./supabase";
import { getBodyMetrics, upsertBodyMetrics, getSupplements } from "./health";

// ============================================
// Typen
// ============================================

export type LifeStage = 
  | 'teen'              // 13-17 Jahre
  | 'young_adult'       // 18-24 Jahre
  | 'adult'             // 25-34 Jahre
  | 'trying_to_conceive' // Kinderwunsch
  | 'pregnant'          // Schwanger
  | 'postpartum'        // Nach der Geburt
  | 'perimenopause'     // Perimenopause
  | 'menopause';        // Menopause

export type AgeGroup = '13-17' | '18-24' | '25-34' | '35-44' | '45+';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type Goal = 
  | 'understand_cycle'
  | 'track_period'
  | 'conceive'
  | 'avoid_pregnancy'
  | 'manage_pms'
  | 'manage_menopause'
  | 'pregnancy_support'
  | 'general_health';

export type Interest =
  | 'nutrition'
  | 'exercise'
  | 'mental_health'
  | 'sexuality'
  | 'sleep'
  | 'skin_hair'
  | 'hormones'
  | 'fertility';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  birth_year: number | null;
  avatar: string;
  takes_supplements: boolean;
  partner_code?: string;
  // Neue Personalisierungs-Felder
  life_stage?: LifeStage | null;
  age_group?: AgeGroup | null;
  experience_level?: ExperienceLevel | null;
  goals?: Goal[] | null;
  interests?: Interest[] | null;
  onboarding_completed?: boolean;
  onboarding_step?: number;
}

export interface UserPreferences {
  id?: number;
  user_id: string;
  theme: 'rose' | 'lavender' | 'peach' | 'sage' | 'auto';
  notifications_enabled: boolean;
  reminder_time: string;
  show_fertility: boolean;
  show_educational_content: boolean;
}

export interface FullUserData {
  profile: UserProfile | null;
  bodyMetrics: { weight_kg: number | null; height_cm: number | null } | null;
  cycleData: {
    last_period_start: string | null;
    cycle_length: number;
    period_length: number;
  } | null;
  preferences: UserPreferences | null;
}

// Verfügbare Avatare (Emoji-Stil) – wird nach und nach durch AvatarPicker ersetzt
export const AVATARS = [
  { id: "🌸", label_de: "Blume", label_fa: "گل", label_en: "Flower" },
  { id: "⭐", label_de: "Stern", label_fa: "ستاره", label_en: "Star" },
  { id: "🌙", label_de: "Mond", label_fa: "ماه", label_en: "Moon" },
  { id: "💜", label_de: "Herz", label_fa: "قلب", label_en: "Heart" },
  { id: "🦋", label_de: "Schmetterling", label_fa: "پروانه", label_en: "Butterfly" },
  { id: "🌺", label_de: "Lotus", label_fa: "نیلوفر", label_en: "Lotus" },
];

// ============================================
// Life Stage Labels (für UI)
// ============================================

export const LIFE_STAGE_LABELS: Record<LifeStage, { de: string; en: string; fa: string }> = {
  teen: { de: "Teenager (13-17)", en: "Teen (13-17)", fa: "نوجوان (۱۳-۱۷)" },
  young_adult: { de: "Junge Erwachsene (18-24)", en: "Young Adult (18-24)", fa: "جوان (۱۸-۲۴)" },
  adult: { de: "Erwachsene (25-34)", en: "Adult (25-34)", fa: "بزرگسال (۲۵-۳۴)" },
  trying_to_conceive: { de: "Kinderwunsch", en: "Trying to Conceive", fa: "قصد بارداری" },
  pregnant: { de: "Schwanger", en: "Pregnant", fa: "باردار" },
  postpartum: { de: "Nach der Geburt", en: "Postpartum", fa: "بعد از زایمان" },
  perimenopause: { de: "Perimenopause", en: "Perimenopause", fa: "پیش از یائسگی" },
  menopause: { de: "Menopause", en: "Menopause", fa: "یائسگی" },
};

export const GOAL_LABELS: Record<Goal, { de: string; en: string; fa: string }> = {
  understand_cycle: { de: "Zyklus verstehen", en: "Understand my cycle", fa: "شناخت چرخه" },
  track_period: { de: "Periode tracken", en: "Track my period", fa: "پیگیری پریود" },
  conceive: { de: "Schwanger werden", en: "Get pregnant", fa: "باردار شدن" },
  avoid_pregnancy: { de: "Verhütung", en: "Avoid pregnancy", fa: "پیشگیری از بارداری" },
  manage_pms: { de: "PMS bewältigen", en: "Manage PMS", fa: "مدیریت PMS" },
  manage_menopause: { de: "Wechseljahre begleiten", en: "Manage menopause", fa: "مدیریت یائسگی" },
  pregnancy_support: { de: "Schwangerschaftsbegleitung", en: "Pregnancy support", fa: "حمایت بارداری" },
  general_health: { de: "Allgemeine Gesundheit", en: "General health", fa: "سلامت عمومی" },
};

export const INTEREST_LABELS: Record<Interest, { de: string; en: string; fa: string; emoji: string }> = {
  nutrition: { de: "Ernährung", en: "Nutrition", fa: "تغذیه", emoji: "🥗" },
  exercise: { de: "Bewegung & Sport", en: "Exercise & Sports", fa: "ورزش", emoji: "🏃‍♀️" },
  mental_health: { de: "Mentale Gesundheit", en: "Mental Health", fa: "سلامت روان", emoji: "🧠" },
  sexuality: { de: "Sexualität", en: "Sexuality", fa: "جنسیت", emoji: "💕" },
  sleep: { de: "Schlaf", en: "Sleep", fa: "خواب", emoji: "😴" },
  skin_hair: { de: "Haut & Haare", en: "Skin & Hair", fa: "پوست و مو", emoji: "💎" },
  hormones: { de: "Hormone", en: "Hormones", fa: "هورمون‌ها", emoji: "🧪" },
  fertility: { de: "Fruchtbarkeit", en: "Fertility", fa: "باروری", emoji: "❤️" },
};

// ============================================
// Life Stage → Empfohlene Ziele
// ============================================

export function getRecommendedGoals(lifeStage: LifeStage): Goal[] {
  switch (lifeStage) {
    case 'teen':
      return ['understand_cycle', 'track_period', 'general_health'];
    case 'young_adult':
      return ['track_period', 'avoid_pregnancy', 'manage_pms', 'general_health'];
    case 'adult':
      return ['track_period', 'conceive', 'avoid_pregnancy', 'manage_pms', 'general_health'];
    case 'trying_to_conceive':
      return ['conceive', 'understand_cycle', 'general_health'];
    case 'pregnant':
      return ['pregnancy_support', 'general_health'];
    case 'postpartum':
      return ['general_health', 'manage_pms'];
    case 'perimenopause':
      return ['manage_menopause', 'manage_pms', 'general_health'];
    case 'menopause':
      return ['manage_menopause', 'general_health'];
    default:
      return ['general_health'];
  }
}

// ============================================
// Life Stage → Theme
// ============================================

export function getRecommendedTheme(lifeStage: LifeStage): 'rose' | 'lavender' | 'peach' | 'sage' {
  switch (lifeStage) {
    case 'teen': return 'lavender';
    case 'young_adult': return 'rose';
    case 'adult': return 'rose';
    case 'trying_to_conceive': return 'peach';
    case 'pregnant': return 'peach';
    case 'postpartum': return 'peach';
    case 'perimenopause': return 'sage';
    case 'menopause': return 'sage';
    default: return 'rose';
  }
}

// ============================================
// Life Stage → Beschreibung
// ============================================

export function getLifeStageDescription(lifeStage: LifeStage, locale: string): string {
  const descriptions: Record<LifeStage, { de: string; en: string; fa: string }> = {
    teen: {
      de: "Du bist neu in der Welt des Zyklus? Keine Sorge – Luma erklärt dir alles einfach und verständlich.",
      en: "New to the world of cycles? Don't worry – Luma explains everything simply and clearly.",
      fa: "تازه وارد دنیای چرخه شده‌ای؟ نگران نباش – لوما همه چیز را ساده و قابل فهم توضیح می‌دهد.",
    },
    young_adult: {
      de: "Lerne deinen Körper besser kennen und verstehe, wie dein Zyklus dich beeinflusst.",
      en: "Get to know your body better and understand how your cycle affects you.",
      fa: "بدنت را بهتر بشناس و بفهم چرخه چگونه بر تو تأثیر می‌گذارد.",
    },
    adult: {
      de: "Dein Zyklus ist ein wichtiger Teil deines Lebens. Luma hilft dir, ihn optimal zu nutzen.",
      en: "Your cycle is an important part of your life. Luma helps you make the most of it.",
      fa: "چرخه تو بخش مهمی از زندگی‌ات است. لوما به تو کمک می‌کند از آن بهترین استفاده را ببری.",
    },
    trying_to_conceive: {
      de: "Wir begleiten dich auf deinem Weg zum Wunschkind – mit präzisem Tracking und einfühlsamen Tipps.",
      en: "We accompany you on your journey to conceive – with precise tracking and empathetic tips.",
      fa: "ما تو را در مسیر بارداری همراهی می‌کنیم – با پیگیری دقیق و نکات دلسوزانه.",
    },
    pregnant: {
      de: "Eine aufregende Zeit! Luma zeigt dir Woche für Woche, wie sich dein Baby entwickelt.",
      en: "An exciting time! Luma shows you week by week how your baby is developing.",
      fa: "زمانی هیجان‌انگیز! لوما هفته به هفته به تو نشان می‌دهد که نوزادت چگونه رشد می‌کند.",
    },
    postpartum: {
      de: "Die Zeit nach der Geburt ist besonders. Luma hilft dir, dich um dich und dein Baby zu kümmern.",
      en: "The time after birth is special. Luma helps you take care of yourself and your baby.",
      fa: "زمان بعد از زایمان ویژه است. لوما به تو کمک می‌کند از خودت و نوزادت مراقبت کنی.",
    },
    perimenopause: {
      de: "Dein Körper verändert sich – Luma hilft dir, diese Phase mit Gelassenheit zu meistern.",
      en: "Your body is changing – Luma helps you navigate this phase with ease.",
      fa: "بدنت در حال تغییر است – لوما به تو کمک می‌کند این مرحله را با آرامش پشت سر بگذاری.",
    },
    menopause: {
      de: "Ein neuer Lebensabschnitt beginnt. Luma unterstützt dich mit wertvollen Informationen und Tipps.",
      en: "A new chapter begins. Luma supports you with valuable information and tips.",
      fa: "فصل جدیدی آغاز می‌شود. لوما با اطلاعات و نکات ارزشمند از تو حمایت می‌کند.",
    },
  };
  const desc = descriptions[lifeStage];
  return desc[locale as keyof typeof desc] || desc.en;
}

// ============================================
// Profil laden
// ============================================

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("getProfile error:", error);
    return null;
  }
  return data;
}

export async function getFullUserData(userId: string): Promise<FullUserData> {
  const [profile, bodyMetrics, cycleResult, preferencesResult] = await Promise.all([
    getProfile(userId),
    getBodyMetrics(userId),
    createClient().from("user_cycles").select("*").eq("user_id", userId).maybeSingle(),
    createClient().from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  return {
    profile,
    bodyMetrics,
    cycleData: cycleResult.data || null,
    preferences: preferencesResult.data || null,
  };
}

// ============================================
// Profil speichern
// ============================================

export async function saveProfile(params: {
  userId: string;
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
  const supabase = createClient();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: params.userId,
      name: params.name,
      email: params.email,
      birth_year: params.birthYear,
      avatar: params.avatar,
      takes_supplements: params.takesSupplements,
      life_stage: params.lifeStage,
      age_group: params.ageGroup,
      experience_level: params.experienceLevel,
      goals: params.goals,
      interests: params.interests,
      onboarding_completed: params.onboardingCompleted,
      onboarding_step: params.onboardingStep,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("saveProfile error:", error);
    return false;
  }
  return true;
}

// ============================================
// User Preferences
// ============================================

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("getUserPreferences error:", error);
    return null;
  }
  return data;
}

export async function saveUserPreferences(params: {
  userId: string;
  theme?: string;
  notificationsEnabled?: boolean;
  reminderTime?: string;
  showFertility?: boolean;
  showEducationalContent?: boolean;
}): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: params.userId,
      theme: params.theme,
      notifications_enabled: params.notificationsEnabled,
      reminder_time: params.reminderTime,
      show_fertility: params.showFertility,
      show_educational_content: params.showEducationalContent,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("saveUserPreferences error:", error);
    return false;
  }
  return true;
}

// ============================================
// Komplettes Onboarding speichern (ein Aufruf)
// ============================================

export async function saveOnboardingData(params: {
  userId: string;
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
  const supabase = createClient();

  try {
    // 1. Profile speichern (mit Personalisierungs-Feldern)
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: params.userId,
        name: params.name,
        email: params.email,
        birth_year: params.birthYear,
        avatar: params.avatar,
        takes_supplements: params.takesSupplements,
        life_stage: params.lifeStage,
        age_group: params.ageGroup,
        experience_level: params.experienceLevel,
        goals: params.goals,
        interests: params.interests,
        onboarding_completed: true,
        onboarding_step: 0,
      },
      { onConflict: "id" }
    );

    if (profileError) throw profileError;

    // 2. Zyklusdaten speichern
    const { error: cycleError } = await supabase.from("user_cycles").upsert(
      {
        user_id: params.userId,
        last_period_start: params.lastPeriodStart,
        cycle_length: params.cycleLength,
        period_length: params.periodLength,
      },
      { onConflict: "user_id" }
    );

    if (cycleError) throw cycleError;

    // 3. Körperdaten speichern
    const bodyOk = await upsertBodyMetrics(params.userId, params.weightKg, params.heightCm);
    if (!bodyOk) throw new Error("Failed to save body metrics");

    // 4. Preferences speichern
    const recommendedTheme = params.lifeStage ? getRecommendedTheme(params.lifeStage) : 'rose';
    await saveUserPreferences({
      userId: params.userId,
      theme: recommendedTheme,
      notificationsEnabled: true,
      reminderTime: "08:00",
      showFertility: params.lifeStage !== 'teen', // Teens sehen keine Fruchtbarkeitsinfos
      showEducationalContent: true,
    });

    return true;
  } catch (err) {
    console.error("saveOnboardingData error:", err);
    return false;
  }
}

// ============================================
// Personalisierte Tipps generieren
// ============================================

export function getPersonalizedTip(
  lifeStage: LifeStage | null | undefined,
  goals: Goal[] | null | undefined,
  locale: string
): { tip: string; category: string } {
  const tips: Record<string, { de: string; en: string; fa: string }> = {
    teen_welcome: {
      de: "Dein Körper ist einzigartig! Jeder Zyklus ist anders – lerne ihn kennen, ohne Druck.",
      en: "Your body is unique! Every cycle is different – get to know it without pressure.",
      fa: "بدن تو独一无二 است! هر چرخه متفاوت است – آن را بدون فشار بشناس.",
    },
    teen_track: {
      de: "Tipp: Tracke deine Periode, um ein Gefühl für deinen Rhythmus zu bekommen. Es wird mit der Zeit regelmäßiger!",
      en: "Tip: Track your period to get a feel for your rhythm. It will become more regular over time!",
      fa: "نکته: پریودت را پیگیری کن تا به ریتم بدنت عادت کنی. به مرور زمان منظم‌تر می‌شود!",
    },
    conceive_fertile: {
      de: "Dein Fruchtbarkeitsfenster ist die beste Zeit für eine Schwangerschaft. Achte auf deine Körpersignale!",
      en: "Your fertile window is the best time for pregnancy. Pay attention to your body's signals!",
      fa: "پنجره باروری بهترین زمان برای بارداری است. به نشانه‌های بدنت توجه کن!",
    },
    conceive_health: {
      de: "Folsäure ist jetzt besonders wichtig! Nimm täglich 400 µg Folsäure für die gesunde Entwicklung deines Babys.",
      en: "Folic acid is especially important now! Take 400 µg daily for your baby's healthy development.",
      fa: "اسید فولیک الان خیلی مهم است! روزانه ۴۰۰ میکروگرم برای رشد سالم نوزادت مصرف کن.",
    },
    pregnant_week: {
      de: "Jede Woche ist ein kleiner Meilenstein. Genieße die Reise und gönn dir Ruhe, wenn du sie brauchst.",
      en: "Every week is a small milestone. Enjoy the journey and rest when you need it.",
      fa: "هر هفته یک نقطه عطف کوچک است. از سفر لذت ببر و وقتی نیاز داری استراحت کن.",
    },
    menopause_cool: {
      de: "Hitzewallungen? Trinke kühles Wasser, trage atmungsaktive Kleidung und vermeide scharfe Gewürze.",
      en: "Hot flashes? Drink cool water, wear breathable clothing, and avoid spicy foods.",
      fa: "گرگرفتگی؟ آب خنک بنوش، لباس تنفس‌پذیر بپوش و از ادویه‌های تند پرهیز کن.",
    },
    menopause_sleep: {
      de: "Schlafprobleme in den Wechseljahren? Eine feste Schlafroutine und weniger Bildschirmzeit am Abend können helfen.",
      en: "Sleep issues during menopause? A consistent sleep routine and less screen time in the evening can help.",
      fa: "مشکل خواب در یائسگی؟ یک روال خواب منظم و کمتر کردن زمان صفحه نمایش در شب می‌تواند کمک کند.",
    },
    general_water: {
      de: "Trinke genug Wasser! 2 Liter pro Tag helfen gegen Müdigkeit und Kopfschmerzen.",
      en: "Drink enough water! 2 liters per day help against fatigue and headaches.",
      fa: "آب کافی بنوش! ۲ لیتر در روز به کاهش خستگی و سردرد کمک می‌کند.",
    },
    general_movement: {
      de: "Bewegung an der frischen Luft hebt die Stimmung und reduziert Stress – schon 15 Minuten Spaziergang helfen!",
      en: "Exercise in fresh air boosts mood and reduces stress – even a 15-minute walk helps!",
      fa: "حرکت در هوای تازه خلق و خو را بهبود می‌بخشد و استرس را کاهش می‌دهد – حتی ۱۵ دقیقه پیاده‌روی کمک می‌کند!",
    },
  };

  // Life stage specific tips
  if (lifeStage === 'teen') {
    const teenTips = [tips.teen_welcome, tips.teen_track, tips.general_water];
    return { tip: teenTips[Math.floor(Math.random() * teenTips.length)][locale as keyof typeof tips.teen_welcome] || tips.teen_welcome.en, category: 'education' };
  }

  if (lifeStage === 'trying_to_conceive' || goals?.includes('conceive')) {
    const conceiveTips = [tips.conceive_fertile, tips.conceive_health, tips.general_water];
    return { tip: conceiveTips[Math.floor(Math.random() * conceiveTips.length)][locale as keyof typeof tips.conceive_fertile] || tips.conceive_fertile.en, category: 'fertility' };
  }

  if (lifeStage === 'pregnant') {
    return { tip: tips.pregnant_week[locale as keyof typeof tips.pregnant_week] || tips.pregnant_week.en, category: 'pregnancy' };
  }

  if (lifeStage === 'perimenopause' || lifeStage === 'menopause') {
    const menoTips = [tips.menopause_cool, tips.menopause_sleep, tips.general_water];
    return { tip: menoTips[Math.floor(Math.random() * menoTips.length)][locale as keyof typeof tips.menopause_cool] || tips.menopause_cool.en, category: 'menopause' };
  }

  // Default tips
  const defaultTips = [tips.general_water, tips.general_movement];
  return { tip: defaultTips[Math.floor(Math.random() * defaultTips.length)][locale as keyof typeof tips.general_water] || tips.general_water.en, category: 'general' };
}