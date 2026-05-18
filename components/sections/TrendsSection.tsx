import { TrendCard } from "@/components/ui/TrendCard";
import type { Trend } from "@/lib/supabase/types";

interface TrendsSectionProps {
  trends: Trend[];
}

export function TrendsSection({ trends }: TrendsSectionProps) {
  return (
    <section style={{ background: "var(--surface)", padding: "80px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p className="ui-small" style={{ color: "var(--primary)", marginBottom: "8px" }}>
            TRENDING NOW
          </p>
          <h2 className="h2" style={{ color: "var(--text)", margin: "0 0 12px" }}>
            Market Trends
          </h2>
          <p className="body" style={{ color: "var(--muted)" }}>
            Discover emerging signals and opportunities
          </p>
        </div>

        {/* Grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}
          className="trends-grid"
        >
          {trends.map((trend) => (
            <TrendCard key={trend.id} trend={trend} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .trends-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .trends-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
