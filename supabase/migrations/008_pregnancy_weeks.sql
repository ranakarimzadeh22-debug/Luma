-- Migration 008: Pregnancy weeks data
-- Creates a table for all 40 pregnancy weeks with fruit comparison, size, weight, milestones and tips

CREATE TABLE IF NOT EXISTS pregnancy_weeks (
  week INTEGER PRIMARY KEY,
  fruit TEXT NOT NULL,
  fruit_de TEXT NOT NULL,
  fruit_en TEXT NOT NULL,
  fruit_fa TEXT NOT NULL,
  size_cm DECIMAL(5,2) NOT NULL,
  weight_g INTEGER NOT NULL,
  milestone_de TEXT NOT NULL,
  milestone_en TEXT NOT NULL,
  milestone_fa TEXT NOT NULL,
  tip_de TEXT NOT NULL,
  tip_en TEXT NOT NULL,
  tip_fa TEXT NOT NULL
);

-- Enable RLS but allow public read (data is static reference)
ALTER TABLE pregnancy_weeks ENABLE ROW LEVEL SECURITY;

-- Everyone can read pregnancy week data (it's reference data, not user-specific)
CREATE POLICY "Everyone can read pregnancy weeks"
  ON pregnancy_weeks
  FOR SELECT
  USING (true);

-- Insert all 40 pregnancy weeks
INSERT INTO pregnancy_weeks (week, fruit, fruit_de, fruit_en, fruit_fa, size_cm, weight_g, milestone_de, milestone_en, milestone_fa, tip_de, tip_en, tip_fa) VALUES
(1, 'Mohnsamen', 'Mohnsamen', 'Poppy seed', 'دانه خشخاش', 0.01, 0, 'Dein Körper bereitet sich auf den Eisprung vor', 'Your body prepares for ovulation', 'بدن شما برای تخمک‌گذاری آماده می‌شود', 'Beginne mit Folsäure, wenn du es noch nicht tust', 'Start taking folic acid if you haven''t already', 'اگر هنوز شروع نکرده‌ای، اسید فولیک مصرف کن'),
(2, 'Mohnsamen', 'Mohnsamen', 'Poppy seed', 'دانه خشخاش', 0.02, 0, 'Der Eisprung findet statt – die Befruchtung kann erfolgen', 'Ovulation occurs – fertilization can happen', 'تخمک‌گذاری انجام می‌شود – لقاح می‌تواند اتفاق بیفتد', 'Achte auf eine ausgewogene Ernährung mit viel Gemüse', 'Eat a balanced diet with plenty of vegetables', 'به یک رژیم متعادل با سبزیجات فراوان توجه کن'),
(3, 'Stecknadelkopf', 'Stecknadelkopf', 'Pinhead', 'سری سوزن', 0.1, 0, 'Die Zelle teilt sich – das Leben beginnt', 'The cell divides – life begins', 'سلول تقسیم می‌شود – زندگی آغاز می‌شود', 'Vermeide Alkohol und Rauchen ab jetzt komplett', 'Avoid alcohol and smoking completely from now on', 'از همین حالا الکل و سیگار را کاملاً کنار بگذار'),
(4, 'Mohnsamen', 'Mohnsamen', 'Poppy seed', 'دانه خشخاش', 0.1, 0, 'Der Embryo nistet sich in der Gebärmutter ein', 'The embryo implants in the uterus', 'جنین در رحم لانه‌گزینی می‌کند', 'Deine Periode bleibt aus – Zeit für einen Schwangerschaftstest', 'Your period is late – time for a pregnancy test', 'پریودت عقب افتاده – وقت تست بارداری است'),
(5, 'Apfelsamen', 'Apfelsamen', 'Apple seed', 'دانه سیب', 0.3, 0, 'Das Herz beginnt zu schlagen!', 'The heart starts beating!', 'قلب شروع به تپیدن می‌کند!', 'Übelkeit kann auftreten – iss kleine, häufige Mahlzeiten', 'Nausea may occur – eat small, frequent meals', 'ممکن است حالت تهوع داشته باشی – وعده‌های کوچک و مکرر بخور'),
(6, 'Erbse', 'Erbse', 'Pea', 'نخود', 0.6, 0, 'Gehirn und Rückenmark beginnen sich zu bilden', 'Brain and spinal cord begin to form', 'مغز و نخاع شروع به شکل‌گیری می‌کنند', 'Trinke ausreichend Wasser – mindestens 2 Liter täglich', 'Drink plenty of water – at least 2 liters daily', 'به اندازه کافی آب بنوش – حداقل ۲ لیتر در روز'),
(7, 'Blaubeere', 'Blaubeere', 'Blueberry', 'زغال‌اخته', 1.3, 0, 'Arme und Beine beginnen zu wachsen', 'Arms and legs begin to grow', 'دست‌ها و پاها شروع به رشد می‌کنند', 'Vitamin B6 kann gegen Übelkeit helfen', 'Vitamin B6 can help with nausea', 'ویتامین B6 می‌تواند به کاهش تهوع کمک کند'),
(8, 'Himbeere', 'Himbeere', 'Raspberry', 'تمشک', 1.6, 1, 'Alle wichtigen Organe sind angelegt', 'All major organs have formed', 'همه اندام‌های اصلی شکل گرفته‌اند', 'Vereinbare deinen ersten Vorsorgetermin beim Frauenarzt', 'Schedule your first prenatal appointment', 'اولین ویزیت بارداری را با پزشک هماهنگ کن'),
(9, 'Kirsche', 'Kirsche', 'Cherry', 'گیلاس', 2.3, 2, 'Finger und Zehen sind vollständig getrennt', 'Fingers and toes are fully separated', 'انگشتان دست و پا کاملاً از هم جدا شده‌اند', 'Sanfte Bewegung wie Schwimmen oder Spazierengehen tut gut', 'Gentle exercise like swimming or walking is good', 'ورزش ملایم مثل شنا یا پیاده‌روی مفید است'),
(10, 'Pflaume', 'Pflaume', 'Plum', 'آلو', 3.1, 4, 'Das Baby kann seinen Mund öffnen und schließen', 'The baby can open and close its mouth', 'نوزاد می‌تواند دهان خود را باز و بسته کند', 'Eisenreiche Lebensmittel unterstützen die Blutbildung', 'Iron-rich foods support blood formation', 'غذاهای غنی از آهن به خون‌سازی کمک می‌کنند'),
(11, 'Feige', 'Feige', 'Fig', 'انجیر', 4.1, 7, 'Die Genitalien beginnen sich zu entwickeln', 'Genitals begin to develop', 'اندام تناسلی شروع به رشد می‌کند', 'Gönn dir ausreichend Schlaf – dein Körper arbeitet hart', 'Get enough sleep – your body is working hard', 'خواب کافی داشته باش – بدنت سخت کار می‌کند'),
(12, 'Limette', 'Limette', 'Lime', 'لیمو', 5.4, 14, 'Das Baby hat einen Greifreflex entwickelt', 'The baby has developed a grasp reflex', 'نوزاد رفلکس گرفتن را توسعه داده است', 'Das Risiko einer Fehlgeburt sinkt jetzt deutlich', 'The risk of miscarriage drops significantly now', 'خطر سقط جنین اکنون به طور قابل توجهی کاهش می‌یابد'),
(13, 'Pfirsich', 'Pfirsich', 'Peach', 'هلو', 7.4, 23, 'Das Baby kann seinen Daumen lutschen', 'The baby can suck its thumb', 'نوزاد می‌تواند انگشت شست خود را بمکد', 'Jetzt ist ein guter Zeitpunkt, um deine Ernährung umzustellen', 'Now is a good time to adjust your diet', 'الان زمان خوبی است تا رژیم غذایی خود را تنظیم کنی'),
(14, 'Zitrone', 'Zitrone', 'Lemon', 'لیمو', 8.7, 43, 'Das Baby beginnt, Fruchtwasser zu schlucken', 'The baby starts swallowing amniotic fluid', 'نوزاد شروع به بلع مایع آمنیوتیک می‌کند', 'Kalziumreiche Nahrung unterstützt den Knochenaufbau', 'Calcium-rich foods support bone development', 'غذاهای غنی از کلسیم به رشد استخوان کمک می‌کنند'),
(15, 'Apfel', 'Apfel', 'Apple', 'سیب', 10.1, 70, 'Das Baby kann Licht wahrnehmen', 'The baby can perceive light', 'نوزاد می‌تواند نور را درک کند', 'Trinke weiterhin ausreichend und bewege dich regelmäßig', 'Keep drinking enough and exercise regularly', 'به نوشیدن آب کافی و ورزش منظم ادامه بده'),
(16, 'Avocado', 'Avocado', 'Avocado', 'آووکادو', 11.6, 100, 'Das Baby kann seinen Kopf bewegen', 'The baby can move its head', 'نوزاد می‌تواند سر خود را حرکت دهد', 'Du könntest jetzt erste Kindsbewegungen spüren', 'You might feel the first baby movements now', 'ممکن است اولین حرکات جنین را حس کنی'),
(17, 'Birne', 'Birne', 'Pear', 'گلابی', 13, 140, 'Das Baby beginnt, Fettgewebe aufzubauen', 'The baby starts building fat tissue', 'نوزاد شروع به ساخت بافت چربی می‌کند', 'Magnesium kann Wadenkrämpfen vorbeugen', 'Magnesium can prevent leg cramps', 'منیزیم می‌تواند از گرفتگی عضلات پا جلوگیری کند'),
(18, 'Paprika', 'Paprika', 'Bell pepper', 'فلفل دلمه‌ای', 14.2, 190, 'Das Baby kann gähnen und Schluckauf haben', 'The baby can yawn and get hiccups', 'نوزاد می‌تواند خمیازه بکشد و سکسکه داشته باشد', 'Achte auf eine gute Körperhaltung – der Bauch wächst', 'Watch your posture – your belly is growing', 'به وضعیت بدنی خود توجه کن – شکم در حال رشد است'),
(19, 'Mango', 'Mango', 'Mango', 'انبه', 15.3, 240, 'Die Haut wird durch Lanugohaare geschützt', 'The skin is protected by lanugo hair', 'پوست توسط موهای کرکی محافظت می‌شود', 'Vitamin D ist jetzt besonders wichtig für Knochen', 'Vitamin D is especially important for bones now', 'ویتامین D اکنون برای استخوان‌ها بسیار مهم است'),
(20, 'Banane', 'Banane', 'Banana', 'موز', 16.5, 300, 'Das Baby kann hören – es reagiert auf Geräusche', 'The baby can hear – it reacts to sounds', 'نوزاد می‌شنود – به صداها واکنش نشان می‌دهد', 'Sprich und singe für dein Baby – es erkennt deine Stimme', 'Talk and sing to your baby – it recognizes your voice', 'با نوزادت صحبت کن و آواز بخوان – صدای تو را می‌شناسد'),
(21, 'Karotte', 'Karotte', 'Carrot', 'هویج', 26.7, 360, 'Das Baby schluckt und verdaut Fruchtwasser', 'The baby swallows and digests amniotic fluid', 'نوزاد مایع آمنیوتیک را می‌بلعد و هضم می‌کند', 'Eisenmangel ist jetzt häufig – lass deine Werte checken', 'Iron deficiency is common – get your levels checked', 'کمبود آهن شایع است – سطح آن را بررسی کن'),
(22, 'Kokosnuss', 'Kokosnuss', 'Coconut', 'نارگیل', 27.8, 430, 'Die Augenbrauen und Wimpern sind sichtbar', 'Eyebrows and eyelashes are visible', 'ابروها و مژه‌ها قابل مشاهده هستند', 'Schlaf auf der linken Seite für bessere Durchblutung', 'Sleep on your left side for better circulation', 'برای گردش خون بهتر به پهلوی چپ بخواب'),
(23, 'Grapefruit', 'Grapefruit', 'Grapefruit', 'گریپ‌فروت', 28.9, 500, 'Das Baby hat Schlaf- und Wachphasen', 'The baby has sleep and wake cycles', 'نوزاد چرخه‌های خواب و بیداری دارد', 'Trinke weiterhin viel – Fruchtwasser wird ständig erneuert', 'Keep drinking – amniotic fluid is constantly renewed', 'به نوشیدن آب ادامه بده – مایع آمنیوتیک دائماً بازسازی می‌شود'),
(24, 'Maiskolben', 'Maiskolben', 'Ear of corn', 'ذرت', 30, 600, 'Die Lungenbläschen beginnen sich zu bilden', 'The alveoli in the lungs begin to form', 'کیسه‌های هوایی ریه شروع به شکل‌گیری می‌کنند', 'Ab jetzt ist das Baby außerhalb der Gebärmutter überlebensfähig', 'From now on, the baby could survive outside the womb', 'از این به بعد نوزاد می‌تواند خارج از رحم زنده بماند'),
(25, 'Rutabaga', 'Kohlrabi', 'Rutabaga', 'شلغم', 34.6, 660, 'Das Baby kann Grimassen schneiden', 'The baby can make facial expressions', 'نوزاد می‌تواند ادا و اطوار درآورد', 'Sodbrennen kann auftreten – iss kleinere Portionen', 'Heartburn may occur – eat smaller portions', 'ممکن است سوزش سر دل داشته باشی – وعده‌های کوچک‌تر بخور'),
(26, 'Zucchini', 'Zucchini', 'Zucchini', 'کدو سبز', 35.6, 760, 'Die Augen öffnen sich zum ersten Mal', 'The eyes open for the first time', 'چشم‌ها برای اولین بار باز می‌شوند', 'Schwangerschaftsstreifen können auftreten – eincremen hilft', 'Stretch marks may appear – moisturizing helps', 'ممکن است ترک‌های بارداری ظاهر شوند – مرطوب‌کننده کمک می‌کند'),
(27, 'Blumenkohl', 'Blumenkohl', 'Cauliflower', 'گل کلم', 36.6, 875, 'Das Baby kann träumen (REM-Schlaf)', 'The baby can dream (REM sleep)', 'نوزاد می‌تواند رویا ببیند (خواب REM)', 'Beginne mit der Vorbereitung des Kreißsaals', 'Start preparing for the delivery room', 'آماده‌سازی برای اتاق زایمان را شروع کن'),
(28, 'Aubergine', 'Aubergine', 'Eggplant', 'بادمجان', 37.6, 1000, 'Das Baby kann blinzeln', 'The baby can blink', 'نوزاد می‌تواند پلک بزند', 'Ab jetzt alle zwei Wochen zur Vorsorgeuntersuchung', 'From now on, prenatal checkups every two weeks', 'از این به بعد هر دو هفته یکبار معاینه بارداری'),
(29, 'Butternut-Kürbis', 'Butternut-Kürbis', 'Butternut squash', 'کدو حلوایی', 38.6, 1150, 'Das Baby dreht sich möglicherweise mit dem Kopf nach unten', 'The baby may turn head-down', 'نوزاد ممکن است سر را به سمت پایین بچرخاند', 'Rückenschmerzen sind normal – Wärme und Bewegung helfen', 'Back pain is normal – heat and exercise help', 'کمردرد طبیعی است – گرما و ورزش کمک می‌کند'),
(30, 'Kohl', 'Kohl', 'Cabbage', 'کلم', 39.9, 1310, 'Das Baby kann seine Temperatur regulieren', 'The baby can regulate its temperature', 'نوزاد می‌تواند دمای خود را تنظیم کند', 'Pack deine Krankenhaustasche – es könnte früher losgehen', 'Pack your hospital bag – it could start early', 'کیف بیمارستان را ببند – ممکن است زودتر شروع شود'),
(31, 'Kokosnuss', 'Kokosnuss', 'Coconut', 'نارگیل', 41.1, 1500, 'Das Baby kann zwischen hell und dunkel unterscheiden', 'The baby can distinguish light from dark', 'نوزاد می‌تواند روشنایی را از تاریکی تشخیص دهد', 'Schlafmangel jetzt häufig – ruhe dich aus, wann immer du kannst', 'Sleep deprivation is common – rest whenever you can', 'کمبود خواب شایع است – هر وقت می‌توانی استراحت کن'),
(32, 'Honigmelone', 'Honigmelone', 'Honeydew melon', 'خربزه', 42.3, 1700, 'Die Fingernägel sind vollständig ausgebildet', 'Fingernails are fully formed', 'ناخن‌های دست کاملاً شکل گرفته‌اند', 'Übe Atemtechniken für die Geburt', 'Practice breathing techniques for birth', 'تکنیک‌های تنفس برای زایمان را تمرین کن'),
(33, 'Ananas', 'Ananas', 'Pineapple', 'آناناس', 43.7, 1900, 'Das Immunsystem des Babys entwickelt sich', 'The baby''s immune system is developing', 'سیستم ایمنی نوزاد در حال توسعه است', 'Jetzt wöchentlich zum Frauenarzt', 'Weekly checkups from now on', 'از این به بعد هفته‌ای یکبار به پزشک مراجعه کن'),
(34, 'Melone', 'Melone', 'Melon', 'طالبی', 45, 2100, 'Das Baby kann seine Augen koordinieren', 'The baby can coordinate its eyes', 'نوزاد می‌تواند چشم‌های خود را هماهنگ کند', 'Senkwehen können jetzt auftreten – das Baby rutscht tiefer', 'Braxton Hicks contractions may occur', 'ممکن است انقباضات براکستون هیکس رخ دهد'),
(35, 'Honigmelone', 'Honigmelone', 'Honeydew', 'خربزه', 46.2, 2400, 'Die Lungen sind fast vollständig ausgereift', 'The lungs are almost fully mature', 'ریه‌ها تقریباً کاملاً بالغ شده‌اند', 'Bereite dich mental auf die Geburt vor – Atemübungen helfen', 'Prepare mentally for birth – breathing exercises help', 'از نظر ذهنی برای زایمان آماده شو – تمرینات تنفسی کمک می‌کند'),
(36, 'Kopfsalat', 'Kopfsalat', 'Romaine lettuce', 'کاهو', 47.4, 2600, 'Das Baby hat einen festen Schlaf-Wach-Rhythmus', 'The baby has a stable sleep-wake rhythm', 'نوزاد ریتم ثابت خواب و بیداری دارد', 'Die Geburt kann jederzeit beginnen – bleib entspannt', 'Birth could start anytime – stay relaxed', 'زایمان می‌تواند هر لحظه شروع شود – آرام باش'),
(37, 'Wassermelone (mini)', 'Wassermelone (mini)', 'Watermelon (mini)', 'هندوانه کوچک', 48.6, 2850, 'Das Baby gilt als termingerecht (voll entwickelt)', 'The baby is considered full-term', 'نوزاد کامل (ترم) محسوب می‌شود', 'Achte auf Anzeichen von Wehen – Kontraktionen, Wasserabgang', 'Watch for signs of labor – contractions, water breaking', 'به نشانه‌های زایمان توجه کن – انقباضات، شکستن آب'),
(38, 'Rhabarber', 'Rhabarber', 'Rhubarb', 'ریواس', 49.8, 3100, 'Das Baby verliert das Käseschmiermittel', 'The baby loses the vernix caseosa', 'نوزاد ورنیکس (چربی محافظ) را از دست می‌دهد', 'Ruhe bewahren – die meisten Babys kommen zwischen Woche 38-42', 'Stay calm – most babies arrive between weeks 38-42', 'آرام باش – بیشتر نوزادان بین هفته ۳۸-۴۲ به دنیا می‌آیند'),
(39, 'Wassermelone', 'Wassermelone', 'Watermelon', 'هندوانه', 50.7, 3250, 'Alle Organe sind bereit für das Leben außerhalb', 'All organs are ready for life outside', 'همه اندام‌ها برای زندگی خارج از رحم آماده هستند', 'Bald ist es so weit – genieße die letzten ruhigen Momente', 'Soon it''s time – enjoy the last quiet moments', 'به زودی وقتش می‌رسد – از آخرین لحظات آرام لذت ببر'),
(40, 'Wassermelone', 'Wassermelone', 'Watermelon', 'هندوانه', 51, 3400, 'Herzlichen Glückwunsch – dein Baby ist bereit!', 'Congratulations – your baby is ready!', 'تبریک – نوزاد تو آماده است!', 'Du hast es geschafft! Alles Gute für die Geburt 💕', 'You did it! Best wishes for the birth 💕', 'انجامش دادی! بهترین آرزوها برای زایمان 💕')
ON CONFLICT (week) DO UPDATE SET
  fruit = EXCLUDED.fruit,
  fruit_de = EXCLUDED.fruit_de,
  fruit_en = EXCLUDED.fruit_en,
  fruit_fa = EXCLUDED.fruit_fa,
  size_cm = EXCLUDED.size_cm,
  weight_g = EXCLUDED.weight_g,
  milestone_de = EXCLUDED.milestone_de,
  milestone_en = EXCLUDED.milestone_en,
  milestone_fa = EXCLUDED.milestone_fa,
  tip_de = EXCLUDED.tip_de,
  tip_en = EXCLUDED.tip_en,
  tip_fa = EXCLUDED.tip_fa;