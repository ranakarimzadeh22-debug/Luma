CREATE TABLE new_period_plans (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES new_users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT new_period_plans_date_order CHECK (end_date >= start_date)
);

CREATE INDEX new_period_plans_user_start_idx
  ON new_period_plans (user_id, start_date DESC);

COMMENT ON TABLE new_period_plans IS
  'Vom Nutzer geplante Periodenzeiträume; ausdrücklich keine bestätigten Ist-Daten und keine Berechnungsgrundlage.';
