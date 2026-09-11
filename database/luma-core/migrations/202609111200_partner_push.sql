CREATE TABLE new_partner_push_subscriptions (
  id UUID PRIMARY KEY,
  partner_user_id UUID NOT NULL REFERENCES new_users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX new_partner_push_subscriptions_partner_idx ON new_partner_push_subscriptions(partner_user_id);

CREATE TABLE new_partner_period_events (
  id UUID PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES new_users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT new_partner_period_events_type_check CHECK (event_type IN ('period_started', 'period_ended')),
  CONSTRAINT new_partner_period_events_unique UNIQUE (owner_user_id, event_type, event_date)
);

COMMENT ON TABLE new_partner_push_subscriptions IS
  'Kontogebundene Web-Push-Anmeldungen eines Partnerkontos der neuen Luma. Enthält keine Zyklus- oder Profildaten.';
COMMENT ON TABLE new_partner_period_events IS
  'Deduplizierungsprotokoll für Partner-Push-Ereignisse: ein UNIQUE-Constraint verhindert mehrfachen Versand für dieselbe Eigentümerin, Ereignisart und dasselbe Ereignisdatum, auch bei parallelen Anfragen.';
