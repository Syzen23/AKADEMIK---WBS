-- ============================================================
-- AKADEMIK WBS - Database Schema Migration
-- Version: 001 - Initial Schema
-- Run this in: Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url    TEXT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: projects
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  invite_code VARCHAR(16) UNIQUE NOT NULL,
  leader_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deadline    TIMESTAMPTZ NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_leader_id ON projects(leader_id);
CREATE INDEX IF NOT EXISTS idx_projects_invite_code ON projects(invite_code);

-- ============================================================
-- TABLE: project_members
-- ============================================================
CREATE TABLE IF NOT EXISTS project_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_project_members UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);

-- ============================================================
-- TABLE: project_assets
-- ============================================================
CREATE TABLE IF NOT EXISTS project_assets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('github', 'figma', 'gdrive', 'docs', 'other')),
  asset_url  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_assets_project_id ON project_assets(project_id);

-- ============================================================
-- TABLE: stages
-- ============================================================
CREATE TABLE IF NOT EXISTS stages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  stage_order INT NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stages_project_id ON stages(project_id);

-- ============================================================
-- TABLE: tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_id         UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  assigned_to      UUID NULL REFERENCES users(id) ON DELETE SET NULL,
  title            VARCHAR(255) NOT NULL,
  description      TEXT NULL,
  estimated_hours  DECIMAL(5,2) DEFAULT 0.00,
  status           VARCHAR(20) DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Blocked', 'Done')),
  priority         VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  due_date         TIMESTAMPTZ NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_stage_id ON tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- ============================================================
-- TABLE: task_dependencies
-- ============================================================
CREATE TABLE IF NOT EXISTS task_dependencies (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id              UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  prerequisite_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_no_self_dependency CHECK (task_id != prerequisite_task_id),
  CONSTRAINT uq_task_dependency UNIQUE (task_id, prerequisite_task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_prereq_id ON task_dependencies(prerequisite_task_id);

-- ============================================================
-- TABLE: work_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS work_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id        UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hours_spent    DECIMAL(5,2) NOT NULL CHECK (hours_spent > 0),
  activity_notes TEXT NULL,
  logged_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_logs_task_id ON work_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_user_id ON work_logs(user_id);

-- ============================================================
-- TRIGGER: Auto-add leader as project_member with role 'leader'
-- ============================================================
CREATE OR REPLACE FUNCTION fn_add_leader_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.leader_id, 'leader')
  ON CONFLICT (project_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_add_leader_as_member
AFTER INSERT ON projects
FOR EACH ROW
EXECUTE FUNCTION fn_add_leader_as_member();

-- ============================================================
-- TRIGGER: Validate dependency before marking task as Done
-- (Application-level validation is primary; this is a DB safety net)
-- ============================================================
CREATE OR REPLACE FUNCTION fn_check_dependencies_before_done()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Done' AND OLD.status != 'Done' THEN
    IF EXISTS (
      SELECT 1
      FROM task_dependencies td
      JOIN tasks pt ON pt.id = td.prerequisite_task_id
      WHERE td.task_id = NEW.id
        AND pt.status != 'Done'
    ) THEN
      RAISE EXCEPTION 'Cannot mark task as Done: prerequisite tasks are not yet completed.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_dependencies_before_done
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION fn_check_dependencies_before_done();
