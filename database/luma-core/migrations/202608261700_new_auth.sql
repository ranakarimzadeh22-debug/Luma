CREATE TABLE new_users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT new_users_email_normalized CHECK (email = LOWER(BTRIM(email)))
);

CREATE TABLE new_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES new_users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX new_sessions_user_id_idx ON new_sessions(user_id);
CREATE INDEX new_sessions_expires_at_idx ON new_sessions(expires_at);

CREATE TABLE new_auth_rate_limits (
  key_hash CHAR(64) PRIMARY KEY,
  attempts INTEGER NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT new_auth_rate_limits_attempts_positive CHECK (attempts > 0)
);

COMMENT ON TABLE new_users IS 'Accounts used only by the new Luma application path.';
COMMENT ON TABLE new_sessions IS 'Opaque sessions used only by the new Luma application path.';
COMMENT ON TABLE new_auth_rate_limits IS 'Short-lived counters for the new registration and login endpoints.';
