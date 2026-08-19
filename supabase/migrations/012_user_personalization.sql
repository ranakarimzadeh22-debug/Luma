-- ============================================
-- Luma – User Personalization Fields
-- ============================================
-- Erweitert user_profiles um Personalisierungs-Felder
-- für lebensphasen-basierte Anpassung der App
-- ============================================

-- ##########################################
-- Lebensphasen und Personalisierungs-Felder
-- ##########################################
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS life_stage TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS age_group TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS experience_level TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS goals TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS interests TEXT[];
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- ##########################################
-- Constraints für life_stage
-- ##########################################
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS valid_life_stage;
ALTER TABLE user_profiles ADD CONSTRAINT valid_life_stage CHECK (
  life_stage IS NULL OR life_stage IN (
    'teen',           -- 13-17 Jahre
    'young_adult',    -- 18-24 Jahre
    'adult',          -- 25-34 Jahre
    'trying_to_conceive', -- Kinderwunsch
    'pregnant',       -- Schwanger
    'postpartum',     -- Nach der Geburt
    'perimenopause',  -- Perimenopause
    'menopause'       -- Menopause
  )
);

-- ##########################################
-- Constraints für age_group
-- ##########################################
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS valid_age_group;
ALTER TABLE user_profiles ADD CONSTRAINT valid_age_group CHECK (
  age_group IS NULL OR age_group IN (
    '13-17', '18-24', '25-34', '35-44', '45+'
  )
);

-- ##########################################
-- Constraints für experience_level
-- ##########################################
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS valid_experience_level;
ALTER TABLE user_profiles ADD CONSTRAINT valid_experience_level CHECK (
  experience_level IS NULL OR experience_level IN (
    'beginner', 'intermediate', 'advanced'
  )
);

-- ============================================
-- Tabelle: user_preferences
-- Speichert UI-Präferenzen des Nutzers
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  theme TEXT DEFAULT 'rose' CHECK (theme IN ('rose', 'lavender', 'peach', 'sage', 'auto')),
  notifications_enabled BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '08:00',
  show_fertility BOOLEAN DEFAULT true,
  show_educational_content BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id)
);

-- ============================================
-- Tabelle: user_interaction_log
-- Zeichnet auf, welche Seiten/Features genutzt werden
-- für spätere Analyse und Verbesserung
-- ============================================
CREATE TABLE IF NOT EXISTS user_interaction_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  page TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Tabelle: user_daily_tips
-- Personalisierte Tipps für jeden Tag
-- ============================================
CREATE TABLE IF NOT EXISTS user_daily_tips (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  tip_key TEXT NOT NULL,
  tip_text TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  shown BOOLEAN DEFAULT false,
  liked BOOLEAN DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date, tip_key)
);

-- ============================================
-- Trigger: updated_at
-- ============================================
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS aktivieren
-- ============================================
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interaction_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_tips ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS-Policies: user_preferences
-- ============================================
CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RLS-Policies: user_interaction_log
-- ============================================
CREATE POLICY "Users can insert own interactions"
  ON user_interaction_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own interactions"
  ON user_interaction_log FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- RLS-Policies: user_daily_tips
-- ============================================
CREATE POLICY "Users can read own tips"
  ON user_daily_tips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tips"
  ON user_daily_tips FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);