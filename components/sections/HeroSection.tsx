import { Button } from "@/components/ui/Button";
import type { IdeaStats } from "@/lib/supabase/types";

interface HeroSectionProps {
  stats: IdeaStats;
}

export function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section
      style={{
        background: "var(--bg)",
        padding: "80px 24px 64px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background texture */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(228,97,26,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative" }}>
        {/* Badge */}
        <div className="animate-fade-up" style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
          <span
            className="ui-label"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--light)",
              color: "var(--primary)",
              padding: "6px 14px",
              borderRadius: "var(--pill)",
              border: "1px solid rgba(228,97,26,0.20)",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "var(--primary)",
                display: "inline-block",
                animation: "pulse-dot 2s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            New ideas added daily
          </span>
        </div>

        {/* Headline */}
        <h1
          className="display-xl animate-fade-up-delay-1"
          style={{ color: "var(--text)", margin: "0 0 24px" }}
        >
          Discover Startup Ideas{" "}
          <em style={{ color: "var(--primary)", fontStyle: "italic" }}>Worth Building</em>
        </h1>

        {/* Subtitle */}
        <p
          className="body-large animate-fade-up-delay-2"
          style={{ color: "var(--muted)", maxWidth: "520px", margin: "0 auto 36px", lineHeight: 1.65 }}
        >
          Pre-researched, PM-validated startup ideas with real market signals,
          community proof, and AI-powered analysis.
        </p>

        {/* CTAs */}
        <div
          className="animate-fade-up-delay-3"
          style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "36px" }}
        >
          <Button variant="primary" href="#idea-of-day">Browse Today&apos;s Idea →</Button>
          <Button variant="secondary" href="/hub/agent">Research My Idea</Button>
        </div>

        {/* Social proof */}
        <div
          className="animate-fade-up-delay-4"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "40px" }}
        >
          {/* Avatar stack */}
          <div style={{ display: "flex" }}>
            {["E8", "F5", "D4", "C3"].map((seed, i) => (
              <div
                key={seed}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "2px solid var(--bg)",
                  marginLeft: i === 0 ? 0 : "-8px",
                  background: `hsl(${20 + i * 30}, 55%, 65%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "white",
                  flexShrink: 0,
                }}
              >
                {seed[0]}
              </div>
            ))}
          </div>
          <span className="body-small" style={{ color: "var(--muted)" }}>
            <strong style={{ color: "var(--text)", fontWeight: 600 }}>{stats.total_ideas.toLocaleString()}+</strong> ideas researched
          </span>
        </div>

        {/* Workflow tags */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {["DISCOVER", "VALIDATE", "BUILD IN SPECFLOW AI"].map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                className="ui-small"
                style={{
                  background: "var(--surface)",
                  color: i === 2 ? "var(--text)" : "var(--muted)",
                  padding: "5px 12px",
                  borderRadius: "var(--pill)",
                  fontWeight: i === 2 ? 600 : 500,
                  border: i === 2 ? "1px solid rgba(13,13,13,0.12)" : "1px solid transparent",
                }}
              >
                {step}
              </span>
              {i < 2 && (
                <span className="ui-small" style={{ color: "var(--muted)" }}>→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
