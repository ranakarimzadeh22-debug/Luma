-- ============================================
-- LUMA – ALL TABLES (Alle Migrationen in einem)
-- ============================================
-- Führe dieses SQL im Supabase Dashboard SQL Editor aus:
-- 1. Gehe zu https://supabase.com/dashboard
-- 2. Wähle dein Projekt: vfofxbibxabvvgoswawk
-- 3. Klicke auf "SQL Editor"
-- 4. Füge dieses SQL ein und klicke "Run"
-- ============================================

-- 1. Trigger-Funktion (wird von allen Tabellen benötigt)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== 1. user_cycles =====
CREATE TABLE IF NOT EXISTS user_cycles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  last_period_start DATE NOT NULL,
  cycle_length INTEGER NOT NULL DEFAULT 28,
  period_length INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "uc_read" ON user_cycles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "uc_insert" ON user_cycles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "uc_update" ON user_cycles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "uc_delete" ON user_cycles FOR DELETE USING (auth.uid() = user_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'uc_updated') THEN
    CREATE TRIGGER uc_updated BEFORE UPDATE ON user_cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- ===== 2. pregnancies =====
CREATE TABLE IF NOT EXISTS pregnancies (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_pregnant BOOLEAN DEFAULT false,
  last_period_start DATE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pregnancies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "preg_read" ON pregnancies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "preg_insert" ON pregnancies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "preg_update" ON pregnancies FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "preg_delete" ON pregnancies FOR DELETE USING (auth.uid() = user_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'preg_updated') THEN
    CREATE TRIGGER preg_updated BEFORE UPDATE ON pregnancies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- ===== 3. user_daily_health =====
CREATE TABLE IF NOT EXISTS user_daily_health (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  water_liters REAL DEFAULT 0,
  vitamins_checked JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE user_daily_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "udh_read" ON user_daily_health FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "udh_insert" ON user_daily_health FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "udh_update" ON user_daily_health FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "udh_delete" ON user_daily_health FOR DELETE USING (auth.uid() = user_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'udh_updated') THEN
    CREATE TRIGGER udh_updated BEFORE UPDATE ON user_daily_health FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- ===== 4. user_body_metrics =====
CREATE TABLE IF NOT EXISTS user_body_metrics (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  weight_kg REAL,
  height_cm REAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_body_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ubm_read" ON user_body_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ubm_insert" ON user_body_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ubm_update" ON user_body_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ubm_delete" ON user_body_metrics FOR DELETE USING (auth.uid() = user_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'ubm_updated') THEN
    CREATE TRIGGER ubm_updated BEFORE UPDATE ON user_body_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- ===== 5. profiles erweitern =====
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_year INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '🌸';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS takes_supplements BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS medications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'de';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prof_updated') THEN
    CREATE TRIGGER prof_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- ===== 6. user_supplements =====
CREATE TABLE IF NOT EXISTS user_supplements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dose TEXT,
  time TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_supplements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "us_read" ON user_supplements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "us_insert" ON user_supplements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "us_update" ON user_supplements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "us_delete" ON user_supplements FOR DELETE USING (auth.uid() = user_id);

-- ===== 7. user_supplement_log =====
CREATE TABLE IF NOT EXISTS user_supplement_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplement_id BIGINT REFERENCES user_supplements(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  checked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, supplement_id, date)
);

ALTER TABLE user_supplement_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usl_read" ON user_supplement_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "usl_insert" ON user_supplement_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "usl_update" ON user_supplement_log FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "usl_delete" ON user_supplement_log FOR DELETE USING (auth.uid() = user_id);

-- ===== 8. user_supplement_reminders =====
CREATE TABLE IF NOT EXISTS user_supplement_reminders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplement_name TEXT NOT NULL,
  time TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_supplement_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usr_read" ON user_supplement_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "usr_insert" ON user_supplement_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "usr_update" ON user_supplement_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "usr_delete" ON user_supplement_reminders FOR DELETE USING (auth.uid() = user_id);