-- ============================================================
-- ALTER TABLE
-- ============================================================

ALTER TABLE trends ADD COLUMN IF NOT EXISTS builder_takeaway text null;
ALTER TABLE market_insights ADD COLUMN IF NOT EXISTS newsletter_safe boolean default false;
ALTER TABLE market_insights ADD COLUMN IF NOT EXISTS confidence_band text null;

-- ============================================================
-- New table: idea_pipeline_runs
-- ============================================================

CREATE TABLE IF NOT EXISTS idea_pipeline_runs (
  id               uuid primary key default gen_random_uuid(),
  run_date         date not null unique,
  status           text not null default 'pending' check (status in ('pending','running','completed','failed')),
  candidate_count  int default 0,
  drafted_idea_id  uuid references ideas(id) on delete set null null,
  error_message    text null,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ============================================================
-- New table: idea_candidates
-- ============================================================

CREATE TABLE IF NOT EXISTS idea_candidates (
  id               uuid primary key default gen_random_uuid(),
  pipeline_run_id  uuid not null references idea_pipeline_runs(id),
  scout_output     jsonb not null,
  editor_output    jsonb null,
  status           text not null default 'pending' check (status in ('pending','approved','rejected')),
  drafted_idea_id  uuid references ideas(id) on delete set null null,
  created_at       timestamptz default now()
);

-- ============================================================
-- New table: trend_pipeline_runs
-- ============================================================

CREATE TABLE IF NOT EXISTS trend_pipeline_runs (
  id               uuid primary key default gen_random_uuid(),
  week_start       date not null unique,
  status           text not null default 'pending' check (status in ('pending','running','completed','failed')),
  candidate_count  int default 0,
  error_message    text null,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ============================================================
-- New table: trend_candidates
-- ============================================================

CREATE TABLE IF NOT EXISTS trend_candidates (
  id               uuid primary key default gen_random_uuid(),
  pipeline_run_id  uuid not null references trend_pipeline_runs(id),
  scout_output     jsonb not null,
  editor_output    jsonb null,
  status           text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at       timestamptz default now()
);

-- ============================================================
-- New table: insight_pipeline_runs
-- ============================================================

CREATE TABLE IF NOT EXISTS insight_pipeline_runs (
  id               uuid primary key default gen_random_uuid(),
  week_start       date not null unique,
  status           text not null default 'pending' check (status in ('pending','running','completed','failed')),
  candidate_count  int default 0,
  error_message    text null,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ============================================================
-- New table: insight_candidates
-- ============================================================

CREATE TABLE IF NOT EXISTS insight_candidates (
  id               uuid primary key default gen_random_uuid(),
  pipeline_run_id  uuid not null references insight_pipeline_runs(id),
  scout_output     jsonb not null,
  editor_output    jsonb null,
  status           text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at       timestamptz default now()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_idea_pipeline_runs_run_date ON idea_pipeline_runs(run_date);
CREATE INDEX IF NOT EXISTS idx_idea_candidates_pipeline_run_id ON idea_candidates(pipeline_run_id);
CREATE INDEX IF NOT EXISTS idx_trend_pipeline_runs_week_start ON trend_pipeline_runs(week_start);
CREATE INDEX IF NOT EXISTS idx_trend_candidates_pipeline_run_id ON trend_candidates(pipeline_run_id);
CREATE INDEX IF NOT EXISTS idx_insight_pipeline_runs_week_start ON insight_pipeline_runs(week_start);
CREATE INDEX IF NOT EXISTS idx_insight_candidates_pipeline_run_id ON insight_candidates(pipeline_run_id);

-- ============================================================
-- Triggers
-- ============================================================

CREATE TRIGGER set_idea_pipeline_runs_updated_at
  BEFORE UPDATE ON idea_pipeline_runs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_trend_pipeline_runs_updated_at
  BEFORE UPDATE ON trend_pipeline_runs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_insight_pipeline_runs_updated_at
  BEFORE UPDATE ON insight_pipeline_runs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE idea_pipeline_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON idea_pipeline_runs TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_none" ON idea_pipeline_runs AS RESTRICTIVE TO authenticated USING (false) WITH CHECK (false);

ALTER TABLE idea_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON idea_candidates TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_none" ON idea_candidates AS RESTRICTIVE TO authenticated USING (false) WITH CHECK (false);

ALTER TABLE trend_pipeline_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON trend_pipeline_runs TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_none" ON trend_pipeline_runs AS RESTRICTIVE TO authenticated USING (false) WITH CHECK (false);

ALTER TABLE trend_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON trend_candidates TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_none" ON trend_candidates AS RESTRICTIVE TO authenticated USING (false) WITH CHECK (false);

ALTER TABLE insight_pipeline_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON insight_pipeline_runs TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_none" ON insight_pipeline_runs AS RESTRICTIVE TO authenticated USING (false) WITH CHECK (false);

ALTER TABLE insight_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all" ON insight_candidates TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "auth_read_none" ON insight_candidates AS RESTRICTIVE TO authenticated USING (false) WITH CHECK (false);
