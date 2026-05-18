CREATE TABLE IF NOT EXISTS profiles (
  id                 uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email              text,
  full_name          text,
  avatar_url         text,
  plan               text DEFAULT 'free',
  stripe_customer_id text,
  created_at         timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_ideas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  idea_id    uuid REFERENCES ideas(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, idea_id)
);

CREATE TABLE IF NOT EXISTS claimed_ideas (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  idea_id    uuid REFERENCES ideas(id) ON DELETE CASCADE,
  claimed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, idea_id)
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE,
  idea_input  text NOT NULL,
  status      text DEFAULT 'pending',
  result      jsonb,
  steps_done  integer DEFAULT 0,
  total_steps integer DEFAULT 40,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
