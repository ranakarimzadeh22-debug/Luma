// ============================================
// Persona Configuration – Luma App
// Defines adaptive UI behavior for 4 user personas.
// ============================================

import { type LifeStage, type Goal, type Interest } from "@/lib/profile";

// ============================================
// Persona Definition
// ============================================

export type PersonaId = 'teen' | 'adult' | 'trying_to_conceive' | 'perimenopause';

export interface PersonaConfig {
  id: PersonaId;
  lifeStage: LifeStage;
  /** Human-readable label */
  label: { de: string; en: string; fa: string };
  /** Short description / tagline */
  tagline: { de: string; en: string; fa: string };
  /** Emoji icon */
  emoji: string;
  /** Which dashboard sections to show */
  dashboardSections: {
    welcomeCard: boolean;
    personalizedTip: boolean;
    todayTimeline: boolean;
    periodReminder: boolean;
    cycleWheel: boolean;
    ovulationInfo: boolean;
    fertilityInfo: boolean;
    pregnancyBanner: boolean;
    bodyTemperature: boolean;
    babyDevelopment: boolean;
    menopauseSymptoms: boolean;
    moodTracker: boolean;
    symptomTracker: boolean;
    todoList: boolean;
    supplements: boolean;
    partnerLink: boolean;
  };
  /** Sections to show on /heute page */
  heuteSections: {
    heroMainStatus: boolean;
    phaseCard: boolean;
    phaseProgressBar: boolean;
    babyDevelopment: boolean;
    todoList: boolean;
    symptomGrid: boolean;
    bodyTemperature: boolean;
    fertilityToday: boolean;
    moodCard: boolean;
    reminders: boolean;
    smartSuggestion: boolean;
    educationCard: boolean;
  };
  /** Priority features (display order) */
  priorityFeatures: Array<{
    id: string;
    icon: string;
    label: { de: string; en: string; fa: string };
  }>;
  /** Features that must NEVER be shown */
  blockedFeatures: string[];
  /** Recommended goals for onboarding */
  recommendedGoals: Goal[];
  /** Recommended interests for onboarding */
  recommendedInterests: Interest[];
  /** Content filter: keywords/topics to exclude from tips */
  blockedTopics: string[];
  /** Show education content by default */
  showEducationByDefault: boolean;
  /** Show fertility content by default */
  showFertilityByDefault: boolean;
}

// ============================================
// Persona-Specific Dashboard Content Headers
// ============================================

export interface DashboardHeroConfig {
  title: { de: string; en: string; fa: string };
  subtitle: { de: string; en: string; fa: string };
  primaryStat: 'cycle_day' | 'fertile_window' | 'symptoms_today' | 'week_number';
  secondaryStat: 'next_period' | 'ovulation_countdown' | 'consecutive_logged' | 'hot_flashes';
  ctaText: { de: string; en: string; fa: string };
  ctaLink: string;
  moodPrompt: { de: string; en: string; fa: string };
}

