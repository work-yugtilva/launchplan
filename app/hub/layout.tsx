import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { supabaseAdmin } from '@/app/lib/supabase/admin'
import { HubShell } from '@/app/components/hub/HubShell'
import type { Profile } from '@/app/lib/types'

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  let profile: Profile | null = profileRow ?? null

  if (!profile) {
    const upsertPayload: import('@/app/lib/types').Database['public']['Tables']['profiles']['Insert'] = {
      id:         user.id,
      email:      user.email ?? null,
      full_name:  (user.user_metadata?.full_name as string) ?? null,
      avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
      plan:       'free',
    }
    const { data: upserted, error: upsertError } = await supabaseAdmin
      .from('profiles')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(upsertPayload as any, { onConflict: 'id' })
      .select('*')
      .single()

    if (upsertError || !upserted) {
      console.error('[HubLayout] profile upsert failed', upsertError)
      redirect('/?error=profile_setup_failed')
    }

    profile = upserted as Profile
  }

  return <HubShell profile={profile}>{children}</HubShell>
}
