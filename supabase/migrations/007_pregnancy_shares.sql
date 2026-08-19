-- ============================================
-- Luma – Pregnancy Share Links
-- ============================================
-- Tabelle: pregnancy_shares
-- Ermöglicht der Mutter, einen sicheren Teilen-Link
-- für den Partner zu generieren.
--
-- Der Partner greift über einen UUID-Token (nicht erratbar)
-- auf die Schwangerschaftsdaten zu (read-only).
--
-- Verwendet von:
--   - src/lib/pregnancy-share.ts
--   - src/app/api/pregnancy/share/[token]/route.ts
--   - src/app/schwangerschaft/partner/[token]/page.tsx
-- ============================================

-- 1. Tabelle erstellen
CREATE TABLE IF NOT EXISTS pregnancy_shares (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  share_token UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  partner_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Index auf share_token für schnelle Lookups
CREATE INDEX IF NOT EXISTS idx_pregnancy_shares_token ON pregnancy_shares(share_token);

-- 3. Trigger: updated_at automatisch setzen
CREATE TRIGGER pregnancy_shares_updated_at
  BEFORE UPDATE ON pregnancy_shares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. RLS aktivieren
ALTER TABLE pregnancy_shares ENABLE ROW LEVEL SECURITY;

-- 5. RLS-Policies:
--    - Mutter: eigener Eintrag (SELECT, INSERT, UPDATE)
--    - Partner: kein direkter DB-Zugriff (Zugriff nur über API-Route)

CREATE POLICY "Users can read own pregnancy share"
  ON pregnancy_shares
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pregnancy share"
  ON pregnancy_shares
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pregnancy share"
  ON pregnancy_shares
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);