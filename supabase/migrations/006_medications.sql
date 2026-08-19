-- ============================================
-- Luma – Medikamente & Vitamine
-- ============================================
-- Fügt der profiles-Tabelle ein medications-Feld hinzu
-- als JSONB-Array, z.B. ["Vitamin D", "Folsäure", "Eisen"]
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS medications JSONB DEFAULT '[]'::jsonb;