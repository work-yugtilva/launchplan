import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const message = error ?? 'Something went wrong during authentication.'

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'var(--font-dm-sans), sans-serif',
    }}>
      <div style={{
        background: 'var(--raised)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 40,
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 4px 24px rgba(13,13,13,0.07)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', color: '#b45309', marginBottom: 16 }}>⚠</div>

        <h1 style={{
          fontFamily: 'var(--font-instrument-serif), serif',
          fontSize: '1.5rem',
          fontWeight: 400,
          color: 'var(--text)',
          margin: '0 0 12px 0',
          lineHeight: 1.3,
        }}>
          Authentication Error
        </h1>

        <p style={{
          fontSize: '0.9375rem',
          color: 'var(--muted)',
          margin: '0 0 28px 0',
          lineHeight: 1.5,
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Link
            href="/auth/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 44,
              padding: '0 28px',
              background: '#e4611a',
              border: 'none',
              borderRadius: 9999,
              color: '#fff',
              fontSize: '0.9375rem',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'background 0.15s ease',
            }}
          >
            Try again
          </Link>

          <Link
            href="/"
            style={{
              fontSize: '0.875rem',
              color: 'var(--muted)',
              textDecoration: 'none',
            }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