export const DASHBOARD_HERO: Record<PersonaId, DashboardHeroConfig> = {
  teen: {
    title: { de: "Dein Körper ist ein Wunder", en: "Your body is a wonder", fa: "بدن تو یک شگفتی است" },
    subtitle: { de: "Lerne ihn kennen – in deinem Tempo", en: "Get to know it – at your pace", fa: "آشنا شو – با سرعت خودت" },
    primaryStat: 'cycle_day',
    secondaryStat: 'next_period',
    ctaText: { de: "Heutige Lektion entdecken", en: "Discover today's lesson", fa: "کشف درس امروز" },
    ctaLink: "/heute",
    moodPrompt: { de: "Wie fühlst du dich heute?", en: "How do you feel today?", fa: "امروز چه حسی داری؟" },
  },
  adult: {
    title: { de: "Dein Zyklus, deine Superkraft", en: "Your cycle, your superpower", fa: "چرخه تو، ابرقدرت تو" },
    subtitle: { de: "Verstehe deinen Körper und lebe im Einklang", en: "Understand your body and live in sync", fa: "بدنت را بفهم و هماهنگ زندگی کن" },
    primaryStat: 'cycle_day',
    secondaryStat: 'next_period',
    ctaText: { de: "Heute im Detail", en: "Today in detail", fa: "امروز با جزئیات" },
    ctaLink: "/heute",
    moodPrompt: { de: "Wie ist deine Energie heute?", en: "What's your energy today?", fa: "انرژی امروزت چطوره؟" },
  },
  trying_to_conceive: {
    title: { de: "Deine Reise zum Wunschkind", en: "Your journey to conceive", fa: "سفر تو به سوی بارداری" },
    subtitle: { de: "Wir begleiten dich – mit Liebe und Präzision", en: "We're with you – with love and precision", fa: "ما همراه تو هستیم – با عشق و دقت" },
    primaryStat: 'fertile_window',
    secondaryStat: 'ovulation_countdown',
    ctaText: { de: "Fruchtbarkeitsfenster prüfen", en: "Check fertile window", fa: "بررسی پنجره باروری" },
    ctaLink: "/heute",
    moodPrompt: { de: "Wie fühlst du dich heute auf deiner Reise?", en: "How do you feel on your journey today?", fa: "امروز در سفرت چه حسی داری؟" },
  },
  perimenopause: {
    title: { de: "Eine neue Phase – voller Kraft", en: "A new phase – full of strength", fa: "یک مرحله جدید – پر از قدرت" },
    subtitle: { de: "Dein Körper verändert sich – wir sind für dich da", en: "Your body is changing – we're here for you", fa: "بدنت در حال تغییر است – ما برای تو اینجا هستیم" },
    primaryStat: 'symptoms_today',
    secondaryStat: 'hot_flashes',
    ctaText: { de: "Symptome heute erfassen", en: "Log today's symptoms", fa: "ثبت علائم امروز" },
    ctaLink: "/gesundheit",
    moodPrompt: { de: "Wie geht es dir heute?", en: "How are you today?", fa: "امروز حال تو چطور است؟" },
  },
};

// ============================================
// Persona-Specific Educational Content
// ============================================

