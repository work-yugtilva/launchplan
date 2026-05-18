import React from 'react'
import { Idea } from '@/app/lib/types'
import { Badge } from '@/app/components/ui/Badge'
import { ScoreDot } from '@/app/components/ui/ScoreDot'

interface IdeaCardProps {
  idea: Idea
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <a
      href={`/ideas/${idea.slug}`}
      className="idea-card"
      style={{
        background: 'var(--raised)',
        borderRadius: 'var(--r10)',
        border: '1px solid rgba(13,13,13,0.07)',
        boxShadow: 'var(--shadow-1)',
        padding: 'var(--s24)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s16)',
        textDecoration: 'none',
        color: 'var(--text)',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--s8)', flexWrap: 'wrap' }}>
        {idea.category && <Badge variant="category">{idea.category}</Badge>}
        {idea.business_model && <Badge variant="model">{idea.business_model}</Badge>}
      </div>

      <h3 style={{
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '1.125rem',
        fontWeight: 600,
        color: 'var(--text)',
        lineHeight: 1.35,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {idea.title}
      </h3>

      {idea.tagline && (
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--muted)',
          lineHeight: 1.55,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {idea.tagline}
        </p>
      )}

      <div style={{ display: 'flex', gap: 'var(--s16)', flexWrap: 'wrap' }}>
        <ScoreDot score={idea.score_opportunity} label="Opportunity" />
        <ScoreDot score={idea.score_problem}     label="Problem"     />
        <ScoreDot score={idea.score_feasibility} label="Feasibility" />
        <ScoreDot score={idea.score_timing}      label="Timing"      />
      </div>

      <div style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(13,13,13,0.06)',
        paddingTop: 'var(--s16)',
        fontSize: '0.8125rem',
        fontWeight: 500,
        color: 'var(--muted)',
      }}>
        Revenue: {idea.revenue_potential ?? 'N/A'}
      </div>
    </a>
  )
}
