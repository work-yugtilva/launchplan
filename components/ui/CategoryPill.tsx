interface CategoryPillProps {
  children: React.ReactNode;
  variant?: "primary" | "surface" | "neutral";
}

export function CategoryPill({ children, variant = "primary" }: CategoryPillProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: "var(--light)", color: "var(--primary)" },
    surface: { background: "var(--surface)", color: "var(--muted)" },
    neutral: { background: "var(--surface)", color: "var(--text)", border: "1px solid rgba(13,13,13,0.08)" },
  };

  return (
    <span
      className="ui-label"
      style={{
        ...styles[variant],
        padding: "3px 10px",
        borderRadius: "var(--pill)",
        display: "inline-block",
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}
