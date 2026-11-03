-- One-time setup for the Cloudflare D1 database "stallionconnect".
-- Paste all of this into: Storage & databases > D1 > stallionconnect > Console, then Execute.
-- (Same result as migrations/0001_init.sql + 0002_lead_source.sql.)

CREATE TABLE IF NOT EXISTS enquiries (
  id          TEXT PRIMARY KEY,
  created_at  TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  note        TEXT NOT NULL DEFAULT '',
  name        TEXT NOT NULL,
  company     TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  service     TEXT NOT NULL,
  team_size   TEXT NOT NULL,
  message     TEXT NOT NULL,
  source      TEXT NOT NULL DEFAULT 'website'
);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries (status);

CREATE TABLE IF NOT EXISTS applications (
  id          TEXT PRIMARY KEY,
  created_at  TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  note        TEXT NOT NULL DEFAULT '',
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL,
  role        TEXT NOT NULL,
  experience  TEXT NOT NULL,
  city        TEXT NOT NULL DEFAULT '',
  languages   TEXT NOT NULL DEFAULT '',
  message     TEXT NOT NULL DEFAULT '',
  source      TEXT NOT NULL DEFAULT 'website'
);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);

-- Admin sign-in (password + emailed code). Same as migrations/0003_admin_auth.sql.
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
