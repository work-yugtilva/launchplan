import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/server'
import type { Idea, CommunitySignal } from '@/app/lib/types'
import { getScoreColor } from '@/app/lib/types'

export const revalidate = 300

const SCORE_DIMS: { label: string; key: keyof Idea }[] = [
  { label: 'Market Opp', key: 'score_opportunity' },
  { label: 'Problem', key: 'score_problem' },
  { label: 'PM Fit', key: 'score_pm_fit' },
  { label: 'Feasibility', key: 'score_feasibility' },
  { label: 'Timing', key: 'score_timing' },
]

function scoreBarColor(score: number | null): string {
  const c = getScoreColor(score)
  if (c === 'green') return '#1a7a4a'
  if (c === 'amber') return '#b45309'
  return '#c0392b'
}

function Pill({ children, bg, color }: { children: string; bg: string; color: string }) {
  return (
    <span style={{
      background: bg,
      color,
      fontSize: '11px',
      fontWeight: 600,
      padding: '3px 10px',
      borderRadius: '9999px',
      letterSpacing: '0.04em',
      textTransform: 'uppercase' as const,
      fontFamily: 'var(--font-dm-sans), sans-serif',
    }}>
      {children}
    </span>
  )
}

function NotFound() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      fontFamily: 'var(--font-dm-sans), sans-serif',
    }}>
      <p style={{ fontSize: '1.125rem', color: '#5f5750' }}>Idea not found.</p>
      <Link href="/hub/ideas/discover" style={{
        color: '#e4611a',
        fontWeight: 600,
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        ← Back to Ideas
      </Link>
    </div>
  )
}

function Skeleton() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ width: '100px', height: '16px', background: '#e2ddd7', borderRadius: '4px', marginBottom: '32px' }} />
      <div style={{ width: '70%', height: '36px', background: '#e2ddd7', borderRadius: '6px', marginBottom: '12px' }} />
      <div style={{ width: '90%', height: '18px', background: '#e2ddd7', borderRadius: '4px', marginBottom: '24px' }} />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {[80, 100, 90].map((w, i) => (
          <div key={i} style={{ width: `${w}px`, height: '24px', background: '#e2ddd7', borderRadius: '9999px' }} />
        ))}
      </div>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <div style={{ width: '120px', height: '14px', background: '#e2ddd7', borderRadius: '4px', flexShrink: 0 }} />
          <div style={{ flex: 1, height: '10px', background: '#e2ddd7', borderRadius: '4px' }} />
          <div style={{ width: '30px', height: '14px', background: '#e2ddd7', borderRadius: '4px', flexShrink: 0 }} />
        </div>
      ))}
      <div style={{ width: '100%', height: '80px', background: '#e2ddd7', borderRadius: '6px', marginTop: '24px' }} />
    </div>
  )
}

type IdeaWithSignals = Idea & { community_signals: CommunitySignal[] }

