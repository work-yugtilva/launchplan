import React from 'react'
import { MarketInsight } from '@/app/lib/types'
import { Badge } from '@/app/components/ui/Badge'

interface InsightCardProps {
  insight: MarketInsight
}

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <div style={{
      background: 'var(--raised)',
      borderRadius: 'var(--r10)',
      border: '1px solid rgba(13,13,13,0.07)',
      boxShadow: 'var(--shadow-1)',
      padding: 'var(--s24)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--s16)',
    }}>
      {insight.insight_type && (
        <Badge variant="score">{insight.insight_type}</Badge>
      )}

      <h3 style={{
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '1.0625rem',
        fontWeight: 600,
        color: 'var(--text)',
        lineHeight: 1.35,
      }}>
        {insight.title}
      </h3>

      {insight.metric_value && (
        <div style={{
          background: 'var(--light)',
          borderRadius: 'var(--r8)',
          padding: 'var(--s16)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {insight.metric_label && (
            <span style={{
              fontSize: '0.6875rem',
              color: 'var(--primary)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {insight.metric_label}
            </span>
          )}
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', lineHeight: 1 }}>
            {insight.metric_value}
          </span>
          {insight.metric_period && (
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              {insight.metric_period}
            </span>
          )}
        </div>
      )}

      {insight.description && (
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--muted)',
          lineHeight: 1.55,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {insight.description}
        </p>
      )}

      {insight.source_label && (
        <div style={{
          marginTop: 'auto',
          borderTop: '1px solid rgba(13,13,13,0.06)',
          paddingTop: 'var(--s16)',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--muted)',
        }}>
          Source: {insight.source_label}
        </div>
      )}
    </div>
  )
}
