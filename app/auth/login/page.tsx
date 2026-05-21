'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client'

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/hub/browse'

  const [email, setEmail] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [emailFocused, setEmailFocused] = useState(false)
  const [googleHover, setGoogleHover] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function startCooldown() {
    setResendCooldown(30)
    intervalRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function mapOtpError(msg: string): React.ReactNode {
    if (msg.includes('User not found')) {
      return (
        <>
          No account found.{' '}
          <Link href={`/auth/signup${next !== '/hub/browse' ? `?next=${next}` : ''}`}
            style={{ color: '#e4611a', textDecoration: 'underline' }}>
            Sign up first →
          </Link>
        </>
      )
    }
    if (msg.includes('Email rate limit exceeded') || msg.includes('rate limit')) {
      return 'Too many attempts. Try again in a few minutes.'
    }
    return msg
  }

  async function handleGoogle() {
    setGoogleError(null)
    setGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      setGoogleError(error.message)
      setGoogleLoading(false)
    }
  }

  async function handleOtp(e: React.FormEvent) {
    e.preventDefault()
    setOtpError(null)
    setOtpLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        shouldCreateUser: false,
      },
    })
    setOtpLoading(false)
    if (error) {
      setOtpError(error.message)
    } else {
      setOtpSent(true)
      startCooldown()
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    setOtpError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        shouldCreateUser: false,
      },
    })
    if (error) {
      setOtpError(error.message)
    } else {
      startCooldown()
    }
  }

  const signupHref = `/auth/signup${next !== '/hub/browse' ? `?next=${encodeURIComponent(next)}` : ''}`

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
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 32, height: 32, background: '#e4611a',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 13L8 3L13 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 10H11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            LaunchPlan
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-instrument-serif), serif',
          fontSize: '1.5rem',
          fontWeight: 400,
          color: 'var(--text)',
          margin: '0 0 28px 0',
          lineHeight: 1.3,
        }}>
          Sign in to your account
        </h1>

        {otpSent ? (
          /* Success state */
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: '2rem', color: '#1a7a4a', marginBottom: 12 }}>✓</div>
            <h2 style={{
              fontFamily: 'var(--font-instrument-serif), serif',
              fontSize: '1.25rem',
              fontWeight: 400,
              color: 'var(--text)',
              margin: '0 0 8px 0',
            }}>
              Check your email
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
              We sent a sign-in link to <strong style={{ color: 'var(--text)' }}>{email}</strong>.
              The link expires in 10 minutes.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: 0 }}>
              Didn&apos;t receive it?{' '}
              {resendCooldown > 0 ? (
                <span style={{ color: 'var(--muted)' }}>Resend in {resendCooldown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    color: '#e4611a', cursor: 'pointer', fontSize: '0.875rem',
                    textDecoration: 'underline',
                  }}
                >
                  Resend
                </button>
              )}
            </p>
            {otpError && (
              <div style={errorStyle}>{otpError}</div>
            )}
          </div>
        ) : (
          <>
            {/* Google button */}
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              onMouseEnter={() => setGoogleHover(true)}
              onMouseLeave={() => setGoogleHover(false)}
              style={{
                width: '100%',
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                background: googleHover ? '#f8f8f8' : 'var(--raised)',
                border: `1px solid ${googleHover ? '#d0cbc4' : 'var(--border)'}`,
                borderRadius: 9999,
                cursor: googleLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.9375rem',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontWeight: 500,
                color: 'var(--text)',
                transition: 'background 0.15s ease, border-color 0.15s ease',
                opacity: googleLoading ? 0.7 : 1,
                padding: '0 20px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
              </svg>
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            {googleError && (
              <div style={{ ...errorStyle, marginTop: 8 }}>{googleError}</div>
            )}

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              margin: '20px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{
                fontSize: '0.8125rem', color: 'var(--muted)',
                background: 'var(--raised)', padding: '0 12px',
              }}>
                or
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* Magic link form */}
            <form onSubmit={handleOtp}>
              <label style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
              }}>
                Sign in with email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                required
                style={{
                  width: '100%',
                  border: `1px solid ${emailFocused ? '#e4611a' : 'var(--border)'}`,
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: '0.9375rem',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  color: 'var(--text)',
                  background: 'var(--raised)',
                  outline: 'none',
                  boxShadow: emailFocused ? '0 0 0 3px rgba(228,97,26,0.10)' : 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="submit"
                disabled={otpLoading || !email}
                style={{
                  width: '100%',
                  height: 44,
                  marginTop: 8,
                  background: otpLoading || !email ? 'rgba(228,97,26,0.5)' : '#e4611a',
                  border: 'none',
                  borderRadius: 9999,
                  color: '#fff',
                  fontSize: '0.9375rem',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontWeight: 500,
                  cursor: otpLoading || !email ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.15s ease',
                }}
              >
                {otpLoading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 0.8s linear infinite' }}>
                      <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
                      <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Sending…
                  </>
                ) : 'Send magic link'}
              </button>
              {otpError && (
                <div style={{ ...errorStyle, marginTop: 8 }}>{mapOtpError(otpError)}</div>
              )}
            </form>
          </>
        )}

        {/* Footer */}
        <p style={{
          marginTop: 28,
          fontSize: '0.875rem',
          color: 'var(--muted)',
          textAlign: 'center',
        }}>
          Don&apos;t have an account?{' '}
          <Link href={signupHref} style={{ color: '#e4611a', textDecoration: 'none', fontWeight: 500 }}>
            Get started free →
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

const errorStyle: React.CSSProperties = {
  background: 'rgba(192,57,43,0.08)',
  border: '1px solid rgba(192,57,43,0.2)',
  color: '#c0392b',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: '0.875rem',
  lineHeight: 1.4,
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
