CREATE TABLE new_pms_symptom_entries (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES new_users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  symptom TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT new_pms_symptom_entries_symptom_check
    CHECK (symptom IN ('breast_tenderness', 'abdominal_pain', 'fatigue', 'mood_swings')),
  CONSTRAINT new_pms_symptom_entries_user_date_symptom_unique
    UNIQUE (user_id, entry_date, symptom)
);

CREATE INDEX new_pms_symptom_entries_user_date_idx
  ON new_pms_symptom_entries (user_id, entry_date DESC);

COMMENT ON TABLE new_pms_symptom_entries IS
  'WP-013: von der Nutzerin selbst datiert markierte PMS-Symptome der neuen Luma. Eine Nutzerangabe, keine medizinische Diagnose. Beeinflusst nie Perioden-, Eisprung- oder Fruchtbarkeitsvorhersagen.';
COMMENT ON COLUMN new_pms_symptom_entries.symptom IS
  'Genau einer der vier bestätigten Werte: breast_tenderness (Brustschmerzen/-spannen), abdominal_pain (Unterleibsschmerzen), fatigue (Müdigkeit), mood_swings (Stimmungsschwankungen).';
