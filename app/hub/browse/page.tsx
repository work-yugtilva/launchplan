import Link from 'next/link'
import {
  queryIdeaOfDay,
  queryPublishedIdeas,
  queryTrends,
  queryMarketInsights,
  querySiteStats,
} from '@/app/lib/queries/public-home'
import IdeaDiscoverCard from '@/app/components/hub/IdeaDiscoverCard'
import { getScoreColor } from '@/app/lib/types'
import type { IdeaOfDayResponse } from '@/app/lib/types'

export const revalidate = 300

const SCORE_COLOR_MAP = { green: '#1a7a4a', amber: '#b45309', red: '#c0392b' } as const

export default async function BrowsePage() {
  const hour = new Date().getUTCHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const [stats, iotdRaw, ideasResult, trendsResult, insightsResult] = await Promise.all([
    querySiteStats(),
    queryIdeaOfDay(),
    queryPublishedIdeas({ limit: 4 }),
    queryTrends({ limit: 3, sort_by: 'growth_pct' }),
    queryMarketInsights({ limit: 3 }),
  ])

  const iotd = iotdRaw as IdeaOfDayResponse | null
  const ideas = ideasResult.ideas
  const trends = trendsResult.trends
  const insights = insightsResult.insights

  const SCORE_DIMS = [
    { label: 'Market Opp', key: 'score_opportunity' as const },
    { label: 'Problem', key: 'score_problem' as const },
    { label: 'PM Fit', key: 'score_pm_fit' as const },
    { label: 'Feasibility', key: 'score_feasibility' as const },
    { label: 'Timing', key: 'score_timing' as const },
  ]

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
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
        .browse-3col {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 700px) {
          .browse-3col { grid-template-columns: 1fr; }
        }
        .idea-discover-card .card-hover-row {
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .idea-discover-card:hover .card-hover-row { opacity: 1; }
        .idea-discover-card {
          transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
        }
        .idea-discover-card:hover {
          border-color: #e4611a !important;
          box-shadow: 0 4px 20px rgba(13,13,13,0.10), 0 1px 4px rgba(13,13,13,0.06) !important;
          transform: translateY(-1px);
        }
        .card-action-btn:hover { color: #e4611a !important; }
        .iotd-card {
          transition: box-shadow 0.15s ease;
        }
        .iotd-card:hover {
          box-shadow: 0 4px 24px rgba(13,13,13,0.10);
        }
        .trend-card {
          transition: border-color 0.15s ease, transform 0.15s ease;
        }
        .trend-card:hover {
          border-color: #e4611a !important;
          transform: translateY(-1px);
        }
      `}</style>

      <div style={{ maxWidth: '1200px' }}>
        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-instrument-serif), serif',
              fontSize: '2rem',
              fontWeight: 400,
              color: '#0d0d0d',
              margin: '0 0 6px',
            }}
          >
            {greeting} 👋
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: '0.9375rem',
              color: '#5f5750',
              margin: 0,
            }}
          >
            Here&apos;s what&apos;s happening in LaunchPlan today.
          </p>
        </div>

        {/* Stats row */}
        <div className="browse-3col" style={{ marginBottom: '48px' }}>
          {[
            { value: stats.total_ideas, label: 'IDEAS' },
            { value: stats.total_trends, label: 'TRENDS' },
            { value: stats.total_insights, label: 'MARKET INSIGHTS' },
          ].map(stat => (
            <div
              key={stat.label}
              style={{
                background: '#fffaf5',
                border: '1px solid #e2ddd7',
                borderRadius: '8px',
                padding: '20px 24px',
              }}
            >
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: '#0d0d0d',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  lineHeight: 1,
                  marginBottom: '6px',
                }}
              >
                {stat.value.toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: '#5f5750',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Idea of the Day */}
        {iotd && (
          <div style={{ marginBottom: '48px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-instrument-serif), serif',
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: '#0d0d0d',
                  margin: 0,
                }}
              >
                Idea of the Day
              </h2>
              <Link
                href="/hub/ideas/discover"
                style={{
                  fontSize: '0.875rem',
                  color: '#e4611a',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
              >
                View all ideas →
              </Link>
            </div>
            <div
              className="iotd-card"
              style={{
                background: '#fffaf5',
                border: '1px solid #e2ddd7',
                borderRadius: '10px',
                padding: '28px 32px',
              }}
            >
              <span
                style={{
                  background: '#e4611a1f',
                  color: '#e4611a',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  display: 'inline-block',
                  marginBottom: '14px',
                }}
              >
                Idea of the Day
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-instrument-serif), serif',
                  fontSize: '1.75rem',
                  fontWeight: 400,
                  color: '#0d0d0d',
                  margin: '0 0 8px',
                  lineHeight: 1.25,
                }}
              >
                {iotd.idea.title}
              </h3>
              {iotd.idea.tagline && (
                <p
                  style={{
                    fontSize: '1rem',
                    color: '#5f5750',
                    margin: '0 0 16px',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    lineHeight: 1.5,
                  }}
                >
                  {iotd.idea.tagline}
                </p>
              )}
              {/* Metadata */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexWrap: 'wrap',
                  marginBottom: '18px',
                  fontSize: '0.8125rem',
                  color: '#5f5750',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
              >
                {iotd.idea.category && (
                  <span style={{ color: '#e4611a', fontWeight: 500 }}>{iotd.idea.category}</span>
                )}
                {iotd.idea.market_type && (
                  <>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{iotd.idea.market_type}</span>
                  </>
                )}
                {iotd.idea.execution_difficulty && (
                  <>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{iotd.idea.execution_difficulty}</span>
                  </>
                )}
              </div>
              {/* Score strip */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {SCORE_DIMS.map(({ label, key }) => (
                  <div
                    key={key}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                  >
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: SCORE_COLOR_MAP[getScoreColor(iotd.idea[key] as number | null)],
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        color: '#5f5750',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              {/* CTA */}
              <Link
                href={`/ideas/${iotd.idea.slug}`}
                style={{
                  display: 'inline-block',
                  background: '#e4611a',
                  color: '#fff',
                  borderRadius: '9999px',
                  padding: '9px 22px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  textDecoration: 'none',
                  marginBottom: iotd.idea.community_signals?.length ? '16px' : 0,
                }}
              >
                Explore this idea →
              </Link>
              {/* Community signals */}
              {iotd.idea.community_signals && iotd.idea.community_signals.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap',
                    fontSize: '0.8125rem',
                    color: '#5f5750',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                  }}
                >
                  {iotd.idea.community_signals.map(sig => (
                    <span key={sig.id}>
                      {sig.platform} • {sig.count?.toLocaleString() ?? 0}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fresh Ideas */}
        <div style={{ marginBottom: '48px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-instrument-serif), serif',
                fontSize: '1.5rem',
                fontWeight: 400,
                color: '#0d0d0d',
                margin: 0,
              }}
            >
              Fresh Ideas
            </h2>
            <Link
              href="/hub/ideas/discover"
              style={{
                fontSize: '0.875rem',
                color: '#e4611a',
                textDecoration: 'none',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}
            >
              See all →
            </Link>
          </div>
          {ideas.length > 0 ? (
            <div className="ideas-grid">
              {ideas.map((idea, i) => (
                <IdeaDiscoverCard key={idea.id} idea={idea} index={i} />
              ))}
            </div>
          ) : (
            <p style={{ color: '#5f5750', fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: '0.9375rem' }}>
              No ideas published yet.
            </p>
          )}
        </div>

        {/* Trending Now */}
        <div style={{ marginBottom: '48px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-instrument-serif), serif',
                fontSize: '1.5rem',
                fontWeight: 400,
                color: '#0d0d0d',
                margin: 0,
              }}
            >
              Trending Now
            </h2>
            <Link
              href="/hub/trends/discover"
              style={{
                fontSize: '0.875rem',
                color: '#e4611a',
                textDecoration: 'none',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}
            >
              See all →
            </Link>
          </div>
          <div className="browse-3col">
            {trends.map(trend => (
              <div
                key={trend.id}
                className="trend-card"
                style={{
                  background: '#fffaf5',
                  border: '1px solid #e2ddd7',
                  borderRadius: '8px',
                  padding: '18px 20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
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
                        background:
                          trend.growth_pct > 0
                            ? 'rgba(26,122,74,0.10)'
                            : 'rgba(192,57,43,0.10)',
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
                      margin: '0 0 8px',
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
                      marginBottom: '8px',
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
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {trend.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Market Signals */}
        <div style={{ marginBottom: '48px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-instrument-serif), serif',
                fontSize: '1.5rem',
                fontWeight: 400,
                color: '#0d0d0d',
                margin: 0,
              }}
            >
              Market Signals
            </h2>
            <Link
              href="/hub/market-insights/discover"
              style={{
                fontSize: '0.875rem',
                color: '#e4611a',
                textDecoration: 'none',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}
            >
              See all →
            </Link>
          </div>
          <div className="browse-3col">
            {insights.map(insight => (
              <div
                key={insight.id}
                style={{
                  background: '#fffaf5',
                  border: '1px solid #e2ddd7',
                  borderRadius: '8px',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '160px',
                }}
              >
                {insight.metric_value && (
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: '#e4611a',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      lineHeight: 1,
                      marginBottom: '4px',
                    }}
                  >
                    {insight.metric_value}
                  </div>
                )}
                {insight.metric_label && (
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#0d0d0d',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      marginBottom: '2px',
                    }}
                  >
                    {insight.metric_label}
                  </div>
                )}
                {insight.metric_period && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#5f5750',
                      fontStyle: 'italic',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      marginBottom: '8px',
                    }}
                  >
                    {insight.metric_period}
                  </div>
                )}
                {insight.description && (
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: '#5f5750',
                      margin: '0 0 auto',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {insight.description}
                  </p>
                )}
                {insight.source_label && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#5f5750',
                      fontStyle: 'italic',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      borderTop: '1px solid #e2ddd7',
                      paddingTop: '8px',
                      marginTop: '12px',
                    }}
                  >
                    {insight.source_label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
