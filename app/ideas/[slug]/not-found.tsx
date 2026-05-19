import Link from 'next/link'
import { NavBar } from '@/components/layout/NavBar'

export default function IdeaNotFound() {
  return (
    <>
      <NavBar />
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '4rem',
            marginBottom: '16px',
            opacity: 0.3,
          }}
        >
          💡
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-instrument-serif), serif',
            fontSize: '2rem',
            fontWeight: 400,
            color: 'var(--text)',
            margin: '0 0 12px',
            lineHeight: 1.2,
          }}
        >
          This idea doesn&apos;t exist&hellip; yet.
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: '0.9375rem',
            color: 'var(--muted)',
            margin: '0 0 32px',
            maxWidth: '400px',
            lineHeight: 1.6,
          }}
        >
          The idea you&apos;re looking for may have been removed or the link might be wrong.
        </p>
        <Link
          href="/hub/ideas/discover"
          style={{
            background: 'var(--primary)',
            color: '#fff',
            borderRadius: 'var(--pill)',
            padding: '10px 24px',
            fontSize: '0.875rem',
            fontWeight: 500,
            fontFamily: 'var(--font-dm-sans), sans-serif',
            textDecoration: 'none',
          }}
        >
          Browse all ideas →
        </Link>
      </div>
    </>
  )
}
