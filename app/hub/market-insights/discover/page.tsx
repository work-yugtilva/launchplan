'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { MarketInsight } from '@/app/lib/types'

const PAGE_SIZE = 9

const TYPE_OPTIONS = [
  { label: 'Market Size', value: 'market_size' },
  { label: 'Growth Signal', value: 'growth_signal' },
  { label: 'Community Demand', value: 'community_demand' },
]

function InsightCard({ insight, index }: { insight: MarketInsight; index: number }) {
  return (
    <Link
      href={`/hub/market-insights/research?id=${insight.id}`}
      className="insight-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#fffaf5',
        border: '1px solid #e2ddd7',
        borderRadius: '8px',
        padding: '18px 20px',
        animation: 'fadeSlideIn 0.25s ease both',
        animationDelay: `${index * 40}ms`,
        textDecoration: 'none',
        cursor: 'pointer',
      }}
    >
      {insight.metric_value && (
        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#e4611a', fontFamily: 'var(--font-dm-sans), sans-serif', lineHeight: 1, marginBottom: '4px' }}>
          {insight.metric_value}
        </div>
      )}
      {insight.metric_label && (
        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0d0d0d', fontFamily: 'var(--font-dm-sans), sans-serif', marginBottom: '2px' }}>
          {insight.metric_label}
        </div>
      )}
      {insight.metric_period && (
        <div style={{ fontSize: '0.75rem', color: '#5f5750', fontStyle: 'italic', fontFamily: 'var(--font-dm-sans), sans-serif', marginBottom: '10px' }}>
          {insight.metric_period}
        </div>
      )}
      {insight.description && (
        <p style={{ fontSize: '0.8125rem', color: '#5f5750', margin: '0 0 auto', fontFamily: 'var(--font-dm-sans), sans-serif', lineHeight: 1.6 }}>
          {insight.description}
        </p>
      )}
      {insight.source_label && (
        <div style={{ fontSize: '0.75rem', color: '#5f5750', fontStyle: 'italic', fontFamily: 'var(--font-dm-sans), sans-serif', borderTop: '1px solid #e2ddd7', paddingTop: '8px', marginTop: '12px' }}>
          {insight.source_label}
        </div>
      )}
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: '#f0ece5', border: '1px solid #e2ddd7', borderRadius: '8px', padding: '18px 20px', height: '160px' }}>
      <div className="skeleton-shimmer" style={{ height: '28px', borderRadius: '4px', marginBottom: '8px', width: '40%' }} />
      <div className="skeleton-shimmer" style={{ height: '14px', borderRadius: '4px', marginBottom: '6px', width: '70%' }} />
      <div className="skeleton-shimmer" style={{ height: '14px', borderRadius: '4px', marginBottom: '6px', width: '90%' }} />
      <div className="skeleton-shimmer" style={{ height: '14px', borderRadius: '4px', width: '55%' }} />
    </div>
  )
}

export default function MarketInsightsDiscoverPage() {
  const [insights, setInsights] = useState<MarketInsight[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [insightType, setInsightType] = useState('')
  const [fetchError, setFetchError] = useState<string | null>(null)

  function buildUrl(currentOffset: number) {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(currentOffset) })
    if (insightType) params.set('insight_type', insightType)
    return `/api/market-insights?${params.toString()}`
  }

  const fetchInsights = useCallback(
    async (reset: boolean) => {
      if (reset) setLoading(true)
      else setLoadingMore(true)
      try {
        const currentOffset = reset ? 0 : offset
        const res = await fetch(buildUrl(currentOffset))
        if (!res.ok) {
          setFetchError('Failed to load insights. Please try again.')
          return
        }
        setFetchError(null)
        const json = await res.json()
        if (reset) setInsights(json.insights ?? [])
        else setInsights(prev => [...prev, ...(json.insights ?? [])])
        setHasMore(json.hasMore ?? false)
        setOffset(currentOffset + PAGE_SIZE)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [insightType, offset]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInsights(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insightType])

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg, #f0ece5 25%, #e8e4dd 50%, #f0ece5 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite linear;
        }
        .insights-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) { .insights-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 580px) { .insights-grid { grid-template-columns: 1fr; } }
        .insight-card { transition: border-color 0.15s ease, transform 0.15s ease; }
        .insight-card:hover { border-color: #e4611a !important; transform: translateY(-1px); }
        .filter-chip { transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease; }
        .load-more-btn:hover { background: #e2ddd7 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: '1200px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: '2rem', fontWeight: 400, color: '#0d0d0d', margin: '0 0 6px' }}>
            Market Signals
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#5f5750', margin: 0, fontFamily: 'var(--font-dm-sans), sans-serif' }}>
            Data-backed signals on where the market is moving.
          </p>
        </div>

        {/* Filter bar */}
        <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #e2ddd7' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#5f5750', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
              Insight Type
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setInsightType(prev => prev === opt.value ? '' : opt.value)}
                  className="filter-chip"
                  style={{
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    border: insightType === opt.value ? '1px solid #e4611a' : '1px solid #e2ddd7',
                    background: insightType === opt.value ? '#e4611a1f' : 'transparent',
                    color: insightType === opt.value ? '#e4611a' : '#5f5750',
                    fontSize: '0.8125rem',
                    fontWeight: insightType === opt.value ? 500 : 400,
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {fetchError && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#c0392b', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.9375rem', margin: '0 0 8px' }}>{fetchError}</p>
            <button onClick={() => fetchInsights(true)} style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.875rem', color: '#5f5750' }}>
              Retry
            </button>
          </div>
        )}

        <div className="insights-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : insights.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 24px' }}>
              <p style={{ fontSize: '1rem', fontWeight: 500, color: '#0d0d0d', fontFamily: 'var(--font-dm-sans), sans-serif', marginBottom: '12px' }}>
                No insights found
              </p>
              <button
                onClick={() => setInsightType('')}
                style={{ background: '#e4611a', color: '#fff', border: 'none', borderRadius: '9999px', padding: '9px 22px', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'var(--font-dm-sans), sans-serif', cursor: 'pointer' }}
              >
                Clear filter
              </button>
            </div>
          ) : (
            insights.map((insight, i) => <InsightCard key={insight.id} insight={insight} index={i} />)
          )}
        </div>

        {!loading && hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <button
              onClick={() => fetchInsights(false)}
              disabled={loadingMore}
              className="load-more-btn"
              style={{ background: '#f0ece5', color: '#0d0d0d', border: '1px solid #e2ddd7', borderRadius: '9999px', padding: '10px 28px', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'var(--font-dm-sans), sans-serif', cursor: loadingMore ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: loadingMore ? 0.7 : 1 }}
            >
              {loadingMore ? (
                <>
                  <span style={{ width: '14px', height: '14px', border: '2px solid #5f5750', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                  Loading...
                </>
              ) : (
                'Load more insights'
              )}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
