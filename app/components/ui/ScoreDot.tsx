import React from 'react'
import { getScoreColor, ScoreColor } from '@/app/lib/types'

interface ScoreDotProps {
  score:      number | null
  label?:     string
  size?:      'sm' | 'md'
  className?: string
}

const dotColors: Record<ScoreColor, string> = {
  green: 'var(--green)',
  amber: 'var(--amber)',
  red:   'var(--red)',
}

const dotSizes: Record<string, number> = {
  sm: 8,
  md: 12,
}

export function ScoreDot({ score, label, size = 'sm', className }: ScoreDotProps) {
  const color = getScoreColor(score)
  const px = dotSizes[size]

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} className={className}>
      <span style={{ width: px, height: px, borderRadius: '50%', background: dotColors[color], flexShrink: 0, display: 'inline-block' }} />
      {label && <span style={{ fontSize: '0.6875rem', color: 'var(--muted)', fontWeight: 500 }}>{label}</span>}
    </span>
  )
}
