import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { CategoryPill } from "@/components/ui/CategoryPill";
import type { IdeaOfDayResponse } from "@/lib/supabase/types";

interface IdeaOfDaySectionProps {
  data: IdeaOfDayResponse;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  const icons: Record<string, React.ReactNode> = {
    reddit: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm5.8 9.4a1.4 1.4 0 00-1.4 1.4c0 .12.02.24.05.35a8.08 8.08 0 01-4.43 1.24 8.08 8.08 0 01-4.43-1.24c.03-.11.05-.23.05-.35a1.4 1.4 0 00-2.4-.97 1.4 1.4 0 001.07 2.35c.06 0 .12-.01.18-.02a8.83 8.83 0 004.73 2.17v.8c-1.04.19-1.8.84-1.8 1.61 0 .93 1.12 1.69 2.5 1.69s2.5-.76 2.5-1.69c0-.77-.76-1.42-1.8-1.61v-.8A8.83 8.83 0 0014.7 12.2c.06.01.12.02.18.02a1.4 1.4 0 001.07-2.35A1.4 1.4 0 0015.8 9.4zm-9.67 1.4a.8.8 0 110-1.6.8.8 0 010 1.6zm3.87 2.68a2.14 2.14 0 01-1.5-.54.15.15 0 00-.21.21 2.4 2.4 0 001.71.63 2.4 2.4 0 001.71-.63.15.15 0 00-.21-.21 2.14 2.14 0 01-1.5.54zm2.27-2.68a.8.8 0 110-1.6.8.8 0 010 1.6z"/>
      </svg>
    ),
    facebook: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
        <path d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878V12.89h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"/>
      </svg>
    ),
    youtube: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
        <path d="M19.582 5.418A2.52 2.52 0 0017.8 3.63C16.25 3.2 10 3.2 10 3.2s-6.25 0-7.8.43A2.52 2.52 0 00.418 5.418C0 6.97 0 10.2 0 10.2s0 3.23.418 4.782a2.52 2.52 0 001.782 1.788C3.75 17.2 10 17.2 10 17.2s6.25 0 7.8-.43a2.52 2.52 0 001.782-1.788C20 13.43 20 10.2 20 10.2s0-3.23-.418-4.782zM8 13.2V7.2l5.2 3-5.2 3z"/>
      </svg>
    ),
  };
  return <>{icons[platform] ?? null}</>;
};

const platformLabel: Record<string, string> = {
  reddit: "communities",
  facebook: "groups",
  youtube: "channels",
  other: "sources",
};

