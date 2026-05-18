// ─── Section 1: Database interface ───────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      ideas: {
        Row: {
          id: string
          slug: string
          title: string
          tagline: string | null
          description: string | null
          category: string | null
          business_model: string | null
          market_type: string | null
          revenue_potential: string | null
          execution_difficulty: string | null
          score_opportunity: number | null
          score_problem: number | null
          score_feasibility: number | null
          score_timing: number | null
          score_pm_fit: number | null
          is_idea_of_day: boolean
          idea_of_day_date: string | null
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          tagline?: string | null
          description?: string | null
          category?: string | null
          business_model?: string | null
          market_type?: string | null
          revenue_potential?: string | null
          execution_difficulty?: string | null
          score_opportunity?: number | null
          score_problem?: number | null
          score_feasibility?: number | null
          score_timing?: number | null
          score_pm_fit?: number | null
          is_idea_of_day?: boolean
          idea_of_day_date?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          tagline?: string | null
          description?: string | null
          category?: string | null
          business_model?: string | null
          market_type?: string | null
          revenue_potential?: string | null
          execution_difficulty?: string | null
          score_opportunity?: number | null
          score_problem?: number | null
          score_feasibility?: number | null
          score_timing?: number | null
          score_pm_fit?: number | null
          is_idea_of_day?: boolean
          idea_of_day_date?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      trends: {
        Row: {
          id: string
          keyword: string
          volume: number | null
          growth_pct: number | null
          description: string | null
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          keyword: string
          volume?: number | null
          growth_pct?: number | null
          description?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          keyword?: string
          volume?: number | null
          growth_pct?: number | null
          description?: string | null
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      market_insights: {
        Row: {
          id: string
          title: string
          metric_label: string | null
          metric_value: string | null
          metric_period: string | null
          description: string | null
          insight_type: string | null
          source_label: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          metric_label?: string | null
          metric_value?: string | null
          metric_period?: string | null
          description?: string | null
          insight_type?: string | null
          source_label?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          metric_label?: string | null
          metric_value?: string | null
          metric_period?: string | null
          description?: string | null
          insight_type?: string | null
          source_label?: string | null
          created_at?: string
        }
      }
      community_signals: {
        Row: {
          id: string
          idea_id: string
          platform: string
          count: number | null
          themes: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          platform: string
          count?: number | null
          themes?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          platform?: string
          count?: number | null
          themes?: string[] | null
          created_at?: string
        }
      }
      idea_stats: {
        Row: {
          id: string
          total_ideas: number
          total_trends: number
          total_insights: number
          updated_at: string
        }
        Insert: {
          id?: string
          total_ideas: number
          total_trends: number
          total_insights: number
          updated_at?: string
        }
        Update: {
          id?: string
          total_ideas?: number
          total_trends?: number
          total_insights?: number
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          plan: string
          stripe_customer_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          plan?: string
          stripe_customer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          plan?: string
          stripe_customer_id?: string | null
          created_at?: string
        }
      }
      saved_ideas: {
        Row: {
          id: string
          user_id: string
          idea_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          idea_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          idea_id?: string
          created_at?: string
        }
      }
      agent_runs: {
        Row: {
          id: string
          user_id: string
          idea_input: string
          status: string
          result: Record<string, unknown> | null
          steps_done: number
          total_steps: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          idea_input: string
          status?: string
          result?: Record<string, unknown> | null
          steps_done?: number
          total_steps?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          idea_input?: string
          status?: string
          result?: Record<string, unknown> | null
          steps_done?: number
          total_steps?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export default Database

// ─── Section 2: Convenience type aliases ─────────────────────────────────────

export type Idea = Database['public']['Tables']['ideas']['Row']
export type IdeaInsert = Database['public']['Tables']['ideas']['Insert']
export type Trend = Database['public']['Tables']['trends']['Row']
export type MarketInsight = Database['public']['Tables']['market_insights']['Row']
export type CommunitySignal = Database['public']['Tables']['community_signals']['Row']
export type IdeaStats = Database['public']['Tables']['idea_stats']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type AgentRun = Database['public']['Tables']['agent_runs']['Row']

// ─── Section 3: Composite API response types ─────────────────────────────────

export type IdeaWithSignals = Idea & {
  community_signals: CommunitySignal[]
}

export type IdeaOfDayResponse = {
  idea: IdeaWithSignals
  prev: { slug: string; date: string } | null
  next: { slug: string; date: string } | null
}

export type IdeasResponse = {
  ideas: Idea[]
  total: number
  hasMore: boolean
}

export type StatsResponse = {
  total_ideas: number
  total_trends: number
  total_insights: number
}

export type AgentStatusResponse = {
  status: AgentRun['status']
  steps_done: number
  total_steps: number
  result: Record<string, unknown> | null
}

// ─── Section 4: Score color utility ──────────────────────────────────────────

export type ScoreColor = 'green' | 'amber' | 'red'

export function getScoreColor(score: number | null): ScoreColor {
  if (score === null) return 'red'
  if (score >= 70) return 'green'
  if (score >= 50) return 'amber'
  return 'red'
}

// ─── Section 5: Score label utility ──────────────────────────────────────────

export function getScoreLabel(score: number | null): string {
  if (score === null) return 'N/A'
  if (score >= 80) return 'Strong'
  if (score >= 65) return 'Good'
  if (score >= 50) return 'Fair'
  return 'Weak'
}
