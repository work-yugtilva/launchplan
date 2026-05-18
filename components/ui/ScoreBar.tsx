interface ScoreBarProps {
  label: string;
  score: number | null;
}

function scoreClass(score: number | null): string {
  if (score === null) return "";
  if (score >= 70) return "score-green";
  if (score >= 50) return "score-amber";
  return "score-red";
}

function scoreColor(score: number | null): string {
  if (score === null) return "var(--muted)";
  if (score >= 70) return "var(--green)";
  if (score >= 50) return "var(--amber)";
  return "var(--red)";
}

export function ScoreBar({ label, score }: ScoreBarProps) {
  const displayScore = score ?? 0;
  const cls = scoreClass(score);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="ui-label" style={{ color: "var(--muted)" }}>{label}</span>
        <span
          className={`ui-label ${cls}`}
          style={{ padding: "2px 8px", borderRadius: "var(--pill)", fontWeight: 600 }}
        >
          {score !== null ? score : "—"}
        </span>
      </div>
      <div
        style={{
          height: "6px",
          borderRadius: "var(--pill)",
          background: "var(--surface)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${displayScore}%`,
            borderRadius: "var(--pill)",
            background: scoreColor(score),
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}
