-- ============================================================
-- AKADEMIK WBS - Database Schema Migration
-- Version: 002 - Add Personal Memos (Catatan Cepat)
-- ============================================================

CREATE TABLE IF NOT EXISTS personal_memos (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title              VARCHAR(255) NOT NULL,
  content            TEXT NOT NULL,
  is_converted       BOOLEAN NOT NULL DEFAULT FALSE,
  linked_project_id  UUID NULL REFERENCES projects(id) ON DELETE SET NULL,
  linked_task_id     UUID NULL REFERENCES tasks(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personal_memos_user_id ON personal_memos(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_memos_created_at ON personal_memos(created_at DESC);
