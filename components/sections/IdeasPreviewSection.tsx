import { Button } from "@/components/ui/Button";
import { IdeaCard } from "@/components/ui/IdeaCard";
import type { Idea } from "@/lib/supabase/types";

interface IdeasPreviewSectionProps {
  ideas: Idea[];
  totalIdeas: number;
}

export function IdeasPreviewSection({ ideas, totalIdeas }: IdeasPreviewSectionProps) {
  return (
    <section style={{ background: "var(--bg)", padding: "80px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p className="ui-small" style={{ color: "var(--primary)", marginBottom: "8px" }}>
            IDEA DATABASE
          </p>
          <h2 className="h2" style={{ color: "var(--text)", margin: "0 0 12px" }}>
            Explore Startup Ideas
          </h2>
          <p className="body" style={{ color: "var(--muted)", maxWidth: "480px", margin: "0 auto" }}>
            Dive into deep research and analysis on {totalIdeas.toLocaleString()}+ business ideas
          </p>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
            marginBottom: "40px",
          }}
          className="ideas-grid"
        >
          {ideas.slice(0, 6).map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>

        {/* Browse all */}
        <div style={{ textAlign: "center" }}>
          <Button variant="secondary" href="/ideas">Browse All Ideas →</Button>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .ideas-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .ideas-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
