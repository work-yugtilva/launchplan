'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import type { Profile } from '@/app/lib/types'
import {
  House,
  User,
  Bookmark,
  LayoutGrid,
  FlaskConical,
  Sparkles,
  BarChart2,
  Search,
  BookOpen,
  Crown,
  GraduationCap,
  HelpCircle,
  ChevronRight,
  PanelLeft,
} from 'lucide-react'

interface HubSidebarProps {
  profile: Profile
  isCollapsed: boolean
  onToggle: () => void
}

const ungroupedItems = [
  { label: 'Home', href: '/hub/browse', icon: House },
  { label: 'My Profile', href: '/hub/profile', icon: User },
  { label: 'My Stuff', href: '/hub/my-stuff', icon: Bookmark },
]

const sections = [
  {
    label: 'IDEAS',
    items: [
      { label: 'Discover', href: '/hub/ideas/discover', icon: LayoutGrid },
      { label: 'Research', href: '/hub/ideas/research', icon: FlaskConical },
      { label: 'Generate', href: '/hub/ideas/generate', icon: Sparkles },
    ],
  },
  {
    label: 'TRENDS',
    items: [
      { label: 'Discover', href: '/hub/trends/discover', icon: BarChart2 },
      { label: 'Research', href: '/hub/trends/research', icon: Search },
    ],
  },
  {
    label: 'MARKET INSIGHTS',
    items: [
      { label: 'Discover', href: '/hub/market-insights/discover', icon: BookOpen },
      { label: 'Research', href: '/hub/market-insights/research', icon: Search },
    ],
  },
]

const bottomItems = [
  { label: 'Empire', href: '/hub/empire', icon: Crown },
  { label: 'Learn', href: '/hub/learn', icon: GraduationCap },
  { label: 'Support', href: '/hub/support', icon: HelpCircle },
]

function planLabel(plan: string): string {
  if (plan === 'pro') return 'Pro plan'
  if (plan === 'empire') return 'Empire plan'
  return 'Free plan'
}

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0][0].toUpperCase()
  }
  if (email) return email[0].toUpperCase()
  return '?'
}

export function HubSidebar({ profile, isCollapsed, onToggle }: HubSidebarProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'build'>('browse')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(href + '/')
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  function NavItem({
    href,
    icon: Icon,
    label,
  }: {
    href: string
    icon: React.ElementType
    label: string
  }) {
    const active = isActive(href)
    return (
      <Link
        href={href}
        title={isCollapsed ? label : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: isCollapsed ? '10px 0' : '7px 10px',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          borderRadius: '6px',
          background: active ? '#e4611a1f' : 'transparent',
          color: active ? '#e4611a' : 'var(--muted)',
          fontWeight: active ? 500 : 400,
          fontSize: '0.875rem',
          fontFamily: 'var(--font-dm-sans), sans-serif',
          textDecoration: 'none',
          transition: 'background 0.15s ease, color 0.15s ease',
          width: '100%',
        }}
      >
        <Icon size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
        {!isCollapsed && <span>{label}</span>}
      </Link>
    )
  }

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: isCollapsed ? '64px' : '240px',
        transition: 'width 200ms ease',
        background: 'var(--surface)',
        borderRight: '1px solid #e2ddd7',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 12px 12px', flexShrink: 0 }}>
        {/* Row 1: Logo + collapse button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            marginBottom: isCollapsed ? 0 : '12px',
          }}
        >
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                LaunchPlan
              </span>
              <span
                style={{
                  background: '#e4611a',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: 'var(--pill)',
                  letterSpacing: '0.03em',
                  lineHeight: 1.4,
                  whiteSpace: 'nowrap',
                }}
              >
                HUB
              </span>
            </div>
          )}
          <button
            onClick={onToggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
            }}
          >
            <PanelLeft
              size={18}
              style={{
                transform: isCollapsed ? 'rotate(180deg)' : 'none',
                transition: 'transform 200ms ease',
              }}
            />
          </button>
        </div>

        {/* Row 2: Browse/Build tabs */}
        {!isCollapsed && (
          <div
            style={{
              display: 'flex',
              background: 'rgba(13,13,13,0.05)',
              borderRadius: 'var(--pill)',
              padding: '3px',
              gap: '2px',
            }}
          >
            {(['browse', 'build'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '5px 0',
                  borderRadius: 'var(--pill)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  background: activeTab === tab ? 'var(--raised)' : 'transparent',
                  color: activeTab === tab ? 'var(--text)' : 'var(--muted)',
                  boxShadow: activeTab === tab ? 'var(--shadow-1)' : 'none',
                  transition: 'background 0.15s, color 0.15s',
                  textTransform: 'capitalize',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
        {activeTab === 'browse' ? (
          <>
            {/* Ungrouped items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
              {ungroupedItems.map(item => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>

            {/* Sectioned items */}
            {sections.map(section => (
              <div key={section.label} style={{ marginBottom: '4px' }}>
                {!isCollapsed ? (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      padding: '10px 10px 4px',
                    }}
                  >
                    {section.label}
                  </div>
                ) : (
                  <div style={{ borderTop: '1px solid #e2ddd7', margin: '6px 0' }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {section.items.map(item => (
                    <NavItem key={item.href} {...item} />
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          !isCollapsed && (
            <div
              style={{
                margin: '24px 10px',
                padding: '20px 16px',
                borderRadius: 'var(--r8)',
                border: '1px dashed rgba(13,13,13,0.12)',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--muted)',
                  fontWeight: 500,
                  marginBottom: '4px',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
              >
                Coming soon
              </p>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--muted)',
                  opacity: 0.7,
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
              >
                Build tools are in development.
              </p>
            </div>
          )
        )}
      </nav>

      {/* Bottom section */}
      <div style={{ flexShrink: 0, borderTop: '1px solid #e2ddd7', padding: '8px 8px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
          {bottomItems.map(item => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>

        {/* User card */}
        <div style={{ borderTop: '1px solid #e2ddd7', padding: '10px 8px', position: 'relative' }}>
          {/* Sign-out dropdown */}
          {userMenuOpen && !isCollapsed && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '8px',
                right: '8px',
                background: 'var(--raised)',
                border: '1px solid rgba(13,13,13,0.09)',
                borderRadius: 'var(--r8)',
                boxShadow: 'var(--shadow-2)',
                overflow: 'hidden',
                zIndex: 50,
              }}
            >
              <button
                onClick={handleSignOut}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: 'var(--red)',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                }}
              >
                Sign out
              </button>
            </div>
          )}

          <button
            onClick={() => setUserMenuOpen(o => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: 'var(--font-dm-sans), sans-serif',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                getInitials(profile.full_name, profile.email)
              )}
            </div>

            {!isCollapsed && (
              <>
                <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden', minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--text)',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {profile.full_name ?? profile.email ?? 'User'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--muted)',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                    }}
                  >
                    {planLabel(profile.plan)}
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  style={{
                    color: 'var(--muted)',
                    flexShrink: 0,
                    transform: userMenuOpen ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.15s ease',
                  }}
                />
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
