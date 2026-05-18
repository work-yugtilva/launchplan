import { MarketInsightCard } from "@/components/ui/MarketInsightCard";
import type { MarketInsight } from "@/lib/supabase/types";

interface MarketInsightsSectionProps {
  insights: MarketInsight[];
}

export function MarketInsightsSection({ insights }: MarketInsightsSectionProps) {
  return (
    <section style={{ background: "var(--bg)", padding: "80px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p className="ui-small" style={{ color: "var(--primary)", marginBottom: "8px" }}>
            MARKET INTELLIGENCE
          </p>
          <h2 className="h2" style={{ color: "var(--text)", margin: "0 0 12px" }}>
            Why Now
          </h2>
          <p className="body" style={{ color: "var(--muted)" }}>
            Real market signals that validate the opportunity
          </p>
        </div>

        {/* Grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}
          className="insights-grid"
        >
          {insights.map((insight) => (
            <MarketInsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .insights-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .insights-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
