'use client'

import React, { useState } from 'react'

interface ButtonProps {
  variant:    'primary' | 'secondary' | 'ghost' | 'specflow'
  size?:      'sm' | 'md' | 'lg'
  href?:      string
  onClick?:   () => void
  disabled?:  boolean
  className?: string
  children:   React.ReactNode
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: 'var(--primary)',
    color: '#ffffff',
    boxShadow: '0 2px 12px rgba(228,97,26,0.30)',
    border: 'none',
  },
  secondary: {
    background: 'var(--raised)',
    color: 'var(--text)',
    border: '1px solid rgba(13,13,13,0.10)',
    boxShadow: 'var(--shadow-1)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--muted)',
    border: 'none',
  },
  specflow: {
    background: 'var(--text)',
    color: '#ffffff',
    border: 'none',
    boxShadow: 'var(--shadow-2)',
  },
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { padding: '8px 16px',  fontSize: '0.875rem'  },
  md: { padding: '12px 24px', fontSize: '0.9375rem' },
  lg: { padding: '16px 32px', fontSize: '1rem'      },
}

const baseStyle: React.CSSProperties = {
  borderRadius: 'var(--pill)',
  fontFamily: 'inherit',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'background 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease',
  textDecoration: 'none',
}

export function Button({ variant, size = 'md', href, onClick, disabled, className, children }: ButtonProps) {
  const [hovered, setHovered] = useState(false)

  const style: React.CSSProperties = {
    ...baseStyle,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
    transform: hovered && !disabled ? 'translateY(-1px)' : 'translateY(0)',
  }

  const handlers = {
    onMouseEnter: () => { if (!disabled) setHovered(true) },
    onMouseLeave: () => setHovered(false),
    onClick: disabled ? undefined : onClick,
  }

  if (href) {
    return <a href={href} style={style} className={className} {...handlers}>{children}</a>
  }

  return (
    <button type="button" style={style} className={className} disabled={disabled} {...handlers}>
      {children}
    </button>
  )
}
