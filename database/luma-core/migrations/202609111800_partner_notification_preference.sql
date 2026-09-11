CREATE TABLE new_partner_notification_preferences (
  partner_user_id UUID PRIMARY KEY REFERENCES new_users(id) ON DELETE CASCADE,
  wants_notifications BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE new_partner_notification_preferences IS
  'WP-004 Version 5: rein informative Ja/Nein-Auswahl eines Partnerkontos, ob es später Benachrichtigungen erhalten möchte. Fordert keine Geräteberechtigung an, versendet keine Nachricht und ist unabhängig von den ungenutzten Push-Tabellen aus Version 4 (new_partner_push_subscriptions, new_partner_period_events), die als Altstruktur bestehen bleiben.';
