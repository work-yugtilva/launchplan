CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS ideas (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 text UNIQUE NOT NULL,
  title                text NOT NULL,
  tagline              text,
  description          text,
  category             text,
  business_model       text,
  market_type          text,
  revenue_potential    text,
  execution_difficulty text,
  score_opportunity    integer CHECK (score_opportunity BETWEEN 0 AND 100),
  score_problem        integer CHECK (score_problem BETWEEN 0 AND 100),
  score_feasibility    integer CHECK (score_feasibility BETWEEN 0 AND 100),
  score_timing         integer CHECK (score_timing BETWEEN 0 AND 100),
  score_pm_fit         integer CHECK (score_pm_fit BETWEEN 0 AND 100),
  is_idea_of_day       boolean DEFAULT false,
  idea_of_day_date     date,
  published            boolean DEFAULT false,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trends (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword     text NOT NULL,
  volume      integer,
  growth_pct  numeric,
  description text,
  category    text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_insights (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text NOT NULL,
  metric_label   text,
  metric_value   text,
  metric_period  text,
  description    text,
  insight_type   text,
  source_label   text,
  created_at     timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_signals (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id    uuid REFERENCES ideas(id) ON DELETE CASCADE,
  platform   text,
  count      integer,
  themes     text[],
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS idea_stats (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_ideas     integer DEFAULT 0,
  total_trends    integer DEFAULT 0,
  total_insights  integer DEFAULT 0,
  updated_at      timestamptz DEFAULT now()
);
