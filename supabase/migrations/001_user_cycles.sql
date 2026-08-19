-- ============================================
-- Luma – Zyklus-Datenbank Migration
-- ============================================
-- Tabelle: user_cycles
-- Speichert die Zyklusdaten jedes Benutzers:
--   - last_period_start: Erster Tag der letzten Periode
--   - cycle_length:      Zykluslänge in Tagen (Standard 28)
--   - period_length:     Periodendauer in Tagen (Standard 5)
--
-- Verwendet von:
--   - src/app/onboarding/page.tsx   (erste Einrichtung)
--   - src/app/zyklus/page.tsx        (Zyklus-Übersicht)
--   - src/app/dashboard/page.tsx     (Dashboard – 🔄-Button)
--   - src/components/CycleEditModal.tsx (Bearbeiten-Modal)
--   - src/components/PeriodReminder.tsx
-- ============================================

-- 1. Tabelle erstellen
CREATE TABLE IF NOT EXISTS user_cycles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  last_period_start DATE NOT NULL,
  cycle_length INTEGER NOT NULL DEFAULT 28,
  period_length INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Trigger: updated_at automatisch setzen
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_cycles_updated_at
  BEFORE UPDATE ON user_cycles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. RLS (Row Level Security) aktivieren
ALTER TABLE user_cycles ENABLE ROW LEVEL SECURITY;

-- 4. RLS-Policies: Benutzer dürfen nur ihre eigenen Daten sehen/bearbeiten
CREATE POLICY "Users can read own cycle data"
  ON user_cycles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycle data"
  ON user_cycles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycle data"
  ON user_cycles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);