-- ============================================
-- Luma – Supplement Einnahme-Kalender
-- ============================================
-- Erweiterung des bestehenden Health-Systems
-- um einen täglichen Kalender mit Status pro Supplement
-- ============================================

-- ##########################################
-- Tabelle: user_supplement_calendar
-- Zeigt pro Tag den Status jedes Supplements:
--   - supplement_id:  Verweis auf user_supplements.id
--   - date:           Datum (YYYY-MM-DD)
--   - status:         'taken' | 'missed' | 'open' | 'late'
--   - taken_at:       Uhrzeit wann eingenommen (optional)
-- ##########################################
CREATE TABLE IF NOT EXISTS user_supplement_calendar (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplement_id BIGINT REFERENCES user_supplements(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('taken', 'missed', 'open', 'late')),
  taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, supplement_id, date)
);

-- ##########################################
-- Tabelle: user_supplement_streaks
-- Speichert aktuelle Streak-Daten pro Supplement
-- ##########################################
CREATE TABLE IF NOT EXISTS user_supplement_streaks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  supplement_id BIGINT REFERENCES user_supplements(id) ON DELETE CASCADE NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_taken_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, supplement_id)
);

-- ============================================
-- TRIGGER: updated_at automatisch setzen
-- ============================================
CREATE TRIGGER user_supplement_calendar_updated_at
  BEFORE UPDATE ON user_supplement_calendar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_supplement_streaks_updated_at
  BEFORE UPDATE ON user_supplement_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS (Row Level Security) aktivieren
-- ============================================
ALTER TABLE user_supplement_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supplement_streaks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS-Policies
-- ============================================

-- user_supplement_calendar
CREATE POLICY "Users can read own supplement calendar"
  ON user_supplement_calendar
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own supplement calendar"
  ON user_supplement_calendar
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supplement calendar"
  ON user_supplement_calendar
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own supplement calendar"
  ON user_supplement_calendar
  FOR DELETE
  USING (auth.uid() = user_id);

-- user_supplement_streaks
CREATE POLICY "Users can read own supplement streaks"
  ON user_supplement_streaks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own supplement streaks"
  ON user_supplement_streaks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supplement streaks"
  ON user_supplement_streaks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own supplement streaks"
  ON user_supplement_streaks
  FOR DELETE
  USING (auth.uid() = user_id);