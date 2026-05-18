"use client";
import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Ideas", href: "/ideas" },
    { label: "Trends", href: "/trends" },
    { label: "Research Agent", href: "/hub/agent" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer
      style={{
        background: "var(--surface)",
        borderTop: "1px solid rgba(13,13,13,0.07)",
        padding: "48px 24px 32px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "40px",
            marginBottom: "40px",
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "var(--r4)",
                  background: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 13L8 3L13 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 10H11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.9375rem", color: "var(--text)" }}>
                LaunchPlan
              </span>
            </div>
            <p className="body-small" style={{ color: "var(--muted)", maxWidth: "240px", lineHeight: 1.6 }}>
              Pre-researched startup ideas with AI-powered validation, built for founders and product managers.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="ui-small" style={{ color: "var(--muted)", marginBottom: "16px" }}>{group.toUpperCase()}</p>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="body-small"
                      style={{ color: "var(--muted)", textDecoration: "none", transition: "color 0.15s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(13,13,13,0.07)",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <span className="body-small" style={{ color: "var(--muted)" }}>
            © 2026 LaunchPlan.dev
          </span>
          <span className="body-small" style={{ color: "var(--muted)" }}>
            Built for founders, by founders
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