export function IdeaOfDaySection({ data }: IdeaOfDaySectionProps) {
  const { idea, prev_slug, next_slug } = data;

  return (
    <section
      id="idea-of-day"
      style={{
        background: "var(--bg)",
        padding: "0 24px 80px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Section label */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <p className="ui-small" style={{ color: "var(--primary)", marginBottom: "8px" }}>FEATURED TODAY</p>
          <h2 className="h2" style={{ color: "var(--text)", margin: 0 }}>Idea of the Day</h2>
        </div>

        {/* Main card */}
        <div
          style={{
            background: "var(--raised)",
            borderRadius: "var(--r10)",
            boxShadow: "var(--shadow-2)",
            border: "1px solid rgba(13,13,13,0.07)",
            overflow: "hidden",
          }}
        >
          {/* Card header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
              borderBottom: "1px solid rgba(13,13,13,0.07)",
              background: "var(--surface)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                className="ui-label"
                style={{
                  background: "var(--primary)",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "var(--pill)",
                  fontWeight: 600,
                }}
              >
                Idea of the Day
              </span>
              <span className="body-small" style={{ color: "var(--muted)" }}>
                {formatDate(idea.idea_of_day_date)}
              </span>
            </div>

            {/* Nav arrows */}
            <div style={{ display: "flex", gap: "8px" }}>
              {prev_slug ? (
                <Link
                  href={`/ideas/${prev_slug}`}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: "6px 12px" }}
                  title="Previous idea"
                >
                  ←
                </Link>
              ) : (
                <span className="btn btn-secondary btn-sm" style={{ padding: "6px 12px", opacity: 0.4, cursor: "not-allowed" }}>←</span>
              )}
              {next_slug ? (
                <Link
                  href={`/ideas/${next_slug}`}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: "6px 12px" }}
                  title="Next idea"
                >
                  →
                </Link>
              ) : (
                <span className="btn btn-secondary btn-sm" style={{ padding: "6px 12px", opacity: 0.4, cursor: "not-allowed" }}>→</span>
              )}
            </div>
          </div>

          {/* Card body */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "0",
            }}
            className="iotd-grid"
          >
            {/* Left column */}
            <div style={{ padding: "32px", borderRight: "1px solid rgba(13,13,13,0.07)" }}>
              {/* Category */}
              <div style={{ marginBottom: "16px" }}>
                {idea.category && <CategoryPill variant="primary">{idea.category}</CategoryPill>}
              </div>

              {/* Title */}
              <h1 className="h1" style={{ color: "var(--text)", margin: "0 0 12px" }}>
                {idea.title}
              </h1>

              {/* Tagline */}
              {idea.tagline && (
                <p className="body-large" style={{ color: "var(--muted)", margin: "0 0 24px", lineHeight: 1.6 }}>
                  {idea.tagline}
                </p>
              )}

              {/* Metadata strip */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  padding: "16px",
                  background: "var(--surface)",
                  borderRadius: "var(--r8)",
                  marginBottom: "24px",
                }}
              >
                {[
                  { label: "Revenue Potential", value: idea.revenue_potential, icon: "💰" },
                  { label: "Execution Level", value: idea.execution_difficulty, icon: "⚡" },
                  { label: "Business Model", value: idea.business_model ? idea.business_model.charAt(0).toUpperCase() + idea.business_model.slice(1) : null, icon: "🏗" },
                ].map(({ label, value, icon }) =>
                  value ? (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "14px", flexShrink: 0 }}>{icon}</span>
                      <span className="ui-label" style={{ color: "var(--muted)", minWidth: "140px" }}>{label}</span>
                      <span className="body" style={{ color: "var(--text)", fontWeight: 600 }}>{value}</span>
                    </div>
                  ) : null
                )}
              </div>

              {/* Description */}
              {idea.description && (
                <div style={{ position: "relative", marginBottom: "24px" }}>
                  <p className="body line-clamp-4" style={{ color: "var(--text)", margin: 0, lineHeight: 1.7 }}>
                    {idea.description}
                  </p>
                </div>
              )}

              {/* Community signals */}
              {idea.community_signals && idea.community_signals.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    flexWrap: "wrap",
                    padding: "12px 16px",
                    background: "var(--surface)",
                    borderRadius: "var(--r8)",
                    marginBottom: "24px",
                  }}
                >
                  {idea.community_signals.map((sig) => (
                    <div key={sig.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "var(--muted)" }}>
                        <PlatformIcon platform={sig.platform} />
                      </span>
                      <span className="ui-label" style={{ color: "var(--text)" }}>
                        {sig.count} {platformLabel[sig.platform] ?? "signals"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTAs */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Button variant="primary" href={`/ideas/${idea.slug}`}>
                  See Full Analysis →
                </Button>
                <Button variant="ghost">Save Idea</Button>
                <Button variant="ghost">Share</Button>
              </div>
            </div>

            {/* Right column — scores */}
            <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <p className="ui-small" style={{ color: "var(--muted)", marginBottom: "16px" }}>VALIDATION SCORES</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <ScoreBar label="Opportunity" score={idea.score_opportunity} />
                  <ScoreBar label="Problem" score={idea.score_problem} />
                  <ScoreBar label="Feasibility" score={idea.score_feasibility} />
                  <ScoreBar label="Why Now" score={idea.score_timing} />
                  <ScoreBar label="PM Fit" score={idea.score_pm_fit} />
                </div>
              </div>

              <div style={{ marginTop: "auto" }}>
                <Button variant="specflow" href="/hub/agent" style={{ width: "100%", justifyContent: "center" } as React.CSSProperties}>
                  Build in SpecFlow AI →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .iotd-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
