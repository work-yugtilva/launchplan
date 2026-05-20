'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, BookmarkIcon } from 'lucide-react'
import type { Idea } from '@/app/lib/types'
import IdeaDiscoverCard from '@/app/components/hub/IdeaDiscoverCard'

interface Filters {
  business_model: string[]
  market_type: string[]
  execution_difficulty: string[]
  revenue_potential: string[]
}

const FILTER_GROUPS = [
  {
    key: 'business_model' as keyof Filters,
    label: 'Business Type',
    options: [
      { label: 'SaaS', value: 'saas' },
      { label: 'Service', value: 'service' },
      { label: 'Marketplace', value: 'marketplace' },
      { label: 'Content', value: 'content' },
    ],
  },
  {
    key: 'market_type' as keyof Filters,
    label: 'Market',
    options: [
      { label: 'B2B', value: 'B2B' },
      { label: 'B2C', value: 'B2C' },
      { label: 'B2B2C', value: 'B2B2C' },
    ],
  },
  {
    key: 'execution_difficulty' as keyof Filters,
    label: 'Complexity',
    options: [
      { label: 'Low', value: 'Low' },
      { label: 'Medium', value: 'Medium' },
      { label: 'High', value: 'High' },
    ],
  },
  {
    key: 'revenue_potential' as keyof Filters,
    label: 'Revenue',
    options: [
      { label: '$10K–$100K ARR', value: '$10K–$100K ARR' },
      { label: '$50K–$500K ARR', value: '$50K–$500K ARR' },
      { label: '$100K–$1M ARR', value: '$100K–$1M ARR' },
    ],
  },
]

