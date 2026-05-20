'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search } from 'lucide-react'
import type { Trend } from '@/app/lib/types'

const PAGE_SIZE = 12

const SORT_OPTIONS = [
  { label: 'Fastest Growing', value: 'growth_pct' },
  { label: 'Highest Volume', value: 'volume' },
]

const CATEGORY_OPTIONS = [
  { label: 'AI', value: 'AI' },
  { label: 'Dev Tools', value: 'Dev Tools' },
  { label: 'Health', value: 'Health' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Education', value: 'Education' },
  { label: 'Other', value: 'Other' },
]

function TrendCard({ trend, index }: { trend: Trend; index: number }) {
  return (
    <div
      className="trend-card idea-card"
      style={{
        background: '#fffaf5',
        border: '1px solid #e2ddd7',
        borderRadius: '8px',
        padding: '18px 20px',
        animation: 'fadeSlideIn 0.25s ease both',
        animationDelay: `${index * 40}ms`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#0d0d0d',
            fontFamily: 'var(--font-dm-sans), sans-serif',
          }}
        >
          {trend.keyword}
        </span>
        {trend.growth_pct !== null && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '9999px',
              whiteSpace: 'nowrap',
              background: trend.growth_pct > 0 ? 'rgba(26,122,74,0.10)' : 'rgba(192,57,43,0.10)',
              color: trend.growth_pct > 0 ? '#1a7a4a' : '#c0392b',
              fontFamily: 'var(--font-dm-sans), sans-serif',
            }}
          >
            {trend.growth_pct > 0 ? '+' : ''}
            {trend.growth_pct}%
          </span>
        )}
      </div>
      {trend.volume !== null && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: '#5f5750',
            margin: '0 0 10px',
            fontFamily: 'var(--font-dm-sans), sans-serif',
          }}
        >
          {trend.volume.toLocaleString()} searches/mo
        </p>
      )}
      {trend.category && (
        <span
          style={{
            background: '#e4611a1f',
            color: '#e4611a',
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '9999px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            display: 'inline-block',
            marginBottom: '10px',
          }}
        >
          {trend.category}
        </span>
      )}
      {trend.description && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: '#5f5750',
            margin: 0,
            fontFamily: 'var(--font-dm-sans), sans-serif',
            lineHeight: 1.6,
          }}
        >
          {trend.description}
        </p>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: '#f0ece5',
        border: '1px solid #e2ddd7',
        borderRadius: '8px',
        padding: '18px 20px',
        height: '180px',
      }}
    >
      <div className="skeleton-shimmer" style={{ height: '18px', borderRadius: '4px', marginBottom: '10px', width: '55%' }} />
      <div className="skeleton-shimmer" style={{ height: '14px', borderRadius: '4px', marginBottom: '8px', width: '40%' }} />
      <div className="skeleton-shimmer" style={{ height: '14px', borderRadius: '4px', marginBottom: '8px', width: '80%' }} />
      <div className="skeleton-shimmer" style={{ height: '14px', borderRadius: '4px', width: '65%' }} />
    </div>
  )
}

