'use client'

import { useState } from 'react'
import type { Profile } from '@/app/lib/types'
import { HubSidebar } from './HubSidebar'

interface HubShellProps {
  profile: Profile
  children: React.ReactNode
}

export function HubShell({ profile, children }: HubShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <HubSidebar
        profile={profile}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(c => !c)}
      />
      <main
        style={{
          flex: 1,
          marginLeft: isCollapsed ? '64px' : '240px',
          transition: 'margin-left 200ms ease',
          background: 'var(--bg)',
          minHeight: '100vh',
          padding: '32px',
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  )
}
