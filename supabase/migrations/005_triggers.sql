-- updated_at automation
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_trends_updated_at
  BEFORE UPDATE ON trends
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_agent_runs_updated_at
  BEFORE UPDATE ON agent_runs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Auto-create profile on signup
-- SET search_path = '' prevents search path injection for SECURITY DEFINER functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = ''
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