function SkeletonCard() {
  return (
    <div
      style={{
        background: '#f0ece5',
        border: '1px solid #e2ddd7',
        borderRadius: '8px',
        padding: '20px',
        height: '240px',
      }}
    >
      <div
        className="skeleton-shimmer"
        style={{ height: '20px', borderRadius: '4px', marginBottom: '10px', width: '60%' }}
      />
      <div
        className="skeleton-shimmer"
        style={{ height: '16px', borderRadius: '4px', marginBottom: '6px', width: '100%' }}
      />
      <div
        className="skeleton-shimmer"
        style={{ height: '16px', borderRadius: '4px', marginBottom: '6px', width: '85%' }}
      />
      <div
        className="skeleton-shimmer"
        style={{ height: '16px', borderRadius: '4px', marginBottom: '20px', width: '70%' }}
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div className="skeleton-shimmer" style={{ width: '8px', height: '8px', borderRadius: '50%' }} />
            <div className="skeleton-shimmer" style={{ width: '40px', height: '10px', borderRadius: '3px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div
      style={{
        gridColumn: '1 / -1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        gap: '16px',
        textAlign: 'center',
      }}
    >
      <BookmarkIcon size={48} style={{ color: '#5f5750', opacity: 0.4 }} />
      <p
        style={{
          fontSize: '1rem',
          fontWeight: 500,
          color: '#0d0d0d',
          fontFamily: 'var(--font-dm-sans), sans-serif',
          margin: 0,
        }}
      >
        No ideas match your filters
      </p>
      <button
        onClick={onClear}
        style={{
          background: '#e4611a',
          color: '#fff',
          border: 'none',
          borderRadius: '9999px',
          padding: '9px 22px',
          fontSize: '0.875rem',
          fontWeight: 500,
          fontFamily: 'var(--font-dm-sans), sans-serif',
          cursor: 'pointer',
        }}
      >
        Clear filters
      </button>
    </div>
  )
}

const EMPTY_FILTERS: Filters = {
  business_model: [],
  market_type: [],
  execution_difficulty: [],
  revenue_potential: [],
}

function filtersEmpty(f: Filters): boolean {
  return Object.values(f).every(arr => arr.length === 0)
}

export default function IdeasDiscoverPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [fetchError, setFetchError] = useState<string | null>(null)

  function buildUrl(currentOffset: number, currentSearch: string, currentFilters: Filters) {
    const params = new URLSearchParams()
    if (currentSearch) params.set('search', currentSearch)
    if (currentFilters.business_model.length) params.set('business_model', currentFilters.business_model.join(','))
    if (currentFilters.market_type.length) params.set('market_type', currentFilters.market_type.join(','))
    if (currentFilters.execution_difficulty.length) params.set('execution_difficulty', currentFilters.execution_difficulty.join(','))
    if (currentFilters.revenue_potential.length) params.set('revenue_potential', currentFilters.revenue_potential.join(','))
    params.set('limit', '12')
    params.set('offset', String(currentOffset))
    return `/api/hub/ideas?${params.toString()}`
  }

  const fetchIdeas = useCallback(async (currentSearch: string, currentFilters: Filters) => {
    setLoading(true)
    setOffset(0)
    try {
      const res = await fetch(buildUrl(0, currentSearch, currentFilters))
      if (!res.ok) {
        setFetchError('Failed to load ideas. Please try again.')
        setLoading(false)
        return
      }
      setFetchError(null)
      const data = await res.json()
      setIdeas(data.ideas ?? [])
      setHasMore(data.hasMore ?? false)
      setOffset(12)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIdeas(debouncedSearch, filters)
  }, [debouncedSearch, filters, fetchIdeas])

  function handleSearchChange(val: string) {
    setSearch(val)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(val), 300)
  }

  function toggleFilter(group: keyof Filters, value: string) {
    setFilters(prev => {
      const current = prev[group]
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [group]: next }
    })
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS)
    setSearch('')
    setDebouncedSearch('')
  }

  async function handleLoadMore() {
    setLoadingMore(true)
    try {
      const res = await fetch(buildUrl(offset, debouncedSearch, filters))
      if (!res.ok) return
      const data = await res.json()
      setIdeas(prev => [...prev, ...(data.ideas ?? [])])
      setHasMore(data.hasMore ?? false)
      setOffset(prev => prev + 12)
    } finally {
      setLoadingMore(false)
    }
  }

  const anyFilterActive = !filtersEmpty(filters) || debouncedSearch.length > 0

  return (
    <>
      <style>{`
        .ideas-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) {
          .ideas-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 580px) {
          .ideas-grid { grid-template-columns: 1fr; }
        }
        .idea-discover-card .card-hover-row {
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .idea-discover-card:hover .card-hover-row {
          opacity: 1;
        }
        .idea-discover-card {
          transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }
        .idea-discover-card:hover {
          border-color: #e4611a !important;
          box-shadow: 0 4px 20px rgba(13,13,13,0.10), 0 1px 4px rgba(13,13,13,0.06) !important;
          transform: translateY(-1px);
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
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .idea-discover-card {
          animation: fadeSlideIn 0.25s ease both;
        }
        .card-action-btn:hover {
          color: #e4611a !important;
        }
        .filter-chip {
          transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
        }
        .search-input:focus {
          outline: none;
          border-color: #e4611a !important;
          box-shadow: 0 0 0 2px rgba(228, 97, 26, 0.12);
        }
        .load-more-btn:hover {
          background: #e2ddd7 !important;
        }
      `}</style>

      <div style={{ maxWidth: '1200px' }}>
        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '24px',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-instrument-serif), serif',
                fontSize: '2rem',
                fontWeight: 400,
                color: '#0d0d0d',
                margin: '0 0 6px',
                lineHeight: 1.2,
              }}
            >
              Discover Ideas
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '0.9375rem',
                color: '#5f5750',
                margin: 0,
              }}
            >
              Browse 500+ PM-validated product ideas
            </p>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#5f5750',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search ideas..."
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className="search-input"
              style={{
                width: '240px',
                padding: '8px 14px 8px 34px',
                background: '#fff',
                border: '1px solid #e2ddd7',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                color: '#0d0d0d',
                transition: 'border-color 0.15s ease',
              }}
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            marginBottom: '28px',
            paddingBottom: '20px',
            borderBottom: '1px solid #e2ddd7',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            {FILTER_GROUPS.map(group => (
              <div key={group.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: '#5f5750',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                  }}
                >
                  {group.label}
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {group.options.map(option => {
                    const active = filters[group.key].includes(option.value)
                    return (
                      <button
                        key={option.value}
                        onClick={() => toggleFilter(group.key, option.value)}
                        className="filter-chip"
                        style={{
                          padding: '5px 12px',
                          borderRadius: '9999px',
                          border: active ? '1px solid #e4611a' : '1px solid #e2ddd7',
                          background: active ? '#e4611a1f' : 'transparent',
                          color: active ? '#e4611a' : '#5f5750',
                          fontSize: '0.8125rem',
                          fontWeight: active ? 500 : 400,
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {anyFilterActive && (
              <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
                <button
                  onClick={clearFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#5f5750',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                    padding: '5px 0',
                  }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Fetch error */}
        {fetchError && (
          <div className="text-center py-8" style={{ marginBottom: '16px' }}>
            <p style={{ color: '#c0392b', marginBottom: '8px', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.9375rem' }}>{fetchError}</p>
            <button
              onClick={() => fetchIdeas(debouncedSearch, filters)}
              style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.875rem', color: '#5f5750' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="ideas-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : ideas.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : (
            ideas.map((idea, i) => (
              <IdeaDiscoverCard key={idea.id} idea={idea} index={i} />
            ))
          )}
        </div>

        {/* Load More */}
        {!loading && hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <button
              onClick={handleLoadMore}
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
                transition: 'background 0.15s ease',
                opacity: loadingMore ? 0.7 : 1,
              }}
            >
              {loadingMore ? (
                <>
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid #5f5750',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                  Loading...
                </>
              ) : (
                'Load more ideas'
              )}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