export default function TrendsDiscoverPage() {
  const [trends, setTrends] = useState<Trend[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [sortBy, setSortBy] = useState('growth_pct')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [fetchError, setFetchError] = useState<string | null>(null)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function buildUrl(currentOffset: number, currentSearch: string) {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(currentOffset),
      sort_by: sortBy,
    })
    if (category) params.set('category', category)
    if (currentSearch) params.set('search', currentSearch)
    return `/api/trends?${params.toString()}`
  }

  const fetchTrends = useCallback(
    async (reset: boolean) => {
      if (reset) setLoading(true)
      else setLoadingMore(true)
      try {
        const currentOffset = reset ? 0 : offset
        const res = await fetch(buildUrl(currentOffset, debouncedSearch))
        if (!res.ok) {
          setFetchError('Failed to load trends. Please try again.')
          return
        }
        setFetchError(null)
        const json = await res.json()
        if (reset) setTrends(json.trends ?? [])
        else setTrends(prev => [...prev, ...(json.trends ?? [])])
        setHasMore(json.hasMore ?? false)
        setOffset(currentOffset + PAGE_SIZE)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortBy, category, debouncedSearch, offset]
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTrends(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, category, debouncedSearch])

  function handleSearchChange(val: string) {
    setSearch(val)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(val), 300)
  }

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
        .ideas-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) { .ideas-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 580px) { .ideas-grid { grid-template-columns: 1fr; } }
        .trend-card { transition: border-color 0.15s ease, transform 0.15s ease; }
        .trend-card:hover { border-color: #e4611a !important; transform: translateY(-1px); }
        .filter-chip { transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease; }
        .search-input:focus { outline: none; border-color: #e4611a !important; box-shadow: 0 0 0 2px rgba(228,97,26,0.12); }
        .load-more-btn:hover { background: #e2ddd7 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: '1200px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-instrument-serif), serif',
              fontSize: '2rem',
              fontWeight: 400,
              color: '#0d0d0d',
              margin: '0 0 6px',
            }}
          >
            Trends
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#5f5750', margin: 0, fontFamily: 'var(--font-dm-sans), sans-serif' }}>
            Spot what&apos;s growing before it peaks.
          </p>
        </div>

        {/* Filter bar */}
        <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #e2ddd7' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#5f5750', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search trends..."
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                className="search-input"
                style={{
                  width: '200px',
                  padding: '7px 12px 7px 30px',
                  background: '#fff',
                  border: '1px solid #e2ddd7',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  color: '#0d0d0d',
                }}
              />
            </div>

            {/* Sort */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#5f5750', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                Sort by
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className="filter-chip"
                    style={{
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      border: sortBy === opt.value ? '1px solid #e4611a' : '1px solid #e2ddd7',
                      background: sortBy === opt.value ? '#e4611a1f' : 'transparent',
                      color: sortBy === opt.value ? '#e4611a' : '#5f5750',
                      fontSize: '0.8125rem',
                      fontWeight: sortBy === opt.value ? 500 : 400,
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

            {/* Category */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#5f5750', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                Category
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {CATEGORY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setCategory(prev => prev === opt.value ? '' : opt.value)}
                    className="filter-chip"
                    style={{
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      border: category === opt.value ? '1px solid #e4611a' : '1px solid #e2ddd7',
                      background: category === opt.value ? '#e4611a1f' : 'transparent',
                      color: category === opt.value ? '#e4611a' : '#5f5750',
                      fontSize: '0.8125rem',
                      fontWeight: category === opt.value ? 500 : 400,
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
        </div>

        {/* Error */}
        {fetchError && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#c0392b', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.9375rem', margin: '0 0 8px' }}>{fetchError}</p>
            <button onClick={() => fetchTrends(true)} style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.875rem', color: '#5f5750' }}>
              Retry
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="ideas-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : trends.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 24px' }}>
              <p style={{ fontSize: '1rem', fontWeight: 500, color: '#0d0d0d', fontFamily: 'var(--font-dm-sans), sans-serif', marginBottom: '12px' }}>
                No trends match your filters
              </p>
              <button
                onClick={() => { setCategory(''); setSearch(''); setDebouncedSearch('') }}
                style={{ background: '#e4611a', color: '#fff', border: 'none', borderRadius: '9999px', padding: '9px 22px', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'var(--font-dm-sans), sans-serif', cursor: 'pointer' }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            trends.map((trend, i) => <TrendCard key={trend.id} trend={trend} index={i} />)
          )}
        </div>

        {/* Load more */}
        {!loading && hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <button
              onClick={() => fetchTrends(false)}
              disabled={loadingMore}
              className="load-more-btn"
              style={{
                background: '#f0ece5',
                color: '#0d0d0d',
                border: '1px solid #e2ddd7',
                borderRadius: '9999px',
                padding: '10px 28px',
                fontSize: '0.875rem',
                fontWeight: 500,
                fontFamily: 'var(--font-dm-sans), sans-serif',
                cursor: loadingMore ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: loadingMore ? 0.7 : 1,
              }}
            >
              {loadingMore ? (
                <>
                  <span style={{ width: '14px', height: '14px', border: '2px solid #5f5750', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                  Loading...
                </>
              ) : (
                'Load more trends'
              )}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
