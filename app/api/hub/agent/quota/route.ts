import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

export const dynamic = 'force-dynamic'

const PLAN_LIMITS: Record<string, number> = {
  free: 1,
  pro: 10,
  empire: Infinity,
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plan: string = (profileRow as any)?.plan ?? 'free'
  const limit = PLAN_LIMITS[plan] ?? 1

  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('agent_runs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', monthStart.toISOString())

  return NextResponse.json({
    used: count ?? 0,
    limit: limit === Infinity ? null : limit,
    plan,
  })
}
