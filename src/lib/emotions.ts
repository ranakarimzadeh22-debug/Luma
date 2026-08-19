// Emotion types & helpers for Luma's Gefühle-Abteilung

export type MoodKey =
  | "happy" | "sad" | "tired" | "stressed"
  | "anxious" | "calm" | "loving" | "sick" | "energetic";

export interface MoodEntry {
  date: string;       // YYYY-MM-DD
  key: MoodKey;
  intensity: number;  // 1–5
  note?: string;
  timestamp: number;
}

export interface CalendarDay {
  date: string;
  day: number;
  month: number;
  weekday: number;
  entry?: MoodEntry;
}

export interface PatternResult {
  emoji: string;
  titleDe: string;
  titleEn: string;
  titleFa: string;
  descDe: string;
  descEn: string;
  descFa: string;
}

export interface BuddyResponse {
  emoji: string;
  textDe: string;
  textEn: string;
  textFa: string;
}

export interface MoodDef {
  key: MoodKey;
  labelDe: string;
  labelEn: string;
  labelFa: string;
  color: string;
  textColor: string;
  partnerMsgDe: string;
  partnerMsgEn: string;
  partnerMsgFa: string;
  tips: { icon: string; textDe: string; textEn: string; textFa: string }[];
}

export const MOODS: MoodDef[] = [
  {
    key: "happy", labelDe: "Glücklich", labelEn: "Happy", labelFa: "خوشحال",
    color: "#cfe8d5", textColor: "#5a9e72",
    partnerMsgDe: "Deine Partnerin fühlt sich heute glücklich und gut! 😊",
    partnerMsgEn: "Your partner is feeling happy today! 😊",
    partnerMsgFa: "شریک شما امروز خوشحال است! 😊",
    tips: [
      { icon: "🚶‍♀️", textDe: "Spazieren & die gute Laune genießen", textEn: "Take a walk & enjoy the good mood", textFa: "قدم زدن و لذت بردن از خلق خوب" },
      { icon: "📖", textDe: "Ein Buch lesen oder etwas Neues lernen", textEn: "Read a book or learn something new", textFa: "کتاب خواندن یا یادگیری چیزی جدید" },
      { icon: "🎵", textDe: "Lieblingsmusik hören & tanzen", textEn: "Listen to your favorite music & dance", textFa: "گوش دادن به موسیقی مورد علاقه و رقصیدن" },
      { icon: "💌", textDe: "Jemandem eine nette Nachricht schicken", textEn: "Send a kind message to someone", textFa: "فرستادن یک پیام محبت‌آمیز به کسی" },
    ],
  },
  {
    key: "sad", labelDe: "Traurig", labelEn: "Sad", labelFa: "غمگین",
    color: "#b799e5", textColor: "#7a5a9e",
    partnerMsgDe: "Deine Partnerin fühlt sich heute etwas traurig 😢",
    partnerMsgEn: "Your partner is feeling a bit sad today 😢",
    partnerMsgFa: "شریک شما امروز کمی غمگین است 😢",
    tips: [
      { icon: "💧", textDe: "Viel Wasser trinken", textEn: "Drink plenty of water", textFa: "آب زیاد بنوشید" },
      { icon: "🧘‍♀️", textDe: "5 Minuten ruhig atmen", textEn: "5 minutes of calm breathing", textFa: "۵ دقیقه تنفس آرام" },
      { icon: "🚶‍♀️", textDe: "Kurzer Spaziergang an der frischen Luft", textEn: "Short walk in fresh air", textFa: "قدم زدن کوتاه در هوای تازه" },
      { icon: "🍫", textDe: "Etwas Schokolade – du verdienst es", textEn: "Some chocolate – you deserve it", textFa: "کمی شکلات - لیاقتش را داری" },
    ],
  },
  {
    key: "tired", labelDe: "Müde", labelEn: "Tired", labelFa: "خسته",
    color: "#ffd9c7", textColor: "#c4845a",
    partnerMsgDe: "Deine Partnerin ist heute sehr müde 😴",
    partnerMsgEn: "Your partner is very tired today 😴",
    partnerMsgFa: "شریک شما امروز بسیار خسته است 😴",
    tips: [
      { icon: "😴", textDe: "Ein kurzes Nickerchen (20 Min.)", textEn: "A short nap (20 min)", textFa: "یک چرت کوتاه (۲۰ دقیقه)" },
      { icon: "🍵", textDe: "Warmen Kräutertee trinken", textEn: "Drink warm herbal tea", textFa: "نوشیدن چای گیاهی گرم" },
      { icon: "🧘‍♀️", textDe: "Sanfte Dehnübungen im Bett", textEn: "Gentle stretches in bed", textFa: "حرکات کششی نرم در رختخواب" },
      { icon: "📵", textDe: "Handy weglegen & Augen ausruhen", textEn: "Put away phone & rest eyes", textFa: "کنار گذاشتن تلفن و استراحت چشم‌ها" },
    ],
  },
  {
    key: "stressed", labelDe: "Gestresst", labelEn: "Stressed", labelFa: "استرس",
    color: "#f4c7d7", textColor: "#c47a9a",
    partnerMsgDe: "Deine Partnerin ist heute gestresst 😤",
    partnerMsgEn: "Your partner is stressed today 😤",
    partnerMsgFa: "شریک شما امروز استرس دارد 😤",
    tips: [
      { icon: "🌬️", textDe: "4-7-8 Atemübung: 4s ein, 7 halten, 8 aus", textEn: "4-7-8 breathing: 4s in, 7 hold, 8 out", textFa: "تنفس ۴-۷-۸: ۴ ثانیه دم، ۷ نگه، ۸ بازدم" },
      { icon: "🚶‍♀️", textDe: "10 Minuten Spazieren zum Abschalten", textEn: "10 min walk to unwind", textFa: "۱۰ دقیقه پیاده‌روی برای آرامش" },
      { icon: "📝", textDe: "Gedanken aufschreiben", textEn: "Write down your thoughts", textFa: "نوشتن افکار" },
      { icon: "🛁", textDe: "Warmes Bad oder Dusche", textEn: "Warm bath or shower", textFa: "حمام یا دوش گرم" },
    ],
  },
  {
    key: "anxious", labelDe: "Ängstlich", labelEn: "Anxious", labelFa: "مضطرب",
    color: "#ffd9c7", textColor: "#c4845a",
    partnerMsgDe: "Deine Partnerin fühlt sich etwas ängstlich 😟",
    partnerMsgEn: "Your partner is feeling a bit anxious 😟",
    partnerMsgFa: "شریک شما کمی مضطرب است 😟",
    tips: [
      { icon: "🌬️", textDe: "Tief ein- und ausatmen – 5 Mal langsam", textEn: "Breathe deeply – 5 times slowly", textFa: "نفس عمیق - ۵ بار آهسته" },
      { icon: "🧘‍♀️", textDe: "Yoga beruhigt das Nervensystem", textEn: "Yoga calms the nervous system", textFa: "یوگا سیستم عصبی را آرام می‌کند" },
      { icon: "🍵", textDe: "Kamillentee trinken", textEn: "Drink chamomile tea", textFa: "نوشیدن چای بابونه" },
      { icon: "💬", textDe: "Mit jemandem vertrauten sprechen", textEn: "Talk to someone you trust", textFa: "صحبت با کسی که به او اعتماد داری" },
    ],
  },
  {
    key: "calm", labelDe: "Entspannt", labelEn: "Calm", labelFa: "آرام",
    color: "#cfe8d5", textColor: "#5a9e72",
    partnerMsgDe: "Deine Partnerin ist heute entspannt 😌",
    partnerMsgEn: "Your partner is calm today 😌",
    partnerMsgFa: "شریک شما امروز آرام است 😌",
    tips: [
      { icon: "🌿", textDe: "In der Natur spazieren", textEn: "Walk in nature", textFa: "قدم زدن در طبیعت" },
      { icon: "📖", textDe: "Lesen oder Tagebuch schreiben", textEn: "Read or journal", textFa: "خواندن یا نوشتن خاطرات" },
      { icon: "🎨", textDe: "Kreativ sein – malen, basteln, kochen", textEn: "Get creative – paint, craft, cook", textFa: "خلاق بودن - نقاشی، کاردستی، آشپزی" },
      { icon: "🧘‍♀️", textDe: "Meditation oder sanftes Yoga", textEn: "Meditation or gentle yoga", textFa: "مدیتیشن یا یوگای ملایم" },
    ],
  },
  {
    key: "loving", labelDe: "Verliebt", labelEn: "Loving", labelFa: "عاشق",
    color: "#f4c7d7", textColor: "#c47a9a",
    partnerMsgDe: "Deine Partnerin denkt heute besonders an dich 🥰",
    partnerMsgEn: "Your partner is thinking of you today 🥰",
    partnerMsgFa: "شریک شما امروز به شما فکر می‌کند 🥰",
    tips: [
      { icon: "💌", textDe: "Eine liebe Nachricht schicken", textEn: "Send a loving message", textFa: "فرستادن یک پیام عاشقانه" },
      { icon: "🌹", textDe: "Etwas Schönes zusammen planen", textEn: "Plan something nice together", textFa: "برنامه‌ریزی برای یک کار خوب با هم" },
      { icon: "📸", textDe: "Schöne Erinnerungen anschauen", textEn: "Look at beautiful memories", textFa: "نگاه کردن به خاطرات زیبا" },
      { icon: "🍳", textDe: "Zusammen kochen oder essen", textEn: "Cook or eat together", textFa: "آشپزی یا غذا خوردن با هم" },
    ],
  },
  {
    key: "sick", labelDe: "Krank", labelEn: "Sick", labelFa: "بیمار",
    color: "#b799e5", textColor: "#7a5a9e",
    partnerMsgDe: "Deine Partnerin ist heute krank 🤒",
    partnerMsgEn: "Your partner is sick today 🤒",
    partnerMsgFa: "شریک شما امروز بیمار است 🤒",
    tips: [
      { icon: "💧", textDe: "Viel Wasser oder Ingwertee trinken", textEn: "Drink water or ginger tea", textFa: "نوشیدن آب یا چای زنجبیل" },
      { icon: "😴", textDe: "So viel schlafen wie möglich", textEn: "Sleep as much as possible", textFa: "تا حد امکان بخواب" },
      { icon: "🍲", textDe: "Leichte Suppe oder Brühe essen", textEn: "Eat light soup or broth", textFa: "سوپ سبک یا آبگوشت بخور" },
      { icon: "🌡️", textDe: "Temperatur messen & Ruhe gönnen", textEn: "Check temperature & rest", textFa: "دمای بدن را چک کن و استراحت کن" },
    ],
  },
  {
    key: "energetic", labelDe: "Energievoll", labelEn: "Energetic", labelFa: "پر انرژی",
    color: "#cfe8d5", textColor: "#5a9e72",
    partnerMsgDe: "Deine Partnerin ist heute voller Energie ⚡",
    partnerMsgEn: "Your partner is full of energy today ⚡",
    partnerMsgFa: "شریک شما امروز پر انرژی است ⚡",
    tips: [
      { icon: "🏃‍♀️", textDe: "Laufen, Radfahren oder Sport", textEn: "Run, cycle or exercise", textFa: "دویدن، دوچرخه‌سواری یا ورزش" },
      { icon: "🧹", textDe: "Wohnung aufräumen – macht den Kopf frei", textEn: "Tidy up – clears your mind", textFa: "مرتب کردن خانه - ذهن را آزاد می‌کند" },
      { icon: "🎯", textDe: "Ein Ziel angehen", textEn: "Tackle a goal", textFa: "به یک هدف بپرداز" },
      { icon: "🕺", textDe: "Tanzen & Energie rauslassen", textEn: "Dance & let the energy out", textFa: "برقص و انرژی را آزاد کن" },
    ],
  },
];

