"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { label: "Ideas", href: "/ideas" },
  { label: "Trends", href: "/trends" },
  { label: "Research", href: "/hub/agent" },
  { label: "Pricing", href: "/pricing" },
];

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "rgba(247,244,240,0.88)",
        borderBottom: "1px solid rgba(13,13,13,0.07)",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--r4)",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 13L8 3L13 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 10H11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", fontWeight: 700, fontSize: "1rem", color: "var(--text)", letterSpacing: "-0.01em" }}>
            LaunchPlan
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, justifyContent: "center" }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="ui-label"
              style={{
                color: "var(--muted)",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: "var(--pill)",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--text)";
                (e.currentTarget as HTMLElement).style.background = "rgba(13,13,13,0.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "var(--muted)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <Button variant="ghost" href="/auth/login" size="sm">Sign In</Button>
          <Button variant="primary" href="/auth/signup" size="sm">Get Started</Button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            color: "var(--text)",
          }}
          className="mobile-menu-btn"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {menuOpen
              ? <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              : <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ borderTop: "1px solid rgba(13,13,13,0.07)", padding: "12px 24px 16px", background: "rgba(247,244,240,0.97)" }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="ui-label"
              onClick={() => setMenuOpen(false)}
              style={{ display: "block", padding: "10px 0", color: "var(--muted)", textDecoration: "none", borderBottom: "1px solid rgba(13,13,13,0.05)" }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <Button variant="ghost" href="/auth/login" size="sm">Sign In</Button>
            <Button variant="primary" href="/auth/signup" size="sm">Get Started</Button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
