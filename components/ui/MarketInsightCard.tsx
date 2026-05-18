"use client";
import type { MarketInsight } from "@/lib/supabase/types";

interface MarketInsightCardProps {
  insight: MarketInsight;
}

const insightTypeLabel: Record<string, string> = {
  market_size: "Market Size",
  growth_signal: "Growth Signal",
  community_demand: "Community Demand",
};

export function MarketInsightCard({ insight }: MarketInsightCardProps) {
  return (
    <div
      style={{
        padding: "24px",
        background: "var(--raised)",
        borderRadius: "var(--r10)",
        boxShadow: "var(--shadow-1)",
        border: "1px solid rgba(13,13,13,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Type label */}
      {insight.insight_type && (
        <span className="ui-small" style={{ color: "var(--primary)" }}>
          {insightTypeLabel[insight.insight_type] ?? insight.insight_type}
        </span>
      )}

      {/* Title */}
      <h3 className="h3" style={{ margin: 0, color: "var(--text)" }}>
        {insight.title}
      </h3>

      {/* Metric */}
      {insight.metric_value && (
        <div>
          <div
            style={{
              fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
              fontSize: "2.25rem",
              fontWeight: 400,
              color: "var(--primary)",
              lineHeight: 1.1,
            }}
          >
            {insight.metric_value}
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
            {insight.metric_label && (
              <span className="ui-label" style={{ color: "var(--muted)" }}>
                {insight.metric_label}
              </span>
            )}
            {insight.metric_period && (
              <span className="ui-label" style={{ color: "var(--muted)" }}>
                · {insight.metric_period}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {insight.description && (
        <p className="body-small" style={{ color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
          {insight.description}
        </p>
      )}

      {/* Source */}
      {insight.source_label && (
        <div style={{ marginTop: "auto" }}>
          <span className="ui-small" style={{ color: "var(--muted)" }}>
            Source: {insight.source_label}
          </span>
        </div>
      )}
    </div>
  );
}