/* ---------- storage ---------- */

const STORAGE_KEY = "luma-moods-v2";

export function loadMoods(): MoodEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MoodEntry[];
  } catch { /* ignore */ }
  // migrate old format
  try {
    const old = localStorage.getItem("luma-moods");
    if (old) {
      const map = JSON.parse(old) as Record<string, string>;
      const migrated: MoodEntry[] = Object.entries(map).map(([date, key]) => ({
        date,
        key: key as MoodKey,
        intensity: 3,
        timestamp: new Date(date).getTime(),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      localStorage.removeItem("luma-moods");
      return migrated;
    }
  } catch { /* ignore */ }
  return [];
}

export function saveMood(entry: MoodEntry) {
  const moods = loadMoods();
  const idx = moods.findIndex((m) => m.date === entry.date);
  if (idx >= 0) moods[idx] = entry;
  else moods.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(moods));
}

export function getTodayEntry(): MoodEntry | undefined {
  const today = new Date().toISOString().split("T")[0];
  return loadMoods().find((m) => m.date === today);
}

/* ---------- streak ---------- */

export function calcStreak(): number {
  const moods = loadMoods();
  if (!moods.length) return 0;
  const dates = moods.map((m) => m.date).sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  let check = today;
  for (const d of dates) {
    if (d === check) {
      streak++;
      const prev = new Date(check);
      prev.setDate(prev.getDate() - 1);
      check = prev.toISOString().split("T")[0];
    }
  }
  return streak;
}

/* ---------- calendar ---------- */

export function getCalendarDays(days = 30): CalendarDay[] {
  const moods = loadMoods();
  const result: CalendarDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    result.push({
      date: dateStr,
      day: d.getDate(),
      month: d.getMonth(),
      weekday: d.getDay(),
      entry: moods.find((m) => m.date === dateStr),
    });
  }
  return result;
}