async function IdeaResearchContent({ id }: { id: string }) {
  const supabase = await createClient()
  const { data: idea } = await supabase
    .from('ideas')
    .select('*, community_signals(*)')
    .eq('id', id)
    .eq('published', true)
    .single<IdeaWithSignals>()

  if (!idea) return <NotFound />

  return (
    <div style={{
      maxWidth: '760px',
      margin: '0 auto',
      padding: '32px 24px 64px',
      animation: 'fadeSlideIn 0.25s ease both',
    }}>
      <style>{`@keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Back */}
      <Link href="/hub/ideas/discover" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: '#5f5750',
        fontSize: '0.875rem',
        fontFamily: 'var(--font-dm-sans), sans-serif',
        textDecoration: 'none',
        marginBottom: '28px',
      }}>
        ← Back to Ideas
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-instrument-serif), serif',
          fontSize: '2rem',
          fontWeight: 400,
          color: '#0d0d0d',
          margin: '0 0 10px',
          lineHeight: 1.25,
        }}>
          {idea.title}
        </h1>
        {idea.tagline && (
          <p style={{
            fontSize: '1rem',
            color: '#5f5750',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            margin: '0 0 16px',
            lineHeight: 1.6,
          }}>
            {idea.tagline}
          </p>
        )}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {idea.category && <Pill bg="#e4611a1f" color="#e4611a">{idea.category}</Pill>}
          {idea.business_model && <Pill bg="#e4611a1f" color="#e4611a">{idea.business_model}</Pill>}
          {idea.market_type && <Pill bg="#f0ede9" color="#5f5750">{idea.market_type}</Pill>}
        </div>
      </div>

      {/* Scores */}
      <div style={{
        background: '#fffaf5',
        border: '1px solid #e2ddd7',
        borderRadius: '8px',
        padding: '20px 24px',
        marginBottom: '28px',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: '#5f5750',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          margin: '0 0 16px',
        }}>
          Scores
        </h2>
        {SCORE_DIMS.map(dim => {
          const score = idea[dim.key] as number | null
          const color = scoreBarColor(score)
          const pct = score ?? 0
          return (
            <div key={dim.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{
                width: '120px',
                flexShrink: 0,
                fontSize: '0.8125rem',
                color: '#5f5750',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}>
                {dim.label}
              </span>
              <div style={{ flex: 1, background: '#e2ddd7', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px' }} />
              </div>
              <span style={{
                width: '32px',
                flexShrink: 0,
                fontSize: '0.8125rem',
                fontWeight: 600,
                color,
                fontFamily: 'var(--font-dm-sans), sans-serif',
                textAlign: 'right',
              }}>
                {score ?? '—'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{
          fontFamily: 'var(--font-instrument-serif), serif',
          fontSize: '1.25rem',
          fontWeight: 400,
          color: '#0d0d0d',
          margin: '0 0 12px',
        }}>
          Overview
        </h2>
        {idea.description && (
          <p style={{
            fontSize: '0.9375rem',
            color: '#0d0d0d',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            lineHeight: 1.7,
            margin: '0 0 14px',
          }}>
            {idea.description}
          </p>
        )}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {idea.revenue_potential && (
            <Pill bg="#f0ede9" color="#5f5750">{`Revenue: ${idea.revenue_potential}`}</Pill>
          )}
          {idea.execution_difficulty && (
            <Pill bg="#f0ede9" color="#5f5750">{`Difficulty: ${idea.execution_difficulty}`}</Pill>
          )}
        </div>
      </div>

      {/* Why Now */}
      {idea.why_now && (
        <div style={{
          borderLeft: '3px solid #e4611a',
          background: '#e4611a0d',
          borderRadius: '0 6px 6px 0',
          padding: '16px 20px',
          marginBottom: '28px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#e4611a',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: '0 0 8px',
          }}>
            Why Now
          </h2>
          <p style={{
            fontSize: '0.9375rem',
            color: '#0d0d0d',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            lineHeight: 1.7,
            margin: 0,
          }}>
            {idea.why_now}
          </p>
        </div>
      )}

      {/* Community Signals */}
      {idea.community_signals.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{
            fontFamily: 'var(--font-instrument-serif), serif',
            fontSize: '1.25rem',
            fontWeight: 400,
            color: '#0d0d0d',
            margin: '0 0 14px',
          }}>
            Community Signals
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {idea.community_signals.map(sig => (
              <div key={sig.id} style={{
                background: '#fffaf5',
                border: '1px solid #e2ddd7',
                borderRadius: '6px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: '#0d0d0d',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                    }}>
                      {sig.platform}
                    </span>
                    {sig.count != null && (
                      <span style={{
                        fontSize: '0.8125rem',
                        color: '#5f5750',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                      }}>
                        {sig.count.toLocaleString()} mentions
                      </span>
                    )}
                  </div>
                  {sig.themes && sig.themes.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {sig.themes.map(theme => (
                        <span key={theme} style={{
                          background: '#e2ddd7',
                          color: '#5f5750',
                          fontSize: '11px',
                          fontWeight: 500,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                        }}>
                          {theme}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Risks */}
      {idea.key_risks && idea.key_risks.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontFamily: 'var(--font-instrument-serif), serif',
            fontSize: '1.25rem',
            fontWeight: 400,
            color: '#0d0d0d',
            margin: '0 0 12px',
          }}>
            Key Risks
          </h2>
          <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {idea.key_risks.map((risk, i) => (
              <li key={i} style={{
                fontSize: '0.9375rem',
                color: '#0d0d0d',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                lineHeight: 1.6,
              }}>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <a
        href="https://specflowai.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          background: '#e4611a',
          color: '#fff',
          fontFamily: 'var(--font-dm-sans), sans-serif',
          fontWeight: 600,
          fontSize: '1rem',
          padding: '14px 24px',
          borderRadius: '9999px',
          textDecoration: 'none',
          letterSpacing: '0.01em',
        }}
      >
        Build this with SpecFlow AI →
      </a>
    </div>
  )
}

export default async function IdeasResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

  if (!id) return <NotFound />

  return (
    <Suspense fallback={<Skeleton />}>
      <IdeaResearchContent id={id} />
    </Suspense>
  )
}
