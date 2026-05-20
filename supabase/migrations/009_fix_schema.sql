DELETE FROM community_signals WHERE idea_id IS NULL;
ALTER TABLE community_signals ALTER COLUMN idea_id SET NOT NULL;

DROP POLICY IF EXISTS "Public read idea stats" ON idea_stats;
DROP TABLE IF EXISTS idea_stats CASCADE;

CREATE OR REPLACE VIEW idea_stats AS
SELECT
  '00000000-0000-0000-0000-000000000001'::uuid AS id,
  (SELECT COUNT(*) FROM ideas WHERE published = true)::integer AS total_ideas,
  (SELECT COUNT(*) FROM trends)::integer AS total_trends,
  (SELECT COUNT(*) FROM market_insights)::integer AS total_insights,
  now() AS updated_at;

GRANT SELECT ON idea_stats TO anon, authenticated;
