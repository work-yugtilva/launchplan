import React from 'react'
import { Trend } from '@/app/lib/types'
import { Badge } from '@/app/components/ui/Badge'

interface TrendCardProps {
  trend: Trend
}

export function TrendCard({ trend }: TrendCardProps) {
  const isHighGrowth = (trend.growth_pct ?? 0) >= 100

  const growthChipStyle: React.CSSProperties = {
    background: isHighGrowth ? 'var(--green-bg)' : 'var(--surface)',
    color: isHighGrowth ? 'var(--green)' : 'var(--muted)',
    fontSize: '0.75rem',
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 'var(--pill)',
    flexShrink: 0,
  }

  return (
    <div style={{
      background: 'var(--raised)',
      borderRadius: 'var(--r10)',
      border: '1px solid rgba(13,13,13,0.07)',
      boxShadow: 'var(--shadow-1)',
      padding: 'var(--s24)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--s8)' }}>
        <h3 style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--text)',
          lineHeight: 1.35,
        }}>
          {trend.keyword}
        </h3>
        {trend.growth_pct !== null && (
          <span style={growthChipStyle}>+{trend.growth_pct}%</span>
        )}
      </div>

      {trend.category && <Badge variant="score">{trend.category}</Badge>}

      {trend.description && (
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--muted)',
          lineHeight: 1.55,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {trend.description}
        </p>
      )}

      {trend.volume !== null && (
        <div style={{
          marginTop: 'auto',
          borderTop: '1px solid rgba(13,13,13,0.06)',
          paddingTop: 'var(--s16)',
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: 'var(--muted)',
        }}>
          Volume: {trend.volume.toLocaleString()}
        </div>
      )}
    </div>
  )
}
