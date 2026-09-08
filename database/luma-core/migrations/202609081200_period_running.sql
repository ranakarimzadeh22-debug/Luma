ALTER TABLE new_period_entries
  DROP CONSTRAINT new_period_entries_date_order;

ALTER TABLE new_period_entries
  ALTER COLUMN end_date DROP NOT NULL;

ALTER TABLE new_period_entries
  ADD COLUMN expected_end_date DATE;

ALTER TABLE new_period_entries
  ADD CONSTRAINT new_period_entries_date_order
    CHECK (end_date IS NULL OR end_date >= start_date);

ALTER TABLE new_period_entries
  ADD CONSTRAINT new_period_entries_expected_end_order
    CHECK (expected_end_date IS NULL OR expected_end_date >= start_date);

COMMENT ON COLUMN new_period_entries.end_date IS
  'Tatsächlich bestätigtes Ende. NULL bedeutet: Periode läuft noch, echtes Ende fehlt.';
COMMENT ON COLUMN new_period_entries.expected_end_date IS
  'Optionales erwartetes Ende einer laufenden Periode. Keine bestätigte Tatsache, zählt nie als historische Periodendauer.';
