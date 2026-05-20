CREATE OR REPLACE FUNCTION create_agent_run(
  p_user_id     uuid,
  p_idea_input  text,
  p_total_steps integer DEFAULT 40
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan        text;
  v_limit       integer;
  v_used        integer;
  v_run_id      uuid;
  v_month_start timestamptz;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));

  SELECT plan INTO v_plan FROM profiles WHERE id = p_user_id;
  v_plan := COALESCE(v_plan, 'free');

  v_limit := CASE v_plan
    WHEN 'pro'    THEN 10
    WHEN 'empire' THEN 2147483647
    ELSE 1
  END;

  v_month_start := date_trunc('month', now());

  SELECT COUNT(*) INTO v_used
  FROM agent_runs
  WHERE user_id = p_user_id
    AND created_at >= v_month_start;

  IF v_used >= v_limit THEN
    RAISE EXCEPTION 'QUOTA_EXCEEDED:limit=%:used=%:plan=%', v_limit, v_used, v_plan;
  END IF;

  INSERT INTO agent_runs (user_id, idea_input, status, steps_done, total_steps)
  VALUES (p_user_id, p_idea_input, 'pending', 0, p_total_steps)
  RETURNING id INTO v_run_id;

  RETURN v_run_id;
END;
$$;

REVOKE ALL ON FUNCTION create_agent_run(uuid, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION create_agent_run(uuid, text, integer) FROM authenticated;
REVOKE ALL ON FUNCTION create_agent_run(uuid, text, integer) FROM anon;

GRANT EXECUTE ON FUNCTION create_agent_run(uuid, text, integer) TO service_role;
