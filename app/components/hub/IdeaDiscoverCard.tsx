'use client'

import Link from 'next/link'
import { Bookmark, Share2, ArrowRight } from 'lucide-react'
import type { Idea } from '@/app/lib/types'
import { getScoreColor } from '@/app/lib/types'

const SCORE_DIMS = [
  { label: 'Market Opp', key: 'score_opportunity' as keyof Idea },
  { label: 'Problem', key: 'score_problem' as keyof Idea },
  { label: 'PM Fit', key: 'score_pm_fit' as keyof Idea },
  { label: 'Feasibility', key: 'score_feasibility' as keyof Idea },
  { label: 'Timing', key: 'score_timing' as keyof Idea },
]

function getBadges(idea: Idea): string[] {
  const badges: string[] = []
  if ((idea.score_timing ?? 0) >= 75) badges.push('Perfect Timing')
  else if ((idea.score_opportunity ?? 0) >= 75) badges.push('High Opportunity')
  if ((idea.score_pm_fit ?? 0) >= 75) badges.push('Strong PM Fit')
  else if ((idea.score_problem ?? 0) >= 75) badges.push('Clear Problem')
  return badges.slice(0, 2)
}

function dotColor(color: 'green' | 'amber' | 'red'): string {
  if (color === 'green') return '#1a7a4a'
  if (color === 'amber') return '#b45309'
  return '#c0392b'
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

export interface IdeaDiscoverCardProps {
  idea: Idea
  index: number
  showUnsave?: boolean
  onUnsave?: (id: string) => void
  savedAt?: string
}

export default function IdeaDiscoverCard({
  idea,
  index,
  showUnsave,
  onUnsave,
  savedAt,
}: IdeaDiscoverCardProps) {
  const badges = getBadges(idea)

  return (
    <Link
      href={`/ideas/${idea.slug}`}
      className="idea-discover-card"
      style={{
        display: 'block',
        background: '#fffaf5',
        border: '1px solid #e2ddd7',
        borderRadius: '8px',
        padding: '20px',
        textDecoration: 'none',
        animationDelay: `${index * 40}ms`,
      }}
    >
      {/* Badges */}
      {badges.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
          {badges.map(badge => (
            <span
              key={badge}
              style={{
                background: '#e4611a1f',
                color: '#e4611a',
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
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
      <div
        style={{
          fontSize: '1.0625rem',
          fontWeight: 600,
          color: '#0d0d0d',
          fontFamily: 'var(--font-dm-sans), sans-serif',
          marginBottom: '6px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: 1.4,
        }}
      >
        {idea.title}
      </div>

      {/* Tagline */}
      {idea.tagline && (
        <div
          style={{
            fontSize: '0.8125rem',
            color: '#5f5750',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            marginBottom: '12px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
          }}
        >
          {idea.tagline}
        </div>
      )}

      {/* Metadata row */}
      <div
        style={{
          fontSize: '0.8125rem',
          color: '#5f5750',
          fontFamily: 'var(--font-dm-sans), sans-serif',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexWrap: 'wrap',
        }}
      >
        <span>📊</span>
        {idea.category && (
          <span style={{ color: '#e4611a', fontWeight: 500 }}>{idea.category}</span>
        )}
        {idea.category && idea.market_type && <span style={{ opacity: 0.4 }}>·</span>}
        {idea.market_type && <span>{idea.market_type}</span>}
        {idea.execution_difficulty && (
          <>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{idea.execution_difficulty}</span>
          </>
        )}
      </div>

      {/* Score strip */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
        {SCORE_DIMS.map(dim => {
          const score = idea[dim.key] as number | null
          const color = dotColor(getScoreColor(score))
          return (
            <div
              key={dim.key}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: '#5f5750',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                }}
              >
                {dim.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Hover row */}
      <div
        className="card-hover-row"
        style={{
          borderTop: '1px solid #e2ddd7',
          paddingTop: '12px',
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        {showUnsave ? (
          <button
            onClick={async (e) => {
              e.preventDefault()
              onUnsave?.(idea.id)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#c0392b',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
            className="card-action-btn"
          >
            <Bookmark size={13} />
            Unsave
          </button>
        ) : (
          <button
            onClick={async (e) => {
              e.preventDefault()
              try {
                await fetch(`/api/hub/ideas/${idea.id}/save`, { method: 'POST' })
              } catch {
                /* silent */
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#5f5750',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
            className="card-action-btn"
          >
            <Bookmark size={13} />
            Save
          </button>
        )}
        <button
          onClick={async (e) => {
            e.preventDefault()
            const url = `${window.location.origin}/ideas/${idea.slug}`
            if (navigator.share) {
              await navigator.share({ title: idea.title, url })
            } else {
              await navigator.clipboard.writeText(url)
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#5f5750',
            fontSize: '0.8125rem',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            padding: '4px 8px',
            borderRadius: '4px',
          }}
          className="card-action-btn"
        >
          <Share2 size={13} />
          Share
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', color: '#e4611a' }}>
          <ArrowRight size={15} />
        </div>
      </div>

      {/* Saved timestamp */}
      {savedAt && (
        <p
          style={{
            fontSize: '0.75rem',
            color: '#5f5750',
            margin: '8px 0 0',
            fontFamily: 'var(--font-dm-sans), sans-serif',
          }}
        >
          Saved {timeAgo(savedAt)}
        </p>
      )}
    </Link>
  )
}
