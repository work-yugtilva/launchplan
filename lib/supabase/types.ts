export interface Idea {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  category: string | null;
  business_model: "saas" | "service" | "marketplace" | "content" | "hardware" | null;
  market_type: string | null;
  revenue_potential: string | null;
  execution_difficulty: string | null;
  score_opportunity: number | null;
  score_problem: number | null;
  score_feasibility: number | null;
  score_timing: number | null;
  score_pm_fit: number | null;
  is_idea_of_day: boolean;
  idea_of_day_date: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunitySignal {
  id: string;
  idea_id: string;
  platform: "reddit" | "facebook" | "youtube" | "other";
  count: number | null;
  themes: string[] | null;
  created_at: string;
}

export interface Trend {
  id: string;
  keyword: string;
  volume: number | null;
  growth_pct: number | null;
  description: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketInsight {
  id: string;
  title: string;
  metric_label: string | null;
  metric_value: string | null;
  metric_period: string | null;
  description: string | null;
  insight_type: "market_size" | "growth_signal" | "community_demand" | null;
  source_label: string | null;
  created_at: string;
}

export interface IdeaStats {
  id: string;
  total_ideas: number;
  total_trends: number;
  total_insights: number;
  updated_at: string;
}

export interface IdeaOfDayResponse {
  idea: Idea & { community_signals: CommunitySignal[] };
  prev_slug: string | null;
  next_slug: string | null;
}

export interface IdeasResponse {
  ideas: Idea[];
  total: number;
}
