import type { Trend } from "@/lib/supabase/types";

interface TrendCardProps {
  trend: Trend;
}

function growthClass(pct: number | null): { color: string; bg: string } {
  if (pct === null) return { color: "var(--muted)", bg: "var(--surface)" };
  if (pct >= 100) return { color: "var(--green)", bg: "var(--green-bg)" };
  if (pct >= 20) return { color: "var(--amber)", bg: "var(--amber-bg)" };
  return { color: "var(--red)", bg: "var(--red-bg)" };
}

export function TrendCard({ trend }: TrendCardProps) {
  const { color, bg } = growthClass(trend.growth_pct);

  return (
    <div
      style={{
        padding: "20px",
        background: "var(--raised)",
        borderRadius: "var(--r10)",
        boxShadow: "var(--shadow-1)",
        border: "1px solid rgba(13,13,13,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Growth badge */}
      {trend.growth_pct !== null && (
        <span
          className="ui-label"
          style={{
            display: "inline-flex",
            alignSelf: "flex-start",
            padding: "3px 10px",
            borderRadius: "var(--pill)",
            background: bg,
            color,
            fontWeight: 600,
          }}
        >
          +{Number(trend.growth_pct).toLocaleString()}%
        </span>
      )}

      {/* Keyword */}
      <h3 className="h3" style={{ margin: 0, color: "var(--text)" }}>
        {trend.keyword}
      </h3>

      {/* Volume */}
      {trend.volume !== null && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="ui-small" style={{ color: "var(--muted)" }}>VOLUME</span>
          <span className="ui-label" style={{ color: "var(--text)", fontWeight: 600 }}>
            {trend.volume.toLocaleString()}/mo
          </span>
        </div>
      )}

      {/* Description */}
      {trend.description && (
        <p className="body-small line-clamp-2" style={{ color: "var(--muted)", margin: 0 }}>
          {trend.description}
        </p>
      )}
    </div>
  );
}
