CREATE TABLE new_partner_connection_codes (
  id UUID PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES new_users(id) ON DELETE CASCADE,
  code_hash CHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ
);

CREATE INDEX new_partner_connection_codes_owner_idx ON new_partner_connection_codes(owner_user_id);

CREATE TABLE new_partner_connections (
  id UUID PRIMARY KEY,
  owner_user_id UUID NOT NULL REFERENCES new_users(id) ON DELETE CASCADE,
  partner_user_id UUID NOT NULL REFERENCES new_users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  CONSTRAINT new_partner_connections_status_check CHECK (status IN ('active', 'ended')),
  CONSTRAINT new_partner_connections_distinct_accounts CHECK (owner_user_id <> partner_user_id)
);

CREATE UNIQUE INDEX new_partner_connections_owner_active_idx
  ON new_partner_connections(owner_user_id)
  WHERE status = 'active';

CREATE INDEX new_partner_connections_partner_idx ON new_partner_connections(partner_user_id) WHERE status = 'active';

COMMENT ON TABLE new_partner_connection_codes IS
  'Kurzlebige, gehashte Verbindungscodes der neuen Luma. Nur einmal innerhalb von zehn Minuten einlösbar.';
COMMENT ON TABLE new_partner_connections IS
  'Aktive/beendete Partnerverbindungen der neuen Luma. Höchstens eine aktive Verbindung pro Owner-Konto (partieller eindeutiger Index).';
