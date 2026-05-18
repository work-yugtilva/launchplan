-- Composite index for ideas list query: filter by published + sort by created_at
CREATE INDEX IF NOT EXISTS idx_ideas_published_created
  ON ideas (published, created_at DESC)
  WHERE published = true;

-- CHECK constraints to enforce enum-like text columns at DB level
ALTER TABLE ideas
  ADD CONSTRAINT chk_business_model
  CHECK (business_model IN ('saas', 'service', 'marketplace', 'content', 'hardware'));

ALTER TABLE community_signals
  ADD CONSTRAINT chk_platform
  CHECK (platform IN ('reddit', 'facebook', 'youtube', 'other'));

ALTER TABLE agent_runs
  ADD CONSTRAINT chk_status
  CHECK (status IN ('pending', 'running', 'completed', 'failed'));

ALTER TABLE market_insights
  ADD CONSTRAINT chk_insight_type
  CHECK (insight_type IN ('market_size', 'growth_signal', 'community_demand'));