/* ---------- mood color ---------- */

const MOOD_COLOR_MAP: Record<string, string> = {
  happy: "#5a9e72", sad: "#7a5a9e", tired: "#c4845a",
  stressed: "#c47a9a", anxious: "#c4845a", calm: "#5a9e72",
  loving: "#c47a9a", sick: "#7a5a9e", energetic: "#5a9e72",
};

export function moodColor(key: string): string {
  return MOOD_COLOR_MAP[key] ?? "#b799e5";
}

/* ---------- pattern analysis ---------- */

export function analyzePatterns(): PatternResult[] {
  const moods = loadMoods();
  if (moods.length < 3) return [];

  const results: PatternResult[] = [];

  const freq: Record<string, number> = {};
  moods.forEach((m) => { freq[m.key] = (freq[m.key] ?? 0) + 1; });
  const topKey = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (topKey) {
    const mood = MOODS.find((m) => m.key === topKey);
    results.push({
      emoji: "📊",
      titleDe: "Deine häufigste Stimmung",
      titleEn: "Your most common mood",
      titleFa: "رایج‌ترین حالت روحی شما",
      descDe: `Du fühlst dich oft ${mood?.labelDe ?? topKey}. Das ist völlig in Ordnung!`,
      descEn: `You often feel ${mood?.labelEn ?? topKey}. That's perfectly okay!`,
      descFa: `شما اغلب ${mood?.labelFa ?? topKey} هستید. این کاملاً طبیعی است!`,
    });
  }

  const lowKeys = new Set(["sad", "tired", "stressed", "anxious"]);
  const lowCount = moods.filter((m) => lowKeys.has(m.key)).length;
  const ratio = lowCount / moods.length;
  if (ratio > 0.4) {
    results.push({
      emoji: "🌧️",
      titleDe: "Achte auf dich",
      titleEn: "Take care of yourself",
      titleFa: "مراقب خودت باش",
      descDe: "In letzter Zeit überwiegen schwierige Gefühle. Vielleicht brauchst du eine Auszeit 💜",
      descEn: "Difficult feelings are more frequent lately. Maybe you need a break 💜",
      descFa: "اخیراً احساسات دشوار بیشتر شده‌اند. شاید به یک استراحت نیاز دارید 💜",
    });
  }

  return results;
}

