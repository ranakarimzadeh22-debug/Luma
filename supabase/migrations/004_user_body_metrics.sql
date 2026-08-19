-- ============================================
-- Luma – Körperdaten-Migration (Gewicht & Größe)
-- ============================================
-- Tabelle: user_body_metrics
-- Speichert Gewicht und Größe der Benutzerin für
-- die Berechnung des täglichen Wasserbedarfs.
--
-- Formel: Wasser (L) = (weight_kg × 0.033)
-- Optional mit Größe: Wasser (L) = (weight_kg × 0.03) + (height_cm × 0.004)
--
-- Verwendet von:
--   - src/components/WaterTracker.tsx (Wasserziel berechnen)
-- ============================================

-- 1. Tabelle erstellen
CREATE TABLE IF NOT EXISTS user_body_metrics (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  weight_kg REAL,          -- Körpergewicht in kg (nullable)
  height_cm REAL,          -- Körpergröße in cm (nullable)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Trigger: updated_at automatisch setzen
CREATE TRIGGER user_body_metrics_updated_at
  BEFORE UPDATE ON user_body_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. RLS (Row Level Security) aktivieren
ALTER TABLE user_body_metrics ENABLE ROW LEVEL SECURITY;

-- 4. RLS-Policies: Benutzer dürfen nur ihre eigenen Daten sehen/bearbeiten
CREATE POLICY "Users can read own body metrics"
  ON user_body_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own body metrics"
  ON user_body_metrics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own body metrics"
  ON user_body_metrics
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);