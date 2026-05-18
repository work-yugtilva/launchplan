import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { IdeaOfDaySection } from "@/components/sections/IdeaOfDaySection";
import { IdeasPreviewSection } from "@/components/sections/IdeasPreviewSection";
import { TrendsSection } from "@/components/sections/TrendsSection";
import { MarketInsightsSection } from "@/components/sections/MarketInsightsSection";
import { CTASection } from "@/components/sections/CTASection";
import type {
  Idea,
  CommunitySignal,
  Trend,
  MarketInsight,
  IdeaStats,
  IdeaOfDayResponse,
} from "@/lib/supabase/types";

interface StatsJson {
  total_ideas: number;
  total_trends: number;
  total_insights: number;
}

interface IotdJson {
  idea: Idea & { community_signals: CommunitySignal[] };
  prev: { slug: string } | null;
  next: { slug: string } | null;
}

interface IdeasJson {
  ideas: Idea[];
  total: number;
}

interface TrendsJson {
  trends: Trend[];
  total: number;
}

interface InsightsJson {
  insights: MarketInsight[];
  total: number;
}

function statsForHero(row: StatsJson): IdeaStats {
  return { id: "", updated_at: "", ...row };
}

function ideaOfDayForSection(data: IotdJson): IdeaOfDayResponse {
  return {
    idea: data.idea,
    prev_slug: data.prev?.slug ?? null,
    next_slug: data.next?.slug ?? null,
  };
}

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "";

async function loadHomeData() {
  const [statsRes, iotdRes, ideasRes, trendsRes, insightsRes] = await Promise.all([
    fetch(`${BASE}/api/stats`, { next: { revalidate: 86400 } }),
    fetch(`${BASE}/api/idea-of-day`, { next: { revalidate: 3600 } }),
    fetch(`${BASE}/api/ideas?limit=6`, { next: { revalidate: 300 } }),
    fetch(`${BASE}/api/trends?limit=4&sort_by=growth_pct`, { next: { revalidate: 3600 } }),
    fetch(`${BASE}/api/market-insights?limit=3`, { next: { revalidate: 3600 } }),
  ]);

  const statsJson = statsRes.ok
    ? ((await statsRes.json()) as StatsJson)
    : { total_ideas: 0, total_trends: 0, total_insights: 0 };

  const iotdRaw = iotdRes.ok ? ((await iotdRes.json()) as IotdJson) : null;

  const ideasJson = ideasRes.ok
    ? ((await ideasRes.json()) as IdeasJson)
    : { ideas: [] as Idea[], total: 0 };

  const trendsJson = trendsRes.ok
    ? ((await trendsRes.json()) as TrendsJson)
    : { trends: [] as Trend[], total: 0 };

  const insightsJson = insightsRes.ok
    ? ((await insightsRes.json()) as InsightsJson)
    : { insights: [] as MarketInsight[], total: 0 };

  return {
    stats: statsForHero(statsJson),
    iotd: iotdRaw ? ideaOfDayForSection(iotdRaw) : null,
    ideasData: { ideas: ideasJson.ideas, total: ideasJson.total, hasMore: false },
    trends: trendsJson.trends,
    insights: insightsJson.insights,
  };
}

export default async function HomePage() {
  const { stats, iotd, ideasData, trends, insights } = await loadHomeData();

  return (
    <>
      <NavBar />
      <main>
        <HeroSection stats={stats} />
        {iotd && <IdeaOfDaySection data={iotd} />}
        <IdeasPreviewSection ideas={ideasData.ideas as Idea[]} totalIdeas={stats.total_ideas} />
        <TrendsSection trends={trends as Trend[]} />
        <MarketInsightsSection insights={insights as MarketInsight[]} />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
