-- ============================================
-- Luma – Gesundheits-Datenbank Migration
-- ============================================
-- Verwendet von:
--   - src/app/gesundheit/page.tsx              (Gesundheits-Seite)
--   - src/components/VitaminChecklist.tsx       (tägliche Vitamin-Checkliste)
--   - src/components/WaterTracker.tsx           (Wasser-Tracker)
--   - src/components/CustomSupplements.tsx      (eigene Supplements verwalten)
--   - src/components/SupplementReminder.tsx    (Erinnerungen)
-- ============================================

-- ##########################################
-- Tabelle 1: user_daily_health
-- Speichert tägliche Gesundheitsdaten:
--   - water_liters:      Getrunkene Liter (0.0 – 2.0)
--   - vitamins_checked:  JSONB mit Vitamin-Status { "Vitamin D": true, ... }
--   - date:              Datum (YYYY-MM-DD)
-- Pro user_id + date gibt es NUR EINEN Eintrag (ON CONFLICT = upsert)
-- ##########################################
CREATE TABLE IF NOT EXISTS user_daily_health (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  water_liters REAL NOT NULL DEFAULT 0,
  vitamins_checked JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

-- ##########################################
-- Tabelle 2: user_supplements
-- Speichert die vom User angelegten Supplemente:
--   - name:  Name des Supplements (z.B. "Vitamin C")
--   - dose:  Dosierung (z.B. "500mg")
--   - time:  Uhrzeit als HH:MM (optional)
-- ##########################################
CREATE TABLE IF NOT EXISTS user_supplements (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dose TEXT NOT NULL DEFAULT '',
  time TEXT NOT NULL DEFAULT '', -- HH:MM format
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ##########################################
-- Tabelle 3: user_supplement_log
-- Tägliches Abhaken der Supplements:
--   - supplement_id:  Verweis auf user_supplements.id
--   - date:           Datum (YYYY-MM-DD)
--   - checked:        true = genommen
-- Pro supplement_id + date gibt es NUR EINEN Eintrag
-- ##########################################
CREATE TABLE IF NOT EXISTS user_supplement_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplement_id BIGINT REFERENCES user_supplements(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  checked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, supplement_id, date)
);

-- ##########################################
-- Tabelle 4: user_supplement_reminders
-- Speichert Erinnerungen für Supplements:
--   - supplement_name: Anzeigename
--   - time:            Uhrzeit als HH:MM
--   - enabled:         true = aktiv
-- ##########################################
CREATE TABLE IF NOT EXISTS user_supplement_reminders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplement_name TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT '08:00', -- HH:MM format
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TRIGGER: updated_at automatisch setzen
-- ============================================
-- (Nutzt die bereits existierende Funktion update_updatedat() aus 001_user_cycles.sql)

CREATE TRIGGER user_daily_health_updated_at
  BEFORE UPDATE ON user_daily_health
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_supplements_updated_at
  BEFORE UPDATE ON user_supplements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_supplement_log_updated_at
  BEFORE UPDATE ON user_supplement_log
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_supplement_reminders_updated_at
  BEFORE UPDATE ON user_supplement_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS (Row Level Security) aktivieren
-- ============================================
ALTER TABLE user_daily_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supplement_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supplement_reminders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS-Policies: Benutzer dürfen nur ihre eigenen Daten sehen/bearbeiten
-- ============================================

-- user_daily_health
CREATE POLICY "Users can read own daily health"
  ON user_daily_health
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily health"
  ON user_daily_health
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily health"
  ON user_daily_health
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_supplements
CREATE POLICY "Users can read own supplements"
  ON user_supplements
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own supplements"
  ON user_supplements
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supplements"
  ON user_supplements
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own supplements"
  ON user_supplements
  FOR DELETE
  USING (auth.uid() = user_id);

-- user_supplement_log
CREATE POLICY "Users can read own supplement log"
  ON user_supplement_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own supplement log"
  ON user_supplement_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supplement log"
  ON user_supplement_log
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_supplement_reminders
CREATE POLICY "Users can read own reminders"
  ON user_supplement_reminders
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON user_supplement_reminders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON user_supplement_reminders
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON user_supplement_reminders
  FOR DELETE
  USING (auth.uid() = user_id);