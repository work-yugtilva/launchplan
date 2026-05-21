import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/server'
import type { Idea, MarketInsight, CommunitySignal } from '@/app/lib/types'
import IdeaDiscoverCard from '@/app/components/hub/IdeaDiscoverCard'

export const revalidate = 300

type IdeaWithSignals = Idea & { community_signals: CommunitySignal[] }

function insightTypeBadge(type: string | null): { bg: string; color: string } {
  switch (type) {
    case 'market_size':
      return { bg: '#1a52761f', color: '#1a5276' }
    case 'growth_signal':
      return { bg: '#1a7a4a1f', color: '#1a7a4a' }
    case 'community_demand':
      return { bg: '#6c34831f', color: '#6c3483' }
    default:
      return { bg: '#e2ddd7', color: '#5f5750' }
  }
}

function formatInsightType(type: string | null): string {
  if (!type) return 'Insight'
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function NotFound() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      fontFamily: 'var(--font-dm-sans), sans-serif',
    }}>
      <p style={{ fontSize: '1.125rem', color: '#5f5750' }}>Insight not found.</p>
      <Link href="/hub/market-insights/discover" style={{
        color: '#e4611a',
        fontWeight: 600,
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        ← Back to Market Insights
      </Link>
    </div>
  )
}

function Skeleton() {
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ width: '130px', height: '16px', background: '#e2ddd7', borderRadius: '4px', marginBottom: '32px' }} />
      <div style={{ width: '60%', height: '36px', background: '#e2ddd7', borderRadius: '6px', marginBottom: '12px' }} />
      <div style={{ width: '80px', height: '24px', background: '#e2ddd7', borderRadius: '9999px', marginBottom: '28px' }} />
      <div style={{ width: '160px', height: '64px', background: '#e2ddd7', borderRadius: '6px', marginBottom: '8px' }} />
      <div style={{ width: '200px', height: '18px', background: '#e2ddd7', borderRadius: '4px', marginBottom: '32px' }} />
      <div style={{ width: '100%', height: '80px', background: '#e2ddd7', borderRadius: '6px', marginBottom: '32px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[1, 2].map(i => (
          <div key={i} style={{ height: '160px', background: '#e2ddd7', borderRadius: '8px' }} />
        ))}
      </div>
    </div>
  )
}

async function InsightResearchContent({ id }: { id: string }) {
  const supabase = await createClient()

  const { data: insight } = await supabase
    .from('market_insights')
    .select('*')
    .eq('id', id)
    .single<MarketInsight>()

  if (!insight) return <NotFound />

  const { data: relatedIdeas } = await supabase
    .from('ideas')
    .select('*, community_signals(*)')
    .eq('published', true)
    .ilike('category', `%${insight.insight_type ?? ''}%`)
    .limit(4)

  const ideas = (relatedIdeas ?? []) as IdeaWithSignals[]
  const badge = insightTypeBadge(insight.insight_type)

  return (
    <div style={{
      maxWidth: '820px',
      margin: '0 auto',
      padding: '32px 24px 64px',
      animation: 'fadeSlideIn 0.25s ease both',
    }}>
      <style>{`@keyframes fadeSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Back */}
      <Link href="/hub/market-insights/discover" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: '#5f5750',
        fontSize: '0.875rem',
        fontFamily: 'var(--font-dm-sans), sans-serif',
        textDecoration: 'none',
        marginBottom: '28px',
      }}>
        ← Back to Market Insights
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-instrument-serif), serif',
          fontSize: '2rem',
          fontWeight: 400,
          color: '#0d0d0d',
          margin: '0 0 12px',
          lineHeight: 1.25,
        }}>
          {insight.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {insight.insight_type && (
            <span style={{
              background: badge.bg,
              color: badge.color,
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: '9999px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase' as const,
              fontFamily: 'var(--font-dm-sans), sans-serif',
            }}>
              {formatInsightType(insight.insight_type)}
            </span>
          )}
          {insight.source_label && (
            <span style={{
              fontSize: '0.8125rem',
              color: '#5f5750',
              fontFamily: 'var(--font-dm-sans), sans-serif',
            }}>
              {insight.source_label}
            </span>
          )}
        </div>
      </div>

      {/* Hero stat */}
      {(insight.metric_value || insight.metric_label) && (
        <div style={{
          background: '#fffaf5',
          border: '1px solid #e2ddd7',
          borderRadius: '8px',
          padding: '24px 28px',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          {insight.metric_value && (
            <div style={{
              fontFamily: 'var(--font-instrument-serif), serif',
              fontSize: '3.5rem',
              fontWeight: 400,
              color: '#e4611a',
              lineHeight: 1,
            }}>
              {insight.metric_value}
            </div>
          )}
          {insight.metric_label && (
            <div style={{
              fontSize: '1rem',
              color: '#5f5750',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              lineHeight: 1.5,
            }}>
              {insight.metric_label}
            </div>
          )}
          {insight.metric_period && (
            <span style={{
              display: 'inline-block',
              marginTop: '4px',
              background: '#e2ddd7',
              color: '#5f5750',
              fontSize: '11px',
              fontWeight: 500,
              padding: '2px 8px',
              borderRadius: '9999px',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              alignSelf: 'flex-start',
            }}>
              {insight.metric_period}
            </span>
          )}
        </div>
      )}

      {/* Description */}
      {insight.description && (
        <div style={{ marginBottom: '36px' }}>
          <p style={{
            fontSize: '0.9375rem',
            color: '#0d0d0d',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            lineHeight: 1.75,
            margin: 0,
          }}>
            {insight.description}
          </p>
        </div>
      )}

      {/* Related Ideas */}
      <div style={{ marginBottom: '36px' }}>
        <h2 style={{
          fontFamily: 'var(--font-instrument-serif), serif',
          fontSize: '1.5rem',
          fontWeight: 400,
          color: '#0d0d0d',
          margin: '0 0 16px',
        }}>
          Ideas in this space
        </h2>
        {ideas.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}>
            {ideas.map((idea, index) => (
              <IdeaDiscoverCard
                key={idea.id}
                idea={idea}
                index={index}
                linkHref={`/hub/ideas/research?id=${idea.id}`}
              />
            ))}
          </div>
        ) : (
          <p style={{
            fontSize: '0.9375rem',
            color: '#5f5750',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontStyle: 'italic',
          }}>
            No related ideas yet — check back soon.
          </p>
        )}
      </div>

      {/* CTA */}
      <Link href="/hub/ideas/discover" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        border: '1.5px solid #e4611a',
        color: '#e4611a',
        fontFamily: 'var(--font-dm-sans), sans-serif',
        fontWeight: 600,
        fontSize: '0.9375rem',
        padding: '12px 24px',
        borderRadius: '9999px',
        textDecoration: 'none',
        letterSpacing: '0.01em',
      }}>
        Explore all ideas →
      </Link>
    </div>
  )
}

export default async function MarketInsightsResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

  if (!id) return <NotFound />

  return (
    <Suspense fallback={<Skeleton />}>
      <InsightResearchContent id={id} />
    </Suspense>
  )
}
