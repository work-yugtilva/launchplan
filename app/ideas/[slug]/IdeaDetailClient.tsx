'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bookmark, Share2, ChevronDown, Lock, Copy, X, ExternalLink } from 'lucide-react'
import type { IdeaWithSignals, Idea, CommunitySignal } from '@/app/lib/types'

interface Props {
  idea: IdeaWithSignals
  plan: string
}

function scoreBarColor(score: number | null): string {
  if (!score || score < 50) return '#9b2226'
  if (score < 80) return '#e4611a'
  return '#2d6a4f'
}

function scoreDisplay(score: number | null): string {
  if (score === null) return '—/10'
  return `${Math.round(score / 10)}/10`
}

function getBadges(idea: Idea): string[] {
  const badges: string[] = []
  if ((idea.score_timing ?? 0) >= 75) badges.push('Perfect Timing')
  else if ((idea.score_opportunity ?? 0) >= 75) badges.push('High Opportunity')
  if ((idea.score_pm_fit ?? 0) >= 75) badges.push('Strong PM Fit')
  else if ((idea.score_problem ?? 0) >= 75) badges.push('Clear Problem')
  return badges.slice(0, 2)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const SCORE_DIMS = [
  { label: 'Market Opportunity', key: 'score_opportunity' as keyof Idea },
  { label: 'Problem Severity', key: 'score_problem' as keyof Idea },
  { label: 'PM Feasibility', key: 'score_pm_fit' as keyof Idea },
  { label: 'Build Complexity', key: 'score_feasibility' as keyof Idea },
  { label: 'Why Now', key: 'score_timing' as keyof Idea },
]

const ALL_TABS = [
  { id: 'overview', label: 'Overview', gated: false },
  { id: 'value-ladder', label: 'Value Ladder', gated: true },
  { id: 'why-now', label: 'Why Now', gated: false },
  { id: 'proof-signals', label: 'Proof & Signals', gated: false },
  { id: 'market-gap', label: 'Market Gap', gated: false },
  { id: 'execution-plan', label: 'Execution Plan', gated: false },
  { id: 'prd-brief', label: 'PRD Brief', gated: true },
  { id: 'gtm-plan', label: 'GTM Plan', gated: true },
  { id: 'interview-script', label: 'Interview Script', gated: true },
  { id: 'community-signals', label: 'Community Signals', gated: false },
]

function isPro(plan: string): boolean {
  return plan === 'pro' || plan === 'empire'
}

function ProGateOverlay({ tabLabel, onClose }: { tabLabel: string; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(255,250,245,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #e2ddd7',
          borderRadius: '10px',
          padding: '32px',
          maxWidth: '360px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(13,13,13,0.10), 0 1px 4px rgba(13,13,13,0.06)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={16} />
        </button>
        <Lock size={24} style={{ color: '#e4611a', marginBottom: '12px' }} />
        <span
          style={{
            display: 'inline-block',
            background: '#e4611a1f',
            color: '#e4611a',
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 10px',
            borderRadius: '9999px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            marginBottom: '16px',
          }}
        >
          Pro Feature
        </span>
        <h3
          style={{
            fontFamily: 'var(--font-instrument-serif), serif',
            fontSize: '1.375rem',
            fontWeight: 400,
            color: 'var(--text)',
            marginBottom: '8px',
            lineHeight: 1.3,
          }}
        >
          Unlock {tabLabel}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: '0.875rem',
            color: 'var(--muted)',
            marginBottom: '24px',
            lineHeight: 1.5,
          }}
        >
          Get full analysis and AI-generated outputs with a Pro plan.
        </p>
        <a
          href="/pricing"
          style={{
            display: 'inline-block',
            background: '#0d0d0d',
            color: '#fffaf5',
            borderRadius: '9999px',
            padding: '10px 24px',
            fontSize: '0.875rem',
            fontWeight: 500,
            fontFamily: 'var(--font-dm-sans), sans-serif',
            textDecoration: 'none',
          }}
        >
          Upgrade to Pro →
        </a>
      </div>
    </div>
  )
}

function PlatformIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase()
  if (p === 'reddit') return <span>🔴</span>
  if (p === 'youtube') return <span>▶</span>
  if (p === 'facebook') return <span>👥</span>
  return <span>💬</span>
}

function CommunitySignalsGrid({ signals }: { signals: CommunitySignal[] }) {
  const byPlatform = signals.reduce<Record<string, CommunitySignal[]>>((acc, s) => {
    const key = s.platform ?? 'Other'
    acc[key] = [...(acc[key] ?? []), s]
    return acc
  }, {})

  const platforms = ['reddit', 'youtube', 'facebook', 'other']
  const allPlatforms = [
    ...platforms.filter(p => byPlatform[p] || byPlatform[p.charAt(0).toUpperCase() + p.slice(1)]),
    ...Object.keys(byPlatform).filter(
      p => !platforms.includes(p.toLowerCase())
    ),
  ]

  const entries = Object.entries(byPlatform)

  if (entries.length === 0) {
    return (
      <div style={{ padding: '24px', color: 'var(--muted)', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.875rem' }}>
        No community signals found yet.
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="signals-grid">
      {entries.map(([platform, sigs]) => {
        const totalCount = sigs.reduce((sum, s) => sum + (s.count ?? 0), 0)
        const allThemes = sigs.flatMap(s => s.themes ?? [])
        const visibleThemes = allThemes.slice(0, 3)
        const extra = allThemes.length - 3

        return (
          <div
            key={platform}
            style={{
              background: '#fffaf5',
              border: '1px solid #e2ddd7',
              borderLeft: '3px solid #e4611a',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <PlatformIcon platform={platform} />
              <span
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--text)',
                  textTransform: 'capitalize',
                }}
              >
                {platform}
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '0.8125rem',
                color: 'var(--muted)',
                marginBottom: '10px',
              }}
            >
              {totalCount} communities found · {sigs.length} segment{sigs.length !== 1 ? 's' : ''}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {visibleThemes.map((theme, i) => (
                <span
                  key={i}
                  style={{
                    background: '#f0ece5',
                    color: '#5f5750',
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                  }}
                >
                  {theme}
                </span>
              ))}
              {extra > 0 && (
                <span
                  style={{
                    background: '#f0ece5',
                    color: '#e4611a',
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontWeight: 500,
                  }}
                >
                  +{extra} more
                </span>
              )}
            </div>
            <a
              href="#"
              style={{
                color: '#e4611a',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              View detailed breakdown →
            </a>
          </div>
        )
      })}
    </div>
  )
}

function GatedOutputCard({ label, onUnlock }: { label: string; onUnlock: () => void }) {
  return (
    <div
      style={{
        background: '#fffaf5',
        border: '1px solid #e2ddd7',
        borderRadius: '8px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={16} style={{ color: '#e4611a' }} />
          <span
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontWeight: 500,
              fontSize: '0.9375rem',
              color: 'var(--text)',
            }}
          >
            {label}
          </span>
        </div>
        <button
          style={{
            background: 'none',
            border: '1px solid #e2ddd7',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            color: 'var(--muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Copy size={12} /> Copy
        </button>
      </div>
      {/* Blurred placeholder content */}
      <div style={{ filter: 'blur(6px)', userSelect: 'none', pointerEvents: 'none', marginBottom: '16px' }}>
        {[100, 85, 92, 78, 88, 60].map((w, i) => (
          <div
            key={i}
            style={{
              height: '14px',
              background: '#e2ddd7',
              borderRadius: '3px',
              width: `${w}%`,
              marginBottom: '8px',
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #e2ddd7',
          paddingTop: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <button
          onClick={onUnlock}
          style={{
            color: '#e4611a',
            background: 'none',
            border: 'none',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            cursor: 'pointer',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Lock size={13} /> Unlock with Pro
        </button>
        <a
          href="#"
          style={{
            color: 'var(--muted)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            textDecoration: 'none',
          }}
        >
          Download .md
        </a>
      </div>
    </div>
  )
}

function ProContentPlaceholder({ label }: { label: string }) {
  return (
    <div
      style={{
        background: '#fffaf5',
        border: '1px solid #e2ddd7',
        borderRadius: '8px',
        padding: '40px 24px',
        textAlign: 'center',
        maxWidth: '480px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontWeight: 500,
          fontSize: '0.9375rem',
          color: 'var(--text)',
          marginBottom: '6px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: '0.875rem',
          color: 'var(--muted)',
        }}
      >
        AI-generated output coming soon. Check back shortly.
      </p>
    </div>
  )
}

export function IdeaDetailClient({ idea, plan }: Props) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showStickyBar, setShowStickyBar] = useState(false)
  const [gateOpen, setGateOpen] = useState(false)
  const [gateTabLabel, setGateTabLabel] = useState('')
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onScroll() {
      const threshold = headerRef.current
        ? headerRef.current.offsetTop + headerRef.current.offsetHeight
        : 400
      setShowStickyBar(window.scrollY > threshold)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleTabClick(tab: { id: string; label: string; gated: boolean }) {
    if (tab.gated && !isPro(plan)) {
      setGateTabLabel(tab.label)
      setGateOpen(true)
      return
    }
    setActiveTab(tab.id)
    setGateOpen(false)
  }

  function openGate(label: string) {
    setGateTabLabel(label)
    setGateOpen(true)
  }

  const badges = getBadges(idea)
  const signals = idea.community_signals ?? []

  return (
    <>
      <style>{`
        @keyframes barBloom {
          from { width: 0% }
          to { width: var(--bar-target) }
        }
        .score-bar-fill {
          animation: barBloom 400ms ease-out both;
        }
        .tab-item {
          transition: color 0.15s ease, border-color 0.15s ease;
          white-space: nowrap;
        }
        .tab-item:hover { color: #e4611a !important; }
        .sticky-bar {
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .sticky-bar.hidden {
          transform: translateY(100%);
          opacity: 0;
          pointer-events: none;
        }
        .action-btn:hover { background: #e2ddd7 !important; }
        @media (max-width: 768px) {
          .idea-header-grid { flex-direction: column !important; }
          .score-cards-col { width: 100% !important; margin-top: 24px; }
          .signals-grid { grid-template-columns: 1fr !important; }
          .business-fit-strip { flex-wrap: wrap !important; }
        }
      `}</style>

      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '32px 24px 120px',
        }}
      >
        {/* Breadcrumb */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '24px',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: '0.8125rem',
            color: 'var(--muted)',
          }}
        >
          <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
            Home
          </Link>
          <span>›</span>
          <Link href="/hub/ideas/discover" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
            Ideas
          </Link>
          <span>›</span>
          <span
            style={{
              color: 'var(--text)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '300px',
            }}
          >
            {idea.title}
          </span>
        </nav>

        {/* Header block */}
        <div
          ref={headerRef}
          className="idea-header-grid"
          style={{
            display: 'flex',
            gap: '40px',
            alignItems: 'flex-start',
            marginBottom: '40px',
          }}
        >
          {/* Left */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badges */}
            {badges.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {badges.map(badge => (
                  <span
                    key={badge}
                    style={{
                      background: '#e4611a1f',
                      color: '#e4611a',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 10px',
                      borderRadius: '9999px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1
              style={{
                fontFamily: 'var(--font-instrument-serif), serif',
                fontSize: '2rem',
                fontWeight: 400,
                color: '#0d0d0d',
                lineHeight: 1.2,
                marginBottom: '8px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {idea.title}
            </h1>

            {/* Date */}
            <p
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '0.8125rem',
                color: 'var(--muted)',
                marginBottom: '16px',
              }}
            >
              Published {formatDate(idea.created_at)}
            </p>

            {/* Keyword row */}
            <div
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '0.875rem',
                color: 'var(--muted)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexWrap: 'wrap',
              }}
            >
              <span>🔑</span>
              {idea.category && (
                <span style={{ color: '#e4611a', fontWeight: 500 }}>{idea.category}</span>
              )}
              <span style={{ opacity: 0.4 }}>·</span>
              <span>
                {signals.reduce((sum, s) => sum + (s.count ?? 0), 0) || '—'}/mo signals
              </span>
              {idea.market_type && (
                <>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>{idea.market_type}</span>
                </>
              )}
            </div>

            {/* Business Fit strip */}
            <div
              className="business-fit-strip"
              style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
            >
              {[
                idea.revenue_potential,
                idea.execution_difficulty,
                idea.market_type,
                idea.business_model?.toUpperCase(),
              ]
                .filter(Boolean)
                .map((val, i) => (
                  <span
                    key={i}
                    style={{
                      background: '#f0ece5',
                      color: '#0d0d0d',
                      border: '1px solid #e2ddd7',
                      borderRadius: '9999px',
                      padding: '4px 14px',
                      fontSize: '0.8125rem',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {val}
                  </span>
                ))}
            </div>
          </div>

          {/* Right: Score cards */}
          <div
            className="score-cards-col"
            style={{ width: '300px', flexShrink: 0 }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
              }}
            >
              {SCORE_DIMS.map((dim, idx) => {
                const score = idea[dim.key] as number | null
                const color = scoreBarColor(score)
                const pct = score ?? 0

                return (
                  <div
                    key={dim.key}
                    style={{
                      gridColumn: idx === 4 ? '1 / -1' : undefined,
                      background: '#f0ece5',
                      border: '1px solid #e2ddd7',
                      borderRadius: '8px',
                      padding: '14px',
                      animationDelay: `${idx * 80}ms`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        color: 'var(--muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                        marginBottom: '6px',
                      }}
                    >
                      {dim.label}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-instrument-serif), serif',
                        fontSize: '1.5rem',
                        fontWeight: 400,
                        color: '#0d0d0d',
                        marginBottom: '8px',
                        lineHeight: 1,
                      }}
                    >
                      {scoreDisplay(score)}
                    </div>
                    {/* Bar track */}
                    <div
                      style={{
                        height: '4px',
                        borderRadius: '9999px',
                        background: '#e2ddd7',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        className="score-bar-fill"
                        style={
                          {
                            height: '100%',
                            borderRadius: '9999px',
                            background: color,
                            animationDelay: `${idx * 80}ms`,
                            '--bar-target': `${pct}%`,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Description */}
        {idea.description && (
          <div
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: '1rem',
              lineHeight: 1.7,
              color: '#0d0d0d',
              maxWidth: '720px',
              marginBottom: '40px',
            }}
          >
            {idea.description}
          </div>
        )}

        {/* Tab bar */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            background: '#fffaf5',
            borderBottom: '1px solid #e2ddd7',
            marginBottom: '32px',
            overflowX: 'auto',
          }}
        >
          <div style={{ display: 'flex', minWidth: 'max-content' }}>
            {ALL_TABS.map(tab => {
              const isActive = activeTab === tab.id
              const isGated = tab.gated && !isPro(plan)
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className="tab-item"
                  style={{
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #e4611a' : '2px solid transparent',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? '#e4611a' : 'var(--muted)',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {tab.label}
                  {isGated && (
                    <Lock size={11} style={{ opacity: 0.6 }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ position: 'relative', minHeight: '200px' }}>
          {/* Overview */}
          {activeTab === 'overview' && (
            <div>
              {idea.tagline && (
                <p
                  style={{
                    fontFamily: 'var(--font-instrument-serif), serif',
                    fontSize: '1.25rem',
                    fontWeight: 400,
                    color: '#0d0d0d',
                    fontStyle: 'italic',
                    marginBottom: '24px',
                    lineHeight: 1.5,
                    maxWidth: '640px',
                  }}
                >
                  &ldquo;{idea.tagline}&rdquo;
                </p>
              )}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                }}
              >
                {[
                  { label: 'Business Model', value: idea.business_model },
                  { label: 'Market Type', value: idea.market_type },
                  { label: 'Revenue Potential', value: idea.revenue_potential },
                  { label: 'Execution Difficulty', value: idea.execution_difficulty },
                  { label: 'Category', value: idea.category },
                ]
                  .filter(item => item.value)
                  .map(item => (
                    <div
                      key={item.label}
                      style={{
                        background: '#f0ece5',
                        border: '1px solid #e2ddd7',
                        borderRadius: '8px',
                        padding: '14px 16px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          color: 'var(--muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                          marginBottom: '4px',
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: 500,
                          color: 'var(--text)',
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Value Ladder */}
          {activeTab === 'value-ladder' && (
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px',
                  filter: !isPro(plan) ? 'blur(3px)' : undefined,
                }}
                className="value-ladder-grid"
              >
                {[
                  { tier: 'Tier 1', name: 'Freemium / Lead Magnet', price: 'Free – $0', desc: 'Core value delivered free to build pipeline and validate demand at scale.' },
                  { tier: 'Tier 2', name: 'Paid Core', price: '$29 – $99/mo', desc: 'Full product access with key workflows, integrations, and team features.' },
                  { tier: 'Tier 3', name: 'Enterprise / Expansion', price: '$299+/mo', desc: 'Custom contracts, dedicated support, SSO, and advanced analytics.' },
                ].map(t => (
                  <div
                    key={t.tier}
                    style={{
                      background: '#fffaf5',
                      border: '1px solid #e2ddd7',
                      borderRadius: '8px',
                      padding: '20px',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        background: '#e4611a1f',
                        color: '#e4611a',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                        marginBottom: '10px',
                      }}
                    >
                      {t.tier}
                    </span>
                    <div
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: 'var(--text)',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                        marginBottom: '4px',
                      }}
                    >
                      {t.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        color: '#e4611a',
                        fontWeight: 500,
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                        marginBottom: '10px',
                      }}
                    >
                      {t.price}
                    </div>
                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--muted)',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {t.desc}
                    </p>
                  </div>
                ))}
              </div>
              {!isPro(plan) && (
                <ProGateOverlay tabLabel="Value Ladder" onClose={() => setActiveTab('overview')} />
              )}
            </div>
          )}

          {/* Why Now */}
          {activeTab === 'why-now' && (
            <div style={{ maxWidth: '640px' }}>
              <div
                style={{
                  background: '#f0ece5',
                  border: '1px solid #e2ddd7',
                  borderRadius: '8px',
                  padding: '24px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--muted)',
                    }}
                  >
                    Timing Score
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-instrument-serif), serif',
                      fontSize: '1.25rem',
                      color: '#0d0d0d',
                    }}
                  >
                    {scoreDisplay(idea.score_timing)}
                  </span>
                </div>
                <div style={{ height: '6px', borderRadius: '9999px', background: '#e2ddd7', overflow: 'hidden' }}>
                  <div
                    className="score-bar-fill"
                    style={{
                      height: '100%',
                      borderRadius: '9999px',
                      background: scoreBarColor(idea.score_timing),
                      '--bar-target': `${idea.score_timing ?? 0}%`,
                    } as React.CSSProperties}
                  />
                </div>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '0.9375rem',
                  color: 'var(--text)',
                  lineHeight: 1.7,
                }}
              >
                {idea.score_timing && idea.score_timing >= 80
                  ? `Market conditions are exceptionally aligned for ${idea.title}. Converging trends in the ${idea.category ?? 'target'} space, combined with recent shifts in buyer behavior, create a narrow window of opportunity.`
                  : idea.score_timing && idea.score_timing >= 50
                  ? `Timing for ${idea.title} is favorable with moderate market readiness. The ${idea.category ?? 'target'} market shows growing demand signals, though competition is increasing.`
                  : `Market timing for ${idea.title} presents challenges. Consider waiting for stronger adoption signals or repositioning for an emerging sub-segment.`}
              </p>
            </div>
          )}

          {/* Proof & Signals */}
          {activeTab === 'proof-signals' && (
            <CommunitySignalsGrid signals={signals} />
          )}

          {/* Market Gap */}
          {activeTab === 'market-gap' && (
            <div style={{ maxWidth: '640px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '0.9375rem',
                  color: 'var(--text)',
                  lineHeight: 1.7,
                  marginBottom: '16px',
                }}
              >
                {idea.title} targets an underserved segment in the{' '}
                {idea.category ?? 'target'} market. Current solutions fail to address{' '}
                {idea.market_type === 'B2B'
                  ? 'enterprise workflow integration and the lack of PM-centric tooling'
                  : 'the fragmented user experience and high switching costs'}{' '}
                that this idea directly solves.
              </p>
              <div
                style={{
                  background: '#f0ece5',
                  border: '1px solid #e2ddd7',
                  borderRadius: '8px',
                  padding: '20px',
                }}
              >
                <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', fontFamily: 'var(--font-dm-sans), sans-serif', marginBottom: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gap Summary</div>
                {['No strong incumbent owns this niche', `${idea.market_type ?? 'B2B'} buyers are underserved`, `${idea.category ?? 'Category'} adoption is accelerating`].map((point, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.875rem', color: 'var(--text)' }}>
                    <span style={{ color: '#1a7a4a', fontWeight: 700 }}>✓</span>
                    {point}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Execution Plan */}
          {activeTab === 'execution-plan' && (
            <div style={{ maxWidth: '640px' }}>
              {['Week 1–2: Problem validation interviews (5–10 target users)', 'Week 3–4: Lo-fi prototype + landing page', 'Month 2: Beta with 3–5 design partners', 'Month 3: Launch v1 + pricing experiments'].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e4611a1f', color: '#e4611a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'var(--font-dm-sans), sans-serif', flexShrink: 0 }}>{i + 1}</div>
                  <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.9375rem', color: 'var(--text)', lineHeight: 1.5, margin: 0, paddingTop: '4px' }}>{step}</p>
                </div>
              ))}
            </div>
          )}

          {/* PRD Brief */}
          {activeTab === 'prd-brief' && (
            <ProContentPlaceholder label="PRD Brief" />
          )}

          {/* GTM Plan */}
          {activeTab === 'gtm-plan' && (
            <ProContentPlaceholder label="GTM Plan" />
          )}

          {/* Interview Script */}
          {activeTab === 'interview-script' && (
            <ProContentPlaceholder label="Interview Script" />
          )}

          {/* Community Signals */}
          {activeTab === 'community-signals' && (
            <CommunitySignalsGrid signals={signals} />
          )}

          {/* Global gate modal */}
          {gateOpen && (
            <ProGateOverlay tabLabel={gateTabLabel} onClose={() => setGateOpen(false)} />
          )}
        </div>
      </div>

      {/* Sticky actions bar */}
      <div
        className={`sticky-bar${showStickyBar ? '' : ' hidden'}`}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fffaf5',
          borderTop: '1px solid #e2ddd7',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 50,
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[
            { icon: <Bookmark size={14} />, label: 'Save' },
            { icon: <Share2 size={14} />, label: 'Share' },
            { icon: <ChevronDown size={14} />, label: 'More' },
          ].map(btn => (
            <button
              key={btn.label}
              className="action-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f0ece5',
                color: '#0d0d0d',
                border: '1px solid #e2ddd7',
                borderRadius: '9999px',
                padding: '7px 14px',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                cursor: 'pointer',
                transition: 'background 0.12s ease',
              }}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
        </div>
        <a
          href="https://specflowai.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#0d0d0d',
            color: '#fffaf5',
            borderRadius: '9999px',
            padding: '9px 20px',
            fontSize: '0.875rem',
            fontWeight: 500,
            fontFamily: 'var(--font-dm-sans), sans-serif',
            textDecoration: 'none',
          }}
        >
          Build in SpecFlow AI
          <ExternalLink size={13} />
        </a>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .value-ladder-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
