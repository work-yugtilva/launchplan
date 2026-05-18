import React from 'react'

interface SectionHeaderProps {
  eyebrow?:    string
  heading:     string
  subheading?: string
  align?:      'left' | 'center'
  className?:  string
}

export function SectionHeader({ eyebrow, heading, subheading, align = 'left', className }: SectionHeaderProps) {
  const isCenter = align === 'center'

  return (
    <div style={{ textAlign: isCenter ? 'center' : 'left' }} className={className}>
      {eyebrow && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCenter ? 'center' : 'flex-start', gap: '8px', marginBottom: '12px' }}>
          <span style={{ width: '28px', height: '2px', background: 'var(--primary)', borderRadius: '2px', flexShrink: 0, display: 'inline-block' }} />
          <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {eyebrow}
          </span>
        </div>
      )}
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 400, color: 'var(--text)', lineHeight: 1.2, marginBottom: subheading ? '8px' : '0' }}>
        {heading}
      </h2>
      {subheading && (
        <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: 0 }}>
          {subheading}
        </p>
      )}
    </div>
  )
}
