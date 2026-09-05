ALTER TABLE new_users
  ADD COLUMN period_history_onboarding_skipped BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN new_users.period_history_onboarding_skipped IS
  'True once the user explicitly skipped entering past periods before their first home screen visit.';