export interface EducationModule {
  id: string;
  title: { de: string; en: string; fa: string };
  summary: { de: string; en: string; fa: string };
  emoji: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const EDUCATION_MODULES: Record<PersonaId, EducationModule[]> = {
  teen: [
    {
      id: 'what_is_period',
      title: { de: "Was ist die Periode?", en: "What is a period?", fa: "پریود چیست؟" },
      summary: { de: "Ganz einfach erklärt – dein Körper bereitet sich jeden Monat vor.", en: "Simply explained – your body prepares every month.", fa: "ساده توضیح داده شده – بدنت هر ماه آماده می‌شود." },
      emoji: "🩸",
      difficulty: 'beginner',
    },
    {
      id: 'cycle_phases',
      title: { de: "Die 4 Phasen deines Zyklus", en: "The 4 phases of your cycle", fa: "۴ فاز چرخه تو" },
      summary: { de: "Lerne die Menstruations-, Follikel-, Ovulations- und Lutealphase kennen.", en: "Learn about menstrual, follicular, ovulation, and luteal phases.", fa: "با فازهای قاعدگی، فولیکولی، تخمک‌گذاری و لوتئال آشنا شو." },
      emoji: "🌙",
      difficulty: 'beginner',
    },
    {
      id: 'self_care_tips',
      title: { de: "Self-Care während der Periode", en: "Self-care during your period", fa: "مراقبت از خود در دوران پریود" },
      summary: { de: "Wärme, Ruhe und die richtige Ernährung helfen dir.", en: "Warmth, rest, and the right nutrition help.", fa: "گرما، استراحت و تغذیه مناسب به تو کمک می‌کند." },
      emoji: "🌸",
      difficulty: 'beginner',
    },
    {
      id: 'body_changes',
      title: { de: "Veränderungen in der Pubertät", en: "Changes during puberty", fa: "تغییرات در دوران بلوغ" },
      summary: { de: "Dein Körper verändert sich – das ist völlig normal.", en: "Your body is changing – that's completely normal.", fa: "بدنت در حال تغییر است – این کاملاً طبیعی است." },
      emoji: "🦋",
      difficulty: 'beginner',
    },
  ],
  adult: [
    {
      id: 'cycle_tracking',
      title: { de: "Zyklus-Tracking leicht gemacht", en: "Cycle tracking made easy", fa: "پیگیری چرخه آسان شد" },
      summary: { de: "Erfahre, warum Tracking dir hilft, deinen Körper besser zu verstehen.", en: "Learn why tracking helps you understand your body better.", fa: "بفهم چرا پیگیری به تو کمک می‌کند بدنت را بهتر بشناسی." },
      emoji: "📊",
      difficulty: 'intermediate',
    },
    {
      id: 'hormone_health',
      title: { de: "Hormonelle Gesundheit", en: "Hormonal health", fa: "سلامت هورمونی" },
      summary: { de: "Wie Hormone deinen Körper, deine Stimmung und deine Energie beeinflussen.", en: "How hormones affect your body, mood, and energy.", fa: "هورمون‌ها چگونه بر بدن، خلق و انرژی تو تأثیر می‌گذارند." },
      emoji: "🧪",
      difficulty: 'intermediate',
    },
    {
      id: 'nutrition_cycle',
      title: { de: "Ernährung nach Zyklusphase", en: "Nutrition by cycle phase", fa: "تغذیه بر اساس فاز چرخه" },
      summary: { de: "Iss das Richtige für jede Phase deines Zyklus.", en: "Eat the right foods for each cycle phase.", fa: "غذای مناسب هر فاز چرخه را بخور." },
      emoji: "🥗",
      difficulty: 'intermediate',
    },
  ],
  trying_to_conceive: [
    {
      id: 'fertile_window',
      title: { de: "Dein Fruchtbarkeitsfenster", en: "Your fertile window", fa: "پنجره باروری تو" },
      summary: { de: "Die 6 Tage, an denen eine Schwangerschaft möglich ist.", en: "The 6 days when pregnancy is possible.", fa: "۶ روزی که بارداری ممکن است." },
      emoji: "❤️",
      difficulty: 'intermediate',
    },
    {
      id: 'ovulation_signs',
      title: { de: "Anzeichen des Eisprungs", en: "Signs of ovulation", fa: "نشانه‌های تخمک‌گذاری" },
      summary: { de: "Lerne die körperlichen Zeichen deines Eisprungs kennen.", en: "Learn the physical signs of your ovulation.", fa: "نشانه‌های فیزیکی تخمک‌گذاری را بشناس." },
      emoji: "🌕",
      difficulty: 'advanced',
    },
    {
      id: 'preconception_health',
      title: { de: "Gesundheit vor der Schwangerschaft", en: "Preconception health", fa: "سلامتی قبل از بارداری" },
      summary: { de: "Folsäure, Ernährung und Lebensstil für eine gesunde Schwangerschaft.", en: "Folic acid, nutrition, and lifestyle for a healthy pregnancy.", fa: "اسید فولیک، تغذیه و سبک زندگی برای بارداری سالم." },
      emoji: "💊",
      difficulty: 'intermediate',
    },
    {
      id: 'stress_fertility',
      title: { de: "Stress und Fruchtbarkeit", en: "Stress and fertility", fa: "استرس و باروری" },
      summary: { de: "Wie du Stress reduzieren und deine Fruchtbarkeit fördern kannst.", en: "How to reduce stress and boost fertility.", fa: "چگونه استرس را کاهش دهی و باروری را تقویت کنی." },
      emoji: "🧘",
      difficulty: 'intermediate',
    },
  ],
  perimenopause: [
    {
      id: 'what_is_perimenopause',
      title: { de: "Was ist die Perimenopause?", en: "What is perimenopause?", fa: "پیش از یائسگی چیست؟" },
      summary: { de: "Die Übergangsphase vor der Menopause – dein Körper verändert sich.", en: "The transition phase before menopause – your body is changing.", fa: "مرحله انتقالی قبل از یائسگی – بدنت در حال تغییر است." },
      emoji: "🦋",
      difficulty: 'beginner',
    },
    {
      id: 'symptom_management',
      title: { de: "Umgang mit Symptomen", en: "Managing symptoms", fa: "مدیریت علائم" },
      summary: { de: "Hitzewallungen, Schlafstörungen und Stimmungsschwankungen lindern.", en: "Relieve hot flashes, sleep issues, and mood swings.", fa: "کاهش گرگرفتگی، مشکلات خواب و نوسانات خلقی." },
      emoji: "🔥",
      difficulty: 'intermediate',
    },
    {
      id: 'bone_health',
      title: { de: "Knochengesundheit in den Wechseljahren", en: "Bone health in menopause", fa: "سلامت استخوان در یائسگی" },
      summary: { de: "Kalzium, Vitamin D und Bewegung für starke Knochen.", en: "Calcium, vitamin D, and exercise for strong bones.", fa: "کلسیم، ویتامین D و ورزش برای استخوان‌های قوی." },
      emoji: "🦴",
      difficulty: 'intermediate',
    },
    {
      id: 'hormone_therapy',
      title: { de: "Hormontherapie – was du wissen solltest", en: "Hormone therapy – what to know", fa: "هورمون‌درمانی – آنچه باید بدانی" },
      summary: { de: "Vor- und Nachteile der Hormonersatztherapie (HRT).", en: "Pros and cons of hormone replacement therapy (HRT).", fa: "مزایا و معایب هورمون‌درمانی جایگزین (HRT)." },
      emoji: "💊",
      difficulty: 'advanced',
    },
  ],
};

// ============================================
// Persona Configurations
// ============================================

export const PERSONA_CONFIGS: Record<PersonaId, PersonaConfig> = {
  // ═══════════════════════════════════════════
  // PERSONA 1: TEEN (13-17)
  // ═══════════════════════════════════════════
  teen: {
    id: 'teen',
    lifeStage: 'teen',
    label: { de: "Teenager", en: "Teen", fa: "نوجوان" },
    tagline: { de: "Entdecke deinen Körper", en: "Discover your body", fa: "بدنت را کشف کن" },
    emoji: "🌸",
    dashboardSections: {
      welcomeCard: true,
      personalizedTip: true,
      todayTimeline: false, // Too complex - use simplified version
      periodReminder: true,
      cycleWheel: true, // Simplified
      ovulationInfo: false,
      fertilityInfo: false,
      pregnancyBanner: false,
      bodyTemperature: false,
      babyDevelopment: false,
      menopauseSymptoms: false,
      moodTracker: true,
      symptomTracker: true, // Simplified
      todoList: true,
      supplements: false,
      partnerLink: false,
    },
    heuteSections: {
      heroMainStatus: true, // Simplified
      phaseCard: true, // Simplified
      phaseProgressBar: false,
      babyDevelopment: false,
      todoList: true,
      symptomGrid: true, // Simplified emoji-only
      bodyTemperature: false,
      fertilityToday: false,
      moodCard: true,
      reminders: false,
      smartSuggestion: true,
      educationCard: true, // Priority: education first
    },
    priorityFeatures: [
      { id: 'education', icon: '📚', label: { de: "Lernen", en: "Learn", fa: "یادگیری" } },
      { id: 'cycle', icon: '🌙', label: { de: "Mein Zyklus", en: "My Cycle", fa: "چرخه من" } },
      { id: 'mood', icon: '😊', label: { de: "Mein Gefühl", en: "My Mood", fa: "حال من" } },
    ],
    blockedFeatures: [
      'ovulation', 'fertile_window', 'basal_temperature', 
      'cervical_mucus', 'pregnancy', 'conception',
      'hrT_therapy', 'menopause_symptoms',
    ],
    recommendedGoals: ['understand_cycle', 'track_period', 'general_health'],
    recommendedInterests: ['mental_health', 'nutrition', 'sleep', 'exercise'],
    blockedTopics: ['sex', 'intercourse', 'fertility_treatment', 'miscarriage', 'hrT'],
    showEducationByDefault: true,
    showFertilityByDefault: false,
  },

  // ═══════════════════════════════════════════
  // PERSONA 2: ADULT (25-30)
  // ═══════════════════════════════════════════
  adult: {
    id: 'adult',
    lifeStage: 'adult',
    label: { de: "Erwachsene", en: "Adult", fa: "بزرگسال" },
    tagline: { de: "Dein Zyklus, deine Stärke", en: "Your cycle, your strength", fa: "چرخه تو، قدرت تو" },
    emoji: "🌺",
    dashboardSections: {
      welcomeCard: true,
      personalizedTip: true,
      todayTimeline: true,
      periodReminder: true,
      cycleWheel: true,
      ovulationInfo: true,
      fertilityInfo: true,
      pregnancyBanner: false, // Only when pregnant
      bodyTemperature: true, // Optional
      babyDevelopment: false,
      menopauseSymptoms: false,
      moodTracker: true,
      symptomTracker: true,
      todoList: true,
      supplements: true,
      partnerLink: true,
    },
    heuteSections: {
      heroMainStatus: true,
      phaseCard: true,
      phaseProgressBar: true,
      babyDevelopment: false,
      todoList: true,
      symptomGrid: true,
      bodyTemperature: true,
      fertilityToday: true, // May be hidden by preference
      moodCard: true,
      reminders: true,
      smartSuggestion: true,
      educationCard: false, // Less priority for adult, shown via separate section
    },
    priorityFeatures: [
      { id: 'today', icon: '📅', label: { de: "Heute", en: "Today", fa: "امروز" } },
      { id: 'cycle', icon: '🌙', label: { de: "Zyklus", en: "Cycle", fa: "چرخه" } },
      { id: 'health', icon: '💪', label: { de: "Gesundheit", en: "Health", fa: "سلامتی" } },
      { id: 'mood', icon: '😊', label: { de: "Gefühle", en: "Feelings", fa: "احساسات" } },
      { id: 'yoga', icon: '🧘', label: { de: "Yoga", en: "Yoga", fa: "یوگا" } },
    ],
    blockedFeatures: [
      'menopause_symptoms', 'baby_development',
    ],
    recommendedGoals: ['track_period', 'manage_pms', 'general_health'],
    recommendedInterests: ['nutrition', 'exercise', 'mental_health', 'sleep', 'hormones'],
    blockedTopics: [],
    showEducationByDefault: true,
    showFertilityByDefault: true,
  },

  // ═══════════════════════════════════════════
  // PERSONA 3: TRYING TO CONCEIVE (~35)
  // ═══════════════════════════════════════════
  trying_to_conceive: {
    id: 'trying_to_conceive',
    lifeStage: 'trying_to_conceive',
    label: { de: "Kinderwunsch", en: "Trying to Conceive", fa: "قصد بارداری" },
    tagline: { de: "Deine Reise zum Wunschkind", en: "Your journey to conceive", fa: "سفر تو به سوی بارداری" },
    emoji: "💕",
    dashboardSections: {
      welcomeCard: true,
      personalizedTip: true,
      todayTimeline: true,
      periodReminder: true,
      cycleWheel: true,
      ovulationInfo: true, // PRIMARY
      fertilityInfo: true, // PRIMARY
      pregnancyBanner: false, // Only when confirmed
      bodyTemperature: true, // Important for tracking
      babyDevelopment: false,
      menopauseSymptoms: false,
      moodTracker: true,
      symptomTracker: true,
      todoList: true,
      supplements: true, // Important (folic acid)
      partnerLink: true, // Partner connection
    },
    heuteSections: {
      heroMainStatus: true, // Focus on fertility
      phaseCard: true,
      phaseProgressBar: true,
      babyDevelopment: false,
      todoList: true,
      symptomGrid: true,
      bodyTemperature: true, // Important
      fertilityToday: true, // PRIMARY
      moodCard: true,
      reminders: true,
      smartSuggestion: true,
      educationCard: true, // Conception education
    },
    priorityFeatures: [
      { id: 'fertility', icon: '❤️', label: { de: "Fruchtbarkeit", en: "Fertility", fa: "باروری" } },
      { id: 'today', icon: '📅', label: { de: "Heute", en: "Today", fa: "امروز" } },
      { id: 'cycle', icon: '🌙', label: { de: "Zyklus", en: "Cycle", fa: "چرخه" } },
      { id: 'health', icon: '💪', label: { de: "Gesundheit", en: "Health", fa: "سلامتی" } },
      { id: 'pregnancy', icon: '🤰', label: { de: "Schwangerschaft", en: "Pregnancy", fa: "بارداری" } },
    ],
    blockedFeatures: [
      'contraception', 'menopause_symptoms', 'baby_development',
      'avoid_pregnancy',
    ],
    recommendedGoals: ['conceive', 'understand_cycle', 'general_health'],
    recommendedInterests: ['fertility', 'nutrition', 'hormones', 'mental_health', 'exercise'],
    blockedTopics: ['contraception', 'abortion'],
    showEducationByDefault: true,
    showFertilityByDefault: true,
  },

  // ═══════════════════════════════════════════
  // PERSONA 4: PERIMENOPAUSE (~45-55)
  // ═══════════════════════════════════════════
  perimenopause: {
    id: 'perimenopause',
    lifeStage: 'perimenopause',
    label: { de: "Perimenopause", en: "Perimenopause", fa: "پیش از یائسگی" },
    tagline: { de: "Eine neue Phase – voller Kraft", en: "A new phase – full of strength", fa: "یک مرحله جدید – پر از قدرت" },
    emoji: "🦋",
    dashboardSections: {
      welcomeCard: true,
      personalizedTip: true,
      todayTimeline: true, // Adapted for menopause
      periodReminder: true,
      cycleWheel: true, // Adapted for irregular cycles
      ovulationInfo: false,
      fertilityInfo: false,
      pregnancyBanner: false,
      bodyTemperature: false, // Not useful for menopause
      babyDevelopment: false,
      menopauseSymptoms: true, // PRIMARY
      moodTracker: true,
      symptomTracker: true, // PRIMARY
      todoList: true,
      supplements: true, // Bone health, vitamins
      partnerLink: false,
    },
    heuteSections: {
      heroMainStatus: true, // Focus on symptoms
      phaseCard: true,
      phaseProgressBar: true,
      babyDevelopment: false,
      todoList: true,
      symptomGrid: true, // Expanded for menopause
      bodyTemperature: false,
      fertilityToday: false,
      moodCard: true, // Important
      reminders: true,
      smartSuggestion: true,
      educationCard: true, // Menopause education
    },
    priorityFeatures: [
      { id: 'symptoms', icon: '🔥', label: { de: "Symptome", en: "Symptoms", fa: "علائم" } },
      { id: 'health', icon: '💪', label: { de: "Gesundheit", en: "Health", fa: "سلامتی" } },
      { id: 'mood', icon: '😊', label: { de: "Gefühle", en: "Feelings", fa: "احساسات" } },
      { id: 'menopause', icon: '🦋', label: { de: "Wechseljahre", en: "Menopause", fa: "یائسگی" } },
      { id: 'yoga', icon: '🧘', label: { de: "Yoga", en: "Yoga", fa: "یوگا" } },
    ],
    blockedFeatures: [
      'ovulation', 'fertile_window', 'basal_temperature',
      'cervical_mucus', 'pregnancy', 'conception',
      'baby_development', 'contraception',
    ],
    recommendedGoals: ['manage_menopause', 'manage_pms', 'general_health'],
    recommendedInterests: ['nutrition', 'exercise', 'mental_health', 'sleep', 'hormones', 'skin_hair'],
    blockedTopics: ['pregnancy', 'conception', 'baby'],
    showEducationByDefault: true,
    showFertilityByDefault: false,
  },
};

// ============================================
// Helper: Map LifeStage → PersonaId
// ============================================

export function lifeStageToPersona(lifeStage: LifeStage | null | undefined): PersonaId {
  switch (lifeStage) {
    case 'teen': return 'teen';
    case 'young_adult':
    case 'adult': return 'adult';
    case 'trying_to_conceive': return 'trying_to_conceive';
    case 'pregnant':
    case 'postpartum': return 'adult'; // Fallback to adult
    case 'perimenopause':
    case 'menopause': return 'perimenopause';
    default: return 'adult';
  }
}

// ============================================
// Helper: Get full persona config
// ============================================

export function getPersonaConfig(lifeStage: LifeStage | null | undefined): PersonaConfig {
  const personaId = lifeStageToPersona(lifeStage);
  return PERSONA_CONFIGS[personaId];
}

// ============================================
// Helper: Check if feature is blocked
// ============================================

export function isFeatureBlocked(featureId: string, lifeStage: LifeStage | null | undefined): boolean {
  const config = getPersonaConfig(lifeStage);
  return config.blockedFeatures.includes(featureId);
}

// ============================================
// Helper: Check if topic is blocked
// ============================================

export function isTopicBlocked(topic: string, lifeStage: LifeStage | null | undefined): boolean {
  const config = getPersonaConfig(lifeStage);
  return config.blockedTopics.some(blocked => 
    topic.toLowerCase().includes(blocked.toLowerCase())
  );
}