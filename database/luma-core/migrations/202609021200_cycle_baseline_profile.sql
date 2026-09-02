CREATE TABLE new_cycle_baseline_profiles (
  user_id UUID PRIMARY KEY REFERENCES new_users(id) ON DELETE CASCADE,
  last_period_start DATE,
  bleeding_duration_days SMALLINT,
  cycle_length_days SMALLINT,
  regularity TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT new_cycle_baseline_bleeding_duration_valid
    CHECK (bleeding_duration_days IS NULL OR bleeding_duration_days BETWEEN 1 AND 366),
  CONSTRAINT new_cycle_baseline_cycle_length_valid
    CHECK (cycle_length_days IS NULL OR cycle_length_days BETWEEN 1 AND 730),
  CONSTRAINT new_cycle_baseline_regularity_valid
    CHECK (regularity IN ('regular', 'irregular', 'unknown'))
);

COMMENT ON TABLE new_cycle_baseline_profiles IS
  'Minimal cycle baseline answers for accounts used only by the new Luma application path.';
