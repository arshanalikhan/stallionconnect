-- Cloudflare D1 schema for enquiries and job applications.
-- Apply with: npx wrangler d1 migrations apply stallionconnect --remote

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
  message     TEXT NOT NULL
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
  message     TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);
