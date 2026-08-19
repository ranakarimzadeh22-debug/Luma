-- ============================================
-- Luma – Profil-Erweiterung (Avatar, Alter, Supplements)
-- ============================================
-- Erweitert die bestehende `profiles`-Tabelle um:
--   - birth_year:         Geburtsjahr (z.B. 1995)
--   - avatar:             Ausgewählter Charakter/Avatar
--   - takes_supplements:  Ob die Userin Supplements nimmt
--
-- Verwendet von:
--   - src/app/onboarding/page.tsx (Ersterfassung)
--   - src/app/settings/page.tsx   (Bearbeiten)
--   - src/components/Dashboard.tsx (Begrüßung + Avatar)
-- ============================================

-- Spalten zu profiles hinzufügen (falls nicht vorhanden)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_year INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '🌸';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS takes_supplements BOOLEAN DEFAULT false;

-- Trigger: updated_at (falls profiles noch keinen hat)
-- (Die update_updated_at-Funktion existiert bereits aus 001_user_cycles.sql)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_updated_at'
  ) THEN
    CREATE TRIGGER profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;