-- Admin sign-in: one-time codes sent by email, and failed password attempts
-- (used for rate limiting).
CREATE TABLE IF NOT EXISTS admin_otps (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  code_hash   TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  attempts    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_otps_email ON admin_otps (email, created_at);

CREATE TABLE IF NOT EXISTS admin_auth_failures (
  email       TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_auth_failures ON admin_auth_failures (email, created_at);
