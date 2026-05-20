'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookmarkIcon } from 'lucide-react'
import IdeaDiscoverCard from '@/app/components/hub/IdeaDiscoverCard'
import type { Idea } from '@/app/lib/types'

export default function MyStuffPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [savedAt, setSavedAt] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/hub/ideas/saved')
        if (!res.ok) {
          setError('Failed to load saved ideas.')
          return
        }
        const json = await res.json()
        setIdeas(json.ideas ?? [])
        setSavedAt(json.savedAt ?? {})
      } catch {
        setError('Failed to load saved ideas.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleUnsave(id: string) {
    setIdeas(prev => prev.filter(i => i.id !== id))
    try {
      await fetch(`/api/hub/ideas/${id}/save`, { method: 'DELETE' })
    } catch {
      /* silent */
    }
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
        .idea-discover-card .card-hover-row {
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .idea-discover-card:hover .card-hover-row { opacity: 1; }
        .idea-discover-card {
          transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
          animation: fadeSlideIn 0.25s ease both;
        }
        .idea-discover-card:hover {
          border-color: #e4611a !important;
          box-shadow: 0 4px 20px rgba(13,13,13,0.10), 0 1px 4px rgba(13,13,13,0.06) !important;
          transform: translateY(-1px);
        }
        .card-action-btn:hover { color: #e4611a !important; }
      `}</style>

      <div style={{ maxWidth: '1200px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--font-instrument-serif), serif', fontSize: '2rem', fontWeight: 400, color: '#0d0d0d', margin: '0 0 6px' }}>
            My Stuff
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#5f5750', margin: 0, fontFamily: 'var(--font-dm-sans), sans-serif' }}>
            Ideas you&apos;ve saved for later.
          </p>
        </div>

        {loading ? (
          <div className="ideas-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: '#f0ece5', border: '1px solid #e2ddd7', borderRadius: '8px', padding: '20px', height: '240px' }}>
                <div className="skeleton-shimmer" style={{ height: '20px', borderRadius: '4px', marginBottom: '10px', width: '60%' }} />
                <div className="skeleton-shimmer" style={{ height: '16px', borderRadius: '4px', marginBottom: '6px', width: '100%' }} />
                <div className="skeleton-shimmer" style={{ height: '16px', borderRadius: '4px', width: '80%' }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <p style={{ color: '#c0392b', fontFamily: 'var(--font-dm-sans), sans-serif', marginBottom: '12px' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: '#e4611a', color: '#fff', border: 'none', borderRadius: '9999px', padding: '9px 22px', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'var(--font-dm-sans), sans-serif', cursor: 'pointer' }}
            >
              Retry
            </button>
          </div>
        ) : ideas.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', gap: '16px', textAlign: 'center' }}>
            <BookmarkIcon size={48} style={{ color: '#5f5750', opacity: 0.4 }} />
            <p style={{ fontSize: '1rem', fontWeight: 500, color: '#0d0d0d', fontFamily: 'var(--font-dm-sans), sans-serif', margin: 0 }}>
              No saved ideas yet.
            </p>
            <Link
              href="/hub/ideas/discover"
              style={{ background: '#e4611a', color: '#fff', borderRadius: '9999px', padding: '9px 22px', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'var(--font-dm-sans), sans-serif', textDecoration: 'none' }}
            >
              Browse ideas →
            </Link>
          </div>
        ) : (
          <div className="ideas-grid">
            {ideas.map((idea, i) => (
              <IdeaDiscoverCard
                key={idea.id}
                idea={idea}
                index={i}
                showUnsave
                onUnsave={handleUnsave}
                savedAt={savedAt[idea.id]}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
