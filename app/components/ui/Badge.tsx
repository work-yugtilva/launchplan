import React from 'react'

interface BadgeProps {
  variant:    'category' | 'score' | 'growth' | 'plan' | 'model'
  children:   React.ReactNode
  className?: string
}

const badgeStyles: Record<string, React.CSSProperties> = {
  category: {
    background: 'var(--light)',
    color: 'var(--primary)',
    border: '1px solid rgba(228,97,26,0.20)',
  },
  score: {
    background: 'var(--surface)',
    color: 'var(--muted)',
    border: '1px solid rgba(13,13,13,0.08)',
  },
  growth: {
    background: 'var(--green-bg)',
    color: 'var(--green)',
    border: '1px solid rgba(26,122,74,0.20)',
  },
  plan: {
    background: 'var(--amber-bg)',
    color: 'var(--amber)',
    border: '1px solid rgba(180,83,9,0.20)',
  },
  model: {
    background: 'var(--surface)',
    color: 'var(--muted)',
    border: '1px solid rgba(13,13,13,0.08)',
  },
}

const accentVariants = new Set(['category', 'model'])

const baseStyle: React.CSSProperties = {
  borderRadius: 'var(--pill)',
  padding: '4px 10px',
  fontSize: '0.75rem',
  fontWeight: 500,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
}

export function Badge({ variant, children, className }: BadgeProps) {
  const style: React.CSSProperties = {
    ...baseStyle,
    ...badgeStyles[variant],
    ...(accentVariants.has(variant) ? { textTransform: 'uppercase', letterSpacing: '0.05em' } : {}),
  }
  return <span style={style} className={className}>{children}</span>
}
