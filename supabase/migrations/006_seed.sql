-- Seed idea_stats
INSERT INTO idea_stats (total_ideas, total_trends, total_insights) VALUES (1247, 89, 43);

-- Seed sample ideas
INSERT INTO ideas (slug, title, tagline, description, category, business_model, market_type, revenue_potential, execution_difficulty, score_opportunity, score_problem, score_feasibility, score_timing, score_pm_fit, is_idea_of_day, idea_of_day_date, published) VALUES
(
  'ai-pm-copilot',
  'AI Copilot for Product Managers',
  'Turn meeting transcripts and user feedback into structured PRDs, roadmaps, and user stories automatically.',
  'Product managers spend 40% of their time on documentation and synthesis — not strategy. This tool connects to Notion, Confluence, and Zoom to auto-generate PRDs from meeting transcripts, cluster user feedback into themes, and suggest roadmap priorities based on signal frequency. The PM reviews and edits; the AI does the grunt work.',
  'Productivity',
  'saas',
  'B2B',
  '$50K–$500K ARR',
  'Medium',
  88, 82, 76, 91, 94,
  true,
  CURRENT_DATE,
  true
),
(
  'indie-hacker-analytics',
  'Revenue Analytics for Indie Hackers',
  'A single dashboard connecting Stripe, Gumroad, Lemon Squeezy, and AppSumo with cohort analysis built for solopreneurs.',
  'Indie hackers sell across multiple platforms and have no unified revenue view. This tool aggregates all revenue streams with MRR, churn, LTV, and cohort data in one clean dashboard — without the $500/mo Baremetrics price tag.',
  'Analytics',
  'saas',
  'B2C',
  '$10K–$100K ARR',
  'Low',
  79, 85, 88, 73, 81,
  false, null, true
),
(
  'b2b-cold-email-validator',
  'Cold Email Compliance Validator',
  'Validate outbound email campaigns against CAN-SPAM, GDPR, and CASL before hitting send.',
  'As email regulations tighten, one non-compliant campaign can result in fines exceeding $50K. This API-first tool scans email templates and contact lists for compliance issues, flags problematic language, and auto-suggests fixes — integrating with Apollo, Instantly, and Smartlead.',
  'Legal Tech',
  'saas',
  'B2B',
  '$100K–$1M ARR',
  'Medium',
  82, 90, 71, 85, 78,
  false, null, true
),
(
  'marketplace-price-tracker',
  'Cross-Marketplace Price Intelligence',
  'Track competitor pricing across Amazon, Etsy, and Shopify stores in real time with alert rules.',
  'E-commerce sellers lose margin daily to dynamic competitor pricing they can''t monitor manually. This tool scrapes and normalizes pricing across multiple marketplaces, sends alerts when competitors drop prices, and suggests optimal repricing windows based on historical patterns.',
  'E-commerce',
  'saas',
  'B2B',
  '$50K–$500K ARR',
  'High',
  75, 88, 65, 79, 68,
  false, null, true
),
(
  'async-standup-tool',
  'Async Standup for Remote Teams',
  'Replace daily video standups with structured async updates, blockers dashboard, and weekly digest.',
  'Remote teams waste 3–5 hours per week in synchronous standups that could be async. This tool prompts team members for updates via Slack/email, surfaces blockers automatically, and generates a weekly digest for managers — with integrations to Linear and GitHub for automatic progress detection.',
  'Productivity',
  'saas',
  'B2B',
  '$10K–$100K ARR',
  'Low',
  71, 77, 92, 65, 87,
  false, null, true
),
(
  'content-repurposing-ai',
  'AI Content Repurposing Studio',
  'Transform a single long-form article into 20+ platform-optimized formats with one click.',
  'Content creators spend hours manually adapting one piece of content for LinkedIn, Twitter, newsletters, YouTube scripts, and podcast summaries. This tool analyzes the source content, extracts key insights, and generates platform-native versions — preserving the author''s voice through fine-tuning on their past content.',
  'Content',
  'saas',
  'B2C',
  '$10K–$100K ARR',
  'Medium',
  83, 79, 84, 88, 76,
  false, null, true
);

-- Seed community signals for today's idea
INSERT INTO community_signals (idea_id, platform, count, themes)
SELECT id, 'reddit', 47, ARRAY['documentation burnout', 'AI writing tools', 'PM productivity']
FROM ideas WHERE slug = 'ai-pm-copilot';

INSERT INTO community_signals (idea_id, platform, count, themes)
SELECT id, 'facebook', 12, ARRAY['PM communities', 'tool recommendations']
FROM ideas WHERE slug = 'ai-pm-copilot';

INSERT INTO community_signals (idea_id, platform, count, themes)
SELECT id, 'youtube', 8, ARRAY['PM tutorials', 'AI tools reviews']
FROM ideas WHERE slug = 'ai-pm-copilot';

-- Seed trends
INSERT INTO trends (keyword, volume, growth_pct, description, category) VALUES
('AI product management', 18400, 1355.0, 'Product managers using AI tools for documentation, roadmapping, and user research has exploded as LLMs become accurate enough for structured work outputs.', 'Productivity'),
('async work tools', 9200, 287.0, 'Post-pandemic normalization of remote work is driving sustained demand for async communication and documentation tools that reduce meeting overhead.', 'Remote Work'),
('no-code data pipelines', 6700, 198.0, 'Non-technical founders and operators want to connect SaaS tools and analyze data without engineering resources — fueling demand for visual pipeline builders.', 'Developer Tools'),
('indie SaaS revenue analytics', 3100, 142.0, 'The indie hacker movement has created demand for lightweight, affordable alternatives to enterprise analytics — focused on MRR, churn, and cohort data.', 'Analytics');

-- Seed market insights
INSERT INTO market_insights (title, metric_label, metric_value, metric_period, description, insight_type, source_label) VALUES
(
  'Global PM Software Market',
  'Market Size by 2028',
  '$9.8B',
  'CAGR 13.4%',
  'Product management software is one of the fastest-growing B2B SaaS categories, driven by the rise of remote-first product teams and the maturation of agile methodologies globally.',
  'market_size',
  'Grand View Research'
),
(
  'AI Adoption in Enterprise',
  'Enterprise Teams Using AI Tools',
  '74%',
  'as of Q1 2026',
  'Nearly three-quarters of enterprise product teams report using AI-assisted tools for documentation, prioritization, or user research — up from 31% in 2024. The gap between early adopters and laggards is widening.',
  'growth_signal',
  'Gartner Product Survey'
),
(
  'PM Community Demand Signal',
  'Reddit threads on PM burnout',
  '12,400+',
  'last 90 days',
  'r/productmanagement sees thousands of posts monthly about documentation overhead, meeting fatigue, and tool fragmentation — with AI-assisted PM tools consistently in the top 10 most upvoted solution suggestions.',
  'community_demand',
  'Reddit Data API'
);
