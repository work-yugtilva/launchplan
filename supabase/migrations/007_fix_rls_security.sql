DROP POLICY IF EXISTS "Users manage own profile" ON profiles;
DROP POLICY IF EXISTS "Users manage own agent runs" ON agent_runs;
REVOKE ALL ON profiles FROM authenticated;
REVOKE ALL ON agent_runs FROM authenticated;

GRANT SELECT, UPDATE (full_name, avatar_url) ON profiles TO authenticated;

CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update safe profile fields"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

GRANT SELECT ON agent_runs TO authenticated;

CREATE POLICY "Users read own agent runs"
  ON agent_runs FOR SELECT
  USING (auth.uid() = user_id);

GRANT INSERT ON profiles TO service_role;
GRANT ALL ON agent_runs TO service_role;
