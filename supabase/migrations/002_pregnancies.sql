-- ============================================
-- Luma – Schwangerschafts-Datenbank Migration
-- ============================================
-- Tabelle: pregnancies
-- Speichert den Schwangerschaftsstatus jeder Benutzerin:
--   - is_pregnant:     Ob eine Schwangerschaft aktiv ist
--   - last_period_start: Erster Tag der letzten Periode vor SS
--   - due_date:        Berechneter Geburtstermin (last_period + 280 Tage)
--
-- Verwendet von:
--   - src/app/schwangerschaft/page.tsx
--   - src/components/PregnancyModal.tsx
--   - src/components/PregnancyBanner.tsx
--   - src/app/dashboard/page.tsx
-- ============================================

-- 1. Tabelle erstellen
CREATE TABLE IF NOT EXISTS pregnancies (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_pregnant BOOLEAN DEFAULT false,
  last_period_start DATE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Trigger: updated_at automatisch setzen
CREATE TRIGGER pregnancies_updated_at
  BEFORE UPDATE ON pregnancies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. RLS (Row Level Security) aktivieren
ALTER TABLE pregnancies ENABLE ROW LEVEL SECURITY;

-- 4. RLS-Policies: Benutzer dürfen nur ihre eigenen Daten sehen/bearbeiten
CREATE POLICY "Users can read own pregnancy data"
  ON pregnancies
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pregnancy data"
  ON pregnancies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pregnancy data"
  ON pregnancies
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);