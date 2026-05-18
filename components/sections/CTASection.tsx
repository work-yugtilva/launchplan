import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section
      style={{
        background: "#0d0d0d",
        padding: "96px 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(228,97,26,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative" }}>
        <p className="ui-small" style={{ color: "var(--primary)", marginBottom: "16px" }}>
          AI-POWERED RESEARCH
        </p>
        <h2
          style={{
            fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif",
            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
            fontWeight: 400,
            color: "white",
            margin: "0 0 20px",
            lineHeight: 1.2,
          }}
        >
          Ready to Validate{" "}
          <em style={{ color: "var(--primary)", fontStyle: "italic" }}>Your Idea?</em>
        </h2>
        <p
          className="body-large"
          style={{ color: "rgba(255,255,255,0.65)", margin: "0 0 40px", lineHeight: 1.65 }}
        >
          Run a 40-step AI research analysis on any startup idea in minutes.
          Get market sizing, competitor mapping, GTM strategy, and more.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Button variant="primary" href="/hub/agent">Start Research →</Button>
          <Button
            variant="ghost"
            href="/ideas"
            style={{ color: "rgba(255,255,255,0.7)" } as React.CSSProperties}
          >
            Browse Ideas
          </Button>
        </div>
      </div>
    </section>
  );
}
