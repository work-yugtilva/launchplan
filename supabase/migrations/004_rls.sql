ALTER TABLE ideas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends            ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_insights   ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_stats        ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_ideas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE claimed_ideas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs        ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read published ideas"
  ON ideas FOR SELECT USING (published = true);

CREATE POLICY "Public read trends"
  ON trends FOR SELECT USING (true);

CREATE POLICY "Public read market insights"
  ON market_insights FOR SELECT USING (true);

CREATE POLICY "Public read community signals"
  ON community_signals FOR SELECT USING (true);

CREATE POLICY "Public read idea stats"
  ON idea_stats FOR SELECT USING (true);

-- Authenticated user policies
CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users manage own saved ideas"
  ON saved_ideas FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own claimed ideas"
  ON claimed_ideas FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own agent runs"
  ON agent_runs FOR ALL USING (auth.uid() = user_id);

-- Data API access grants
GRANT SELECT ON ideas TO anon, authenticated;
GRANT SELECT ON trends TO anon, authenticated;
GRANT SELECT ON market_insights TO anon, authenticated;
GRANT SELECT ON community_signals TO anon, authenticated;
GRANT SELECT ON idea_stats TO anon, authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON saved_ideas TO authenticated;
GRANT ALL ON claimed_ideas TO authenticated;
GRANT ALL ON agent_runs TO authenticated;
