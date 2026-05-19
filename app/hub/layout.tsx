import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { HubShell } from '@/app/components/hub/HubShell'
import type { Profile } from '@/app/lib/types'

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile: Profile = profileRow ?? {
    id: user.id,
    email: user.email ?? null,
    full_name: (user.user_metadata?.full_name as string) ?? null,
    avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
    plan: 'free',
    stripe_customer_id: null,
    created_at: new Date().toISOString(),
  }

  return <HubShell profile={profile}>{children}</HubShell>
}
