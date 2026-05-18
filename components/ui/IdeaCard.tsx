"use client";
import Link from "next/link";
import type { Idea } from "@/lib/supabase/types";
import { CategoryPill } from "./CategoryPill";

interface IdeaCardProps {
  idea: Idea;
}

function ScoreDot({ score }: { score: number | null }) {
  let bg = "var(--muted)";
  if (score !== null) {
    if (score >= 70) bg = "var(--green)";
    else if (score >= 50) bg = "var(--amber)";
    else bg = "var(--red)";
  }
  return (
    <span
      title={score !== null ? String(score) : "N/A"}
      style={{
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: bg,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <Link
      href={`/ideas/${idea.slug}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "20px",
        background: "var(--raised)",
        borderRadius: "var(--r10)",
        boxShadow: "var(--shadow-1)",
        border: "1px solid rgba(13,13,13,0.06)",
        textDecoration: "none",
        color: "inherit",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-2)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-1)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Top pills */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {idea.category && <CategoryPill variant="primary">{idea.category}</CategoryPill>}
        {idea.business_model && (
          <CategoryPill variant="surface">
            {idea.business_model.charAt(0).toUpperCase() + idea.business_model.slice(1)}
          </CategoryPill>
        )}
      </div>

      {/* Title */}
      <h3 className="h3" style={{ color: "var(--text)", margin: 0 }}>
        {idea.title}
      </h3>

      {/* Tagline */}
      {idea.tagline && (
        <p className="body-small line-clamp-2" style={{ color: "var(--muted)", margin: 0 }}>
          {idea.tagline}
        </p>
      )}

      {/* Score dots row */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "auto" }}>
        <ScoreDot score={idea.score_opportunity} />
        <ScoreDot score={idea.score_problem} />
        <ScoreDot score={idea.score_feasibility} />
        <ScoreDot score={idea.score_timing} />
        <span className="ui-small" style={{ color: "var(--muted)", marginLeft: "4px" }}>
          Opp · Prob · Feas · Timing
        </span>
      </div>

      {/* Revenue badge */}
      {idea.revenue_potential && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span className="ui-label" style={{ color: "var(--muted)" }}>
            Revenue: {idea.revenue_potential}
          </span>
        </div>
      )}
    </Link>
  );
}