/* ---------- buddy (rule-based) ---------- */

const AFFIRMATIONS_DE = [
  "Du bist stark, auch wenn es sich manchmal anders anfühlt 🌸",
  "Jeder Tag ist eine neue Chance – du schaffst das 💪",
  "Deine Gefühle sind wichtig und richtig 💜",
  "Du tust bereits so viel für dich – sei stolz auf dich ✨",
  "Kleine Schritte führen zu großen Veränderungen 🌱",
  "Heute ist ein guter Tag, um freundlich zu dir selbst zu sein 🌷",
];
const AFFIRMATIONS_EN = [
  "You are strong, even when it doesn't feel that way 🌸",
  "Every day is a new chance – you got this 💪",
  "Your feelings matter and are valid 💜",
  "You're already doing so much for yourself – be proud ✨",
  "Small steps lead to big changes 🌱",
  "Today is a good day to be kind to yourself 🌷",
];
const AFFIRMATIONS_FA = [
  "تو قوی هستی، حتی اگر گاهی حس متفاوتی داشته باشی 🌸",
  "هر روز یک فرصت جدید است – تو می‌توانی 💪",
  "احساسات تو مهم و درست هستند 💜",
  "تو از قبل کارهای زیادی برای خودت انجام می‌دهی – به خودت افتخار کن ✨",
  "قدم‌های کوچک به تغییرات بزرگ منجر می‌شوند 🌱",
  "امروز روز خوبی است برای مهربانی با خودت 🌷",
];

