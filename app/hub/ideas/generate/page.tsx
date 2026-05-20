'use client'

import { useState, useEffect, useRef } from 'react'
import type { AgentStatusResponse } from '@/app/lib/types'
import { getScoreColor } from '@/app/lib/types'

const SCORE_COLOR_MAP = { green: '#1a7a4a', amber: '#b45309', red: '#c0392b' } as const

const STATUS_MESSAGES = [
  'Researching market landscape...',
  'Scoring problem severity...',
  'Evaluating PM feasibility...',
  'Checking market timing...',
  'Synthesising PM fit score...',
  'Writing validation report...',
]

const VERDICT_CONFIG = {
  strong:    { bg: 'rgba(26,122,74,0.08)',  color: '#1a7a4a', border: '1px solid rgba(26,122,74,0.2)',  label: '🚀 Strong Signal' },
  promising: { bg: 'rgba(228,97,26,0.08)',  color: '#e4611a', border: '1px solid rgba(228,97,26,0.2)',  label: '💡 Promising' },
  risky:     { bg: 'rgba(180,83,9,0.08)',   color: '#b45309', border: '1px solid rgba(180,83,9,0.2)',   label: '⚠️ Risky' },
  pass:      { bg: 'rgba(192,57,43,0.08)',  color: '#c0392b', border: '1px solid rgba(192,57,43,0.2)', label: '🚫 Pass' },
} as const

type Quota = { used: number; limit: number | null; plan: string }
type Phase = 'idle' | 'running' | 'complete' | 'failed'
type ResultShape = {
  summary?: string
  scores?: { opportunity?: number; problem?: number; feasibility?: number; timing?: number; pm_fit?: number }
  verdict?: 'strong' | 'promising' | 'risky' | 'pass'
  risks?: string[]
  next_steps?: string[]
  market_size?: string
  target_user?: string
}

