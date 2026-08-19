-- ============================================
-- Luma – Fix: Add missing last_period_start to pregnancies
-- ============================================
-- Die Spalte `last_period_start` fehlt in manchen Umgebungen,
-- weil sie in der kombinierten Migration `000_all_tables.sql`
-- nicht enthalten war. Diese Migration fügt sie nachträglich hinzu.
--
-- Betroffen: src/app/profile/page.tsx (handleSave speichert last_period_start)
--            src/app/schwangerschaft/page.tsx  (lädt last_period_start)
-- ============================================

-- Spalte hinzufügen, falls nicht vorhanden
ALTER TABLE pregnancies ADD COLUMN IF NOT EXISTS last_period_start DATE;