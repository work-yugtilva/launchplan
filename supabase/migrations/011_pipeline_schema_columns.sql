-- Add pipeline-generated content columns to ideas
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS summary text null;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS verdict text null
  CHECK (verdict IS NULL OR verdict IN ('strong', 'promising', 'risky', 'pass'));
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS risks jsonb null;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS next_steps jsonb null;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS market_size text null;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS target_user text null;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS tags text[] null;

-- Add pipeline-generated content columns to trends
ALTER TABLE trends ADD COLUMN IF NOT EXISTS headline text null;
ALTER TABLE trends ADD COLUMN IF NOT EXISTS why_it_matters text null;
ALTER TABLE trends ADD COLUMN IF NOT EXISTS product_implication text null;
ALTER TABLE trends ADD COLUMN IF NOT EXISTS trend_type text null
  CHECK (trend_type IS NULL OR trend_type IN ('emerging', 'accelerating', 'peaking', 'declining'));

-- market_insights: builder_relevance (newsletter_safe + confidence_band already in 010)
ALTER TABLE market_insights ADD COLUMN IF NOT EXISTS builder_relevance text null;
