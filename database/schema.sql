-- ============================================
--   INCONNU XD V3 - PostgreSQL Schema
--   For Render Free PostgreSQL
-- ============================================
-- Run this manually OR let the bot auto-create
-- tables on first startup.

-- Groups settings
CREATE TABLE IF NOT EXISTS groups (
  jid  TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'
);

-- Users data
CREATE TABLE IF NOT EXISTS users (
  jid  TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'
);

-- Bot key-value store (language, prefix, botname...)
CREATE TABLE IF NOT EXISTS botdata (
  key   TEXT PRIMARY KEY,
  value JSONB
);

-- Deployed bot instances
CREATE TABLE IF NOT EXISTS deploys (
  id           SERIAL PRIMARY KEY,
  user_id      TEXT,
  session_id   TEXT,
  platform     TEXT,
  deploy_url   TEXT,
  status       TEXT DEFAULT 'active',
  owner_number TEXT,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Command usage counter
CREATE TABLE IF NOT EXISTS cmdcount (
  id    INT PRIMARY KEY DEFAULT 1,
  count INT DEFAULT 0
);
INSERT INTO cmdcount(id, count) VALUES(1, 0) ON CONFLICT DO NOTHING;

-- ============================================
-- Example: query group settings
--   SELECT data FROM groups WHERE jid = '1234567890@g.us';
--
-- Example: update group settings
--   UPDATE groups SET data = data || '{"antilink":true}' WHERE jid = '...';
-- ============================================

