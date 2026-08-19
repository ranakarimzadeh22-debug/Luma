-- ============================================
-- Luma – Add missing RLS policies for profiles
-- ============================================
-- Die `profiles`-Tabelle (von Supabase Auth angelegt) hat RLS aktiviert,
-- aber es fehlen Policies für INSERT, UPDATE und SELECT.
-- Ohne diese Policies kann die App keine Profildaten speichern/laden.
--
-- Betroffen: src/app/profile/page.tsx (handleSave)
--            src/app/onboarding/page.tsx
-- ============================================

-- RLS für profiles aktivieren (falls noch nicht geschehen)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Benutzer darf sein eigenes Profil lesen
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Benutzer darf sein eigenes Profil erstellen
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Benutzer darf sein eigenes Profil aktualisieren
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);