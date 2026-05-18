import React from 'react'
import { getScoreColor, ScoreColor } from '@/app/lib/types'

interface ScoreBarProps {
  label:      string
  score:      number | null
  showValue?: boolean
  className?: string
}

const colorMap: Record<ScoreColor, { bar: string; text: string }> = {
  green: { bar: 'var(--green)', text: 'var(--green)' },
  amber: { bar: 'var(--amber)', text: 'var(--amber)' },
  red:   { bar: 'var(--red)',   text: 'var(--red)'   },
}

export function ScoreBar({ label, score, showValue = true, className }: ScoreBarProps) {
  const color = getScoreColor(score)
  const { bar, text } = colorMap[color]
  const width = score !== null ? `${score}%` : '0%'
  const display = score !== null ? String(score) : '--'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className={className}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
        {showValue && (
          <span style={{ fontSize: '0.75rem', color: text, fontWeight: 600 }}>{display}</span>
        )}
      </div>
      <div style={{ width: '100%', height: '6px', background: 'var(--surface)', borderRadius: 'var(--pill)', overflow: 'hidden' }}>
        <div style={{ width, height: '100%', background: bar, borderRadius: 'var(--pill)', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}
