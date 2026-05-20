import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import type { Idea } from '@/app/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('saved_ideas')
    .select('idea_id, created_at, ideas(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[saved GET]', error)
    return NextResponse.json({ error: 'Failed to fetch saved ideas' }, { status: 500 })
  }

  const ideas: Idea[] = []
  const savedAt: Record<string, string> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of (data ?? []) as any[]) {
    if (row.ideas) {
      const idea = row.ideas as Idea
      ideas.push(idea)
      savedAt[idea.id] = row.created_at as string
    }
  }
  return NextResponse.json({ ideas, savedAt })
}