export function getBuddyResponse(moodKey?: MoodKey): BuddyResponse {
  const hour = new Date().getHours();

  const idx = Math.floor(Math.random() * AFFIRMATIONS_DE.length);

  if (!moodKey || moodKey === "happy" || moodKey === "calm" || moodKey === "energetic") {
    const baseDe = hour < 12 ? `Guten Morgen! 🌅 ` : hour < 18 ? `Schönen Nachmittag! ☀️ ` : `Guten Abend! 🌙 `;
    const baseEn = hour < 12 ? `Good morning! 🌅 ` : hour < 18 ? `Good afternoon! ☀️ ` : `Good evening! 🌙 `;
    const baseFa = hour < 12 ? `صبح بخیر! 🌅 ` : hour < 18 ? `بعد از ظهر خوب! ☀️ ` : `عصر بخیر! 🌙 `;
    return { emoji: "🌸", textDe: baseDe + AFFIRMATIONS_DE[idx], textEn: baseEn + AFFIRMATIONS_EN[idx], textFa: baseFa + AFFIRMATIONS_FA[idx] };
  }

  const moodMap: Record<string, Omit<BuddyResponse, "emoji">> = {
    sad: {
      textDe: "Es ist okay, traurig zu sein. Weinen ist heilsam. Lass die Gefühle zu 💧",
      textEn: "It's okay to be sad. Crying is healing. Let the feelings flow 💧",
      textFa: "اشکال ندارد که غمگین باشی. گریه کردن درمانی است. بگذار احساسات جاری شوند 💧",
    },
    tired: {
      textDe: "Dein Körper sagt dir, dass er Ruhe braucht. Hör auf ihn und gönn dir eine Pause 😴",
      textEn: "Your body is telling you it needs rest. Listen and take a break 😴",
      textFa: "بدن تو می‌گوید که به استراحت نیاز دارد. به آن گوش بده و استراحت کن 😴",
    },
    stressed: {
      textDe: "Stress ist ein Zeichen, dass du viel leistest. Aber vergiss nicht, auch auf dich zu achten 🌬️",
      textEn: "Stress is a sign you're achieving a lot. But don't forget to take care of yourself 🌬️",
      textFa: "استرس نشانه این است که کارهای زیادی انجام می‌دهی. اما فراموش نکن مراقب خودت هم باش 🌬️",
    },
    anxious: {
      textDe: "Angst ist ein Gefühl, nicht die Wahrheit. Atme tief durch – du bist sicher 🌿",
      textEn: "Fear is a feeling, not the truth. Breathe deeply – you are safe 🌿",
      textFa: "ترس یک احساس است، نه حقیقت. نفس عمیق بکش – تو در امانی 🌿",
    },
    loving: {
      textDe: "Liebe ist die schönste Energie! Genieße dieses Gefühl in vollen Zügen 🥰",
      textEn: "Love is the most beautiful energy! Enjoy this feeling to the fullest 🥰",
      textFa: "عشق زیباترین انرژی است! از این احساس نهایت لذت را ببر 🥰",
    },
    sick: {
      textDe: "Kranksein ist anstrengend. Gönn dir absolute Ruhe und werd schnell wieder gesund 🤒💜",
      textEn: "Being sick is exhausting. Give yourself absolute rest and get well soon 🤒💜",
      textFa: "بیمار بودن خسته‌کننده است. به خودت استراحت کامل بده و زود خوب شو 🤒💜",
    },
  };

  const response = moodMap[moodKey];
  if (response) return { emoji: "💬", ...response };

  return { emoji: "🌸", textDe: AFFIRMATIONS_DE[idx], textEn: AFFIRMATIONS_EN[idx], textFa: AFFIRMATIONS_FA[idx] };
}