export default function GeneratePage() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [quota, setQuota] = useState<Quota | null>(null)
  const [progress, setProgress] = useState<AgentStatusResponse | null>(null)
  const [result, setResult] = useState<ResultShape | null>(null)
  const [msgIndex, setMsgIndex] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/api/hub/agent/quota')
      .then(r => r.json())
      .then((d: Quota) => setQuota(d))
      .catch(() => null)
  }, [])

  // Poll when running
  useEffect(() => {
    if (phase !== 'running' || !runId) return
    const iv = setInterval(async () => {
      try {
        const res = await fetch(`/api/agent/${runId}/status`)
        if (!res.ok) return
        const data: AgentStatusResponse = await res.json()
        setProgress(data)
        if (data.status === 'completed') {
          if (data.result) {
            setResult(data.result as ResultShape)
            setPhase('complete')
          } else {
            setPhase('failed')
          }
          clearInterval(iv)
        }
        if (data.status === 'failed') {
          setPhase('failed')
          clearInterval(iv)
        }
      } catch { /* silent */ }
    }, 2000)
    return () => clearInterval(iv)
  }, [phase, runId])

  // Cycle status messages while running
  useEffect(() => {
    if (phase !== 'running') return
    const iv = setInterval(() => {
      setMsgIndex(i => (i + 1) % STATUS_MESSAGES.length)
    }, 3000)
    return () => clearInterval(iv)
  }, [phase])

  function showToast(msg: string) {
    setToast(msg)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 3000)
  }

  async function handleSubmit() {
    if (!input.trim() || input.length < 10 || input.length > 2000) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_input: input.trim() }),
      })
      if (!res.ok) {
        if (res.status === 403 && quota) {
          setQuota({ ...quota, used: quota.limit ?? quota.used })
        }
        setSubmitting(false)
        return
      }
      const { run_id } = await res.json()
      setRunId(run_id)
      setMsgIndex(0)
      setPhase('running')
    } finally {
      setSubmitting(false)
    }
  }

  function resetToIdle() {
    setPhase('idle')
    setRunId(null)
    setResult(null)
    setProgress(null)
    setInput('')
    fetch('/api/hub/agent/quota')
      .then(r => r.json())
      .then((d: Quota) => setQuota(d))
      .catch(() => null)
  }

  const overLimit = quota !== null && quota.limit !== null && quota.used >= quota.limit
  const canSubmit = input.length >= 10 && input.length <= 2000 && !overLimit && !submitting
  const stepsTotal = progress?.total_steps ?? 40
  const stepsDone = progress?.steps_done ?? 0
  const pct = stepsTotal > 0 ? (stepsDone / stepsTotal) * 100 : 0
  const verdict = result?.verdict
  const verdictCfg = verdict ? VERDICT_CONFIG[verdict] : null

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes msgFade { 0%,100% { opacity: 0; } 15%,85% { opacity: 1; } }
        .gen-textarea:focus { outline: none; }
        .gen-submit:hover:not(:disabled) { background: #c95215 !important; }
        .score-card { transition: transform 0.15s ease; }
        .score-card:hover { transform: translateY(-1px); }
      `}</style>

      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#0d0d0d', color: '#fff', padding: '10px 20px', borderRadius: '9999px', fontSize: '0.875rem', fontFamily: 'var(--font-dm-sans), sans-serif', zIndex: 1000, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: '1200px' }}>

        {/* ── IDLE ── */}
        {phase === 'idle' && (
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: '2.5rem', fontWeight: 400, color: '#0d0d0d', margin: '0 0 10px', lineHeight: 1.2 }}>
                Validate Your Idea
              </h1>
              <p style={{ fontSize: '0.9375rem', color: '#5f5750', margin: 0, fontFamily: 'var(--font-dm-sans), sans-serif', lineHeight: 1.6 }}>
                Describe your product idea and our PM agent will analyze it across 5 dimensions in ~2 minutes.
              </p>
            </div>

            {quota && quota.limit !== null && (
              <div style={{ marginBottom: '20px' }}>
                <span style={{ display: 'inline-block', padding: '5px 14px', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 500, fontFamily: 'var(--font-dm-sans), sans-serif', background: overLimit ? 'rgba(192,57,43,0.08)' : 'rgba(228,97,26,0.08)', color: overLimit ? '#c0392b' : '#e4611a' }}>
                  {quota.used} / {quota.limit} run{quota.limit !== 1 ? 's' : ''} used this month
                </span>
                {overLimit && (
                  <p style={{ fontSize: '0.8125rem', color: '#c0392b', fontFamily: 'var(--font-dm-sans), sans-serif', margin: '8px 0 0' }}>
                    Limit reached.{' '}
                    <a href="/hub/empire" style={{ color: '#c0392b', fontWeight: 600 }}>Upgrade to Pro for 10 runs/mo →</a>
                  </p>
                )}
              </div>
            )}

            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <textarea
                className="gen-textarea"
                placeholder="e.g. A SaaS tool that helps solo founders track their MRR without connecting a payment processor..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={overLimit}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{ width: '100%', minHeight: '160px', padding: '16px', border: focused ? '1px solid #e4611a' : '1px solid #e2ddd7', boxShadow: focused ? '0 0 0 3px rgba(228,97,26,0.10)' : 'none', borderRadius: '10px', fontSize: '0.9375rem', fontFamily: 'var(--font-dm-sans), sans-serif', color: '#0d0d0d', background: overLimit ? '#f0ece5' : '#fff', resize: 'vertical', transition: 'border-color 0.15s ease, box-shadow 0.15s ease', boxSizing: 'border-box' }}
              />
              <span style={{ position: 'absolute', bottom: '10px', right: '12px', fontSize: '0.75rem', fontFamily: 'var(--font-dm-sans), sans-serif', color: input.length > 1800 ? '#c0392b' : '#5f5750' }}>
                {input.length}/2000
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="gen-submit"
              style={{ width: '100%', height: '48px', background: canSubmit ? '#e4611a' : '#e2ddd7', color: canSubmit ? '#fff' : '#5f5750', border: 'none', borderRadius: '9999px', fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'var(--font-dm-sans), sans-serif', cursor: canSubmit ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.15s ease' }}
            >
              {submitting ? (
                <>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                  Starting analysis...
                </>
              ) : 'Run PM Analysis →'}
            </button>
          </div>
        )}

        {/* ── RUNNING ── */}
        {phase === 'running' && (
          <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: '1.75rem', fontWeight: 400, color: '#0d0d0d', margin: '0 0 32px' }}>
              Analysing your idea...
            </h1>
            <div style={{ background: '#f0ece5', borderRadius: '9999px', height: '8px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ background: '#e4611a', height: '100%', width: `${pct.toFixed(1)}%`, borderRadius: '9999px', transition: 'width 0.4s ease' }} />
            </div>
            <p style={{ fontSize: '0.875rem', color: '#5f5750', fontFamily: 'var(--font-dm-sans), sans-serif', margin: '0 0 20px' }}>
              {stepsDone} of {stepsTotal} steps complete
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#5f5750', fontStyle: 'italic', fontFamily: 'var(--font-dm-sans), sans-serif', margin: 0, animation: 'msgFade 3s ease infinite' }}>
              {STATUS_MESSAGES[msgIndex]}
            </p>
          </div>
        )}

        {/* ── FAILED ── */}
        {phase === 'failed' && (
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '10px', padding: '28px 32px', textAlign: 'center' }}>
              <p style={{ fontSize: '1rem', color: '#c0392b', fontFamily: 'var(--font-dm-sans), sans-serif', margin: '0 0 16px', fontWeight: 500 }}>
                Analysis failed. This sometimes happens with very short or vague descriptions.
              </p>
              <button onClick={resetToIdle} style={{ background: '#e4611a', color: '#fff', border: 'none', borderRadius: '9999px', padding: '9px 22px', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'var(--font-dm-sans), sans-serif', cursor: 'pointer' }}>
                Try again
              </button>
            </div>
          </div>
        )}

        {/* ── COMPLETE ── */}
        {phase === 'complete' && result && (
          <div style={{ animation: 'fadeSlideIn 0.3s ease both' }}>

            {/* Verdict */}
            {verdictCfg && (
              <div style={{ background: verdictCfg.bg, border: verdictCfg.border, borderRadius: '10px', padding: '20px 28px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 600, color: verdictCfg.color, fontFamily: 'var(--font-dm-sans), sans-serif' }}>{verdictCfg.label}</span>
                <span style={{ fontSize: '0.8125rem', color: verdictCfg.color, fontFamily: 'var(--font-dm-sans), sans-serif', opacity: 0.8 }}>PM Confidence Score</span>
              </div>
            )}

            {/* Score grid */}
            {result.scores && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {([
                  { label: 'Market Opp', val: result.scores.opportunity },
                  { label: 'Problem',    val: result.scores.problem },
                  { label: 'PM Fit',     val: result.scores.pm_fit },
                  { label: 'Feasibility',val: result.scores.feasibility },
                  { label: 'Timing',     val: result.scores.timing },
                ] as { label: string; val: number | undefined }[]).map(({ label, val }) => (
                  <div key={label} className="score-card" style={{ background: '#fffaf5', border: '1px solid #e2ddd7', borderRadius: '8px', padding: '16px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: val != null ? SCORE_COLOR_MAP[getScoreColor(val)] : '#5f5750', fontFamily: 'var(--font-dm-sans), sans-serif', lineHeight: 1, marginBottom: '6px' }}>
                      {val ?? '—'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#5f5750', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {result.summary && (
              <div style={{ background: '#fffaf5', border: '1px solid #e2ddd7', borderRadius: '8px', padding: '20px 24px', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#5f5750', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-dm-sans), sans-serif', marginBottom: '10px' }}>Summary</div>
                <p style={{ fontSize: '0.9375rem', color: '#0d0d0d', fontFamily: 'var(--font-dm-sans), sans-serif', lineHeight: 1.6, margin: 0 }}>{result.summary}</p>
              </div>
            )}

            {/* Risks + Next steps */}
            {(result.risks?.length || result.next_steps?.length) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {result.risks && result.risks.length > 0 && (
                  <div style={{ background: '#fffaf5', border: '1px solid #e2ddd7', borderRadius: '8px', padding: '20px 24px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#5f5750', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-dm-sans), sans-serif', marginBottom: '12px' }}>Risks</div>
                    <ul style={{ margin: 0, paddingLeft: '18px' }}>
                      {result.risks.map((risk, i) => (
                        <li key={i} style={{ fontSize: '0.875rem', color: '#0d0d0d', fontFamily: 'var(--font-dm-sans), sans-serif', lineHeight: 1.6, marginBottom: '6px' }}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.next_steps && result.next_steps.length > 0 && (
                  <div style={{ background: '#fffaf5', border: '1px solid #e2ddd7', borderRadius: '8px', padding: '20px 24px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#5f5750', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-dm-sans), sans-serif', marginBottom: '12px' }}>Next Steps</div>
                    <ol style={{ margin: 0, paddingLeft: '18px' }}>
                      {result.next_steps.map((step, i) => (
                        <li key={i} style={{ fontSize: '0.875rem', color: '#0d0d0d', fontFamily: 'var(--font-dm-sans), sans-serif', lineHeight: 1.6, marginBottom: '6px' }}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Meta row */}
            {(result.market_size || result.target_user) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {result.market_size && (
                  <div style={{ background: '#fffaf5', border: '1px solid #e2ddd7', borderRadius: '8px', padding: '18px 20px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#5f5750', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-dm-sans), sans-serif', marginBottom: '6px' }}>Market Size</div>
                    <div style={{ fontSize: '0.9375rem', color: '#0d0d0d', fontFamily: 'var(--font-dm-sans), sans-serif' }}>{result.market_size}</div>
                  </div>
                )}
                {result.target_user && (
                  <div style={{ background: '#fffaf5', border: '1px solid #e2ddd7', borderRadius: '8px', padding: '18px 20px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#5f5750', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-dm-sans), sans-serif', marginBottom: '6px' }}>Target User</div>
                    <div style={{ fontSize: '0.9375rem', color: '#0d0d0d', fontFamily: 'var(--font-dm-sans), sans-serif' }}>{result.target_user}</div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => showToast('Coming soon — ideas from agent runs will be saveable soon')}
                style={{ background: '#f0ece5', color: '#0d0d0d', border: '1px solid #e2ddd7', borderRadius: '9999px', padding: '9px 22px', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'var(--font-dm-sans), sans-serif', cursor: 'pointer' }}
              >
                Save to My Stuff
              </button>
              <button
                onClick={resetToIdle}
                style={{ background: '#e4611a', color: '#fff', border: 'none', borderRadius: '9999px', padding: '9px 22px', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'var(--font-dm-sans), sans-serif', cursor: 'pointer' }}
              >
                Run another analysis
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
